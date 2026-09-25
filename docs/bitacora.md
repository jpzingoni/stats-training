# Bitácora del proyecto

Registro de lo que fui haciendo, las decisiones que tomé y los problemas que aparecieron.
Una entrada por etapa, de la más reciente a la más antigua.

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
