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
- Los datos llegan por **`app/data/datos.js`** (define `window.DATOS_TABLERO`), generado por
  `../scripts/generar_datos_app.py` a partir de los CSV. Ese script se ejecuta en el workflow
  diario después de `diario.py` (el paso ya está previsto en `.github/workflows/diario.yml`).
- **Tiene que funcionar abriendo `index.html` directo, sin servidor** (`file://`): por eso los
  datos van en un `.js` cargado con `<script>` (nada de `fetch`) y el JavaScript usa scripts
  clásicos con el espacio de nombres `window.Tablero` (nada de módulos ES `import`/`export`).
  Los scripts se cargan en orden desde `index.html`.
- Tiene que funcionar bien en celular. **Por ahora hay un solo tema, el claro** (`data-theme="light"`
  fijo en `index.html`, sin botón): es el que se está rediseñando. Los tokens del modo oscuro
  siguen en `estilos.css` para reactivarlo más adelante.
- Desarrollo local: desde la raíz del repo, `python scripts/generar_datos_app.py` y después
  abrir `app/index.html` en el navegador (doble clic).

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
- **Plantillas de Zepp**: el generador reconoce la plantilla de cada sesión comparando sus
  bloques con `../scripts/plantillas.csv` (lógica en `../scripts/plantillas.py`). En
  `datos.js` cada actividad trae `plantilla` (nombre, "Libre" o null), `ajuste_plantilla`
  (exacta / aproximada / incompleta) y `entrenamiento` (tiempo, distancia, ritmo y FC solo
  de los bloques de fase Entrenamiento); cada bloque trae su `fase`. Para medir progreso,
  usar `entrenamiento` y comparar sesiones de la misma plantilla.
- **Minutos** (`app/data/minutos.js`, define `window.MINUTOS_TABLERO`): por actividad, una
  lista por columna donde la posición es el minuto (los que el reloj no grabó van `null`):
  `seg`, `dist`, `ritmo` (s/km), `vel`, `fc`, `fcmax`, `cad`, `pot`, `alt`, `zancada`,
  `contacto`, `osc` y `bloque` (nro del bloque, asignado por el punto medio del minuto).
  En el ritmo cuentan las pausas. El pádel solo trae FC. En el tablero está en
  `ctx.todo.minutos`.
- Potencia de carrera (`potencia_w`) en actividades, bloques, `entrenamiento` y minutos.
- Zonas de FC de carrera (límite superior): 139 / 147 / 155 / 164 / 168 / 173 / 182.
- No hay HRV, SpO2 ni peso (la integración Zepp → Intervals no los envía).

## Fase futura (no implementar hasta que lo pida)

- Pestaña "Coach": mostrar el último informe (`../coach/informes/*.md`) y el plan vs. lo
  realizado (`../coach/planes/*.csv`). El generador los copiará a `app/data/`.

   ## Diseño
   Todo lo visual sigue `DESIGN.md`. Ningún color, tamaño de letra, radio ni sombra fuera de sus tokens.
   Para auditar o rediseñar una vista: `/revisar-diseno <vista>`.