# Biblioteca de referencias

Investigación inicial: 2026-10-12. Capturas en `referencias/<nombre>/` (generadas con `mirar.py`).
Cada entrada: qué es, qué principio tomar, qué evitar. Se toman principios, no diseños.

Fuentes descartadas: páginas de producto de Coros Training Hub (`coros-hub/`: foto de portada
y login, no se ve el tablero) y de Whoop (`whoop-home/`: anillos de marketing, el texto sirve,
la imagen no). Dribbble (`dribbble-running/`) confirma lo que **no** hay que hacer: tableros
genéricos con anillos, degradados, fotos de atletas y diez tarjetas del mismo peso.

---

## 1. Portada "cómo vengo"

### Oura: rediseño de la app (Instrument)
- https://www.instrument.com/work/oura-app · https://ouraring.com/blog/es/new-oura-app-experience/
- Captura: `oura-instrument/`
- Pasaron de 5 pestañas a 3 porque los usuarios "tenían que tamizar varios datos" para
  encontrar lo importante. Ordenan todo en **tres capas**: indicador de un vistazo → métricas
  con algo de contexto → vistas exploratorias de largo plazo.
- **Tomar:** la jerarquía en tres capas como regla para cada vista del tablero: arriba la
  respuesta (un número + si va bien o mal), al medio el contexto (KPI y un gráfico), abajo la
  exploración (tablas, todo lo demás). La portada "Este mes" hoy ya tiene capa 1 y 2; Carrera
  mezcla las tres al mismo nivel.
- **Evitar:** los puntajes sintéticos ("readiness 68") y las frases motivacionales. No tenemos
  HRV ni el modelo para inventarlos, y en un tablero público se ven como relleno.

### Whoop: nueva pantalla de inicio
- https://www.whoop.com/us/en/thelocker/the-all-new-whoop-home-screen/
- Captura: `whoop-home/`
- Tres indicadores fijos arriba (sueño, recuperación, esfuerzo), cada uno abre su detalle.
  La meta declarada es "claridad primero".
- **Tomar:** pocos indicadores fijos, **siempre en el mismo lugar**, que llevan al detalle.
  En el tablero: cada KPI de "Este mes" debería ser un enlace a su vista (Pasos → Recuperación,
  Actividades → Calendario).
- **Evitar:** los anillos. Ocupan lugar y no dicen más que el número.

### Garmin Connect: rediseño 2024 (lo que molestó)
- https://dcrainmaker.com/2024/01/garmin-connect-through.html
- https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-mobile-ios/371119/home-page-sucks
- https://www.advnture.com/news/garmin-connect-feedback
- Hilo de r/Garmin (≈400 comentarios), citado en la nota de Advnture: el usuario original dice
  que ahora tiene que **buscar** la información en vez de verla de un vistazo.
- Queja central: tarjetas más grandes = mismos datos, más scroll. Perdieron la vista densa.
- **Tomar:** la densidad es una virtud en un tablero de seguimiento. Mantener la regla de
  DESIGN.md de que "Este mes" entra en ~620px sin scroll. Ninguna tarjeta crece por estética.
- **Evitar:** tarjetas grandes con un solo dato y mucho aire.

### Strava: "Weekly Snapshot" (comparación que frustra)
- https://road.cc/content/tech-news/stravas-weekly-snapshot-makes-me-feel-bad-307315
- Totales de la semana contra "el mismo punto de la semana pasada". Un usuario dice que
  sobre todo lo hace sentir mal con su esfuerzo de la semana, porque su carga varía por
  trabajo, familia y clima.
- **Tomar:** comparar **tasas** (por día, promedio) y no totales parciales. El tablero ya lo
  hace bien ("pasos por día ▲ 1.530 vs. sep"; el total de pasos no lleva comparación).
- **Evitar:** cualquier "vas atrás" a mitad de mes con totales. Si se agrega una comparación de
  volumen, que sea contra el mismo día del mes anterior y en tono neutro (`--texto-sec`).

### Stephen Few y la regla de los 5 segundos
- https://www.aufaitux.com/blog/good-dashboard-design/ (blog de una consultora; la regla es
  heurística, no un estudio)
- **Tomar:** el dato principal más grande, arriba a la izquierda, con aire alrededor. Si todo
  tiene el mismo tamaño y peso, nada es lo principal. Sparkline al lado del KPI para la
  dirección sin agregar un gráfico.
- **Evitar:** gauges y diales (Few inventó el bullet graph justamente para reemplazarlos).

### Runalyze: bloque de cálculos
- https://runalyze.com/ · captura `runalyze/` (sección "Conoce tu estado de entrenamiento")
- Una lista compacta: nombre del indicador, una barra horizontal finita y el valor a la
  derecha. Diez indicadores en el alto de una tarjeta.
- **Tomar:** para el "cómo vengo" del mes, una **lista de filas con barra** (estilo bullet graph
  mínimo) es más densa y más comparable que KPI sueltos en tarjetas. Útil para CTL/ATL/forma:
  "Forma −12" con una barra que muestra dónde cae en su rango.
- **Evitar:** el verde de marca para todo y los íconos de ⓘ en cada fila.

---

## 2. Comparación de sesiones de la misma plantilla

### intervals.icu: página "Compare Activities"
- https://forum.intervals.icu/t/activity-compare-page/68311 (captura `icu-compare/`)
- https://forum.intervals.icu/t/new-activity-comparison-page-started/64397
- Curvas superpuestas, una por sesión con color propio; eje X en tiempo o distancia; se pueden
  correr las curvas para alinear intervalos; debajo, gráficos de "progreso" con **un punto por
  intervalo por sesión**, y una tabla.
- **Tomar:** la combinación **superposición + tendencia por sesión** (lo superpuesto muestra
  la forma; los puntos muestran si hay progreso). El tablero ya tiene las dos cosas
  ("Ritmo a lo largo de la sesión" y "Eficiencia por sesión"), pero separadas por otros gráficos.
- **Evitar:** un color distinto por sesión. Con 4 sesiones ya hay que leer la leyenda; con 8 es
  imposible. Es exactamente el problema que DESIGN.md ya marcó.
- Opiniones (foro):
  - El control para alinear curvas "es difícil de encontrar" (lo admite el autor).
  - Un entrenador pide agrupar sesiones recurrentes ("Long Run") en un gráfico que evolucione,
    porque los gráficos personalizados solo filtran por tipo de actividad:
    https://forum.intervals.icu/t/activity-comparison/2821 · Juan ya tiene esto con las
    plantillas: es la ventaja principal del tablero y tiene que verse primero.

### "¿Estás progresando de verdad?" (foro intervals.icu)
- https://forum.intervals.icu/t/are-you-actually-progressing-cross-activity-interval-comparison-using-the-api/123408
- Un usuario arma con la API la comparación por bloque etiquetado y la muestra como
  "195W → 201W (+3,2 %)". Dice que verlas en orden cronológico hizo el progreso
  "inmediatamente obvio".
- Advertencias de otros usuarios: "una caída del 44 % en el desacople parece más convincente de
  lo que probablemente es"; los bloques más largos dan menos desacople sin importar la forma;
  conviene tener **3 o 4 sesiones parecidas** antes de concluir.
- **Tomar:** el formato **"antes → ahora (variación)"** para la fila protagonista de Carrera.
  Y una marca de confianza cuando hay pocas sesiones ("2 sesiones: tendencia sin confirmar").
- **Evitar:** porcentajes grandes en verde sin contexto de cuántas sesiones hay detrás.

### Datawrapper: resaltar una línea, el resto en gris
- https://www.datawrapper.de/academy/what-to-consider-when-creating-line-charts (captura `dw-lineas/`)
- https://www.vis4.net/blog/doing-the-line-charts-right/ (captura `vis4-lineas/`, Gregor Aisch)
- "El gris es un gran color para separar lo importante de lo que no lo es." El ejemplo
  muestra 8 líneas de colores (mal) contra 1 línea de color sobre 7 grises (bien).
- **Tomar:** en "Ritmo a lo largo de la sesión", la última sesión en `--tinta` gruesa, la
  anterior en `--texto-sec` y el resto en gris claro (`--grilla` más fuerte). DESIGN.md
  propone una rampa azul por antigüedad: es mejor que hoy, pero la rampa es azul como Carrera y
  los niveles intermedios no se distinguen entre sí. Con gris la pregunta queda en "¿la última
  está mejor que las anteriores?", que es la que importa.
- **Evitar:** leyenda separada (Aisch: "las leyendas separadas son el peor caso"). Etiqueta
  directa al final de la línea resaltada ("mar 8 sep").

### Datawrapper: small multiples
- https://www.datawrapper.de/blog/small-multiple-line-charts (captura `dw-small-multiples/`)
- Cada serie en su panel; una línea de referencia repetida en gris en todos los paneles.
- **Tomar:** para celular, en vez de superponer 8 curvas en 340px, una tira de paneles chicos
  por sesión con la sesión más reciente repetida en gris de fondo en cada uno. También sirve
  para ver ritmo y FC de la misma sesión uno arriba del otro con el mismo eje X.
- **Evitar:** más de ~6 paneles por fila; ejes Y distintos entre paneles.

### Slope / dumbbell para "antes y ahora"
- https://r-statistics.co/Dumbbell-and-Slope-Charts-in-R.html · https://datavizproject.com/data-type/dumbbell-plot
- Slope: dirección del cambio entre dos momentos. Dumbbell: tamaño de la brecha.
- Ojo: en métricas donde "menos es mejor" (ritmo, FC) el lector asume que a la derecha es
  mejor. Hace falta marcarlo.
- **Tomar:** un dumbbell por bloque de la plantilla (calentamiento, principal, vuelta a la calma):
  punto gris = promedio de las anteriores, punto `--tinta` = última, segmento en `--bien`/`--mal`.
  Es la vista más chica que responde "¿mejoré en cada parte?".

---

## 3. Gráficos de ritmo y FC

### Eje de ritmo invertido (más rápido = arriba)
- https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/380209/please-fix-pace-graphing-y-axis
- https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/230169/pace-graph-inversion
- Pedido recurrente de usuarios de Garmin: el ritmo dibujado "al revés" confunde porque la
  gente piensa el ritmo como velocidad. SportTracks y Runalyze lo resolvieron dejando elegir.
- **El tablero ya lo hace bien** (`reverse: true` en ritmo). Falta escribirlo en DESIGN.md
  como regla para que no se pierda: "en todo eje de ritmo, más rápido va arriba".

### FC a ritmo fijo / eficiencia
- https://forum.intervals.icu/t/custom-chart-heartrate-specific-pace/43449
- https://help.trainingpeaks.com/hc/en-us/articles/204071724-Aerobic-Decoupling-and-Efficiency-Factor
- https://synchronizedrunning.beehiiv.com/p/the-progress-nobody-tracks
- Lo que piden los corredores: ver si la FC baja al mismo ritmo, solo en sesiones comparables
  (mismo tipo, fáciles). Un usuario pide un box plot de FC por rango de ritmo; otro lo resuelve
  con un gráfico de dispersión FC contra ritmo, donde "los puntos que se mueven abajo a la
  derecha" significan progreso.
- TrainingPeaks: la eficiencia (EF) solo tiene sentido filtrada a sesiones parecidas.
- **El tablero ya tiene** eficiencia (m/latido), deriva cardíaca y dispersión ritmo-FC. El
  problema no es que falten datos: hay **nueve gráficos en Carrera** y la respuesta queda abajo.
- **Tomar:** en la dispersión, colorear por antigüedad igual que la superposición (gris → tinta),
  así "abajo a la derecha con el tiempo" se ve sin leer fechas.
- **Evitar:** mezclar todas las corridas en la tendencia de eficiencia sin separar por
  plantilla (hoy "Eficiencia aeróbica de todas las corridas" separa por subtipo, que es un
  paso intermedio).

### Relación de aspecto (banking)
- vis4.net (mismo artículo): las pendientes se leen mejor cerca de 45°.
- **Tomar:** gráficos de tendencia (eficiencia, CTL) más anchos que altos (~3:1). Un gráfico
  alto exagera variaciones chicas y vende progreso que no hay.

---

## 4. Calendario

### Calendarios tipo GitHub y mapas de calor de entrenamiento
- https://www.mintlify.com/mattbolanos/stratiles/features/activity-heatmap
- https://mail.onlyrss.org/posts/visualising-my-daily-constitutionals.html
- Patrón: semanas en columnas, días en filas; intensidad según volumen; los días vacíos tienen
  que verse distintos de los días suaves; tooltip con fecha y valor; totales debajo.
- **El tablero ya cumple** (Resumen y "Este mes", con rampa por HRSS y `--rampa-vacio`).
- **Tomar:** la línea de totales debajo del calendario ("57,7 km en 5 actividades") en lugar de
  una tarjeta aparte. En "Este mes" eso libera la tarjeta "Actividades del mes", que hoy ocupa
  media pantalla con una sola fila.
- **Evitar:** escalas relativas al máximo propio que cambian de mes a mes (un día igual se vería
  distinto según el mes). Mantener los cortes fijos de HRSS.

---

## 5. Tablas

### Matt Ström-Awn: "Design better data tables"
- https://mattstromawn.com/writing/tables/ (captura `strom-tablas/`)
- Números alineados a la derecha, texto a la izquierda, encabezado alineado con su dato,
  nada centrado. Cifras **tabulares y de caja alta** (lining).
- https://spectrum.adobe.com/page/table (Adobe Spectrum dice lo mismo).
- **El tablero ya cumple** (DESIGN.md §Tabla: `tabular-nums`, derecha, unidad en encabezado).
- **Tomar además:** cuando se comparan sesiones, la columna protagonista con una **mini barra o
  marca de variación** dentro de la celda (PolicyViz: "three things to make your tables more
  visual", https://policyviz.com/2021/03/02/three-things-you-can-do-to-make-your-data-tables-more-visual/).
- **Evitar:** cebrado y bordes verticales.

---

## 6. Tipografía, paleta y modo oscuro

### Modo oscuro en gráficos
- https://www.datawrapper.de/blog/dark-mode-for-embedded-visualizations
- https://data.europa.eu/apps/data-visualisation-guide/colour-guidelines
- Datawrapper mantiene **el contraste** de cada color contra el fondo, no el tono: un azul oscuro
  sobre blanco pasa a azul claro sobre negro. Las grillas en oscuro pasan a gris oscuro. Fondo gris
  muy oscuro, no negro puro. Bajar saturación de rojos y naranjas en oscuro.
- **El tablero ya cumple** en lo principal (la rampa se aclara al subir en oscuro, `--bien`/`--mal`
  tienen versión oscura). Revisar en `/evaluar` que la captura `prueba/celular-oscuro.png` tenga
  fondo gris oscuro y no `#000`.

### Fuente para números
- Ström-Awn: no todas las fuentes tienen cifras tabulares de verdad; Work Sans y San Francisco sí.
- Barlow Semi Condensed tiene `tnum` y el informe de `mirar.py` muestra que se usa en el tablero.
  Coros usa una DIN condensada negra para el mismo rol (`coros-hub/`): confirma que la
  condensada para números es la convención del rubro. No hace falta cambiar de fuente.

---

## 7. Celular

### Datawrapper: diseño "mobile first"
- https://www.datawrapper.de/blog/datawrapper-becomes-mobile-first-charting-tool
- https://www.datawrapper.de/blog/making-column-and-pie-charts-great-on-mobile-and-desktop
- En pantalla chica las etiquetas directas pasan a leyenda arriba; se fija el alto del área de
  dibujo, no del gráfico entero; menos etiquetas en el eje X.
- **Tomar:** en celular, el gráfico de comparación muestra solo **última vs. promedio de
  anteriores** (dos líneas), con la superposición completa detrás de un botón. El alto del área
  de dibujo fijo (~180px) para que todos los gráficos de una vista tengan la misma escala visual.
- **Evitar:** barras de 31 días con etiquetas en todos los días (hoy "Pasos por día" etiqueta
  días impares: en celular conviene cada 7, alineado a lunes).

### Tablas en el celular (agregado en `/evaluar`, 2026-10-12)
- https://www.nngroup.com/videos/big-tables-small-screens/ (NN/g): fijar encabezados y dejar
  elegir un subconjunto de columnas; en tablas numéricas entran más columnas angostas que en
  tablas de texto.
- https://uxmovement.com/mobile/how-to-display-large-data-tables-on-small-screens/ (captura
  `uxmovement-tablas-celular/`, la página es solo texto): la primera columna es el ancla y queda
  fija; lo decisivo, a la izquierda.
- https://www.datawrapper.de/academy/customizing-your-table : cada columna tiene "mostrar en
  escritorio / celular". Menos columnas en el celular, decididas a mano.
- **Tomar:** en el celular, Carrera muestra fecha · ritmo del bloque principal · FC · km, con la
  fecha fija a la izquierda. El resto está en el detalle de la sesión, que ya existe.
- **Evitar:** la tabla de escritorio con scroll horizontal y la columna protagonista fuera de pantalla.

### KPI con sparkline (agregado en `/evaluar`, 2026-10-12)
- https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables (captura
  `dw-tablas-sparklines/`): sparkline en la celda con **el valor inicial y el final escritos en
  las puntas** ("68,3 ~~~ 71,8"). Sin ejes ni tooltip.
- https://docs.stripe.com/stripe-apps/patterns/chart-layout (captura `stripe-kpi-sparkline/`,
  solo texto visible): la sparkline va al lado del KPI para dar la dirección; no sirve cuando
  hace falta el valor exacto.
- **Tomar:** en los KPI de Recuperación y Carrera, una sparkline de 24px de alto con el primer y
  el último valor en las puntas. Responde "¿hacia dónde va?" sin otro gráfico.
- **Evitar:** sparklines con ejes, puntos o color de deporte; en el KPI va en `--texto-sec`.

---

## 8. Identidad de color y tipografía (v3, 2026-10-13)

Contexto: Juan rechazó Barlow y la sobriedad de v1/v2; pidió color estilo Aston Martin y un tono
que lo empuje hacia el objetivo (ver `gustos.md`).

### Aston Martin Aramco F1 Team
- https://www.astonmartinf1.com/en-GB (captura `v3-amf1/`)
- Colores medidos por `mirar.py` en la página: verde **`#00665E`** (rgb 0,102,94), verde casi
  negro **`#00231F`** (rgb 0,35,31) y lima **`#CEDC00`** (rgb 206,220,0). Fondos negros o verde
  casi negro, texto blanco.
- **Tomar:** esos tres valores como anclas de la paleta. El lima **se usa poco**: líneas finas,
  filetes y un dato destacado sobre verde oscuro. Nunca como relleno grande.
- **Evitar:** la fotografía, el negro puro y su tipografía propietaria (AstonMartinSans/Flare no
  es libre).

### Aston Martin (autos)
- https://www.astonmartin.com/en (captura `v3-astonmartin/`, tapada en parte por el aviso de cookies)
- Botones rellenos en `#00665E` con texto blanco, fondos neutros oscuros con un toque oliva
  (`#161A11`). Tipografía de titulares fina y amplia.
- **Tomar:** el verde de marca como color de los **controles activos** y los neutros con un
  tinte verde en lugar de grises puros.
- **Evitar:** los textos grises sobre foto (bajo contraste).

### Runna (app de planes 10K, de Strava)
- https://www.runna.com/10k-training-app (captura `v3-runna/`) ·
  https://screensdesign.com/showcase/runna-running-training-plans (captura `v3-runna-pantallas/`)
- El objetivo es el titular: "10K Training App" en tipografía enorme y apretada. En la app, la
  tarjeta "Week 3" muestra el avance con una **barra segmentada** (semanas) y "Distance 1/42 km".
- **Tomar:** un componente **"Camino a los 10 km"** con la meta escrita en grande y una barra
  segmentada por kilómetro. Motiva con un dato real (la carrera más larga), no con frases.
- **Evitar:** la gamificación con rachas y el coral de su marca (choca con Pádel y con `--mal`).

### Formula 1: resultados
- https://www.formula1.com/en/results/2024/races (captura `v3-f1-resultados/`)
- Titulares en una tipografía **ancha y pesada** en mayúsculas ("2024 RACE RESULTS"); tablas en
  una sans normal (Titillium Web) con tiempos tabulares; encabezados de tabla en mayúsculas grises.
- **Tomar:** el par "titular ancho + tabla de ancho normal". Con Archivo se consigue con **una sola
  familia** (eje de ancho): expandida para títulos, KPI y etiquetas; normal para texto y tablas.
- **Evitar:** titulares en mayúsculas en todos lados: solo las etiquetas van en mayúsculas.

### Muestrario propio de tipografías
- `v3-tipografias/muestrario.png`: 15 candidatas libres de Google Fonts con textos y números
  reales del tablero, sobre el verde de marca. Prueba de cifras tabulares (ancho de "1111111"
  igual a "0000000" con `tabular-nums`): **todas cumplen salvo Chakra Petch**.
- **Elegida: Archivo** (Omnibus-Type, OFL, variable con ancho de 62 a 125 y peso de 100 a 900).
  Expandida (125) tiene aire de automovilismo sin parecer de videojuego; en ancho 100 se lee bien
  en tablas. Una sola familia con dos anchos mantiene la homogeneidad.
- Descartadas: Saira (demasiado "tecno"), Unbounded (pesada y redonda, cansa en tablas), Space
  Grotesk (el "1" con base distrae en números), Schibsted (cifras con mucho espacio).
- https://fonts.google.com/specimen/Archivo (captura `v3-archivo/`; la página no muestra el
  muestrario sin interacción, por eso hice el propio).

---

## 9. Monocromo + naranja (v4, 2026-10-13)

### Rachel · Fitness Personal Trainer (referencia que trajo Juan)
- https://rachel-pt.framer.website/ · capturas `v4-rachel/` (`hoja.png` = la página completa en tramos)
- Medido: General Sans 65/48px peso 500 con `letter-spacing` de −2,6px (−0,04em); texto 16px con
  −0,16px; blancos, `#F8F8F8`, `#121212`, `#1C1C1C`, gris `#767676` y naranja `#F9652F`.
- **Tomar:** el acento único y escaso (solo en lo destacado: la tarjeta "Most popular", el botón
  principal); **los números grandes con la etiqueta gris debajo** ("+102 / Women Coached"); los
  titulares en peso medio y apretados; tarjetas con radio grande; alternar secciones claras y casi
  negras.
- **Evitar:** la fotografía, la tipografía manuscrita de adorno (Covered By Your Grace), las
  píldoras y las tarjetas de precios. Es un sitio de venta: tomamos el sistema visual, no la
  estructura.

### Licencia y cifras de General Sans
- Licencia ITF Free Font License (Fontshare): permite usarla en webs, pero **no redistribuir los
  archivos** (subirlos a un servidor público o a un repo público). Fuentes:
  https://licenseorg.com/guide/fonts/fontshare · https://madegooddesigns.com/fontshare/
- Prueba propia (`v4-tipografias/muestrario.png`): **General Sans no tiene cifras tabulares**
  ("1111111" mide 86px y "0000000" 163px). En tablas y ejes los números bailarían.
- Alternativas libres comparadas en el mismo muestrario: Inter Tight, Inter, Hanken Grotesk,
  **Instrument Sans**, Host Grotesk, Geist, Onest, Figtree, Work Sans (todas con tabulares).
  https://fontalternatives.com/alternatives/general-sans/ sugiere Inter y Work Sans; a la vista,
  **Instrument Sans** es la más parecida en titulares apretados (mismo "color", la misma "a" y
  la misma "t" cortas) y además tiene eje de ancho (75–100). **Elegida.** Segunda opción: Inter Tight.

---

## Opiniones de usuarios reales (resumen)

| Qué dicen | Dónde | Qué implica |
|---|---|---|
| Tienen que buscar la información en vez de verla de un vistazo; las tarjetas grandes obligan a hacer scroll | r/Garmin y foro Garmin, 2024 ([Advnture](https://www.advnture.com/news/garmin-connect-feedback), [foro](https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-mobile-ios/371119/home-page-sucks)) | Densidad > aire en la portada |
| La comparación semanal a mitad de semana los hace sentir mal | [road.cc sobre Strava](https://road.cc/content/tech-news/stravas-weekly-snapshot-makes-me-feel-bad-307315) | Comparar tasas, no totales parciales |
| Ver los bloques ordenados por fecha hizo el progreso "inmediatamente obvio" | [foro intervals.icu](https://forum.intervals.icu/t/are-you-actually-progressing-cross-activity-interval-comparison-using-the-api/123408) | Tendencia por bloque de la plantilla, primero |
| Desconfían de variaciones grandes con pocas sesiones | mismo hilo | Marcar cuántas sesiones respaldan la tendencia |
| El ritmo "al revés" confunde | [foro Garmin](https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/380209/please-fix-pace-graphing-y-axis) | Más rápido = arriba (ya está) |
| Demasiadas métricas distraen; lo útil es volumen semanal, ritmo y FC de las sesiones de calidad | [trainingplan.dev](https://www.trainingplan.dev/blog/posts/tracking-running-progress), [foro Suunto](https://forum.suunto.com/post/84665) | Menos gráficos visibles en Carrera |

---

## Conclusiones: las ideas más fuertes, por impacto

| # | Idea | ¿La cumple DESIGN.md v1? |
|---|---|---|
| 1 | **Carrera se ordena en tres capas** (Oura): arriba el veredicto de la plantilla elegida ("antes → ahora" en el bloque principal: ritmo, FC y eficiencia, con cuántas sesiones lo respaldan); al medio la superposición; abajo, plegado, el resto (deriva, dispersión, km, zonas, dinámica). Hoy hay 9 gráficos al mismo nivel y la respuesta está abajo. | **No.** La guía define componentes, no el orden de las vistas. |
| 2 | **Última sesión resaltada, el resto en gris** (Datawrapper / Aisch), con etiqueta directa y sin leyenda. Lo mismo en la dispersión ritmo-FC y en los puntos de eficiencia. | **En parte.** Propone orden temporal con rampa azul; el gris es más claro y no choca con el azul de Carrera. |
| 3 | **Dumbbell por bloque de la plantilla** (anteriores → última) como gráfico protagonista de comparación, más chico y más legible que 8 curvas, sobre todo en celular. | **No.** |
| 4 | **Densidad en la portada**: sumar los totales debajo del calendario y achicar o eliminar "Actividades del mes"; cada KPI lleva a su vista. | **En parte.** Pide portada sin scroll, pero la tarjeta de actividades sigue ocupando media pantalla. |
| 5 | **Lista con barras para forma/CTL/ATL** (Runalyze, bullet graph mínimo) en vez de KPI sueltos. | **No.** |
| 6 | **Comparar tasas, no totales parciales**, y marcar la confianza con pocas sesiones. | **En parte.** Ya compara por día; falta la regla escrita y la marca de confianza. |
| 7 | **Celular: última vs. promedio** en el gráfico de comparación, small multiples para ver ritmo y FC alineados. Eje X de 31 días etiquetado cada 7. | **No.** Solo regula KPI en 2×2. |
| 8 | **Regla escrita "ritmo: más rápido arriba"** y gráficos de tendencia apaisados (~3:1). | **No escrita** (el código ya invierte el ritmo). |
| — | Ya cumplidas: interfaz neutra y datos con color, cifras tabulares, tablas alineadas, calendario con rampa fija y vacío distinto, modo oscuro con contraste, sin leyenda con una sola serie, sin gauges ni degradados. | **Sí.** |

**Corrección (2026-10-12, en `/evaluar`):** lo que parecía un error de Carrera (KPI de ~470px
de alto en `tablero-carrera/escritorio-largo.png`) es un efecto de la captura: `mirar.py` agranda
la ventana al alto total de la página y `.vista-arriba` mide `calc(100vh - 175px)`. En 1440×900
se ve bien. Queda como problema menor: en monitores muy altos pasaría lo mismo. **Las capturas
`escritorio-largo.png` del tablero no sirven para juzgar alturas**; usar `escritorio.png`.

**Decisión que es de Juan** (cambia qué datos se muestran): la idea 1 pone la **eficiencia
(m/latido) del bloque principal** como uno de los tres números protagonistas de Carrera. Hoy es
un gráfico secundario.
