"""
CARGA HISTÓRICA — se corre UNA sola vez.
Baja todo desde la compra del reloj hasta ANTES DE AYER.

Uso:
    python scripts/historico.py                 # desde 2026-07-10 (por defecto)
    python scripts/historico.py 2026-07-25      # desde otra fecha
"""

import sys
from datetime import date, timedelta

from intervals_comun import DATOS, descargar

DESDE_POR_DEFECTO = date(2026, 7, 10)   # primeros datos del reloj

if __name__ == "__main__":
    desde = date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else DESDE_POR_DEFECTO
    hasta = date.today() - timedelta(days=2)   # hasta antes de ayer

    if (DATOS / "actividades.csv").exists() and sys.stdin.isatty():
        try:
            resp = input("⚠ Ya existe una carga previa en /datos. ¿Volver a correr el histórico? "
                         "(no borra nada, actualiza) [s/N]: ")
        except EOFError:   # en Windows, NUL cuenta como terminal pero no tiene respuesta
            resp = ""
        if resp.strip().lower() != "s":
            sys.exit("Cancelado.")

    descargar(desde, hasta, "Histórico")
