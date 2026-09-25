# App: tablero de entrenamiento

En esta carpeta se desarrolla **solo el tablero web**. Tu rol es de desarrollador front-end
y de visualización de datos. No des consejos de entrenamiento acá: eso vive en `../coach/`.

## Objetivo

Un tablero de mando interactivo con mis datos de entrenamiento (carrera, pádel y
recuperación), pensado para ver mi progreso y para mostrar en mi portfolio.

## Restricciones técnicas

- **Sitio estático**: HTML, CSS y JavaScript. Sin backend. Si se usa una librería, que se
  cargue desde un CDN o esté incluida en la carpeta; nada que requiera un paso de build
  complejo, salvo que lo acordemos.
- **`app/` es la carpeta que se publica** (Cloudflare Pages, output directory `app`). Todo lo
  que el tablero necesita tiene que estar dentro de `app/`: no puede leer `../datos/` en producción.
- Los datos llegan por **`app/data/*.json`**, generados por `../scripts/generar_datos_app.py`
  a partir de los CSV. Ese script se ejecuta en el workflow diario después de `diario.py`
  (el paso ya está previsto en `.github/workflows/diario.yml`).
- Tiene que funcionar bien en celular y en modo claro y oscuro.
- Desarrollo local: desde la raíz del repo, `python scripts/generar_datos_app.py` y después
  `python -m http.server 8000 --directory app` → http://localhost:8000

## Datos disponibles (en `../datos/`, encoding utf-8-sig)

- **actividades.csv**: una fila por sesión. Campos clave: `fecha`, `categoria` (Carrera,
  Pádel, …), `subtipo` (carrera: Bloques / Series / Libre), `duracion_s`, `distancia_m`,
  `ritmo_min_km` (promedio de toda la sesión), `fc_media`, `fc_max`, `carga_hrss`,
  `z1_s`…`z7_s` (segundos por zona de FC), `cadencia_ppm`, `zancada_m`, `contacto_ms`,
  `oscilacion_cm`, `desnivel_pos_m`, `recuperacion_fc`.
- **bloques.csv**: una fila por tramo de cada sesión (`id_actividad`, `nro_bloque`,
  `duracion_s`, `distancia_m`, `ritmo_min_km`, `fc_media`). En las corridas de "Bloques",
  el bloque principal es el nro 2 y es **la mejor métrica de progreso** (el ritmo promedio
  de la sesión mezcla calentamiento y vuelta a la calma).
- **bienestar.csv**: una fila por día: `fc_reposo`, `sueno_horas`, `sueno_puntaje`, `pasos`,
  `fitness_ctl`, `fatiga_atl`, `forma`.
- Zonas de FC de carrera (límite superior): 139 / 147 / 155 / 164 / 168 / 173 / 182.
- No hay HRV, SpO2 ni peso (la integración Zepp → Intervals no los envía).

## Fase futura (no implementar hasta que lo pida)

- Pestaña "Coach": mostrar el último informe (`../coach/informes/*.md`) y el plan vs. lo
  realizado (`../coach/planes/*.csv`). El generador los copiará a `app/data/`.
