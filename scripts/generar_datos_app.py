"""
GENERADOR DE DATOS DEL TABLERO — convierte los CSV de datos/ en app/data/datos.js.

El tablero (app/) es un sitio estático: no puede leer ../datos/ en producción, así que
este script prepara todo lo que necesita. Los cálculos (ritmo en segundos, eficiencia,
agregados semanales, medias móviles) se hacen acá para que el JavaScript solo filtre y
dibuje.

Usa además scripts/plantillas.csv (catálogo de plantillas de Zepp) para reconocer la
plantilla de cada sesión y la fase de cada bloque (ver scripts/plantillas.py).

Genera un único archivo, app/data/datos.js, que define window.DATOS_TABLERO con:
    meta          rango de fechas, conteos, zonas de FC
    actividades   una entrada por sesión, con sus bloques
    semanas       agregados por semana ISO (lunes a domingo)
    bienestar     una entrada por día, con medias móviles de 7 días
    crudos        los tres CSV tal cual vienen + qué columnas usa el tablero

Además genera app/data/minutos.js (window.MINUTOS_TABLERO) con la grabación de cada
sesión resumida por minuto (datos/minutos.csv), en un archivo aparte para que datos.js
siga liviano y legible: una línea por actividad y una lista por columna.

Es un .js (y no JSON) porque se carga con <script>: así el tablero funciona abriendo
app/index.html directo desde el disco, sin levantar un servidor (el navegador bloquea
fetch() sobre file://). Va indentado para que los diffs en GitHub se puedan leer.

La salida es determinística (sin la hora actual): si los CSV no cambian, el archivo
tampoco, y el workflow no hace commits vacíos.

Uso:
    python scripts/generar_datos_app.py
"""

import csv
import json
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

import plantillas

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos"
SALIDA = RAIZ / "app" / "data"

VERSION_ESQUEMA = 1
ZONAS_FC_CARRERA = [139, 147, 155, 164, 168, 173, 182]    # límite superior de Z1…Z7
CATEGORIAS_RESUMEN = ["Carrera", "Pádel", "Caminata", "Ciclismo"]   # el resto va a "Otras"
BLOQUE_PRINCIPAL = 2                                       # en las corridas de "Bloques"
MIN_VALORES_MEDIA_MOVIL = 3                                # de los últimos 7 días

# Columnas que usa el tablero y dónde. Es lo que muestra la pestaña "Datos" para
# distinguir lo que está en uso de lo que no. Si un gráfico empieza a usar una
# columna nueva, agregarla acá.
USO_COLUMNAS = {
    "actividades": {
        "id": "Detalle de bloques (vínculo con bloques.csv)",
        "fecha": "Todas las pestañas",
        "categoria": "Todas las pestañas",
        "subtipo": "Carrera: eficiencia, km semanales, tabla",
        "duracion_s": "Resumen: horas; Pádel; Carrera: eficiencia; Otras actividades",
        "distancia_m": "Resumen: km; Carrera: km semanales, eficiencia; Otras actividades",
        "ritmo_min_km": "Carrera: tabla de sesiones",
        "fc_media": "Carrera: eficiencia; Pádel: FC por sesión; Otras actividades: tabla",
        "fc_max": "Pádel: FC por sesión; Carrera y Otras actividades: tablas",
        "carga_hrss": "Resumen: carga; Pádel: carga por sesión; Otras actividades: tabla",
        "z1_s": "Carrera y Pádel: zonas de FC",
        "z2_s": "Carrera y Pádel: zonas de FC",
        "z3_s": "Carrera y Pádel: zonas de FC",
        "z4_s": "Carrera y Pádel: zonas de FC",
        "z5_s": "Carrera y Pádel: zonas de FC",
        "z6_s": "Carrera y Pádel: zonas de FC",
        "z7_s": "Carrera y Pádel: zonas de FC",
        "cadencia_ppm": "Carrera: dinámica",
        "zancada_m": "Carrera: dinámica",
        "contacto_ms": "Carrera: dinámica",
        "oscilacion_cm": "Carrera: dinámica",
        "desnivel_pos_m": "Ciclismo y Otras actividades; detalle de sesión",
        "hora_inicio": "Detalle de sesión",
        "tiempo_total_s": "Detalle de sesión",
        "calorias": "Detalle de sesión",
        "trimp": "Detalle de sesión",
        "intensidad_pct": "Detalle de sesión",
        "recuperacion_fc": "Detalle de sesión",
        "potencia_w": "Carrera: tarjeta de potencia; detalle de sesión",
    },
    "bloques": {
        "id_actividad": "Detalle de sesión: vueltas",
        "nro_bloque": "Carrera: bloque principal y detalle",
        "tipo": "Detalle de sesión: vueltas",
        "duracion_s": "Detalle de sesión: vueltas",
        "distancia_m": "Detalle de sesión: vueltas",
        "ritmo_min_km": "Carrera: ritmo del bloque principal",
        "fc_media": "Carrera: FC del bloque principal",
        "fc_max": "Detalle de sesión: vueltas",
        "cadencia_ppm": "Detalle de sesión: vueltas",
        "desnivel_pos_m": "Detalle de sesión: vueltas",
        "potencia_w": "Carrera: potencia por etapa",
    },
    "minutos": {
        "id_actividad": "Vínculo con la actividad",
        "minuto": "Carrera: curvas minuto a minuto",
        "segundos": "Carrera: curvas (descarta minutos muy incompletos)",
        "ritmo_min_km": "Carrera: curva de ritmo",
        "velocidad_ms": "Carrera: deriva cardíaca",
        "fc_media": "Carrera: curva de FC y deriva; Pádel: FC por minuto",
        "potencia_w": "Carrera: curva de potencia",
        "cadencia_ppm": "Carrera: curva de cadencia",
        "zancada_m": "Carrera: curva de zancada",
    },
    "bienestar": {
        "fecha": "Resumen y Recuperación",
        "fitness_ctl": "Resumen: forma",
        "fatiga_atl": "Resumen: forma",
        "forma": "Resumen: forma",
        "carga_dia": "Resumen: calendario de carga",
        "fc_reposo": "Recuperación: FC en reposo",
        "sueno_horas": "Recuperación: sueño",
        "sueno_puntaje": "Recuperación: sueño",
        "pasos": "Recuperación: pasos",
    },
}


# ─── Lectura y conversión ────────────────────────────────────────────────────

def leer_csv(nombre):
    with open(DATOS / nombre, encoding="utf-8-sig", newline="") as f:
        lector = csv.DictReader(f)
        return lector.fieldnames, list(lector)


def numero(texto):
    """'37' → 37, '0.81' → 0.81, '' → None."""
    if texto is None or texto.strip() == "":
        return None
    valor = float(texto)
    return int(valor) if valor.is_integer() else valor


def ritmo_a_segundos(texto):
    """'9:10' → 550. Vacío → None."""
    if not texto:
        return None
    minutos, segundos = texto.split(":")
    return int(minutos) * 60 + int(segundos)


def eficiencia(distancia_m, duracion_s, fc_media):
    """Metros recorridos por latido: sube cuando corrés más rápido con la misma FC."""
    if not (distancia_m and duracion_s and fc_media):
        return None
    return round(distancia_m / duracion_s * 60 / fc_media, 3)


def semana_iso(fecha):
    anio, semana, _ = fecha.isocalendar()
    return f"{anio}-W{semana:02d}"


def lunes(fecha):
    return fecha - timedelta(days=fecha.weekday())


def categoria_resumen(categoria):
    return categoria if categoria in CATEGORIAS_RESUMEN else "Otras"


# ─── Armado de cada JSON ─────────────────────────────────────────────────────

def armar_bloques(filas):
    por_actividad = defaultdict(list)
    for b in filas:
        por_actividad[b["id_actividad"]].append({
            "nro": int(b["nro_bloque"]),
            "tipo": b["tipo"],
            "inicio_s": numero(b["inicio_s"]),
            "duracion_s": numero(b["duracion_s"]),
            "distancia_m": numero(b["distancia_m"]),
            "ritmo_s_km": ritmo_a_segundos(b["ritmo_min_km"]),
            "fc_media": numero(b["fc_media"]),
            "fc_max": numero(b["fc_max"]),
            "cadencia": numero(b["cadencia_ppm"]),
            "desnivel_m": numero(b["desnivel_pos_m"]),
            "potencia_w": numero(b.get("potencia_w", "")),
        })
    for lista in por_actividad.values():
        lista.sort(key=lambda b: b["nro"])
    return por_actividad


CATEGORIAS_CON_PLANTILLA = ("Carrera", "Caminata")   # las plantillas de Zepp son de correr/caminar


def armar_actividades(filas, bloques, catalogo):
    actividades = []
    for a in filas:
        propios = bloques.get(a["id"], [])
        # Plantilla de Zepp y fase de cada bloque (ver scripts/plantillas.py)
        plantilla = ajuste = entrenamiento = None
        if a["categoria"] in CATEGORIAS_CON_PLANTILLA:
            resultado = plantillas.asignar(propios, catalogo)
            if resultado:
                plantilla, ajuste, fases = resultado
                for b, f in zip(propios, fases):
                    b["fase"] = f
                entrenamiento = plantillas.resumen_fase(propios, fases)
            elif a["categoria"] == "Carrera":
                plantilla = "Libre"
        principal = None
        if a["subtipo"] == "Bloques":
            principal = next((b for b in propios if b["nro"] == BLOQUE_PRINCIPAL), None)
            if principal is None:
                print(f"⚠️  {a['fecha']} ({a['id']}): corrida de Bloques sin bloque {BLOQUE_PRINCIPAL}")
        actividades.append({
            "id": a["id"],
            "fecha": a["fecha"],
            "hora": a["hora_inicio"],
            "categoria": a["categoria"],
            "subtipo": a["subtipo"] or None,
            "nombre": a["nombre"],
            "duracion_s": numero(a["duracion_s"]),
            "distancia_m": numero(a["distancia_m"]),
            "ritmo_s_km": ritmo_a_segundos(a["ritmo_min_km"]),
            "fc_media": numero(a["fc_media"]),
            "fc_max": numero(a["fc_max"]),
            "potencia_w": numero(a.get("potencia_w", "")),
            "carga": numero(a["carga_hrss"]),
            "desnivel_m": numero(a["desnivel_pos_m"]),
            "tiempo_total_s": numero(a["tiempo_total_s"]),
            "calorias": numero(a["calorias"]),
            "trimp": numero(a["trimp"]),
            "intensidad_pct": numero(a["intensidad_pct"]),
            "recuperacion_fc": numero(a["recuperacion_fc"]),
            "zonas_s": [numero(a[f"z{i}_s"]) or 0 for i in range(1, 8)],
            "dinamica": {
                "cadencia": numero(a["cadencia_ppm"]),
                "zancada": numero(a["zancada_m"]),
                "contacto": numero(a["contacto_ms"]),
                "oscilacion": numero(a["oscilacion_cm"]),
            },
            "eficiencia": eficiencia(numero(a["distancia_m"]), numero(a["duracion_s"]),
                                     numero(a["fc_media"])),
            "bloques": propios,
            "bloque_principal": principal,
            "plantilla": plantilla,
            "ajuste_plantilla": ajuste,
            "entrenamiento": entrenamiento,
        })
    actividades.sort(key=lambda a: (a["fecha"], a["hora"] or "", a["id"]))
    return actividades


def armar_semanas(actividades, desde, hasta):
    """Todas las semanas del rango, aunque estén vacías, para que los gráficos no salten."""
    semanas = {}
    inicio = lunes(desde)
    while inicio <= hasta:
        semanas[semana_iso(inicio)] = {
            "semana": semana_iso(inicio),
            "inicio": inicio.isoformat(),
            "total": {"sesiones": 0, "duracion_s": 0, "carga": 0},
            "por_categoria": {},
        }
        inicio += timedelta(days=7)

    for a in actividades:
        s = semanas[semana_iso(date.fromisoformat(a["fecha"]))]
        s["total"]["sesiones"] += 1
        s["total"]["duracion_s"] += a["duracion_s"] or 0
        s["total"]["carga"] += a["carga"] or 0

        cat = s["por_categoria"].setdefault(categoria_resumen(a["categoria"]), {
            "sesiones": 0, "duracion_s": 0, "distancia_m": 0, "carga": 0, "zonas_s": [0] * 7,
        })
        cat["sesiones"] += 1
        cat["duracion_s"] += a["duracion_s"] or 0
        cat["distancia_m"] += a["distancia_m"] or 0
        cat["carga"] += a["carga"] or 0
        cat["zonas_s"] = [x + y for x, y in zip(cat["zonas_s"], a["zonas_s"])]
        if a["categoria"] == "Carrera":
            por_subtipo = cat.setdefault("distancia_m_por_subtipo", {})
            clave = a["subtipo"] or "Sin subtipo"
            por_subtipo[clave] = por_subtipo.get(clave, 0) + (a["distancia_m"] or 0)

    return list(semanas.values())


def media_movil(valores, i):
    ventana = [v for v in valores[max(0, i - 6): i + 1] if v is not None]
    if len(ventana) < MIN_VALORES_MEDIA_MOVIL:
        return None
    return round(sum(ventana) / len(ventana), 1)


def armar_bienestar(filas):
    filas = sorted(filas, key=lambda r: r["fecha"])
    fc = [numero(r["fc_reposo"]) for r in filas]
    sueno = [numero(r["sueno_horas"]) for r in filas]
    dias = []
    for i, r in enumerate(filas):
        dias.append({
            "fecha": r["fecha"],
            "ctl": numero(r["fitness_ctl"]),
            "atl": numero(r["fatiga_atl"]),
            "forma": numero(r["forma"]),
            "carga_dia": numero(r["carga_dia"]),
            "fc_reposo": fc[i],
            "fc_reposo_m7": media_movil(fc, i),
            "sueno_horas": sueno[i],
            "sueno_horas_m7": media_movil(sueno, i),
            "sueno_puntaje": numero(r["sueno_puntaje"]),
            "pasos": numero(r["pasos"]),
        })
    return dias


def armar_crudos(tablas, columnas_minutos):
    salida = {}
    uso = USO_COLUMNAS["minutos"]
    salida["minutos"] = {
        "columnas": [{"nombre": c, "en_uso": c in uso, "uso": uso.get(c)} for c in columnas_minutos],
        "filas": None,      # se reconstruyen en el tablero a partir de minutos.js
    }
    for nombre, (columnas, filas) in tablas.items():
        uso = USO_COLUMNAS[nombre]
        desconocidas = set(uso) - set(columnas)
        if desconocidas:
            print(f"⚠️  USO_COLUMNAS[{nombre}] menciona columnas que no existen: {sorted(desconocidas)}")
        salida[nombre] = {
            "columnas": [{"nombre": c, "en_uso": c in uso, "uso": uso.get(c)} for c in columnas],
            "filas": [[f[c] for c in columnas] for f in filas],
        }
    return salida


def escribir(contenido):
    """Escribe datos.js solo si cambió. Devuelve True si lo escribió."""
    ruta = SALIDA / "datos.js"
    texto = ("// Generado por scripts/generar_datos_app.py a partir de datos/*.csv. No editar a mano.\n"
             "window.DATOS_TABLERO = " + json.dumps(contenido, ensure_ascii=False, indent=1) + ";\n")
    if ruta.exists() and ruta.read_text(encoding="utf-8") == texto:
        return False
    ruta.write_text(texto, encoding="utf-8", newline="\n")
    return True


# ─── Minutos ─────────────────────────────────────────────────────────────────

# Columnas de minutos.csv → clave corta en minutos.js
CLAVES_MINUTOS = {
    "segundos": "seg", "distancia_m": "dist", "ritmo_min_km": "ritmo", "velocidad_ms": "vel",
    "fc_media": "fc", "fc_max": "fcmax", "cadencia_ppm": "cad", "potencia_w": "pot",
    "altitud_m": "alt", "zancada_m": "zancada", "contacto_ms": "contacto", "oscilacion_cm": "osc",
}


def armar_minutos(filas, actividades):
    """
    {id: {seg: [...], ritmo: [...], ..., bloque: [...]}} con una lista por columna.
    "bloque" es el nro del bloque de cada minuto, asignado por el punto medio del minuto
    (un minuto que empieza 1 s antes de un cambio de bloque pertenece casi entero al siguiente).
    """
    bloques = {a["id"]: a["bloques"] for a in actividades}
    por_act = defaultdict(list)
    for f in filas:
        por_act[f["id_actividad"]].append(f)
    salida = {}
    for id_act in sorted(por_act):
        por_minuto = {int(f["minuto"]): f for f in por_act[id_act]}
        serie = {clave: [] for clave in CLAVES_MINUTOS.values()}
        serie["bloque"] = []
        # La posición en cada lista ES el minuto: si el reloj no grabó algunos (pausa), van vacíos
        for minuto in range(max(por_minuto) + 1):
            f = por_minuto.get(minuto)
            if f is None:
                for lista in serie.values():
                    lista.append(None)
                continue
            for col, clave in CLAVES_MINUTOS.items():
                serie[clave].append(ritmo_a_segundos(f[col]) if col == "ritmo_min_km" else numero(f[col]))
            medio = int(f["minuto"]) * 60 + (numero(f["segundos"]) or 60) / 2
            nro = next((b["nro"] for b in bloques.get(id_act, [])
                        if b["inicio_s"] is not None and b["duracion_s"]
                        and b["inicio_s"] <= medio < b["inicio_s"] + b["duracion_s"]), None)
            serie["bloque"].append(nro)
        # Columnas totalmente vacías (p. ej., pádel sin ritmo) no se escriben
        salida[id_act] = {k: v for k, v in serie.items() if any(x is not None for x in v)}
    return salida


def escribir_minutos(minutos):
    """Una línea por actividad: los diffs diarios solo agregan las sesiones nuevas."""
    ruta = SALIDA / "minutos.js"
    lineas = [f" {json.dumps(k)}: {json.dumps(v, ensure_ascii=False, separators=(',', ':'))}"
              for k, v in minutos.items()]
    texto = ("// Generado por scripts/generar_datos_app.py a partir de datos/minutos.csv. No editar a mano.\n"
             "window.MINUTOS_TABLERO = {\n" + ",\n".join(lineas) + "\n};\n")
    if ruta.exists() and ruta.read_text(encoding="utf-8") == texto:
        return False
    ruta.write_text(texto, encoding="utf-8", newline="\n")
    return True


# ─── Principal ───────────────────────────────────────────────────────────────

def main():
    tablas = {n: leer_csv(f"{n}.csv") for n in ("actividades", "bloques", "bienestar")}
    _, filas_act = tablas["actividades"]
    _, filas_blo = tablas["bloques"]
    _, filas_bie = tablas["bienestar"]

    catalogo = plantillas.leer_catalogo()
    actividades = armar_actividades(filas_act, armar_bloques(filas_blo), catalogo)
    bienestar = armar_bienestar(filas_bie)

    fechas = [a["fecha"] for a in actividades] + [d["fecha"] for d in bienestar]
    desde, hasta = date.fromisoformat(min(fechas)), date.fromisoformat(max(fechas))
    actualizado = max(f["actualizado"] for _, filas in tablas.values()
                      for f in filas if f.get("actualizado"))

    conteos = defaultdict(int)
    for a in actividades:
        conteos[a["categoria"]] += 1

    meta = {
        "version_esquema": VERSION_ESQUEMA,
        "generado": actualizado,
        "desde": desde.isoformat(),
        "hasta": hasta.isoformat(),
        "actividades_por_categoria": dict(sorted(conteos.items())),
        "zonas_fc_carrera": ZONAS_FC_CARRERA,
        "bloque_principal": BLOQUE_PRINCIPAL,
        # Catálogo de plantillas de Zepp (para mostrar su estructura en el tablero)
        "plantillas": {n: [{"fase": p["fase"], "tipo": p["tipo"], "valor": p["valor"]} for p in pasos]
                       for n, pasos in catalogo.items()},
    }

    SALIDA.mkdir(parents=True, exist_ok=True)
    columnas_min, filas_min = leer_csv("minutos.csv") if (DATOS / "minutos.csv").exists() else ([], [])
    cambio_min = escribir_minutos(armar_minutos(filas_min, actividades))

    cambio = escribir({
        "meta": meta,
        "actividades": actividades,
        "semanas": armar_semanas(actividades, desde, hasta),
        "bienestar": bienestar,
        "crudos": armar_crudos(tablas, columnas_min),
    })
    print(f"✅ Datos del tablero: {len(actividades)} actividades, {len(bienestar)} días "
          f"({desde} → {hasta}), {len(filas_min)} minutos. "
          f"datos.js: {'actualizado' if cambio else 'sin cambios'} · minutos.js: {'actualizado' if cambio_min else 'sin cambios'}")


if __name__ == "__main__":
    main()
