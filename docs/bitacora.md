# Bitácora del proyecto

Registro de lo que fui haciendo, las decisiones que tomé y los problemas que aparecieron.
Una entrada por etapa, de la más reciente a la más antigua.

---

## Tablero v1.3: Montserrat y sistema tipográfico único (13/10/2026)

### Qué hice
- Cambié la tipografía a **Montserrat** (400, 500, 600 y 700, incluidas en
  `app/vendor/fuentes/`, licencia OFL) y saqué Barlow. Una sola familia para todo: títulos,
  texto, números, ejes y tooltips.
- Definí en `DESIGN.md` **un token por rol** (`--t-hero`, `--t-kpi`, `--t-pagina`,
  `--t-titulo`, `--t-base`, `--t-control`, `--t-chico`, `--t-eje`, `--t-etiqueta`), cada uno con
  peso, tamaño e interlineado juntos, y reglas para respetarlos (sin tamaños sueltos, cifras
  tabulares en los números, máximo 3 roles por tarjeta, mayúsculas solo en etiquetas, 700
  solo en página y protagonista).
- Migré **todas las vistas**: el CSS ya no tiene ningún `font-size` suelto (pasó de 19 tamaños
  distintos a 9 roles) y los gráficos leen la tipografía de los tokens
  (`Tablero.graficos.tipografia()`), incluidos los textos dibujados en Carrera, Pádel y Este mes.
- De paso: radios llevados a los dos tokens en todas las vistas y el selector "Etapa" con el
  mismo estilo que los demás controles.

### Decisiones
- **Escala 1px más chica que la anterior**: Montserrat es ancha y de letra alta; con los
  tamaños de antes no entraban la portada ni la tabla de Carrera en una pantalla.
- **Sin fuente aparte para los números**: Montserrat trae cifras de ancho fijo
  (`tabular-nums`); verificado que "1111" y "0000" miden lo mismo.
- **Tabla de Carrera con 8 columnas** (la guía pone ese máximo): "Ritmo prom." pasó al detalle
  de la sesión; el ritmo de entrenamiento va en 600 y "aproximada" es una marca chica.

### Pendiente
- En el Calendario, la columna "Semana" parte "13 h 38 min" en dos líneas (Montserrat es más
  ancha).

---

## Tablero v1.2: rediseño de "Este mes" según DESIGN.md (12/10/2026)

### Qué hice
- Guardé el tablero anterior como **v1.1** (`versiones/v1.1/`, fuera de `app/`, con la
  etiqueta de Git `v1.1`) para poder compararlo. Lee los mismos datos de `app/data/`.
- Revisé la portada contra `app/DESIGN.md` (inventario con `grep` y capturas con Playwright en
  escritorio y celular, claro y oscuro) y apliqué los cambios aprobados:
  - **Tokens nuevos** (escala tipográfica `--tx-*`, espaciado, radios, `--tinta`, `--bien` /
    `--mal`, `--sombra-flotante`, `--velo`) y **fuentes Barlow / Barlow Semi Condensed**
    incluidas en `app/vendor/fuentes/` (licencia OFL), para que anden con `file://`.
  - **Interfaz neutra**: el azul dejó de ser color de interfaz (navegación, foco, casillas);
    el ítem activo lleva una barra de tinta. El azul queda para Carrera y la rampa.
  - **Calendario chico**: el fondo de cada día indica la carga (mismos cortes que el
    Resumen) y los puntos, el deporte; hoy tiene un anillo de tinta. Antes, el borde azul
    de "activo" hacía que los días de caminata parecieran carreras.
  - **Tarjetas**: "Pasos del mes" como dato protagonista; variaciones con flecha en verde o
    rojo según convenga (la FC en reposo que sube es mala) y una sola línea de contexto.
  - **Gráfico diario**: sin leyenda, promedio con etiqueta directa ("prom. 11.872"), el último
    día en color pleno y el resto al 60 %, sin la unidad repetida en el eje.
  - **Controles**: un solo estilo de 32px; el segmentado es un grupo unido.
- La versión (v1.2) se ve abajo en la barra lateral.

### Decisiones
- Cambios a `DESIGN.md`: legibilidad del calendario sobre la rampa (número según el nivel y
  puntos con anillo), token `--velo`, padding `--e4` en "Este mes" (tiene que entrar en una
  pantalla de ~620px) y KPI en celular sin partir el valor (`7:16 h`).
- Las variaciones se calculan en `formato.js` (`MEJOR_SI` + `variacion()`): cada métrica dice
  en un solo lugar si le conviene subir o bajar.

### Pendiente
- Migrar el resto de las vistas a la escala tipográfica y los radios (hoy solo "Este mes",
  la barra lateral y los controles compartidos). Quedan textos de canvas con tamaño fijo en
  `carrera.js` y `padel.js`.
- `DESIGN.md` no dice de qué color van las métricas diarias (pasos, sueño): siguen en azul.

---

## Etapa 2 (tablero): curvas minuto a minuto, potencia y análisis nuevos (11/10/2026)

### Qué hice
- El generador produce un archivo nuevo, `app/data/minutos.js`, con los minutos de cada
  sesión: una línea por actividad y una lista por columna (~120 KB). Cada minuto trae
  además el **bloque al que pertenece**. Agrega también `potencia_w` a actividades, bloques
  y al resumen de la fase de entrenamiento.
- **Carrera**:
  - El gráfico "… a lo largo de la sesión" pasó de un escalón por bloque a la **curva real
    minuto a minuto**, con selector Ritmo / FC / Potencia / Cadencia / Zancada. Mantiene la
    alineación por plantilla y las líneas punteadas entre bloques: cada minuto se ubica en
    el tramo de su bloque según la parte del bloque que había transcurrido.
  - La tarjeta **Potencia media** usa el dato real (ponderado por tiempo).
  - **Deriva cardíaca**: cuánto cae la eficiencia (velocidad ÷ FC) de la primera a la
    segunda mitad del bloque de entrenamiento, con referencia en 5 %. En las plantillas por
    ciclos muestra la FC de cada bloque de entrenamiento.
  - **Eficiencia por sesión**: m/latido o W/latido de cada sesión elegida, en la etapa elegida.
  - **Ritmo contra FC, minuto a minuto**: dispersión de hasta 3 sesiones.
- **Carrera, primera pantalla**: debajo de los filtros van la tabla de sesiones (con scroll
  propio y títulos fijos) y, a su derecha, las cuatro tarjetas en columna. La tabla sigue
  los filtros como el resto: solo las sesiones elegidas de la plantilla, con el color de su
  línea. Con una etapa elegida, km, tiempo, ritmo, FC y potencia son de esa etapa (la carga
  sigue siendo de la sesión: Intervals no la calcula por bloque). **Pádel, Ciclismo y
  Otras actividades** abren con la misma primera pantalla (tabla + tarjetas en columna) y,
  como Carrera, sin selector de período: muestran todo el historial. El período queda solo
  en Resumen y Recuperación.
- **El filtro de plantillas pasó a ser de selección múltiple.** Con una sola plantilla, el
  gráfico se alinea a sus bloques. Con varias no hay bloques comunes, así que el eje es el
  tiempo real; las etapas son las fases de las plantillas elegidas (las sesiones libres no
  tienen) y la deriva se muestra en las sesiones con un bloque de entrenamiento continuo. Los gráficos quedan más abajo. En celular, tarjetas en 2 × 2 y la tabla debajo.
- **Pádel**: FC minuto a minuto de cada partido, con las zonas de FC como bandas de fondo y
  los minutos en zona 3 o más.
- **Detalle de cada sesión** (tablas y calendario): gráficos chicos de FC y ritmo por minuto
  (velocidad en la bici).
- **Datos**: se suma `minutos.csv`, que se arma desde `minutos.js` para no duplicarlo.

### Decisiones
- **Minutos en un archivo aparte** de `datos.js`: este sigue liviano y legible, y en GitHub
  cada día solo se agregan las líneas de las sesiones nuevas.
- **Cada minuto se asigna a un bloque por su punto medio**, no por su inicio. El bloque 2 del
  03/09 empieza en el segundo 301: el minuto 5 (300–359 s) es casi entero del bloque 2.
- **El eje Y de las curvas usa los percentiles 3 y 97** con un margen: un minuto con pausa
  (14:31 /km) quedaría contra el borde en lugar de aplastar toda la curva.
- **Deriva**: saltea los 2 primeros minutos del bloque (la FC tarda en estabilizarse) y los
  minutos muy incompletos, y compara mitades de igual duración. Primer resultado en 25 MIN CO:
  2,7 % el 26/08, 7,6 % el 03/09 y 6,8 % el 08/09.

### Problemas
- **Dos sesiones tenían minutos faltantes** en la grabación (pausas en las que el reloj no
  grabó). Como `minutos.js` usa la posición en la lista como número de minuto, se corría
  todo. Ahora los minutos faltantes van vacíos.

---

## Etapa 2 (datos): grabación minuto a minuto (11/10/2026)

### Qué hice
- Verifiqué que la API de Intervals devuelve la grabación completa de cada actividad,
  segundo a segundo: FC, velocidad, distancia, altitud, cadencia, zancada, tiempo de
  contacto, oscilación vertical y potencia. En el pádel solo llega la FC.
- Agregué `datos/minutos.csv`: una fila por minuto de cada sesión, resumida de esa
  grabación (clave: actividad + minuto). Lo cargan el histórico y el diario, así que el
  workflow lo actualiza solo sin cambios en GitHub Actions.
- Agregué la columna `potencia_w` a `actividades.csv` y a `bloques.csv`.

### Hallazgos
- **El reloj sí registra potencia de carrera**, pero Intervals no la promedia (los campos
  de potencia media llegan vacíos). La calculo yo desde la grabación, sin contar las pausas.
- **Dentro de un bloque el ritmo varía bastante.** En el bloque principal del 22/09
  (promedio 6:39 /km), los minutos van de 6:23 a 7:12 y la FC sube de 150 a 163.

### Decisiones
- **Resumir por minuto y no guardar segundo a segundo**: unas 45 filas por corrida en lugar
  de unas 2700, suficiente para ver la curva dentro de cada bloque.
- **No descargar la posición GPS.** El repositorio es público y los recorridos muestran
  desde dónde salgo a correr. Se piden a la API solo los datos necesarios.
- **Para el ritmo de cada minuto, las pausas cuentan** (si paré, el minuto sale más lento).
  Para la cadencia, la potencia y la FC, las pausas no cuentan.

### Problemas
- **Algunos ritmos salían como `10:60`** en lugar de `11:00`: se redondeaban los segundos
  después de separar los minutos. Lo corregí y volví a bajar todo el histórico.

---

## Etapa 2: tablero web (28/09 – 11/10/2026)

### Qué hice
- Escribí `scripts/generar_datos_app.py`, que convierte los CSV en `app/data/datos.js` para
  el tablero (`meta`, `actividades`, `semanas`, `bienestar` y `crudos`). Usa solo la
  biblioteca estándar de Python, así el workflow no suma dependencias.
- Armé el tablero en `app/`. La primera versión tenía pestañas arriba. La versión actual
  sigue el estilo de Intervals.icu: una **barra lateral** con la navegación y los filtros, y
  el **Calendario** mensual como vista principal. Las demás vistas son **Resumen**,
  **Carrera**, **Pádel**, **Ciclismo**, **Otras actividades**, **Recuperación** y **Datos**.
  Tiene filtro de período (4 semanas / 12 semanas / todo), modo claro/oscuro y diseño para
  celular.
- La vista **Datos** muestra los tres CSV tal cual y marca qué columnas usa algún gráfico
  y cuáles no, para saber qué queda por aprovechar.
- El 11/10 subí el tablero y el generador a GitHub. Desde ahí, el workflow diario también
  regenera `datos.js`: para ver los datos nuevos alcanza con `git pull`.
- Recuperé el bienestar del 29/09 al 01/10 volviendo a correr `diario.py` con 14 días
  hacia atrás (ver Problemas).

### Decisiones
- **Chart.js** en lugar de ECharts: pesa ~70 KB contra ~330 KB. El calendario de carga
  (que Chart.js no trae) lo hice con una grilla CSS. Si más adelante hace falta algo que
  Chart.js no resuelva, se evalúa el cambio.
- **Los cálculos se hacen en Python, no en el navegador**: ritmo en segundos, eficiencia
  (metros por latido), agregados semanales y medias móviles de 7 días. El JavaScript solo
  filtra y dibuja.
- **Salida determinística**: la fecha de "actualizado" sale de los CSV y no de la hora
  actual. Si los datos no cambian, el archivo tampoco, y no hay commits vacíos.
- **El tablero se abre sin servidor** (doble clic en `app/index.html`). Al principio usaba
  JSON con `fetch()` y módulos ES, pero los navegadores bloquean las dos cosas en `file://`
  y había que levantar un servidor cada vez. Lo cambié por un único `datos.js` cargado con
  `<script>` y scripts clásicos con un espacio de nombres (`window.Tablero`). En Cloudflare
  funciona igual.
- **Nunca dos ejes Y en un gráfico**: el ritmo y la FC del bloque principal van en
  gráficos separados. Con dos escalas en el mismo gráfico, parece que hay una correlación
  que en realidad no existe.
- **Los días sin dato quedan como huecos** (no se rellenan con 0 ni se interpolan).
- **Ciclismo tiene pestaña propia** (van a sumarse varias salidas). "Otras actividades"
  queda para caminata y cualquier deporte nuevo sin pestaña.
- **Detalle por sesión en todas las pestañas**: al tocar una fila se ven todas las
  métricas, el tiempo en cada zona y las vueltas/bloques. Es un único componente
  (`js/sesiones.js`) hecho con HTML y CSS, sin Chart.js, para que abrir muchas filas no pese.
- **Estructura al estilo Intervals.icu**: barra lateral con la navegación y los filtros
  (qué entrenamientos y qué datos diarios mostrar), y un **calendario mensual** como vista
  principal. Cada día muestra sueño, FC en reposo y pasos, y los entrenamientos solo con su
  nombre; al tocarlos se abre el detalle completo. A la izquierda de cada semana hay un
  resumen (sesiones, tiempo, distancia, carga, fitness, fatiga). En celular la barra lateral
  es un menú desplegable y el calendario pasa a ser una agenda, un día por fila.
- **Portada "Este mes"** (lo primero que se abre): tarjetas con pasos del mes, pasos por
  día, sueño y FC en reposo promedio, las actividades del mes por tipo y un calendario
  chico con los días de actividad marcados. Los promedios se calculan solo con los días
  que tienen dato, y cada tarjeta dice cuántos son: así un día sin reloj no baja el
  promedio. El mes en curso corta en el último día descargado (ayer), no en hoy.
  La portada entra entera en la pantalla, sin scroll, en una grilla de 2 × 2: arriba el
  calendario chico y las cuatro tarjetas (también en 2 × 2); abajo las actividades del mes
  y un gráfico de barras por día (con el promedio como referencia). En celular o en ventanas muy bajas se apila
  y se scrollea. El gráfico diario tiene un selector **Pasos / Sueño** (se recuerda en el
  navegador) y la lista de actividades muestra cada tipo en un solo renglón.
- **Plantillas de Zepp reconocidas automáticamente.** El FIT no trae el nombre de la
  plantilla, pero su estructura queda en las vueltas: cada bloque termina por tiempo
  (25:00) o por distancia (2 km). Armé un catálogo con mis plantillas
  (`scripts/plantillas.csv`: fase, objetivo y ciclos de cada paso) y el generador compara
  cada sesión contra él, con tolerancia (±3 s o 2 %; hasta 25 % en el calentamiento) y
  aceptando sesiones cortadas antes de terminar (`scripts/plantillas.py`). Cada sesión queda
  con su plantilla (o "Libre"), el tipo de coincidencia (exacta, aproximada o incompleta)
  y la **fase de cada bloque**. Con eso se calculan métricas **solo de la parte de
  entrenamiento**, que son más limpias que el promedio de toda la sesión. El catálogo
  resolvió casos que la estructura sola no podía (el 22/09 la vuelta a la calma duró 22:00
  *y* 2 km). Primer resultado: 25 MIN CO ×3, 2KM - 6', 28 MIN CO y Aumento de ritmo; el
  resto son libres (vueltas automáticas de 1 km) o las series del 28/08, que no están en
  el catálogo.
- **Vista Carrera para comparar sesiones de una misma plantilla**: sin selector de período
  (usa todo el historial); un desplegable elige la plantilla y otro, con casillas, las
  sesiones a comparar (hasta 8, por la paleta de colores). Un único gráfico de líneas
  escalonadas muestra el ritmo o la FC (selector) en función del tiempo desde el inicio
  de la sesión: un escalón por bloque, porque solo tenemos promedios por bloque y no datos
  segundo a segundo. Ritmo y FC no van juntos: necesitarían dos ejes Y y eso sugiere
  relaciones que no existen. Con una plantilla elegida, **el eje X sigue los bloques de la
  plantilla** y no el reloj de cada sesión: así todas comparten los mismos tramos (aunque
  un calentamiento haya durado 5:37) y lo que varía es la altura de cada escalón. Los
  bloques por distancia toman su duración promedio. Líneas punteadas verticales marcan
  cada cambio de bloque, con la fase y el objetivo arriba. En "Libre" el eje es el tiempo
  real. Un tercer selector, **Etapa** (toda la sesión, calentamiento, entrenamiento,
  relajado, restaurar), filtra tarjetas y gráfico a los bloques de esa fase: así el ritmo
  y la FC de "lo que corro" no se mezclan con el calentamiento ni la vuelta a la calma.
  Las tarjetas ahora son de la selección: ritmo medio (distancia y tiempo totales), FC
  media (ponderada por tiempo), potencia y distancia. **Potencia: sin datos**; el Amazfit
  Active 2 no la registra en carrera y no viene en lo que bajamos de Intervals.
- **Filtros laterales**: al principio había un filtro por tipo de entrenamiento ("Mostrar
  entrenamientos"), pero en la práctica no lo usaba y ocupaba lugar, así que lo saqué.
  Queda solo "Datos diarios" (sueño, FC en reposo, pasos), que aparece en el Calendario y
  se recuerda en el navegador.
- La lista de columnas "en uso" vive en el generador (`USO_COLUMNAS`). Cuando un gráfico
  empiece a usar una columna nueva, hay que agregarla ahí.

### Problemas
- **No hay FC en reposo, sueño ni pasos antes del 26/08.** Coincide con el límite de la
  sincronización Zepp → Intervals (~4 semanas hacia atrás). Las corridas viejas que subí
  a mano como FIT traen todo lo de la actividad (FC, zonas, dinámica), pero los datos
  diarios de bienestar no vienen en esos archivos. El tablero lo avisa en la pestaña
  Recuperación.
- El servidor de desarrollo de Python (`http.server`) a veces cortaba la conexión en
  Windows al pedir un JSON. Dejó de importar cuando el tablero pasó a abrirse sin servidor.
- **Zepp sincroniza tarde y el workflow solo revisa 7 días.** Al 11/10 faltaban sueño, FC
  en reposo y pasos del 29/09 al 01/10, aunque los datos existían en Intervals: habían
  llegado cuando esos días ya estaban fuera de la ventana. Volví a correr `diario.py 14` y
  aparecieron. Para la próxima: desde GitHub, Actions → "Actualización diaria de datos" →
  Run workflow, con más días hacia atrás.
- **Huecos que no son errores**: el 02/10 Intervals no tiene sueño ni FC en reposo, y del
  05 al 10/10 faltan datos porque el reloj se quedó sin batería.
- **Una caminata larga quedó partida en 5 actividades** (3–4/10, unas 13 h en total): el
  reloj cortó la grabación. Por ahora quedan separadas para no tocar los scripts.
- **En mi Chrome los gráficos de Chart.js a veces quedaban en blanco** (por ejemplo,
  Resumen con "Todo"). No se podía reproducir: en Chrome y Edge sin interfaz se dibujaban
  bien. El aviso en rojo que agregué para diagnosticar mostró "Script error.", que es como
  Chrome oculta los errores de scripts de otro origen: el problema venía de Chart.js
  cargado desde el CDN (probablemente por las extensiones o el antivirus). **Solución**,
  copiada de un prototipo que andaba bien: guardar Chart.js dentro de la carpeta
  (`app/vendor/chart.umd.min.js`, misma versión 4.4.7) y desactivar las animaciones, para
  que cada gráfico se dibuje de una vez. De paso, el tablero ahora funciona sin internet.
  Con eso los gráficos se dibujaron, pero el aviso seguía diciendo "Script error.": era un
  error de alguna **extensión del navegador**, que inyecta sus scripts en la página, y el
  aviso escuchaba todos los errores. Ahora solo muestra los de los archivos del tablero;
  los ajenos van a la consola.

---

## Etapa 1: repositorio y actualización automática (24/09/2026)

### Qué hice
- Creé el repositorio público `stats-training` en GitHub y subí la estructura del proyecto.
- Cargué el Athlete ID y la API key como secretos del repositorio.
- Extendí la carga histórica para que arranque el 10/07.
- Probé a mano el workflow diario y terminó bien. Desde ahí corre solo todos los días
  a las 09:00 (hora de Argentina) y guarda los cambios con un commit `datos:`.

### Problemas
- **El antivirus rompía la conexión con la API.** Avast inspecciona las conexiones HTTPS y
  las firma con su propio certificado. Windows confía en él, pero Python usa su propia lista
  de certificados y rechazaba la conexión. Lo resolví con la librería `truststore`, que hace
  que Python use los certificados del sistema. Descarté desactivar la verificación porque
  deja la conexión expuesta.
- **Finales de línea distintos en Windows y en Linux.** Los CSV se escriben en mi compu
  (Windows, CRLF) y en GitHub Actions (Linux). Agregué un `.gitattributes` que guarda todo
  con LF para que cada commit muestre solo los cambios reales y no el archivo entero.
- **Del 10 al 17/07 no hay actividades en Intervals.** La más antigua es del 18/07. Si
  aparecen entrenamientos de esos días, hay que exportarlos de Zepp y subirlos a mano.

### Decisiones
- **Los valores sin decimales se guardan como enteros** (`37` y no `37.0`): los CSV se leen
  mejor y ocupan menos.
- **Si una actividad no tiene detalle de vueltas, se saltea** en lugar de cortar toda la
  descarga.
- **El workflow hace `git pull --rebase` antes de subir los datos**, por si subí algo
  mientras corría.

---

## Etapa 0: exploración de los datos (22–24/09/2026)

### Qué hice
- Evalué Intervals.icu como plataforma para centralizar los datos del reloj: API REST
  pública, autenticación por API key, más de 200 integraciones de terceros.
- Conecté el Amazfit Active 2 a Intervals.icu a través de la app Zepp (integración oficial).
- Escribí un primer script en Python para conectarme a la API y ver qué campos llegaban.
- Armé un prototipo de tablero HTML con los datos de una muestra de 4 semanas.
- Escribí los scripts `historico.py` (carga inicial) y `diario.py` (actualización diaria).

### Hallazgos
- **La integración Zepp → Intervals solo sincronizó ~4 semanas hacia atrás** (desde el 26/08).
  Las actividades de julio y agosto las exporté de Zepp como FIT y las subí a mano.
- **El ritmo promedio engaña.** Mis corridas con plantilla tienen calentamiento, bloque
  principal y vuelta a la calma casi caminando. El 22/09 el promedio fue 8:13 /km, pero el
  bloque principal fue a 6:38 /km. La métrica útil para ver progreso es el bloque principal.
- **El archivo FIT no guarda el nombre de la plantilla** usada en el reloj; solo quedan las
  vueltas. Las clasifico por su forma (5 min + bloque largo + vuelta a la calma = "Bloques").
- **No llegan HRV, SpO2 ni peso**: la integración de Zepp solo envía actividades, sueño,
  pasos y FC en reposo.
- La cadencia llega por pierna (~69); hay que multiplicarla por 2.
- El pádel genera tanta carga cardíaca como una corrida con bloques: hay que contarlo.

### Decisiones
- **CSV en lugar de JSON** para guardar el histórico: son datos tabulares, ocupan menos,
  los cambios se leen bien en GitHub y se abren directo en Excel o Power BI. El tablero
  recibe JSON, pero generado a partir de los CSV.
- **Tres tablas** con claves para hacer upsert: actividades (id), bloques (actividad + nro)
  y bienestar (fecha).
- **El diario revisa los últimos 7 días**, no solo ayer: así se corrigen solos los datos que
  llegan tarde (sincronizaciones demoradas, sueño completado después, fitness recalculado).
- **Repositorio público**, como parte del portfolio.
- **Separar el trabajo con Claude Code por carpetas** (`app/` para el tablero, `coach/` para
  el entrenamiento), cada una con su propio `CLAUDE.md`, para que cada sesión cargue solo el
  contexto que necesita.
