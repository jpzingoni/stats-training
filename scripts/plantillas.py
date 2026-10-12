"""
PLANTILLAS DE ZEPP — reconoce qué plantilla se usó en cada sesión y la fase de cada bloque.

El archivo FIT que llega a Intervals no trae el nombre de la plantilla, pero su estructura
queda en las vueltas: cada bloque de una plantilla termina por tiempo (ej. 25:00) o por
distancia (ej. 2 km). Este módulo compara los bloques de cada sesión con el catálogo
scripts/plantillas.csv y devuelve la plantilla que coincide (o ninguna).

Catálogo (una fila por paso de la plantilla):
    plantilla      nombre como figura en Zepp
    orden          orden del paso
    fase           Calentamiento / Entrenamiento / Relajado / Restaurar
    objetivo       "mm:ss" si termina por tiempo, "N km" o "N m" si termina por distancia
    ciclo, repeticiones
                   los pasos con la misma letra de ciclo se repiten juntos N veces
                   (ej. 3:30 corriendo + 1:30 caminando, ×7)
"""

import csv
from collections import OrderedDict
from pathlib import Path

CATALOGO = Path(__file__).resolve().parent / "plantillas.csv"

DURACION_MIN_BLOQUE = 10          # los cortes de 1 s al final de una sesión no cuentan
TOLERANCIA_TIEMPO_S = 3           # un objetivo de 25:00 termina entre 24:57 y 25:03
TOLERANCIA_RELATIVA = 0.02        # 2 % (para distancias, y tiempos largos)
TOLERANCIA_CALENTAMIENTO = 0.25   # el calentamiento a veces se alarga (pausas, vuelta tarde)


def _objetivo(texto):
    """'3:30' → ('tiempo', 210) · '2 km' → ('distancia', 2000) · '500 m' → ('distancia', 500)"""
    t = texto.strip().lower().replace(",", ".")
    if ":" in t:
        m, s = t.split(":")
        return "tiempo", int(m) * 60 + int(s)
    if t.endswith("km"):
        return "distancia", float(t[:-2]) * 1000
    if t.endswith("m"):
        return "distancia", float(t[:-1])
    raise ValueError(f"Objetivo no reconocido en plantillas.csv: {texto!r}")


def leer_catalogo(ruta=CATALOGO):
    """Devuelve {nombre: [paso, ...]} con los ciclos ya desplegados en orden."""
    if not ruta.exists():
        return {}
    filas = OrderedDict()
    with open(ruta, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            filas.setdefault(r["plantilla"].strip(), []).append(r)

    catalogo = {}
    for nombre, pasos in filas.items():
        pasos.sort(key=lambda r: int(r["orden"]))
        desplegados, i = [], 0
        while i < len(pasos):
            ciclo = pasos[i]["ciclo"].strip()
            if ciclo:
                grupo = [p for p in pasos[i:] if p["ciclo"].strip() == ciclo]
                veces = int(grupo[0]["repeticiones"] or 1)
                for _ in range(veces):
                    desplegados += grupo
                i += len(grupo)
            else:
                desplegados.append(pasos[i])
                i += 1
        catalogo[nombre] = [
            {"fase": p["fase"].strip(), **dict(zip(("tipo", "valor"), _objetivo(p["objetivo"])))}
            for p in desplegados
        ]
    return catalogo


def _desvio(paso, bloque):
    """Desvío relativo entre lo que pedía el paso y lo que duró/recorrió el bloque."""
    if paso["tipo"] == "tiempo":
        return abs((bloque["duracion_s"] or 0) - paso["valor"]) / paso["valor"]
    if not bloque["distancia_m"]:
        return float("inf")
    return abs(bloque["distancia_m"] - paso["valor"]) / paso["valor"]


def _tolerancia(paso):
    if paso["tipo"] == "tiempo":
        return max(TOLERANCIA_TIEMPO_S / paso["valor"], TOLERANCIA_RELATIVA)
    return TOLERANCIA_RELATIVA


def asignar(bloques, catalogo):
    """
    Busca la plantilla que mejor explica los bloques de una sesión.

    Devuelve (nombre, ajuste, fases) o None si ninguna coincide:
      ajuste  "exacta"      todos los bloques cumplen su objetivo
              "aproximada"  la estructura coincide pero el calentamiento se desvió
              "incompleta"  la sesión cortó antes de terminar la plantilla
      fases   lista paralela a `bloques` con la fase de cada uno (None en los cortes cortos)
    """
    validos = [i for i, b in enumerate(bloques) if (b["duracion_s"] or 0) >= DURACION_MIN_BLOQUE]
    if not validos:
        return None
    candidatos = []
    for nombre, pasos in catalogo.items():
        n = len(validos)
        completa = n == len(pasos)
        # Más bloques que pasos: no es esta plantilla. Menos: solo si hizo al menos la mitad.
        if n > len(pasos) or (not completa and n < max(2, len(pasos) // 2)):
            continue
        exactos, entrenamientos_cumplidos, total_desvio, aceptada = 0, 0, 0.0, True
        for k, (paso, i) in enumerate(zip(pasos, validos)):
            d = _desvio(paso, bloques[i])
            ultimo_de_incompleta = not completa and k == n - 1
            if d <= _tolerancia(paso):
                exactos += 1
                entrenamientos_cumplidos += paso["fase"] == "Entrenamiento"
            elif paso["fase"] == "Calentamiento" and d <= TOLERANCIA_CALENTAMIENTO:
                pass
            elif ultimo_de_incompleta and (paso["tipo"] == "tiempo" and bloques[i]["duracion_s"] < paso["valor"]
                                           or paso["tipo"] == "distancia" and (bloques[i]["distancia_m"] or 0) < paso["valor"]):
                pass        # cortó la sesión a mitad de este paso
            else:
                aceptada = False
                break
            total_desvio += min(d, 1)
        # Una sesión cortada solo cuenta si llegó a cumplir algún bloque de entrenamiento
        # (si no, cualquier caminata de 1 km "empezaría" la plantilla 3KM CO)
        if not aceptada or (not completa and not entrenamientos_cumplidos):
            continue
        ajuste = "incompleta" if not completa else ("exacta" if exactos == n else "aproximada")
        # Preferir: completa > incompleta, más bloques exactos, menos desvío total
        candidatos.append(((not completa, -exactos, total_desvio), nombre, ajuste, pasos))
    if not candidatos:
        return None
    _, nombre, ajuste, pasos = min(candidatos)
    fases = [None] * len(bloques)
    for paso, i in zip(pasos, validos):
        fases[i] = paso["fase"]
    return nombre, ajuste, fases


def resumen_fase(bloques, fases, fase="Entrenamiento"):
    """Tiempo, distancia, ritmo y FC (ponderada por tiempo) de los bloques de una fase."""
    elegidos = [b for b, f in zip(bloques, fases) if f == fase and b["duracion_s"]]
    if not elegidos:
        return None
    dur = sum(b["duracion_s"] for b in elegidos)
    dist = sum(b["distancia_m"] or 0 for b in elegidos)
    def ponderado(clave):
        con = [b for b in elegidos if b.get(clave) is not None]
        return sum(b[clave] * b["duracion_s"] for b in con) / sum(b["duracion_s"] for b in con) if con else None
    fc = ponderado("fc_media")
    potencia = ponderado("potencia_w")
    return {
        "bloques": len(elegidos),
        "duracion_s": dur,
        "distancia_m": round(dist),
        "ritmo_s_km": round(dur / dist * 1000) if dist else None,
        "fc_media": round(fc) if fc is not None else None,
        "potencia_w": round(potencia) if potencia is not None else None,
        "eficiencia": round(dist / dur * 60 / fc, 3) if dist and fc else None,
    }
