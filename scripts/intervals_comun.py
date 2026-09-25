"""
Funciones comunes para bajar datos de Intervals.icu y guardarlos en CSV.
La usan historico.py y diario.py (no se ejecuta sola).

Archivos que genera en la carpeta "datos":
  actividades.csv  -> una fila por sesión (clave: id)
  bloques.csv      -> una fila por vuelta/bloque de cada sesión (clave: id_actividad + nro_bloque)
  bienestar.csv    -> una fila por día (clave: fecha)
  registro.log     -> historial de cada ejecución
"""

import csv
import json
import os
import sys
import time
from datetime import date, datetime, timedelta
from getpass import getpass
from pathlib import Path

import requests

try:
    # Usa los certificados del sistema operativo en lugar de los de Python.
    # Necesario en Windows con antivirus que inspeccionan HTTPS (p. ej., Avast).
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

# En Windows, si la salida se redirige a un archivo, Python usa cp1252 y fallan los emojis
sys.stdout.reconfigure(encoding="utf-8")

BASE = "https://intervals.icu/api/v1"
CARPETA = Path(__file__).resolve().parent
# Si los scripts están dentro de una carpeta "scripts", los datos van en la raíz del proyecto
RAIZ = CARPETA.parent if CARPETA.name == "scripts" else CARPETA
DATOS = RAIZ / "datos"
CONFIG = RAIZ / "config.json"

# Tipos de actividad de Intervals -> tu categoría. Agregá acá los que vayan apareciendo.
CATEGORIAS = {
    "Run": "Carrera", "TrailRun": "Carrera", "VirtualRun": "Carrera",
    "Padel": "Pádel",
    "Walk": "Caminata", "Hike": "Caminata",
    "Ride": "Ciclismo", "VirtualRide": "Ciclismo",
    "WeightTraining": "Fuerza",
    "Swim": "Natación",
}

# ---------------------------------------------------------------- columnas
COLS_ACTIVIDADES = [
    "id", "fecha", "hora_inicio", "tipo_intervals", "categoria", "subtipo", "nombre",
    "duracion_s", "tiempo_total_s", "distancia_m", "ritmo_min_km", "velocidad_media_ms",
    "fc_media", "fc_max", "carga_hrss", "trimp", "intensidad_pct", "calorias",
    "desnivel_pos_m", "cadencia_ppm", "zancada_m", "contacto_ms", "oscilacion_cm",
    "z1_s", "z2_s", "z3_s", "z4_s", "z5_s", "z6_s", "z7_s",
    "recuperacion_fc", "cant_vueltas", "resumen_bloques", "fitness_ctl", "fatiga_atl",
    "dispositivo", "id_zepp", "actualizado",
]
COLS_BLOQUES = [
    "id_actividad", "fecha", "nro_bloque", "tipo", "inicio_s", "duracion_s", "distancia_m",
    "ritmo_min_km", "fc_media", "fc_max", "cadencia_ppm", "desnivel_pos_m",
]
COLS_BIENESTAR = [
    "fecha", "fitness_ctl", "fatiga_atl", "forma", "ramp_rate", "carga_dia",
    "fc_reposo", "sueno_s", "sueno_horas", "sueno_puntaje", "sueno_calidad",
    "pasos", "hrv", "peso", "spo2", "actualizado",
]


# ---------------------------------------------------------------- configuración
def cargar_config():
    """Busca las credenciales en este orden:
    1. Variables de entorno INTERVALS_ATHLETE_ID e INTERVALS_API_KEY (GitHub Actions).
    2. config.json (uso local).
    3. Si no hay nada y es una terminal interactiva, las pide y crea config.json."""
    env_id, env_key = os.environ.get("INTERVALS_ATHLETE_ID"), os.environ.get("INTERVALS_API_KEY")
    if env_id and env_key:
        return {"athlete_id": env_id, "api_key": env_key}
    if CONFIG.exists():
        cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
        if cfg.get("athlete_id") and cfg.get("api_key"):
            return cfg
    if not sys.stdin.isatty():
        sys.exit("❌ Faltan credenciales: definí INTERVALS_ATHLETE_ID e INTERVALS_API_KEY.")
    print("Primera ejecución: necesito tus datos de Intervals.icu (Settings → Developer Settings).")
    cfg = {
        "athlete_id": input("Athlete ID (ej. i12345): ").strip(),
        "api_key": getpass("API key (no se muestra al escribir): ").strip(),
    }
    CONFIG.write_text(json.dumps(cfg, indent=2), encoding="utf-8")
    print(f"✅ Guardado en {CONFIG.name}. No compartas ni subas este archivo.\n")
    return cfg


def sesion(cfg):
    s = requests.Session()
    s.auth = ("API_KEY", cfg["api_key"])
    return s


def pedir(s, url, params=None, intentos=4):
    """GET con reintentos (por si la API limita la cantidad de pedidos)."""
    for i in range(intentos):
        r = s.get(url, params=params, timeout=60)
        if r.status_code in (401, 403):
            sys.exit("❌ Error de autenticación: revisá athlete_id y api_key "
                     "(config.json o variables de entorno).")
        if r.status_code == 404:
            return None   # p. ej., una actividad sin detalle de vueltas: no frena toda la descarga
        if r.status_code == 429 or r.status_code >= 500:
            espera = 5 * (i + 1)
            print(f"   … la API pidió esperar, reintento en {espera}s")
            time.sleep(espera)
            continue
        r.raise_for_status()
        return r.json()
    r.raise_for_status()


# ---------------------------------------------------------------- utilidades
def ritmo(vel_ms):
    if not vel_ms:
        return ""
    seg = 1000 / vel_ms
    return f"{int(seg // 60)}:{int(round(seg % 60)):02d}"


def r(x, dec=1):
    if x is None:
        return ""
    return round(x, dec) if dec else round(x)   # con 0 decimales, entero ("37" y no "37.0")


def rangos(desde, hasta, dias=60):
    """Parte un período largo en tramos para no pedir todo de una vez."""
    ini = desde
    while ini <= hasta:
        fin = min(ini + timedelta(days=dias - 1), hasta)
        yield ini, fin
        ini = fin + timedelta(days=1)


def ahora():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _seg(texto):
    """'5m1s' -> 301 segundos."""
    import re
    return sum(int(n) * {"h": 3600, "m": 60, "s": 1}[u] for n, u in re.findall(r"(\d+)([hms])", texto))


def subtipo(a, bloques):
    """Clasifica las corridas según la forma de sus vueltas (tomadas del resumen de Intervals)."""
    if CATEGORIAS.get(a.get("type")) != "Carrera":
        return ""
    if (a.get("icu_lap_count") or 0) > 10:
        return "Series"
    resumen = a.get("interval_summary") or []           # ej: ["1x 5m1s 126bpm", "1x 28m 157bpm", ...]
    if len(resumen) == 3 and _seg(resumen[0].split(" ")[1]) <= 360:
        return "Bloques"
    return "Libre"


# ---------------------------------------------------------------- transformación
def fila_actividad(a, bloques):
    z = (a.get("icu_hr_zone_times") or []) + [None] * 7
    cad = a.get("average_cadence")
    return {
        "id": a["id"],
        "fecha": a["start_date_local"][:10],
        "hora_inicio": a["start_date_local"][11:16],
        "tipo_intervals": a.get("type"),
        "categoria": CATEGORIAS.get(a.get("type"), "Otros"),
        "subtipo": subtipo(a, bloques),
        "nombre": a.get("name"),
        "duracion_s": a.get("moving_time"),
        "tiempo_total_s": a.get("elapsed_time"),
        "distancia_m": r(a.get("distance"), 0) or "",
        "ritmo_min_km": ritmo(a.get("average_speed")),
        "velocidad_media_ms": r(a.get("average_speed"), 3),
        "fc_media": a.get("average_heartrate"),
        "fc_max": a.get("max_heartrate"),
        "carga_hrss": a.get("icu_training_load"),
        "trimp": r(a.get("trimp")),
        "intensidad_pct": r(a.get("icu_intensity")),
        "calorias": a.get("calories"),
        "desnivel_pos_m": r(a.get("total_elevation_gain"), 0),
        "cadencia_ppm": round(cad * 2) if cad else "",          # Intervals la da por pierna
        "zancada_m": r(a.get("average_stride"), 2),
        "contacto_ms": r(a.get("average_stance_time"), 0),
        "oscilacion_cm": r((a.get("average_vertical_oscillation") or 0) / 10) or "",
        **{f"z{i + 1}_s": z[i] if z[i] is not None else "" for i in range(7)},
        "recuperacion_fc": (a.get("icu_hrr") or {}).get("hrr", ""),
        "cant_vueltas": a.get("icu_lap_count"),
        "resumen_bloques": " | ".join(a.get("interval_summary") or []),
        "fitness_ctl": r(a.get("icu_ctl")),
        "fatiga_atl": r(a.get("icu_atl")),
        "dispositivo": a.get("device_name"),
        "id_zepp": a.get("external_id"),
        "actualizado": ahora(),
    }


def filas_bloques(a, bloques):
    filas = []
    for i, b in enumerate(bloques, start=1):
        cad = b.get("average_cadence")
        filas.append({
            "id_actividad": a["id"],
            "fecha": a["start_date_local"][:10],
            "nro_bloque": i,
            "tipo": b.get("type") or "",
            "inicio_s": b.get("start_time"),
            "duracion_s": b.get("elapsed_time") or b.get("moving_time"),
            "distancia_m": r(b.get("distance"), 0),
            "ritmo_min_km": ritmo(b.get("average_speed")),
            "fc_media": b.get("average_heartrate") or "",
            "fc_max": b.get("max_heartrate") or "",
            "cadencia_ppm": round(cad * 2) if cad else "",
            "desnivel_pos_m": r(b.get("total_elevation_gain"), 0),
        })
    return filas


def fila_bienestar(w):
    ctl, atl = w.get("ctl"), w.get("atl")
    sueno = w.get("sleepSecs")
    return {
        "fecha": w["id"],
        "fitness_ctl": r(ctl),
        "fatiga_atl": r(atl),
        "forma": r(ctl - atl) if ctl is not None and atl is not None else "",
        "ramp_rate": r(w.get("rampRate")),
        "carga_dia": w.get("ctlLoad") or 0,
        "fc_reposo": w.get("restingHR") or "",
        "sueno_s": sueno or "",
        "sueno_horas": r(sueno / 3600, 2) if sueno else "",
        "sueno_puntaje": w.get("sleepScore") or "",
        "sueno_calidad": w.get("sleepQuality") or "",
        "pasos": w.get("steps") or "",
        "hrv": w.get("hrv") or "",
        "peso": w.get("weight") or "",
        "spo2": w.get("spO2") or "",
        "actualizado": ahora(),
    }


# ---------------------------------------------------------------- CSV (leer / actualizar)
def leer_csv(nombre):
    ruta = DATOS / nombre
    if not ruta.exists():
        return []
    with open(ruta, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def guardar_csv(nombre, columnas, filas, orden):
    DATOS.mkdir(exist_ok=True)
    filas = sorted(filas, key=orden)
    tmp = DATOS / (nombre + ".tmp")
    with open(tmp, "w", newline="", encoding="utf-8-sig") as f:   # utf-8-sig: Excel lee bien los acentos
        w = csv.DictWriter(f, fieldnames=columnas, extrasaction="ignore")
        w.writeheader()
        w.writerows(filas)
    os.replace(tmp, DATOS / nombre)   # reemplazo atómico: nunca queda un CSV a medio escribir


def _txt(v):
    return "" if v is None else str(v)


def actualizar(nombre, columnas, nuevas, clave, orden, fechas_borrar=None):
    """Upsert: reemplaza las filas con la misma clave y agrega las nuevas.
    fechas_borrar: si se indica, antes borra las filas de esas fechas
    (sirve para quitar actividades que eliminaste en Intervals).
    Si una fila no cambió, conserva su fecha de "actualizado" original,
    así el historial de GitHub solo muestra cambios reales."""
    existentes = leer_csv(nombre)
    antes = len(existentes)
    originales = {clave(f): f for f in existentes}
    if fechas_borrar:
        existentes = [f for f in existentes if f["fecha"] not in fechas_borrar]
    por_clave = {clave(f): f for f in existentes}
    for f in nuevas:
        k = clave({c: _txt(v) for c, v in f.items()})
        viejo = originales.get(k)
        if viejo and "actualizado" in f and all(
                _txt(viejo.get(c)) == _txt(f.get(c)) for c in columnas if c != "actualizado"):
            f["actualizado"] = viejo.get("actualizado", f["actualizado"])
        por_clave[k] = f
    guardar_csv(nombre, columnas, list(por_clave.values()), orden)
    return len(por_clave) - antes, len(nuevas)


# ---------------------------------------------------------------- proceso principal
def descargar(desde: date, hasta: date, etiqueta: str):
    cfg = cargar_config()
    s = sesion(cfg)
    ath = cfg["athlete_id"]
    print(f"▶ {etiqueta}: del {desde:%d/%m/%Y} al {hasta:%d/%m/%Y}\n")

    acts, well = [], []
    for ini, fin in rangos(desde, hasta):
        p = {"oldest": ini.isoformat(), "newest": fin.isoformat()}
        a = pedir(s, f"{BASE}/athlete/{ath}/activities", p)
        w = pedir(s, f"{BASE}/athlete/{ath}/wellness", p)
        print(f"   {ini:%d/%m} → {fin:%d/%m}: {len(a)} actividades, {len(w)} días de bienestar")
        acts += a
        well += w

    # la API puede devolver alguna actividad fuera de rango por zona horaria: filtramos
    acts = [a for a in acts if desde.isoformat() <= a["start_date_local"][:10] <= hasta.isoformat()]
    well = [w for w in well if desde.isoformat() <= w["id"] <= hasta.isoformat()]

    filas_a, filas_b = [], []
    for i, a in enumerate(acts, start=1):
        det = pedir(s, f"{BASE}/activity/{a['id']}/intervals") or {}
        bloques = det.get("icu_intervals") or []
        filas_a.append(fila_actividad(a, bloques))
        filas_b += filas_bloques(a, bloques)
        print(f"   bloques {i}/{len(acts)}: {a['start_date_local'][:10]} {a.get('type')} ({len(bloques)} bloques)", end="\r")
        time.sleep(0.2)   # pausa corta para no saturar la API
    if acts:
        print()

    fechas = {(desde + timedelta(days=d)).isoformat() for d in range((hasta - desde).days + 1)}
    ids = {f["id"] for f in filas_a}
    na, ta = actualizar("actividades.csv", COLS_ACTIVIDADES, filas_a, lambda f: f["id"],
                        lambda f: (f["fecha"], f["hora_inicio"]), fechas_borrar=fechas)
    # los bloques de las actividades descargadas se reemplazan completos
    existentes_b = [b for b in leer_csv("bloques.csv") if b["id_actividad"] not in ids and b["fecha"] not in fechas]
    guardar_csv("bloques.csv", COLS_BLOQUES, existentes_b + filas_b,
                lambda f: (str(f["fecha"]), str(f["id_actividad"]), int(f["nro_bloque"])))
    nw, tw = actualizar("bienestar.csv", COLS_BIENESTAR, [fila_bienestar(w) for w in well],
                        lambda f: f["fecha"], lambda f: f["fecha"])

    resumen = (f"{ahora()} | {etiqueta} {desde} → {hasta} | "
               f"actividades: {ta} procesadas ({na:+d} nuevas) | bloques: {len(filas_b)} | "
               f"bienestar: {tw} días ({nw:+d} nuevos)")
    DATOS.mkdir(exist_ok=True)
    with open(DATOS / "registro.log", "a", encoding="utf-8") as f:
        f.write(resumen + "\n")

    print(f"\n✅ Listo. Actividades: {ta} procesadas ({na:+d} nuevas) · Bloques: {len(filas_b)} · "
          f"Bienestar: {tw} días ({nw:+d} nuevos)")
    print(f"   Archivos en: {DATOS}")
    if acts:
        primera = min(a["start_date_local"][:10] for a in acts)
        if primera > (desde + timedelta(days=7)).isoformat():
            print(f"\n⚠ La actividad más antigua que devolvió Intervals es del {primera}.\n"
                  f"  Si tenés entrenamientos anteriores, probablemente Zepp no los sincronizó hacia atrás.")
