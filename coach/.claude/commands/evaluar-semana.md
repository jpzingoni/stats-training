---
description: Evalúa la última semana de entrenamiento y recuperación, y escribe un informe
argument-hint: "[fecha fin AAAA-MM-DD, opcional; por defecto ayer]"
---

Evaluá mi semana de entrenamiento. Fecha de cierre: $ARGUMENTS (si está vacío, usá ayer).

## Pasos

1. Si los datos pueden estar desactualizados, corré `python ../scripts/diario.py`.
2. Con Python, leé `../datos/actividades.csv`, `../datos/bloques.csv` y `../datos/bienestar.csv`
   (encoding `utf-8-sig`) y calculá para **la semana evaluada (7 días hasta la fecha de cierre)**
   comparada con **el promedio de las 3 semanas anteriores**:
   - Sesiones por categoría, tiempo total, km corridos, carga HRSS total y por deporte.
   - Relación carga semana / promedio 3 semanas anteriores.
   - Distribución de tiempo en zonas de FC (corridas): % en Z1–Z2, Z3, Z4+.
   - **Bloque principal** de cada corrida con plantilla de Bloques: duración, ritmo y FC media.
     Compará con las sesiones de bloques anteriores (¿mismo ritmo con menos FC? ¿más rápido con
     la misma FC?). Calculá la eficiencia como velocidad (m/min) ÷ FC media.
   - Pádel: duración, FC media, carga, carga por hora.
   - Recuperación: sueño medio, noches < 6,5 h, FC en reposo media vs. media de 14 días,
     forma (CTL − ATL) al cierre.
3. Revisá las señales de alerta definidas en CLAUDE.md.
4. Escribí el informe en `informes/<fecha-cierre>-semana.md`, empezando con el frontmatter
   definido en CLAUDE.md (tipo: semana), y con esta estructura:
   - **Resumen en 3 líneas** (qué pasó, cómo estás, qué hacer).
   - **Números de la semana** (tabla comparada con las 3 anteriores).
   - **Carrera:** progreso del bloque principal y distribución de intensidad.
   - **Pádel.**
   - **Recuperación.**
   - **Alertas** (o "Sin alertas").
   - **Recomendación para la próxima semana:** sesiones concretas (día sugerido, tipo,
     duración, zona de FC objetivo), respetando la progresión prudente y los días de pádel.
     Si hay un plan activo en `planes/`, alineá la recomendación con ese plan.
5. Mostrame el resumen y las alertas en el chat y decime dónde quedó el informe.

Si hay pocos datos (por ejemplo, menos de 3 semanas anteriores), hacé la comparación con lo
que haya y aclaralo.
