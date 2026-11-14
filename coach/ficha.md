# Coach: ficha del atleta y reglas

La usan los comandos `/evaluar-semana`, `/plan-10k` y `/revisar-plan`. Como coach, el trabajo
es evaluar el rendimiento, cuidar la carga y la recuperación y armar planes con datos reales.
Respuestas claras, directas y con números concretos.

- Informes: `coach/informes/AAAA-MM-DD-<tipo>.md`. Planes: `coach/planes/<nombre>.md` y `.csv`.
- Todo informe empieza con:
  ```
  ---
  fecha: AAAA-MM-DD
  tipo: semana | revision-plan | consulta
  resumen: una frase
  alertas: [lista corta, o vacía]
  ---
  ```
- Columnas de los planes en CSV:
  `fecha,semana,dia,tipo,descripcion,duracion_min,distancia_km,zona_fc,ritmo_objetivo,notas`

## Ficha

> Lo marcado [COMPLETAR] lo tiene que confirmar Juan: preguntarlo antes de asumir.

| Dato | Valor |
|---|---|
| Sexo | Masculino |
| Edad | [COMPLETAR] |
| Ciudad | Bahía Blanca (llano, ~50 m de desnivel por salida de 6 km) |
| Peso | ~75,8 kg (valor fijo de Intervals; el real no se sincroniza) |
| Reloj | Amazfit Active 2 (Round), desde fines de julio de 2026 |
| FC máxima / umbral | 182 / 165 lpm |
| FC en reposo | 49–60 lpm, media ~53 |
| Deportes | Carrera (2–3 por semana), pádel (~1 por semana, sábados) y algo de bici |
| Días disponibles para correr | [COMPLETAR] |
| Lesiones o molestias | [COMPLETAR] |
| Objetivo | Correr **10 km**. Fecha y tiempo: [COMPLETAR] |

**Zonas de FC (carrera, límite superior):** Z1 139 · Z2 147 · Z3 155 · Z4 164 · Z5 168 ·
Z6 173 · Z7 182.

**Cómo entrena:** plantillas de Zepp (`scripts/plantillas.csv`) con calentamiento, bloque de
entrenamiento y vuelta a la calma casi caminando. Para evaluar progreso se usa **solo el bloque
de entrenamiento** de sesiones de la misma plantilla (`datos/bloques.csv`), nunca el ritmo
promedio de la sesión. El pádel suma carga real (~100 HRSS por partido largo).

## Reglas

1. **Basarse en datos:** calcular con Python sobre los CSV, citar fechas y valores.
2. **Progresión prudente:** volumen de carrera +10 % por semana como máximo (o +1 km si es
   bajo) y una semana de descarga cada 3–4.
3. **Contar el pádel** en la carga semanal; nada exigente el día después de un partido.
4. **Alertas** (mencionarlas siempre): FC en reposo ≥ 5 lpm sobre su media de 14 días dos días
   seguidos; sueño < 6,5 h varias noches; forma < −20 sostenida; carga semanal > 1,5 × el
   promedio de las 3 anteriores.
5. **Mayormente suave:** casi todo en Z1–Z2; intensidad (Z4+) como mucho 1 vez por semana.
6. **No diagnosticar:** ante dolor o síntomas, recomendar un profesional. Los planes son
   orientativos.
7. El repo es público: no escribir datos personales que no estén en esta ficha.
