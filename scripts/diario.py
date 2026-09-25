"""
ACTUALIZACIÓN DIARIA — agrega los datos hasta AYER.

Por defecto vuelve a bajar los últimos 7 días (terminando ayer) y los
actualiza en los CSV. Así se corrigen solas las cosas que llegan tarde:
una actividad que el reloj sincronizó con demora, el sueño que Zepp
completó después, o el fitness/fatiga que Intervals recalcula.

Uso:
    python scripts/diario.py          # últimos 7 días hasta ayer
    python scripts/diario.py 14       # últimos 14 días (por ejemplo, si no lo corriste en una semana)
"""

import sys
from datetime import date, timedelta

from intervals_comun import DATOS, descargar

DIAS_REVISION = 7

if __name__ == "__main__":
    if not (DATOS / "actividades.csv").exists():
        sys.exit("❌ Todavía no hay datos. Corré primero:  python scripts/historico.py")

    dias = int(sys.argv[1]) if len(sys.argv) > 1 else DIAS_REVISION
    hasta = date.today() - timedelta(days=1)          # hasta ayer
    desde = hasta - timedelta(days=dias - 1)
    descargar(desde, hasta, "Diario")
