# Evaluación del tablero v1.2: todas las vistas

Fecha: 2026-10-12 · Guía de referencia: `../app/DESIGN.md` (v1) · Sin `gustos.md` todavía.

Capturas en `referencias/eval-2026-10-12-<vista>/` (escritorio 1440×900, celular 390×844 y
celular oscuro). Para Carrera, Pádel y Recuperación hay además `escritorio-completa.png`:
página entera con la ventana fija en 900px de alto.

> **Sobre las capturas:** `escritorio-largo.png` agranda la ventana al alto de la página. Como
> las vistas de entrenamiento miden `100vh`, ahí se ven estiradas. Para juzgar alturas sirven
> `escritorio.png` y `escritorio-completa.png`. En la investigación anterior marqué ese
> estiramiento como error; era un efecto de la captura y ya lo corregí en `notas.md`.

---

## Lo que funciona (no perderlo)

1. **"Este mes" cumple la guía casi entera.** Entra en una pantalla, el dato protagonista se
   ve primero, las variaciones usan `--bien`/`--mal` según convenga al atleta (FC en reposo ▲
   en rojo) y compara **tasas** (pasos por día), no totales parciales. Esa decisión evita el
   problema del resumen semanal de Strava (ver `notas.md`). El mini calendario tiene rampa de
   carga, puntos por deporte, anillo de hoy y números legibles en claro y en oscuro.
2. **Interfaz neutra en tinta.** La navegación, los segmentados activos y el foco ya no usan
   el azul de Carrera.
3. **Tipografía.** Barlow para la interfaz y Barlow Semi Condensed con cifras tabulares para
   los números, aplicadas en todo el sitio. El informe de `mirar.py` muestra que domina
   la escala de la guía (15, 17, 13, 11 y 30px).
4. **Zonas de FC con rampa ordinal.** "Tiempo en cada zona" (barras horizontales Z1–Z7) y
   "Zonas por semana" se leen sin leyenda. **Las bandas de zona de fondo en "FC minuto a minuto"
   de Pádel** son la mejor idea gráfica del tablero: contexto sin tinta extra.
5. **Eje de ritmo invertido** (más rápido = arriba), con la aclaración escrita. Es lo que
   piden los usuarios de Garmin (ver `notas.md`).
6. **"Dinámica de carrera" en small multiples**: cuatro paneles iguales, una métrica por panel.
7. **Calendario mensual.** Tiene mucha información bien ordenada, y en el celular pasa a
   agenda (una fila por día, resumen de la semana arriba), que es la solución correcta.
8. **Tablas.** Números a la derecha, cifras tabulares, encabezado sticky, fila clickeable que
   abre el detalle.
9. **Datos.** Mostrar los CSV y qué columnas están en uso es valioso para el portfolio.
10. **Modo oscuro.** La rampa se invierte para mantener el contraste (como hace Datawrapper)
    y las superficies son grises oscuros, no negro puro.

---

## Problemas

### Prioridad alta

#### A1. Los colores de deporte se usan para otras cosas
**Criterio:** significado del color (cada color significa una sola cosa). La guía lo prohíbe
("usar un color de deporte o de serie para estados de interfaz" y "Sesiones comparadas").

| Dónde | Qué pasa | Captura |
|---|---|---|
| Carrera: tabla, comparación, deriva, eficiencia por sesión, dispersión (`carrera.js:158`, `c.serie[i]`) | Cada sesión toma el color de un deporte por orden: la más vieja en azul (Carrera), la siguiente en naranja (Pádel) y la última en **verde (Caminata)**. En la deriva, la última sesión de carrera es una barra verde. | `eval-…-carrera/escritorio-completa.png` |
| Carrera: "Eficiencia aeróbica…" y "Km por semana" (`graficos.js`, `colores().subtipo`) | Bloques = azul, Series = **naranja**, Libre = **verde**: tres tipos de corrida con los colores de tres deportes. | ídem |
| Resumen: "Estado de forma" (`resumen.js:51-53`) | Fitness = azul, Fatiga = naranja, Forma = verde. Justo debajo, "Horas por semana" usa los mismos tres colores para Carrera, Pádel y Caminata. | `eval-…-resumen/escritorio-largo.png` |
| Pádel: "Frecuencia cardíaca" (`padel.js:59-60`) | FC media en **azul** (Carrera) y máxima en naranja, en la vista de Pádel. | `eval-…-padel/escritorio-completa.png` |
| Recuperación: FC en reposo y sueño (`recuperacion.js:51-66`) | Diaria en azul y media de 7 días en naranja. | `eval-…-recuperacion/escritorio-completa.png` |

**Solución elegida:** lo que no es un deporte no lleva color de deporte.
- **Sesiones comparadas:** la última en `--tinta` (2,5px), la anterior en `--texto-sec`
  (1,5px) y las demás en `--eje` (1,5px). En la tabla y la lista de sesiones, el punto usa
  el mismo color. **Cambia la guía:** reemplaza la rampa azul por antigüedad. La rampa es del
  mismo azul que Carrera, los tonos intermedios no se distinguen y la pregunta es "¿la última
  está mejor?". El gris resuelve eso (Datawrapper y Aisch en `notas.md`).
- **Subtipos de carrera** (Bloques / Series / Libre): todos son carrera, así que usan
  `--serie-1` al 100 %, 60 % y 30 % (con `conAlfa`, que ya existe). En la dispersión de
  eficiencia, además, cambia la forma del punto (círculo, triángulo, cuadrado).
- **Una métrica con su media móvil** (Recuperación): diaria en `--eje` (puntos o barras),
  media de 7 días en `--tinta` 2px. La media es lo que importa y la diaria es contexto.
- **Media y máxima** (Pádel, Ciclismo): media en `--tinta` y máxima en `--eje`.
- **Estado de forma:** Fitness en `--tinta` 2px y Fatiga en `--texto-muted` 1,5px. La Forma va
  en un **panel aparte, debajo, con el mismo eje X** (small multiple de 100px de alto),
  como línea en `--tinta` con la línea de 0 marcada. Así ningún color se repite con los deportes.
- **Barras de una sola métrica** que no son de un deporte (pasos en "Este mes" y en
  Recuperación): `--tinta` al 100 % la actual y al 25 % el resto, siguiendo la regla de
  barras de la guía.

#### A2. La primera pantalla de las vistas de entrenamiento está casi vacía
**Dónde:** Carrera, Pádel, Ciclismo y Otras (`.vista-arriba`, `estilos.css:494-504`).
**Criterio:** jerarquía y densidad.
La tabla y la columna de 4 KPI miden `calc(100vh - 175px)`. Con 3 sesiones (Carrera), 6
(Pádel) o **1** (Ciclismo), entre el 70 % y el 90 % de la tarjeta de la tabla queda en blanco.
Cada KPI ocupa ~170px para un número. La primera pantalla de Carrera no muestra ni un gráfico,
y en Ciclismo los 4 KPI repiten la única fila de la tabla. Es la queja de los usuarios de
Garmin: tarjetas grandes y hay que bajar para encontrar el dato. Además, en monitores altos
(1440px o más) todo se estira todavía más.
**Solución elegida:** alturas según el contenido, no según la ventana.
- Los 4 KPI pasan a una **fila horizontal arriba** (la misma `.kpis` de Resumen y Recuperación,
  4 columnas en escritorio y 2 × 2 en celular).
- Debajo, la tabla con su alto natural y `max-height: 420px` con scroll si hay muchas filas.
- Debajo, el primer gráfico (en Carrera, la comparación). A 1440×900 tienen que verse KPI,
  tabla de 3 filas y el comienzo del gráfico.
- Se borra `.vista-arriba` (alto fijo) y `.kpis-columna`.

#### A3. Carrera no responde "¿estoy mejorando?"
**Dónde:** KPI de Carrera (`renderKpisComparacion`) y orden de las tarjetas (`index.html:177-232`).
**Criterio:** jerarquía (5 segundos).
- Los KPI **promedian** las sesiones elegidas ("Ritmo medio 8:32", "FC media 135"). Un promedio
  de tres sesiones no dice si la última fue mejor. La guía ya trae el formato correcto
  (`▲ 0:12 vs. anteriores · última 7:13`), pero no está implementado.
- "3 sesiones · toda la sesión" se repite en los 4 KPI. La guía manda ese contexto al encabezado.
- El gráfico que mejor muestra progreso, "Eficiencia aeróbica de todas las corridas" (sube de
  0,72 a 0,95 m/latido desde julio), está quinto de nueve.

**Solución elegida:**
- KPI de Carrera = **última sesión** en grande, con la variación contra el **promedio de las
  anteriores** en `--bien`/`--mal`: Ritmo del bloque principal (ritmo de entrenamiento), FC del
  bloque principal, Eficiencia (m/latido) y Distancia (variación neutra).
- Con menos de 3 sesiones, la línea de variación dice "pocas sesiones para comparar" en
  `--texto-muted` (los usuarios de intervals.icu desconfían de variaciones con 2 sesiones).
- El contexto común ("3 sesiones de 25 MIN CO · toda la sesión · 26 ago – 8 sep") va una sola
  vez, debajo de los selectores, en `--tx-chico` `--texto-sec`.
- Orden nuevo: KPI → tabla → comparación → eficiencia por sesión + deriva → eficiencia de todas
  las corridas → dispersión → km por semana + zonas → dinámica.

> Elegir la eficiencia como cuarto KPI en lugar de la potencia media cambia **qué dato se
> muestra**: lo dejo marcado para que Juan lo confirme. Si no, el cuarto KPI sigue siendo
> Potencia.

#### A4. Carrera en el celular: el dato protagonista no se ve
**Dónde:** `eval-…-carrera/celular.png`.
**Criterio:** celular.
Los tres selectores apilados ocupan ~280px. La tabla corta a la derecha después de "Tiempo",
así que **el ritmo de entrenamiento y la FC quedan fuera de la pantalla**. Lo mismo pasa en
Otras (el ritmo queda cortado).
**Solución elegida** (NN/g, UX Movement y Datawrapper, en `notas.md`):
- En el celular, Plantilla ocupa el ancho completo; Sesiones y Etapa van lado a lado (50 % y 50 %).
- La tabla muestra en el celular solo: **fecha · ritmo entren. · FC · km**, y el resto se ve
  en el detalle de la sesión (que ya existe). Se hace con una clase `.solo-escritorio` en
  `<th>`/`<td>` y `display: none` bajo 800px.
- La columna de fecha queda fija (`position: sticky; left: 0`) por si se agrega otra columna.

### Prioridad media

#### M1. Comparaciones contra períodos sin datos
**Dónde:** Resumen (KPI) y Recuperación (gráficos).
**Criterio:** jerarquía (información engañosa).
- Resumen con "12 semanas" muestra "+40 vs. 12 semanas anteriores", "+99,5 km vs. …": los
  datos empiezan el 18 de julio, así que el período anterior está casi vacío.
- Recuperación con "12 semanas" deja vacío el **40 % izquierdo de los cuatro gráficos** (hay
  datos desde el 26 de agosto) y lo explica con un párrafo gris.

**Solución elegida:**
- Una variación solo se muestra si el período anterior tiene datos en al menos el 75 % de sus
  días. Si no, la línea de contexto dice "sin período anterior completo" en `--texto-muted`.
- El eje X de Recuperación arranca en el primer día con dato del período. El aviso pasa a una
  línea en el encabezado ("47 de 84 días con dato · desde mié 26 ago"), sin caja.

#### M2. Unidades repetidas en cada marca del eje
**Dónde:** Carrera (comparación y dispersión: "6:40 /km", "8:20 /km"…; dinámica: "140 ppm",
"0,90 m", "350 ms", "8,0 cm"), Pádel ("200 ppm"…). Viene de `METRICAS_COMP[*].formato` y de los
`callback` de los ejes.
**Criterio:** gráficos (tinta de más); la guía lo prohíbe.
**Solución elegida:** un formato para marcas, sin unidad (`ritmo(v)`, `numero(v)`), y la
unidad en el título del gráfico o del eje ("Ritmo (min/km)", "Cadencia (ppm)": la dinámica ya
lo hace en el `h3`). El formato con unidad queda solo para el tooltip.

#### M3. Párrafos explicativos fijos dentro de las tarjetas
**Dónde:** comparación de Carrera (`#carrera-comp-nota`, 3 líneas), deriva, eficiencia por
sesión, dispersión, aviso de Recuperación.
**Criterio:** la guía lo prohíbe ("en un ícono ⓘ con tooltip o en un `<details>`").
**Solución elegida:** cada tarjeta deja **una** línea de subtítulo con lo que se necesita para
leer el gráfico ("Más arriba = más rápido"). El resto va a un `<details class="nota">` con el
resumen "Cómo se calcula", cerrado por defecto y en `--tx-chico`.

#### M4. Bloques de plantilla como líneas punteadas y leyenda abajo
**Dónde:** "Ritmo a lo largo de la sesión" (plugin `LINEAS_BLOQUES`).
**Criterio:** la guía pide bandas de fondo alternadas y etiquetas directas.
**Solución elegida:** bandas `--superficie` / `--superficie-2` por bloque, con el nombre arriba en
`--tx-etiqueta` y el bloque de Entrenamiento apenas más marcado. Sin leyenda: con A1 resuelto, la
última sesión lleva su fecha como etiqueta directa al final de la línea ("mar 8 sep") y el resto
no necesita nombre (el tooltip lo da).

#### M5. Controles fuera del estilo único
**Dónde y qué:**
- "Etapa" (Carrera) y "Partido" (Pádel) son `<select>` nativos: otra flecha, otro alto (~36px),
  y en Windows el menú es del sistema. La guía los prohíbe sin estilo.
- Los desplegables (`.desplegable summary`) usan radio 8px, `0.9rem` y padding propio: no miden 32px.
- En el celular, el segmentado "Período" (Resumen y Recuperación) **se parte en dos filas**
  ("4 semanas" arriba, "12 semanas | Todo" abajo) y deja de ser un grupo
  (`eval-…-resumen/celular-oscuro.png`).

**Solución elegida:** `select` con `appearance: none`, alto `--alto-control`, `--radio-chico`, la
misma flecha `▾` que los desplegables y el mismo padding. `.desplegable summary` con las mismas
medidas. El segmentado lleva `flex-wrap: nowrap`; en el celular la etiqueta "Período" se oculta y
los botones dicen "4 sem", "12 sem" y "Todo".

#### M6. Migración de la escala incompleta en `estilos.css`
**Criterio:** consistencia.
Quedan **más de 30 tamaños en `rem`** fuera de la escala (0.7, 0.72, 0.74, 0.75, 0.76, 0.78, 0.8,
0.85, 0.9rem), `.titulo-vista` en `1.15rem` (la guía dice `--tx-pagina` 24px) y radios 3, 4, 8, 12 y
999px (`.fase`, `.marca`, `.calmes`, `.tabla-contenedor.alta`, `.tooltip`, `.dialogo`,
`.cal-celda`). La tabla usa `0.85rem` (13,6px), un valor entre `--tx-chico` y `--tx-base`.
**Solución elegida:** aplicar la tabla de equivalencias que ya está en la guía (§1). Tabla en
`--tx-chico` con encabezados en `--tx-etiqueta`; título de vista en `--tx-titulo` (17px) en la
barra superior, que es una barra y no un encabezado de página. **Esto cambia la guía**: el
título de la barra pasa a `--tx-titulo`, y `--tx-pagina` queda para el mes en "Este mes" y en
Calendario. Las píldoras (`.fase`, `.marca`) pasan a `--radio-chico`.

#### M7. "Eficiencia por sesión" exagera las diferencias
**Dónde:** Carrera, eje Y de 0,83 a 0,89 con 3 puntos.
**Criterio:** gráficos (no vender progreso que no hay; ver "banking" en `notas.md`).
Una diferencia del 5 % ocupa todo el alto del gráfico.
**Solución elegida:** el eje Y abarca como mínimo ±10 % del promedio de las sesiones mostradas.
Con menos de 3 sesiones, la nota de A3 ("pocas sesiones") también aparece acá.

### Prioridad baja

- **B1. Calendario mensual: semanas sin actividad llenas de rayas.** Las semanas futuras y las
  vacías muestran seis filas "Sesiones 0 / Tiempo — / …". Mostrar "Sin actividad" (con Fitness y
  Fatiga si hay) y no mostrar el resumen de semanas futuras.
- **B2. Calendario de carga (Resumen)** ocupa ~300px de una tarjeta de ancho completo. Ponerlo en
  media columna, al lado de "Horas por semana", o agrandar las celdas para llenar el ancho.
- **B3. Fechas en tres formatos:** "sáb 4 oct" (tablas), "04/10" (Últimas sesiones), "20/07"
  (ejes). En listas y tablas usar siempre "sáb 4 oct"; los ejes pueden quedar "20/07".
- **B4. Columna protagonista sin peso propio.** La guía pide el ritmo de entrenamiento en 600; hoy
  todas las celdas numéricas se ven igual de gruesas porque Barlow Semi Condensed solo tiene 500 y
  600, y el 400 se dibuja en 500. Celdas en 500 y la protagonista en 600.
- **B5. Erratas:** "Calorias" → "Calorías" (Pádel).
- **B6. Datos:** las marcas "en uso / sin usar" son píldoras y el rayado diagonal de las columnas
  sin usar agrega ruido. Bastan el encabezado en cursiva y `--texto-muted`.

---

## Ideas (mejoras, no correcciones)

| Idea | Dónde | Referencia |
|---|---|---|
| **Carrera en tres capas:** arriba el veredicto (KPI de A3), al medio la comparación, abajo y plegado en `<details>` lo exploratorio (dispersión, dinámica, zonas, km). | Carrera | Oura / Instrument (`notas.md` §1) |
| **Dumbbell por bloque de la plantilla:** un renglón por bloque (calentamiento, principal, vuelta a la calma), punto gris = promedio de las anteriores y punto en tinta = última, segmento en `--bien`/`--mal`. Responde "¿mejoré en cada parte?" en 150px. | Carrera, sobre todo en el celular | Slope y dumbbell (`notas.md` §2) |
| **Sparkline en los KPI** con el primer y el último valor en las puntas ("54 ▁▂▃▂ 52"), en `--texto-sec`. | Recuperación, Carrera, Este mes | Datawrapper (tablas) y Stripe (`notas.md`, KPI con sparkline) |
| **Partido contra el anterior** en "FC minuto a minuto" de Pádel: el partido anterior como línea gris de fondo. | Pádel | Datawrapper, línea repetida de fondo (`notas.md` §2) |
| **Calendario mensual con fondo de carga** como el mini calendario de "Este mes", para que las dos vistas cuenten lo mismo con el mismo código visual. | Calendario | Calendarios de entrenamiento (`notas.md` §4) |
| **Forma, fatiga y fitness como lista con barras** (bullet graph mínimo) en Resumen, además del gráfico. | Resumen | Runalyze (`notas.md` §1) |
| **Ritmo y FC alineados** (small multiples con el mismo eje X) en el celular, en lugar de un segmentado que muestra uno por vez. | Carrera | Datawrapper small multiples (`notas.md` §2) |

---

## Recomendación

**Las dos cosas, en este orden:**

1. **Corregir ya dentro de la v1** las prioridades alta y media. Casi todas son partes de la guía
   vigente que todavía no se implementaron (colores de sesión, unidades, párrafos, controles,
   escala, bandas). Hay tres ajustes chicos a la guía que van en el mismo cambio: grises para
   las sesiones comparadas, colores para lo que no es deporte y el tamaño del título de la
   barra. A2 (sacar la primera pantalla de alto fijo) es un cambio de estructura chico y
   urgente.
2. **Preparar una v2** para Carrera y el celular: tres capas, dumbbell por bloque, sparklines en
   KPI y tablas reducidas para el celular. Cambian la estructura de las vistas, que la guía v1
   no define, y conviene verlas en maqueta antes de implementarlas (`/nueva-version`).

**Decidido (2026-10-12):** la eficiencia (m/latido) reemplaza a la potencia como cuarto KPI de
Carrera (A3). Juan delegó la decisión.

---

## Prompt para la sesión de `app/`

> **Reemplazado (2026-10-12)** por el prompt de `propuestas/v2-sistema/CAMBIOS.md`, que
> incluye todas estas correcciones dentro de la v2. Queda acá como registro.

```
Corregí el tablero según la evaluación de diseño del 2026-10-12
(diseno/evaluaciones/2026-10-12-tablero-completo.md). Son correcciones dentro de la guía v1;
actualizá app/DESIGN.md donde se indica. Subí la versión a v1.3 y anotá la etapa en
docs/bitacora.md.

PRIORIDAD ALTA

1. Colores: lo que no es un deporte no usa colores de deporte (--serie-1..4).
   a) Sesiones comparadas de Carrera (carrera.js:158, colorDe): la última sesión en --tinta
      (línea 2,5px), la anterior en --texto-sec (1,5px), el resto en --eje (1,5px). Mismo
      color en el punto de la tabla, la lista de sesiones, la deriva, la eficiencia por
      sesión y la dispersión. En DESIGN.md §2 "Sesiones comparadas", reemplazá la rampa por
      esta regla de grises.
   b) Subtipos de carrera (graficos.js, colores().subtipo): Bloques = --serie-1, Series =
      --serie-1 al 60 %, Libre = --serie-1 al 30 % (usá conAlfa). En la dispersión de
      eficiencia, además, forma de punto distinta (circle, triangle, rect).
   c) Recuperación (recuperacion.js): diaria en --eje, media de 7 días en --tinta 2px.
   d) Pádel "Frecuencia cardíaca" (padel.js:59-60): media en --tinta, máxima en --eje.
      Revisá Ciclismo y Otras: cualquier serie que no sea un deporte sigue la misma regla.
   e) Resumen "Estado de forma" (resumen.js:51-53): Fitness --tinta 2px, Fatiga
      --texto-muted 1,5px. La Forma pasa a un segundo canvas debajo (100px de alto, mismo
      eje X), línea --tinta con la línea de 0 marcada en --eje.
   f) Barras de una métrica que no es un deporte (pasos en inicio.js:212 y recuperacion.js):
      --tinta; la barra actual al 100 % y el resto al 25 %.
   Agregá a DESIGN.md §2 una fila: "Métricas que no son de un deporte → --tinta (principal)
   y --eje / --texto-muted (contexto)".

2. Primera pantalla de Carrera, Pádel, Ciclismo y Otras: eliminá .vista-arriba (alto con
   100vh) y .kpis-columna. Orden: fila de 4 KPI (la clase .kpis, como en Resumen) → tabla
   con alto natural y max-height 420px con scroll → gráficos. A 1440×900, en Carrera tienen
   que verse los KPI, la tabla y el comienzo del gráfico de comparación.

3. KPI de Carrera (renderKpisComparacion): mostrar la ÚLTIMA sesión elegida y la variación
   contra el promedio de las anteriores, con el formato de DESIGN.md §4 KPI
   ("▲ 0:12 vs. anteriores", flecha en --bien/--mal según mejorSi).
   KPI: Ritmo del bloque principal (ritmo entren.), FC del bloque principal, Eficiencia
   del bloque principal (m/latido, mejor si sube), Distancia (variación neutra).
   La potencia sale de los KPI (queda en la tabla y en el detalle).
   Con menos de 3 sesiones, en vez de la variación: "pocas sesiones para comparar" en
   --texto-muted. Sacá "3 sesiones · toda la sesión" de cada KPI y ponelo una sola vez
   debajo de los selectores (--tx-chico, --texto-sec), con el rango de fechas.
   Reordená las tarjetas: comparación → eficiencia por sesión + deriva → eficiencia de
   todas las corridas → dispersión → km por semana + zonas → dinámica.

4. Celular (≤ 800px):
   a) Selectores de Carrera: Plantilla al ancho completo; Sesiones y Etapa lado a lado.
   b) Tablas de Carrera y Otras: en el celular solo fecha · ritmo entren. (o ritmo) · FC
      media · km. Marcá el resto de las columnas con .solo-escritorio (display: none bajo
      800px). Columna de fecha con position: sticky; left: 0.

PRIORIDAD MEDIA

5. Comparaciones sin base: en Resumen, la variación de cada KPI solo se muestra si el
   período anterior tiene datos en al menos el 75 % de sus días; si no, "sin período
   anterior completo" en --texto-muted. En Recuperación, el eje X arranca en el primer día
   con dato del período y el aviso pasa a una línea de contexto en el encabezado (sin caja).

6. Unidades en los ejes: las marcas no llevan unidad (Carrera comparación, dispersión y
   dinámica; Pádel FC minuto a minuto). La unidad va en el título del eje o del gráfico.
   Dejá el formato con unidad solo en los tooltips.

7. Párrafos fijos: cada tarjeta deja como máximo una línea de subtítulo. Las explicaciones
   largas (#carrera-comp-nota, deriva, eficiencia por sesión, dispersión) van a un
   <details class="nota"><summary>Cómo se calcula</summary>…</details>, cerrado, en
   --tx-chico --texto-sec.

8. Bloques de plantilla en la comparación (plugin LINEAS_BLOQUES): bandas de fondo
   alternadas --superficie / --superficie-2, nombre del bloque arriba en --tx-etiqueta,
   Entrenamiento apenas más marcado. Sin leyenda: etiqueta directa con la fecha al final
   de la línea de la última sesión.

9. Controles: <select> de Etapa y Partido con appearance: none, alto --alto-control,
   --radio-chico, borde --borde, flecha ▾ como .desplegable. .desplegable summary con las
   mismas medidas (32px, --radio-chico, --tx-base). En el celular, el segmentado Período
   no se parte: flex-wrap: nowrap, etiqueta "Período" oculta y textos "4 sem", "12 sem",
   "Todo".

10. Escala de estilos.css: aplicá la tabla de equivalencias de DESIGN.md §1 a todos los
    tamaños en rem que quedan. La tabla va en --tx-chico (encabezados en --tx-etiqueta).
    .titulo-vista en --tx-titulo (actualizá DESIGN.md: el título de la barra superior es
    --tx-titulo; --tx-pagina queda para el mes en "Este mes" y en Calendario). Radios solo
    --radio y --radio-chico (.fase, .marca, .calmes, .tabla-contenedor.alta, .tooltip,
    .dialogo, .cal-celda).

11. "Eficiencia por sesión": el eje Y abarca como mínimo ±10 % del promedio de las
    sesiones mostradas.

Verificá cada cambio en claro y en oscuro, a 1440×900 y a 390px de ancho.
```
