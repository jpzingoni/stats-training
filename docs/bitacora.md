# Bitácora del proyecto

Registro de lo que fui haciendo, las decisiones que tomé y los problemas que aparecieron.
Una entrada por etapa, de la más reciente a la más antigua.

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
- Los filtros laterales se aplican a Este mes, al Calendario y al Resumen. En las vistas de cada deporte
  no, porque ahí ya se ve un único deporte. Se recuerdan en el navegador.
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
- **Pendiente: en mi Chrome los gráficos de Chart.js a veces quedan en blanco** (por
  ejemplo, Resumen con "Todo"). No se pudo reproducir: en Chrome y Edge sin interfaz se
  dibujan bien, incluso con la escala de pantalla al 125 % y al 150 %. Sospecha: una
  extensión o el antivirus bloqueando el canvas. Agregué un aviso en rojo que muestra el
  error si algo falla al dibujar, para poder diagnosticarlo.

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
