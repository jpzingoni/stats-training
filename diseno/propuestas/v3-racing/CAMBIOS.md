# v3 · "Racing": cambios contra la guía vigente (v1)

> **2026-10-13 (tarde):** Juan trajo otra referencia (https://rachel-pt.framer.website/) y prefirió
> su paleta y su tipografía. La **v4 "Pulso"** (`propuestas/v4-pulso/`) reemplaza a esta en color y
> tipografía y conserva la banda del objetivo. No implementar la v3.

**La idea en una frase:** el tablero se viste de equipo de carreras británico (verde racing,
lima, tipografía ancha) y abre siempre con cuánto te falta para correr 10 km.

**De dónde sale:** Juan rechazó Barlow y la sobriedad de v1 y v2. Pidió color estilo Aston
Martin y que el tablero lo empuje hacia el objetivo (`referencias/gustos.md`, 2026-10-13). La v3
**conserva el sistema de la v2**: plantilla de vista, componentes únicos, roles de color y
gramática de gráficos. Cambia la tipografía, la paleta y el tono. La v2 queda como antecedente y
no se implementa por separado.

Maqueta: `maqueta.html` ("Este mes" y "Carrera" con datos reales; botones de claro/oscuro y
escritorio/celular). Capturas revisadas: `referencias/v3-maqueta/`.

## Cómo leí la dirección (y por qué)

"Estilo Aston Martin" admitía dos lecturas: **lujo** (fondos negros, tipografía fina, mucho aire)
o **equipo de carreras** (verde racing, lima, tipografía ancha, datos de telemetría). Elegí la
segunda porque sirve mejor para **comparar sesiones y ver progreso**:
- El lima, usado poco, marca **lo que te acerca a la meta**: la última sesión, la barra de los
  10 km y los datos de Carrera. El ojo va directo a la comparación.
- La tipografía ancha da presencia a los números sin agrandarlos. En las tablas se usa el ancho
  normal, que se lee mejor.
- La lectura de lujo pide aire y poca densidad, justo lo que molestó en Garmin y lo que la v2
  corrigió.

## Referencias usadas

| Referencia | URL | Qué tomé |
|---|---|---|
| Aston Martin Aramco F1 | https://www.astonmartinf1.com/en-GB | Los tres colores de marca medidos en la página (`#00665E`, `#00231F`, `#CEDC00`) y el uso escaso del lima |
| Aston Martin (autos) | https://www.astonmartin.com/en | Controles rellenos en `#00665E` y neutros con tinte verde en lugar de grises |
| Runna (planes de 10K) | https://www.runna.com/10k-training-app · https://screensdesign.com/showcase/runna-running-training-plans | El objetivo como titular y la barra de progreso segmentada |
| Formula 1: resultados | https://www.formula1.com/en/results/2024/races | El par "titulares anchos + tablas de ancho normal" con tiempos tabulares |
| Archivo (Google Fonts) | https://fonts.google.com/specimen/Archivo | Una familia libre (OFL) con eje de ancho: dos anchos, una sola fuente |
| Muestrario propio | `referencias/v3-tipografias/muestrario.png` | 15 candidatas probadas con números reales; todas con cifras tabulares menos Chakra Petch |

Detalle de cada una en `referencias/notas.md` §8.

## Diferencias contra la vigente (v1)

| # | Qué cambia | Por qué | Archivos del tablero |
|---|---|---|---|
| 1 | **Tipografía: Archivo** (variable, OFL) en lugar de Barlow + Barlow Semi Condensed. Tres anchos (`--ancho-normal` 100 %, `--ancho-medio` 112 %, `--ancho-expandido` 125 %) con `font-stretch`. | Juan rechazó Barlow. Una familia con eje de ancho da carácter (titulares expandidos) y legibilidad (tablas normales) sin sumar fuentes. | `vendor/fuentes/` (agregar `archivo-variable.woff2` + `OFL.txt`, borrar Barlow), `estilos.css`, `graficos.js` |
| 2 | **Escala:** `--tx-pagina` pasa a 26px y `--tx-hero` a 52px (40px en el celular); se asigna un ancho y un peso a cada token. El título de vista va en `--tx-pagina` expandido. | La tipografía expandida necesita sus propios valores; el título de vista pasa a ser un titular. | `estilos.css` |
| 3 | **Paleta de marca:** `--marca-profunda #00231F`, `--marca #00665E`, `--lima #CEDC00`, `--banda`. Neutros con tinte verde (`#F3F6F2` / `#061A17`). Se borran `--tinta`, `--seleccion`, `--acento` y `--fuente-num`. | Identidad de color estilo Aston Martin (valores medidos en su sitio). | `estilos.css` |
| 4 | **Barra lateral verde racing en los dos modos.** Activo: fondo blanco al 8 % y barra blanca. | Es la firma del tablero: lo primero que se ve. | `estilos.css`, `index.html` |
| 5 | **Controles activos en `--marca`** (antes, tinta negra); foco en `--marca`. | La marca se ve en la interfaz, no solo en los datos. | `estilos.css` |
| 6 | **El lima es el objetivo:** Carrera = lima (lima oscuro `#678C00` en claro, para que se lea sobre blanco). | Lo que te acerca a los 10 km se ve de un solo color en todo el sitio. | `estilos.css`, `graficos.js` |
| 7 | **Deportes nuevos:** Pádel ámbar, Caminata azul cielo, Ciclismo violeta, Otras gris. Ningún deporte es verde. Los tokens se renombran a `--serie-carrera`, `--serie-padel`, etc. | El verde ahora es de la marca y de la intensidad; Caminata era verde y se confundía. Nombres por deporte en lugar de números. | `estilos.css`, `graficos.js` y todas las secciones que usan `--serie-N` |
| 8 | **Rampa de intensidad verde** (menta → racing) para zonas y carga, con una regla de color del número por nivel y modo. | Más esfuerzo = más verde racing. Antes la rampa era el azul de Carrera. | `estilos.css`, `calendario.js`, `inicio.js`, `resumen.js` |
| 9 | **Componente nuevo: banda "Camino a los 10 km"** arriba de "Este mes" y de "Carrera". Muestra la carrera más larga contra la meta, la barra segmentada por km, la marca de las últimas 4 semanas y una línea de datos. | El tono motivador que pidió Juan, hecho con datos reales y sin frases ni rachas. Usa el objetivo de `coach/CLAUDE.md`. | `index.html`, `inicio.js`, `carrera.js`, `componentes.js` (o un `objetivo.js` nuevo), `estilos.css` |
| 10 | **Filete de 3px** en el color de la vista sobre la primera tarjeta de cada vista. Radio de tarjeta de 12px. | Un solo adorno, siempre igual, que ata cada vista a su color. | `estilos.css` |
| 11 | **Todo el sistema de la v2:** plantilla de vista única, sin `vh` salvo la portada, alturas de gráfico como tokens, un solo padding, KPI con sparkline y base completa, KPI de Carrera (última vs. anteriores, con eficiencia), comparación por recencia (la última en lima y el resto en grises), tabla para el celular, nota plegada, gramática única de gráficos y fechas en un solo formato. | Corrige lo que encontró la evaluación (`evaluaciones/2026-10-12-tablero-completo.md`) y logra la homogeneidad que pidió Juan. | Ver `propuestas/v2-sistema/CAMBIOS.md` filas 2 a 17 |

**No cambia:** la escala de espaciado, las reglas de valoración (`--bien`/`--mal` según
convenga al atleta), el formato de los números, la navegación (mismos ítems e íconos) y el diálogo
de detalle.

## Riesgos y cómo los cubre la guía

| Riesgo | Dónde | Cómo se cubre |
|---|---|---|
| El **lima no se lee sobre blanco** (contraste 1,4:1). | Modo claro | En claro, Carrera usa `#678C00` (3,9:1 sobre blanco). El lima puro solo va sobre `--banda`/`--marca-profunda` (11:1). |
| La **banda del objetivo se pierde en oscuro** (fondo `#061A17` contra banda `#00231F`). | Modo oscuro | Token `--banda`: en oscuro, `#00403A`. Verificado en `v3-maqueta/carrera-oscuro.png`. |
| La **tipografía expandida no entra** en el celular (KPI 2 × 2, etiquetas largas). | Celular | Dato héroe a 40px; en el celular, KPI a 26px; las etiquetas pueden ocupar dos líneas ("SUEÑO / PROMEDIO"). Verificado en `v3-maqueta/mes-celular-oscuro.png` y `carrera-celular.png`. |
| **Rampa verde y controles verdes** se pueden confundir. | Calendarios | Los controles están fuera de las tarjetas y llevan texto; la rampa está en celdas dentro de las tarjetas. "Hoy" usa un anillo, no un relleno. |
| El número sobre la **rampa** pierde contraste. | Calendarios | Tabla de color por nivel y modo (§2); todos los pares ≥ 4,5:1. |
| El **pádel ámbar** y el **lima** se parecen con daltonismo rojo-verde. | Calendario, Resumen | Siempre hay etiqueta (leyenda de deportes del mes) y Carrera es el único deporte con dato héroe; en el calendario, los puntos van con nombre en la leyenda. Hay que revisarlo con un simulador al implementar. |
| **Archivo variable pesa más** que los dos woff2 de Barlow (~80–120 KB). | Carga | Un solo archivo con subconjunto latin + latin-ext. Se carga una vez y funciona sin conexión. |
| El **objetivo cambia** (otra distancia, fecha). | Banda | La meta está en una constante (`META_KM`) que lee el objetivo; cuando el coach complete la fecha, se agrega "faltan N semanas" (ya previsto en §5). |

---

## Prompt para la sesión de `app/`

```
Implementá la guía v3 "Racing" del tablero. Objetivo: identidad de equipo de carreras
(verde racing + lima, tipografía Archivo) y un tablero que muestre siempre cuánto falta para
el objetivo de correr 10 km, manteniendo la homogeneidad (una plantilla de vista y un
componente por función).

Fuentes:
- Guía nueva: diseno/propuestas/v3-racing/DESIGN.md → copiala tal cual a app/DESIGN.md
  (reemplaza a la v1).
- Diferencias, motivos y riesgos: diseno/propuestas/v3-racing/CAMBIOS.md
- Sistema heredado de la v2 (estructura, componentes, gráficos):
  diseno/propuestas/v2-sistema/CAMBIOS.md (su prompt, etapas 3 a 7, sigue valiendo salvo en
  color y tipografía, que manda la v3).
- Maqueta de referencia (no es código para copiar): diseno/propuestas/v3-racing/maqueta.html.
  Fijate en banda() (objetivo), ETIQUETA_DIRECTA, BANDAS, REFERENCIA, sinExtremos(),
  sparkline() y variacion().

Trabajá por etapas, con un commit "app:" por etapa. Verificá cada una en claro y en oscuro, a
1440×900 y a 390px. Al final, subí la versión a v3.0 y anotá la etapa en docs/bitacora.md.

ETAPA 1 · Fuente
- Descargá Archivo variable (ejes wdth 62–125 y wght 100–900, subconjuntos latin y
  latin-ext) desde Google Fonts a app/vendor/fuentes/archivo-variable.woff2 (si viene en dos
  archivos por subconjunto, incluí los dos con unicode-range), con su licencia OFL.txt.
- @font-face según DESIGN.md §1 (font-weight 100 900; font-stretch 62% 125%).
- Borrá los woff2 de Barlow y sus @font-face. --fuente = "Archivo"; eliminá --fuente-num.
- Anchos con font-stretch y los tokens --ancho-normal/--ancho-medio/--ancho-expandido.
- Aplicá la escala y la asignación cerrada de §1 (título de vista en --tx-pagina expandido,
  KPI en --tx-kpi ancho medio 700, etiquetas en mayúsculas expandidas, tablas en ancho normal).
  Siempre tabular-nums en números.
- graficos.js: Chart.defaults.font.family = --fuente (ancho normal).

ETAPA 2 · Paleta
- Tokens de §7 en claro y en los dos bloques de oscuro: marca, banda, lima, neutros con tinte
  verde, deportes con nombre (--serie-carrera, --serie-padel, --serie-caminata,
  --serie-ciclismo, --serie-otras), bien/mal, rampa verde y --rampa-texto-alto.
- Reemplazá todos los usos de --serie-1…8, --tinta, --seleccion y --acento:
  · colores().categoria → los tokens por deporte.
  · Controles activos y foco → --marca (texto blanco en el activo).
  · Selección y hover → --marca-suave.
  · "Dato general" (pasos, sueño, FC en reposo, fitness) → --texto.
- Barra lateral con fondo --marca-profunda en los dos modos, con los colores --sobre-marca*
  y el ítem activo según §5.
- Calendarios: rampa verde con el color del número por nivel y modo (§2); hoy con un anillo
  de 2px --marca.

ETAPA 3 · Banda "Camino a los 10 km"
- Componente nuevo (por ejemplo, js/objetivo.js con una función banda()), arriba de "Este mes"
  (debajo del encabezado del mes) y de "Carrera" (debajo de la barra superior). En ningún otro
  lado.
- Datos: META_KM = 10 (objetivo de coach/CLAUDE.md); récord = máxima distancia de Carrera;
  primera = distancia de la primera carrera; reciente = máxima de los últimos 28 días.
- Diseño de §5: fondo --banda, dato héroe en lima, barra de 10 segmentos con relleno
  proporcional, marca blanca "N,N últ. 4 sem.", números 1–10 debajo y UNA línea de texto
  ("Te faltan X km · tu carrera más larga pasó de A a B km desde <mes>"). Sin frases
  motivacionales ni rachas.
- "Este mes" tiene que seguir entrando sin scroll en escritorio (≥ 700px de alto).

ETAPA 4 · Sistema de la v2
- Aplicá las etapas 3 a 7 del prompt de diseno/propuestas/v2-sistema/CAMBIOS.md (plantilla de
  vista, componentes, gráficos, Carrera, calendarios), con los colores de la v3:
  · Comparación por recencia: la última en --serie-carrera 2,5px, la anterior --texto-muted y
    el resto --eje.
  · Subtipos de carrera: --serie-carrera al 100/55/15 % con contorno pleno.
  · Filete superior de 3px en el color de la vista sobre la primera tarjeta de cada vista
    (Carrera: --serie-carrera; Pádel: --serie-padel; vistas generales: --marca).
  · Radio de tarjeta 12px (--radio).

Al terminar, revisá que no queden en css/ ni en js/: "Barlow", --fuente-num, --serie-[0-9],
--tinta, --seleccion, --acento, colores hex fuera de los tokens, font-size en rem/em, vh fuera
de la portada, border-radius distinto de los tres tokens. Revisá además el lima y el ámbar con
un simulador de daltonismo (por ejemplo, el de las DevTools de Chrome: Rendering → Emulate
vision deficiencies).
```
