# v2 · "Sistema": cambios contra la guía vigente (v1)

> **2026-10-13:** Juan rechazó la tipografía y la sobriedad de esta versión (`referencias/gustos.md`).
> La **v3 "Racing"** (`propuestas/v3-racing/`) conserva todo este sistema y cambia la tipografía,
> la paleta y el tono. No implementar la v2 por separado: su prompt se usa desde el de la v3.

**Objetivo (pedido por Juan, 2026-10-12):** que el tablero sea homogéneo, con las mismas
fuentes, la misma paleta usada siempre igual, los mismos tamaños y los mismos componentes
en todas las vistas.

La v2 **no cambia la estética** de la v1: las fuentes, los fondos, la tinta y los colores de
deporte son los mismos. Lo que hace es **cerrar las decisiones que la v1 dejó abiertas**.
Ahí estaban las diferencias que encontró la evaluación
(`evaluaciones/2026-10-12-tablero-completo.md`): la estructura de cada vista, el color de lo
que no es un deporte, los altos, la gramática de los gráficos y el estilo de los controles.

Maqueta: `maqueta.html` ("Este mes" y "Carrera" con datos reales, con botones de claro/oscuro y
escritorio/celular). Capturas: `referencias/v2-maqueta/`.

## Qué cambia

| # | Qué cambia | Por qué | Archivos del tablero |
|---|---|---|---|
| 1 | **Rampa de intensidad de azul a violeta** (zonas y carga). Es el único cambio de paleta. Desaparecen `--serie-5…8` y `--acento`. | La rampa era el mismo azul que Carrera: un día de caminata o la Z4 del pádel "parecían carrera". El violeta no lo usa ningún deporte. El contraste del número sobre la celda queda ≥ 4,5:1 en los 7 niveles, en claro y en oscuro. | `estilos.css` (tokens) |
| 2 | **Tabla de roles de color** (interfaz, deporte, dato general, contexto, intensidad, valoración). | Hoy los colores de deporte se usan para sesiones, subtipos, fitness/fatiga, FC media/máx y medias móviles (evaluación A1). | `graficos.js`, `carrera.js`, `resumen.js`, `padel.js`, `recuperacion.js`, `inicio.js` |
| 3 | **Color de la vista:** cada vista de deporte usa solo su color + grises + rampa + bien/mal. Subtipos = tonos del mismo color con contorno pleno. | Una vista tiene un solo color de dato, y eso le da identidad sin agregar colores. | ídem |
| 4 | **Comparación por recencia en grises:** la última en color de la vista (2,5px), la anterior en `--texto-muted`, el resto en `--eje`. Reemplaza la rampa azul de v1. | La pregunta es "¿la última está mejor?"; los grises la responden sin leyenda (Datawrapper, Aisch). | `carrera.js` (y Pádel si compara partidos) |
| 5 | **Plantilla de vista única:** barra (título + controles) → contexto → 4 KPI → principal → tabla → secundarias → "Más análisis". Con tabla de qué va en cada vista. | Hoy Carrera, Pádel, Ciclismo y Otras tienen tabla + KPI a 100vh, y Resumen y Recuperación tienen KPI arriba: dos estructuras distintas, y la primera deja la pantalla vacía (evaluación A2). | `index.html`, `estilos.css`, `main.js` |
| 6 | **Controles de la vista en la barra superior.** En el celular van en una segunda fila con scroll horizontal, nunca apilados. | En Carrera, los selectores ocupan 280px en el celular, y el segmentado de Período se parte en dos filas (evaluación A4, M5). | `index.html`, `estilos.css` |
| 7 | **Sin alturas con `vh`** fuera de la portada. Alturas de gráfico como tokens (`--alto-principal`, `--alto-grafico`, `--alto-panel`, `--alto-sparkline`). | En la v1 cada gráfico tenía su alto (`.lienzo`, `.alto`, `.chico`, `.detalle`). | `estilos.css` |
| 8 | **Un solo padding de tarjeta (`--e4`)**, sin excepción para "Este mes". | Hoy son dos paddings, con una excepción. | `estilos.css` |
| 9 | **Asignación cerrada de tipografía:** cada elemento tiene su token. Tabla en `--tx-chico`, título de barra en `--tx-titulo`, números en 500/600 (nunca 400). | Quedan más de 30 tamaños en `rem` y las celdas se ven todas en negrita porque la condensada no tiene 400 (evaluación M6, B4). | `estilos.css`, `formato.js` |
| 10 | **Fechas en un solo formato:** `sáb 4 oct` en tablas y listas, `4 oct` en ejes. No existe `04/10`. | Hay tres formatos (evaluación B3). | `formato.js`, `graficos.js`, `resumen.js` |
| 11 | **Gramática única de gráficos en un helper:** marcas sin unidad, sin títulos de eje rotados, extremos sin rótulo cuando el eje es calculado, bandas de fondo, etiqueta directa en el margen, leyenda con puntos arriba a la izquierda. | Hoy cada sección arma sus opciones; hay unidades en cada marca, títulos "horas" y "HRSS" rotados, y leyendas abajo (evaluación M2, M4). | `graficos.js` y todas las secciones |
| 12 | **KPI con sparkline opcional** (valores de las puntas escritos) y regla de **base completa** (≥ 75 % de días o ≥ 3 sesiones; si no, "sin base para comparar"). | Da la dirección sin otro gráfico y evita "+40 vs. 12 semanas anteriores" (evaluación M1, ideas). | `componentes.js`, `resumen.js`, `carrera.js`, `recuperacion.js`, `inicio.js` |
| 13 | **Carrera:** KPI = última sesión vs. promedio de las anteriores, en el bloque principal: ritmo, FC, **eficiencia** (reemplaza a potencia) y distancia. | Los KPI promediaban sesiones y no decían si la última fue mejor (evaluación A3). Juan delegó la elección de la eficiencia. | `carrera.js` |
| 14 | **Tabla en el celular:** fecha + 3 columnas esenciales, el resto `.solo-escritorio`; la fecha queda fija. | En el celular, la columna protagonista quedaba fuera de la pantalla (evaluación A4). | `estilos.css`, `carrera.js`, `otras.js`, `padel.js`, `ciclismo.js` |
| 15 | **Nota plegada** (`<details class="nota">`) como único lugar para las explicaciones. Subtítulo de tarjeta de una línea. | Hay párrafos de 3 líneas dentro de las tarjetas (evaluación M3). | `index.html`, `carrera.js`, `recuperacion.js` |
| 16 | **Calendarios con la misma codificación:** fondo de carga con la rampa en los tres (mini, mensual y de carga). En el mensual, "Sin actividad" y sin resumen en las semanas futuras. | Hoy el mini usa la rampa y el mensual no (evaluación B1, idea). | `calendario.js`, `estilos.css` |
| 17 | **Tercer radio `--radio-celda` (3px)** solo para las celdas de 18px del calendario de carga. Sin píldoras. | Con 6px, una celda de 18px queda redonda. Es la única excepción y queda escrita. | `estilos.css` |

**No cambia:** las fuentes (Barlow y Barlow Semi Condensed), la escala de 7 tamaños, la
escala de espaciado, los fondos, las superficies, la tinta, los colores de deporte,
`--bien`/`--mal`, la navegación lateral, el formato de los números, la portada "Este mes"
(salvo el color de la rampa y el padding) y el diálogo de detalle.

**Relación con la evaluación:** este prompt **reemplaza** al de
`evaluaciones/2026-10-12-tablero-completo.md`. Incluye todas sus correcciones de prioridad
alta y media, y las ordena en etapas.

---

## Prompt para la sesión de `app/`

```
Implementá la guía v2 "Sistema" del tablero. Objetivo: que el tablero sea homogéneo
(mismas fuentes, misma paleta usada siempre igual, mismos tamaños y mismos componentes en
todas las vistas).

Fuentes:
- Guía nueva: diseno/propuestas/v2-sistema/DESIGN.md → copiala tal cual a app/DESIGN.md
  (reemplaza a la v1).
- Diferencias y motivos: diseno/propuestas/v2-sistema/CAMBIOS.md
- Maqueta de referencia (no es código para copiar):
  diseno/propuestas/v2-sistema/maqueta.html. Fijate en especial en los plugins
  ETIQUETA_DIRECTA, BANDAS y REFERENCIA, en sinExtremos(), en sparkline() y en la regla
  de base completa de variacion().

Trabajá por etapas, con un commit "app:" por etapa. Verificá cada una en claro y en
oscuro, a 1440×900 y a 390px. Al final, subí la versión a v2.0 y anotá la etapa en
docs/bitacora.md.

ETAPA 1 · Tokens y escala (estilos.css)
- Tokens de DESIGN.md §7: rampa violeta (claro y oscuro), --radio-celda, alturas de
  gráfico (--alto-principal/--alto-grafico/--alto-panel/--alto-sparkline, con valores de
  celular en @media (max-width: 800px)). Borrá --acento y --serie-5…8 (reemplazá sus usos).
- Ningún font-size fuera de los 7 tokens: aplicá la asignación cerrada de §1 (tabla en
  --tx-chico, .titulo-vista en --tx-titulo, h3 y encabezados en --tx-etiqueta, etc.).
- Números: --fuente-num con peso 500 (normal) o 600 (énfasis), nunca 400.
- Radios: solo --radio, --radio-chico y --radio-celda (este último solo en .cal-celda).
  Sin 999px (.fase, .marca pasan a texto --tx-etiqueta --texto-muted, sin borde).
- Un solo padding de tarjeta: --e4 en todas las vistas.

ETAPA 2 · Color (graficos.js y secciones)
- Roles de §2. Lo que no es un deporte no usa --serie-*:
  · Recuperación: diaria en --eje, media de 7 días en --tinta 2px.
  · Pádel FC media/máx: media --tinta, máxima --eje.
  · Resumen Estado de forma: Fitness --tinta 2px, Fatiga --texto-muted 1,5px; la Forma en
    un panel aparte debajo (--alto-panel, mismo eje X), línea --tinta con el 0 marcado.
  · Barras de métricas generales (pasos en inicio.js y recuperacion.js): --tinta al 100 %
    la actual y al 25 % el resto.
- Color de la vista: en Carrera, Pádel y Ciclismo, el dato principal va en el color de su
  deporte. Subtipos de carrera (colores().subtipo): relleno --serie-1 al 100/55/15 % con
  contorno pleno de 1,5px; en la dispersión, además, forma circle/triangle/rect.
- Comparación por recencia (carrera.js, colorDe): última en el color de la vista 2,5px,
  anterior --texto-muted 1,5px, resto --eje 1,5px. El mismo color en el punto de la tabla,
  la lista de sesiones, la deriva, la eficiencia por sesión y la dispersión.
- Zonas y calendarios usan la rampa (ahora violeta). Número sobre la celda: niveles 1–3
  --texto, 4–7 --fondo.

ETAPA 3 · Plantilla de vista (index.html, estilos.css, main.js)
- Todas las vistas de detalle (Carrera, Pádel, Ciclismo, Otras, Recuperación, Resumen):
  barra superior (título + controles de la vista + rango) → línea de contexto → fila de 4
  KPI (.kpis) → tarjeta principal ancha → tabla de sesiones ancha (si hay) → grilla de
  secundarias → <details> "Más análisis" opcional. Qué va en cada vista: tabla de §4.
- Eliminá .vista-arriba y .kpis-columna. Ninguna altura con vh, salvo #panel-inicio.
- Los controles de la vista (Período, Plantilla/Sesiones/Etapa, Partido) pasan a la barra
  superior. En ≤ 800px: segunda fila con overflow-x: auto, nunca uno por fila. El
  segmentado nunca se parte (flex-wrap: nowrap; textos "4 sem", "12 sem", "Todo").
- El contexto común ("3 sesiones de 25 MIN CO · bloque principal · 26 ago – 8 sep") va una
  sola vez en la línea de contexto, no en cada KPI.

ETAPA 4 · Componentes
- Tarjeta: título + subtítulo de UNA línea (qué se mide y en qué unidad). Las explicaciones
  largas (#carrera-comp-nota, deriva, eficiencia, dispersión, aviso de Recuperación) van a
  <details class="nota"><summary>Cómo se calcula</summary>…</details>, cerrado.
- KPI (componentes.js): etiqueta, valor + unidad, UNA línea de contexto y sparkline opcional
  (SVG, 1,5px --texto-sec, primer y último valor escritos en las puntas). Regla de base
  completa: sin flecha si el período anterior tiene datos en menos del 75 % de sus días o
  si hay menos de 3 sesiones; en su lugar, "sin base para comparar" en --texto-muted.
  Sparkline en Recuperación (los 4) y en Carrera (los 4, una por sesión).
- Tabla: celdas --tx-chico, filas de 36px, números en 500 y una columna protagonista en 600,
  alto natural con max-height: 420px. En ≤ 800px, solo fecha + 3 columnas esenciales (el
  resto con .solo-escritorio) y la primera columna sticky.
- Controles: <select> con appearance: none, alto --alto-control, --radio-chico, flecha ▾
  igual que .desplegable. .desplegable summary con las mismas medidas.
- Fechas (formato.js): tablas, listas y tooltips "sáb 4 oct"; ejes "4 oct". Eliminá "04/10".

ETAPA 5 · Gráficos (graficos.js)
- Un helper de opciones base del que salen todos los gráficos (cuadrícula, ejes, tooltip,
  líneas y barras de §5). Las secciones solo pasan datos y excepciones.
- Marcas de eje sin unidad (la unidad va en el subtítulo). Sin títulos de eje rotados.
- Ejes con mínimo y máximo calculados: sin rótulo en las marcas extremas.
- Eje Y de tendencias: como mínimo ±10 % del promedio mostrado.
- Eje X temporal desde el primer dato del período (Recuperación con 12 semanas).
- Leyenda: ninguna con una serie; etiqueta directa a la derecha del último punto (padding
  derecho 64px); si hace falta leyenda, HTML arriba a la izquierda con puntos de 8px.
- Bandas de fondo para los bloques de plantilla (alternadas --superficie/--superficie-2,
  nombre ARRIBA del área de dibujo, padding superior 20px) y para las zonas en Pádel.

ETAPA 6 · Carrera
- KPI: última sesión vs. promedio de las anteriores, en la etapa elegida (por defecto el
  bloque principal): Ritmo (mejor si baja), FC media (mejor si baja), Eficiencia m/latido
  (mejor si sube) y Distancia (neutra). La potencia sale de los KPI (queda en la tabla).
- Orden: KPI → comparación → tabla → eficiencia por sesión + deriva → eficiencia de todas
  las corridas → "Más análisis" (dispersión, km por semana, zonas, dinámica).
- Tabla: protagonista ritmo de entrenamiento; en el celular, fecha · ritmo · FC · eficiencia.

ETAPA 7 · Calendarios
- Calendario mensual: fondo de cada día con la rampa de carga (mismos cortes que el mini).
  Semanas sin actividad: "Sin actividad" (con Fitness y Fatiga si hay); semanas futuras sin
  resumen.
- Calendario de carga del Resumen: media columna al lado de "Horas por semana".

Al terminar, revisá que no queden en css/ ni en js/: font-size en rem/em, colores hex
fuera de los tokens, --serie-5…8, --acento, vh fuera de #panel-inicio, border-radius
distinto de los tres tokens.
```
