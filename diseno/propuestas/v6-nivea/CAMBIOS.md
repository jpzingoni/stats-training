# v6 · prueba de paleta y tipografía "Nivea"

**Qué es:** una copia del tablero actual (con los fondos y el "día ganado" verde del 31/10) donde
cambian **solo los colores y la tipografía**. Misma estructura, mismos tamaños y mismo código. Como
la v5, no es una guía completa: es una prueba para decidir.

- Abrir con doble clic: `diseno/propuestas/v6-nivea/tablero/index.html`
- Usa el JS, los datos y Chart.js de `app/` (no hay copias): siempre muestra los datos del día.
- La tipografía se carga de Google Fonts, así que **la prueba necesita internet**. Si se aprueba,
  los archivos de la fuente se copian a `app/vendor/fuentes/` (como Montserrat) para que el
  tablero siga andando sin conexión.
- Capturas: `referencias/v6-nivea/` (`escritorio.png` es la web de referencia; `tablero-*.png`, la prueba).

## De dónde sale

Referencia de Juan (2026-10-31): https://www.nivea.com.ar/productos/gel-de-afeitar-sensitive-40058082291230087.html
Le gustan los colores y la letra de la web, y del producto "ese blanco, azul y verde".

Lo que tiene la web (medido con `mirar.py`):

| Rol en la web | Color |
|---|---|
| Texto y títulos | azul marino `#0032a0` |
| Botones | azul vivo `#0f60ff` |
| Fondos de sección | `#f5f8fe`, `#ebf1fd` |
| Acento suave | celeste `#92b7ff` |
| Producto | blanco, azul marino y el verde lima de la banda "0 % alcohol" |

**Tipografía:** la web usa *NIVEA Brand Type*, la letra propia de la marca, que no se puede usar.
La reemplazo por **Nunito** (Google Fonts, licencia OFL), que tiene el mismo tono redondeado y
amable. Verificado: tiene cifras tabulares ("1111" y "0000" miden lo mismo), así que los números de
las tablas quedan alineados. Como es más angosta que Montserrat, los números grandes y los títulos
suben un peso (600 → 700, 700 → 800) para no verse flojos.

## Qué color va a cada cosa (uno por función)

| Qué | Color | Por qué |
|---|---|---|
| Texto, títulos, control activo | azul marino `#0032a0` | como la web: el texto no es negro |
| Fondo de página / barra lateral | `#f5f8fe` / `#ebf1fd` | celestes de la web; barra lateral clara, como pidió Juan |
| Tarjetas | `#ffffff` | el blanco del producto |
| **Carrera** | azul vivo `#0f60ff` | el color de los botones: el deporte protagonista |
| **Pádel** | naranja `#ff8a1f` | |
| **Caminata** | violeta `#9a5bd6` | antes era verde y desaparecía sobre el día ganado |
| **Ciclismo** | turquesa `#00a3ad` | |
| Pasos y sueño (barras diarias) | celeste `#92b7ff` | el acento suave de la web; no compite con Carrera |
| **Día ganado** (calendario de Este mes) | verde lima `#7cc142`, número en azul marino | el verde del producto; el azul marino se lee mejor que el blanco sobre lima |
| Bueno / malo | `#3b8a1c` / `#d6283c` | verde del producto oscurecido para leerse como texto |
| Calendario de carga (Resumen) | rampa de azul marino | separado del azul vivo de Carrera |
| Zonas de FC | sin cambios | gris → rojo |

Botones de los segmentados con las puntas redondeadas, como los de la web.

## Lo que hay que mirar al decidir

- **Dos azules:** Carrera (vivo) y la interfaz (marino). Se distinguen, pero fijate si en la tabla de
  Carrera el texto y los puntos se confunden.
- **El problema de los colores repetidos no es solo de paleta.** En las capturas se ve: "Estado de
  forma" pinta Fitness con el color de Carrera, Fatiga con el de Pádel y Forma con el de Caminata; y
  la tabla de Carrera pinta cada sesión con un color de deporte (la del 8/9 sale violeta, como si
  fuera una caminata). Eso está en el código de los gráficos (`graficos.js`, `carrera.js`,
  `resumen.js`), no en los tokens, así que ninguna paleta lo arregla sola. Es el punto A1 de
  `evaluaciones/2026-10-12-tablero-completo.md` y conviene resolverlo junto con la paleta que se elija.

## Prompt para la sesión de `app/` (si Juan la aprueba)

```
Aplicá la prueba "v6 Nivea" al tablero, sin tocar estructura ni tamaños. Está en
diseno/propuestas/v6-nivea/tablero/css/estilos.css: es el bloque final "PRUEBA DE PALETA Y
TIPOGRAFÍA" (tokens de color, --fuente y los pesos de los roles tipográficos, más dos reglas de
radio de los segmentados). Copiá esos valores en los tokens de app/css/estilos.css. Bajá Nunito
(400, 500, 600, 700 y 800, latin + latin-ext) a app/vendor/fuentes/ con su OFL.txt y cambiá los
@font-face (nada de Google Fonts en producción: tiene que andar con file:// y sin conexión).
Actualizá las secciones de tipografía y color de app/DESIGN.md con las tablas de
diseno/propuestas/v6-nivea/CAMBIOS.md. Verificá todas las vistas a 1440×900 y a 390px.
```
