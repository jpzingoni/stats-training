---
description: Arma un plan progresivo para correr 10 km basado en mis datos reales
argument-hint: "[fecha objetivo y/o tiempo objetivo, ej: 2026-12-06 sub 1h05]"
---

Armame un plan para llegar a correr 10 km. Datos del objetivo: $ARGUMENTS

## Antes de planificar

1. Revisá la ficha en CLAUDE.md. Si faltan datos clave (días disponibles para correr, fecha
   objetivo, lesiones, si el objetivo es completar los 10 km o hacer un tiempo), **preguntámelos
   y esperá la respuesta** antes de armar el plan.
2. Con Python, calculá mi línea de base de las **últimas 4 semanas** a partir de los CSV:
   - Km por semana (media y máximo), salida más larga, corridas por semana.
   - Ritmo y FC del **bloque principal** en las corridas de Bloques (../datos/bloques.csv).
   - Ritmo "suave" real: ritmo de tramos con FC en Z1–Z2.
   - Carga semanal total incluyendo pádel, y días habituales de pádel.
   - Estado de recuperación actual (FC en reposo, sueño, forma).

## Cómo armar el plan

- Duración: según la fecha objetivo; si no hay fecha, proponé 8–10 semanas.
- Fases: base → construcción → específica → descarga previa al objetivo.
- Progresión de la salida larga desde mi máximo actual hasta 10 km (o 11 km para llegar con margen).
- Volumen semanal: +10 % como máximo por semana, con una semana de descarga cada 3–4 semanas.
- 3 corridas por semana (o las que yo indique): una larga suave, una de calidad (bloques en Z3–Z4
  o series), una suave. La mayor parte del tiempo en Z1–Z2.
- Contemplá el pádel: nada exigente el día siguiente a un partido.
- Ritmos y zonas **derivados de mis datos**, no genéricos. Indicá cada sesión con duración o
  distancia, zona de FC objetivo y ritmo orientativo.
- Incluí criterios para ajustar: qué hacer si la FC en reposo sube, si duermo mal o si
  aparece una molestia (en ese caso, consultar a un profesional).

## Qué entregar

1. `planes/plan-10k.md`: explicación breve de la línea de base y la lógica del plan, tabla semana
   por semana y detalle de cada sesión.
2. `planes/plan-10k.csv` con columnas:
   `fecha,semana,dia,tipo,descripcion,duracion_min,distancia_km,zona_fc,ritmo_objetivo,notas`
   (fechas concretas a partir del próximo lunes). Este CSV se va a usar para comparar lo
   planificado con lo realizado y, más adelante, para cargarlo en el calendario de Intervals.icu.
3. En el chat: un resumen del plan y las primeras dos semanas.

Aclarame siempre que es un plan orientativo generado a partir de mis datos.
