---
description: Compara el plan de entrenamiento con lo realizado y propone ajustes
argument-hint: "[archivo del plan, por defecto planes/plan-10k.csv]"
---

Revisá cómo voy con el plan. Plan: $ARGUMENTS (si está vacío, usá `planes/plan-10k.csv`).

1. Corré `python ../scripts/diario.py` si los datos pueden estar desactualizados.
2. Con Python, cruzá cada sesión planificada hasta ayer con `../datos/actividades.csv` (por fecha
   y categoría; tolerá ±1 día de corrimiento) y `../datos/bloques.csv`:
   - ¿Se hizo? ¿Cuánto duró y qué distancia tuvo vs. lo planificado?
   - ¿La intensidad fue la correcta? (tiempo en la zona objetivo, FC del bloque principal).
3. Calculá el % de cumplimiento del plan (sesiones hechas y volumen) y marcá las sesiones
   saltadas, las hechas de más y las que fueron más intensas de lo previsto.
4. Revisá las señales de alerta de CLAUDE.md.
5. Proponé ajustes para las próximas 2 semanas si hace falta (por ejemplo, repetir una semana,
   bajar volumen o adelantar la progresión si todo va bien) y, si te lo confirmo, actualizá
   `planes/plan-10k.csv` y `planes/plan-10k.md` dejando una nota con la fecha y el motivo del cambio.
6. Guardá la revisión en `informes/<fecha-de-hoy>-revision-plan.md` (con el frontmatter de
   CLAUDE.md, tipo: revision-plan) y mostrame el resumen.
