# Entrenamiento: datos, tablero y coach

Proyecto personal y **público** (portfolio). El reloj Amazfit manda los datos a Intervals.icu;
un workflow diario los guarda en CSV y un tablero web los muestra. Se trabaja siempre desde
esta carpeta (una sola sesión).

| Ruta | Qué es |
|---|---|
| `scripts/` | Python: descarga de la API (`diario.py`, `historico.py`, `intervals_comun.py`), reconocimiento de plantillas (`plantillas.py` + `plantillas.csv`) y generador del tablero (`generar_datos_app.py`) |
| `datos/` | CSV (`actividades`, `bloques`, `minutos`, `bienestar`) y `registro.log`. Los actualiza el workflow |
| `.github/workflows/diario.yml` | Todos los días 03:17 (Argentina): `diario.py` → `generar_datos_app.py` → commit `datos:` |
| `app/` | Tablero estático publicado en Cloudflare Pages. Guía visual: `app/DESIGN.md` |
| `coach/ficha.md` | Ficha del atleta y reglas del coach. Comandos: `/evaluar-semana`, `/plan-10k`, `/revisar-plan` |
| `docs/bitacora.md` | Bitácora del proyecto |

## Reglas generales

- Idioma: español rioplatense.
- **Nunca** commitear credenciales (`config.json`, `.env`, `.dev.vars`) ni mostrar la API key.
  En GitHub Actions: secretos `INTERVALS_ATHLETE_ID` e `INTERVALS_API_KEY`.
- Los CSV de `datos/` y `app/data/` los genera el workflow: no editarlos a mano. Para tenerlos
  al día, `git pull`. Los scripts hacen upsert por clave: nunca duplicar filas.
- El repo está en OneDrive: git necesita `windows.appendAtomically=false` (ya configurado).
- Al cerrar una etapa, sumar una entrada en `docs/bitacora.md` (qué, por qué, problemas).
- Commits en español con prefijo: `datos:`, `app:`, `coach:`, `ci:`, `docs:`.

## Tablero (`app/`)

- Sitio estático (HTML, CSS, JS clásico con el espacio de nombres `window.Tablero`), sin build
  ni backend. Tiene que abrirse con doble clic en `app/index.html` (`file://`): nada de
  `fetch` ni módulos ES. Chart.js y las fuentes (Nunito) están en `app/vendor/`.
- Todo lo que usa el tablero vive dentro de `app/` (es la carpeta que se publica).
- Datos: `app/data/datos.js` (`window.DATOS_TABLERO`) y `app/data/minutos.js`
  (`window.MINUTOS_TABLERO`, una lista por columna; la posición es el minuto, `null` si no
  se grabó). Los cálculos se hacen en Python; el JS solo filtra y dibuja.
- Cada actividad trae `plantilla` (o "Libre"), `ajuste_plantilla` y `entrenamiento` (métricas
  solo de los bloques de fase Entrenamiento). Para medir progreso, comparar el
  `entrenamiento` de sesiones de la misma plantilla: el ritmo promedio de la sesión engaña.
- Un solo tema, el claro. Celular y escritorio.
- Todo lo visual sigue `app/DESIGN.md` (para auditar: `/revisar-diseno <vista>`).
- Si un gráfico empieza a usar una columna nueva, agregarla en `USO_COLUMNAS` del generador.

## Datos (encoding utf-8-sig)

- `actividades.csv`: una fila por sesión (`id`). `categoria`, `subtipo`, duración, distancia,
  ritmo, FC, `carga_hrss`, `z1_s`…`z7_s`, dinámica de carrera, `potencia_w`.
- `bloques.csv`: un tramo por fila (`id_actividad` + `nro_bloque`).
- `minutos.csv`: un minuto por fila (actividad + minuto). No se guarda el GPS.
- `bienestar.csv`: un día por fila: `fc_reposo`, `sueno_horas`, `sueno_puntaje`, `pasos`,
  `fitness_ctl`, `fatiga_atl`, `forma`.
- No hay HRV, SpO2 ni peso (Zepp no los envía). Bienestar desde el 26/08/2026.
