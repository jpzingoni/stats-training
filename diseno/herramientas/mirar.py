"""Captura una página web (o una vista del tablero) para que el chat de diseño la pueda mirar.

Uso:
  python herramientas/mirar.py <url> <nombre>
  python herramientas/mirar.py tablero:<vista> <nombre>     p. ej.: tablero:carrera v2-antes

Guarda en referencias/<nombre>/:
  escritorio.png          primera pantalla, 1440×900
  escritorio-largo.png    página completa, recortada a 4000 px de alto
  celular.png             primera pantalla, 390×844
  celular-oscuro.png      solo para el tablero
y muestra el título, las fuentes y los colores más usados en la página.
"""
import sys
from collections import Counter
from pathlib import Path

from playwright.sync_api import sync_playwright

# La consola de Windows usa cp1252: forzamos UTF-8 para poder imprimir acentos y símbolos
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:
    pass

DISENO = Path(__file__).resolve().parent.parent
RAIZ = DISENO.parent

if len(sys.argv) < 3:
    sys.exit(__doc__)
destino, nombre = sys.argv[1], sys.argv[2]

es_tablero = destino.startswith("tablero:")
if es_tablero:
    vista = destino.split(":", 1)[1] or "inicio"
    url = (RAIZ / "app" / "index.html").as_uri() + ("" if vista == "inicio" else f"#{vista}")
else:
    url = destino if destino.startswith("http") else f"https://{destino}"

salida = DISENO / "referencias" / nombre
salida.mkdir(parents=True, exist_ok=True)

ESTILOS_JS = """() => {
  const fuentes = new Map(), colores = new Map();
  const sumar = (m, k) => k && m.set(k, (m.get(k) || 0) + 1);
  for (const el of [...document.querySelectorAll('body *')].slice(0, 3000)) {
    const s = getComputedStyle(el);
    if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) {
      sumar(fuentes, s.fontFamily.split(',')[0].replace(/["']/g, '').trim() + ' ' + s.fontSize + ' ' + s.fontWeight);
      sumar(colores, 'texto ' + s.color);
    }
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') sumar(colores, 'fondo ' + s.backgroundColor);
  }
  const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
  return { titulo: document.title, fuentes: top(fuentes, 12), colores: top(colores, 12) };
}"""

AGENTE = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
          "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def abrir(nav, ancho, alto, tema="light", celular=False):
    ctx = nav.new_context(viewport={"width": ancho, "height": alto}, color_scheme=tema,
                          is_mobile=celular, user_agent=None if es_tablero else AGENTE,
                          locale="es-AR")
    pag = ctx.new_page()
    try:
        pag.goto(url, wait_until="domcontentloaded", timeout=30000)
        pag.wait_for_load_state("networkidle", timeout=8000)
    except Exception:
        pass  # muchas webs nunca quedan "quietas": se captura igual
    pag.wait_for_timeout(1200)
    return ctx, pag


with sync_playwright() as p:
    nav = p.chromium.launch()

    ctx, pag = abrir(nav, 1440, 900)
    pag.screenshot(path=str(salida / "escritorio.png"))
    alto = min(pag.evaluate("document.documentElement.scrollHeight"), 4000)
    pag.set_viewport_size({"width": 1440, "height": alto})
    pag.wait_for_timeout(500)
    pag.screenshot(path=str(salida / "escritorio-largo.png"))
    info = pag.evaluate(ESTILOS_JS)
    ctx.close()

    ctx, pag = abrir(nav, 390, 844, celular=True)
    pag.screenshot(path=str(salida / "celular.png"))
    ctx.close()

    if es_tablero:
        ctx, pag = abrir(nav, 390, 844, tema="dark", celular=True)
        pag.screenshot(path=str(salida / "celular-oscuro.png"))
        ctx.close()

    nav.close()

print(f"URL: {url}")
print(f"Título: {info['titulo']}")
print(f"Capturas en: {salida.relative_to(DISENO)}")
print("Fuentes más usadas (familia tamaño peso -> apariciones):")
for f, n in info["fuentes"]:
    print(f"  {f} -> {n}")
print("Colores más usados:")
for c, n in info["colores"]:
    print(f"  {c} -> {n}")
