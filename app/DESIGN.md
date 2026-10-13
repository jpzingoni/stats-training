# DESIGN.md: guía visual del tablero

Este archivo es la fuente de verdad del aspecto del tablero. Todo lo que se agregue o se
cambie en `css/` y en los gráficos de `js/` tiene que seguirlo. Si algo no está contemplado,
se agrega acá primero y después se implementa.

## Dirección

**"Instrumento de entrenamiento"**: sobrio, preciso, legible de un vistazo. Pensalo como la
planilla de un buen entrenador, no como una app de marketing.

Hay tres ideas que ordenan todo:

1. **La interfaz es neutra y los datos tienen color.** Botones, navegación, selección y foco
   usan tinta (`--tinta`), no colores de la paleta. Así, cuando algo tiene color, significa algo:
   un deporte, una zona, una sesión o una variación buena o mala.
2. **Los números mandan.** Cada pantalla tiene un dato protagonista y el resto lo acompaña.
   Los números usan una fuente condensada con cifras tabulares.
3. **Pocas decisiones, siempre las mismas.** La escala de tamaños es de 7 valores, los radios
   son 2, hay un solo estilo de control y un solo estilo de tarjeta.

---

## 1. Tipografía

| Rol | Fuente | Pesos |
|---|---|---|
| Interfaz (`--fuente`) | **Barlow** | 400, 500, 600 |
| Números (`--fuente-num`) | **Barlow Semi Condensed** | 500, 600 |

- Las fuentes se **incluyen dentro de `app/vendor/fuentes/`** (woff2 + `@font-face`), no se
  cargan desde Google Fonts. Así funcionan con `file://`, sin conexión y en Cloudflare.
- Respaldo: `system-ui, sans-serif`.
- `.num` y todo valor numérico (KPI, celdas numéricas de tabla, ejes de gráficos) llevan
  `font-family: var(--fuente-num)` y `font-variant-numeric: tabular-nums`.
- En Chart.js: `Chart.defaults.font.family` = `--fuente-num` (los ejes son casi todo números).

### Escala (no se usan otros tamaños)

| Token | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| `--tx-etiqueta` | 11px / 16px, MAYÚSCULAS, `letter-spacing: .06em` | 600 | etiqueta de KPI, encabezado de tabla, grupo de navegación, nombre de bloque en gráficos |
| `--tx-chico` | 13px / 18px | 400 | subtextos, contexto de KPI, ejes, leyendas, tooltips |
| `--tx-base` | 15px / 22px | 400 | cuerpo, filas de tabla, navegación, controles |
| `--tx-titulo` | 17px / 24px | 600 | título de tarjeta |
| `--tx-pagina` | 24px / 30px | 600 | título de vista ("Carrera", "Octubre 2026") |
| `--tx-kpi` | 30px / 34px | 600 · num | valor de KPI |
| `--tx-hero` | 44px / 48px | 600 · num | **un** dato protagonista por vista |

Equivalencias para migrar `estilos.css` (hoy tiene 17 tamaños distintos):

| Hoy | Pasa a |
|---|---|
| 0.7 · 0.72 · 0.74 · 0.75rem | `--tx-etiqueta` si es etiqueta; si no, `--tx-chico` |
| 0.76 · 0.78 · 0.8 · 0.82 · 0.85rem | `--tx-chico` |
| 0.9 · 1rem · 15px | `--tx-base` |
| 1.05 · 1.15 · 1.2rem | `--tx-titulo` |
| 1.35rem | `--tx-pagina` |
| 1.4 · 1.7rem | `--tx-kpi` |
| 10px · 11px en canvas (carrera.js, padel.js) | `--tx-etiqueta` o `--tx-chico`, leído del CSS |

### Formato de números (ya resuelto en `formato.js`, mantenerlo)
Miles con punto (130.588), decimales con coma (6,69), ritmo m:ss (6:38). La unidad va
pegada al número, en `--tx-base` y `--texto-sec` (en tablas, la unidad va en el encabezado,
no en cada celda).

---

## 2. Color

Se **conserva la paleta actual** de `estilos.css` (las series y la rampa están validadas para
daltonismo y tienen versión oscura). Lo que cambia es **qué se pinta con qué**.

### Interfaz: tinta, sin acento de color

| Token nuevo | Claro | Oscuro | Uso |
|---|---|---|---|
| `--tinta` | `#0b0b0b` (= `--texto`) | `#ffffff` | botón/segmento activo, foco, día de hoy |
| `--seleccion` | `rgba(11,11,11,.06)` | `rgba(255,255,255,.08)` | ítem de navegación activo, fila seleccionada, hover |

- Se elimina `--acento` como color de interfaz (hoy es el mismo azul que Carrera, y eso hace
  que en el calendario de "Este mes" los días activos parezcan carreras aunque sean caminatas).
- Ítem de navegación activo: fondo `--seleccion`, texto `--texto`, peso 600 y una barra de 2px
  `--tinta` a la izquierda.
- Foco visible: `outline: 2px solid var(--tinta); outline-offset: 2px`.

### Datos

| Qué | Color | Regla |
|---|---|---|
| Deporte | Carrera `--serie-1` · Pádel `--serie-2` · Caminata `--serie-3` · Ciclismo `--serie-4` · Otras `--serie-otras` | Fijo en todo el sitio (ya está en `graficos.js`, no duplicarlo). |
| Zonas de FC Z1–Z7 | `--rampa-1` … `--rampa-7` | Ordinal: más oscuro = más intenso. |
| Carga diaria (calendario) | `--rampa-1` … `--rampa-5` según HRSS | Mapa de calor. Sin actividad: `--rampa-vacio`. |
| **Sesiones comparadas** | ver abajo | |
| Variación buena / mala | `--bien` / `--mal` | Ver "Variaciones". |

**Sesiones comparadas (Carrera):** hoy cada sesión toma `--serie-1…8` por orden. Eso no
codifica nada y repite los colores de los deportes. Se reemplaza por **orden temporal**:

- La sesión más reciente va en `--tinta`, línea de 2,5px.
- Las anteriores van en la rampa, de más clara (más vieja) a más oscura (más nueva), línea
  de 1,5px.
- El cuadradito de la lista de sesiones y el punto de la tabla usan ese mismo color.
- Resultado: de un vistazo se ve si las curvas "suben" con el tiempo, que es la pregunta del
  tablero.

### Variaciones

| Token | Claro | Oscuro |
|---|---|---|
| `--bien` | `#1f8a4c` | `#3fb871` |
| `--mal` | `#d03b3b` | `#e66767` |

- El color depende de si el cambio es **bueno o malo para el atleta**, no de si sube o baja.
  FC en reposo +4,4 → `--mal`. Pasos +1.530 → `--bien`. Ritmo 6:38 → 6:30 → `--bien`.
- Cada métrica declara su sentido en un solo lugar (`formato.js`): `mejorSi: "sube" | "baja" | null`.
  Con `null` (por ejemplo, la distancia de una sesión) la variación va en `--texto-sec`.
- Formato: `▲ 1.530 vs. sep` / `▼ 28 min vs. sep`, en `--tx-chico`.
- `.aviso-error` usa `--mal` (hoy tiene `#d03b3b` escrito a mano).

---

## 3. Espaciado, bordes y superficies

- Escala de espaciado (múltiplos de 4): `--e1 4px` · `--e2 8px` · `--e3 12px` · `--e4 16px` ·
  `--e5 24px` · `--e6 32px`.
- Separación entre tarjetas: `--e4`. Padding de tarjeta: `--e5` en escritorio y `--e4` en celular.
  **Excepción: "Este mes"** usa `--e4` también en escritorio, porque la portada tiene que
  entrar entera en una pantalla de ~620px de alto (sin scroll).
- Radios: **`--radio` 10px** (tarjetas, diálogo) y **`--radio-chico` 6px** (controles, celdas,
  chips, tooltips). `50%` solo en puntos. Desaparecen 2, 3, 4, 8, 12 y 999px.
- Bordes: `1px solid var(--borde)` en tarjetas y `--grilla` en separadores internos.
- **Sombras solo en lo que flota** (tooltip, menú desplegable, diálogo, barra lateral en
  celular), con un solo token `--sombra-flotante`. Las tarjetas no llevan sombra.
- **Velo**: el fondo oscurecido detrás del diálogo y de la barra lateral en celular usa
  `--velo` (no un `rgba` escrito a mano).

---

## 4. Componentes

### Controles: un solo estilo
Selects, desplegables (`.desplegable`), segmentados (`.segmentado`, `.filtro`), botones de
calendario y botón de tema comparten:

- Alto 32px, `--radio-chico`, `1px solid var(--borde)`, fondo `--superficie`, `--tx-base`.
- Activo (`aria-pressed="true"`): fondo `--tinta`, texto `--fondo`.
- **No hay `<select>` nativo sin estilo.** "Etapa" en Carrera pasa a `.desplegable` o se
  le aplica `appearance: none` con la misma flecha `▾`.
- El segmentado es un grupo unido (botones pegados, un solo borde exterior), no píldoras sueltas.

### Encabezado de vista
`--tx-pagina` para el título. Debajo, en `--tx-chico` `--texto-sec`, el contexto que hoy se
repite en cada KPI ("8 sesiones · toda la sesión · 26 ago – 29 sep").

### KPI
```
ETIQUETA                       (--tx-etiqueta, --texto-sec)
8:24 /km                       (--tx-kpi num) (unidad --tx-base --texto-sec)
▲ 0:12 vs. anteriores · última 7:13   (--tx-chico; flecha en --bien/--mal)
```
- Como máximo una línea de contexto. Lo que es igual para todos los KPI va en el encabezado
  de la vista.
- En "Este mes", el primer KPI puede ir en `--tx-hero` como dato protagonista.
- **En celular** (KPI en 2 × 2), el valor no se parte: si no entra, la unidad baja a la línea
  siguiente. Las duraciones largas se escriben compactas (`7:16` con unidad `h`, no
  `7 h 16 min`).

### Tabla
- Encabezados en `--tx-etiqueta`, con la unidad en el encabezado ("RITMO /km", "FC lpm").
- Celdas numéricas en `--fuente-num`, alineadas a la derecha.
- Filas de 40px, separador `--grilla`, hover `--seleccion`.
- Máximo 8 columnas visibles en escritorio. Lo demás va al diálogo de detalle. Prioridad
  en Carrera: fecha · plantilla · km · tiempo · ritmo entrenamiento · FC media · carga.
- La columna "protagonista" (ritmo de entrenamiento) va en peso 600.
- "(aproximada)" como marca chica `--tx-etiqueta` `--texto-muted`, no como texto entre paréntesis.

### Gráficos (Chart.js)
- Leyenda: no hay leyenda si hay una sola serie. Si hay varias, mejor etiqueta directa al
  final de la línea. Si no entra, va la leyenda arriba a la izquierda, en `--tx-chico`.
- Cuadrícula: solo horizontal, `--grilla`, máximo 4 o 5 líneas. Eje X sin cuadrícula.
- Unidades: van en el título del eje o en el título del gráfico, no en cada marca
  (marcas "6:40", no "6:40 /km").
- Líneas de 2px, sin puntos visibles (aparecen al pasar el mouse).
- Promedios y referencias: línea punteada `--texto-muted` 1px con etiqueta directa
  ("prom. 11.872").
- **Bloques de plantilla**: bandas de fondo alternadas (`--superficie` / `--superficie-2`)
  en lugar de líneas punteadas, con el nombre arriba en `--tx-etiqueta`. El bloque de
  Entrenamiento puede llevar un fondo apenas más marcado.
- Barras: máximo 36px de ancho y radio superior de 2px. El valor de "hoy" o del período
  actual va en el color pleno y el resto al 60%.
- Textos explicativos: en un ícono ⓘ con tooltip o en un `<details>`, no en un párrafo fijo
  dentro de la tarjeta.
- Todo texto dibujado en canvas lee tamaño y fuente de los tokens (nada de `11px` fijo en JS).

### Calendario (mini y mensual)
- Días futuros: solo el número en `--texto-muted`, sin borde.
- Días pasados sin actividad: celda `--rampa-vacio`, sin borde.
- Días con actividad: fondo según la carga del día (rampa) y puntos por deporte (colores de
  deporte).
- Hoy: anillo de 2px `--tinta`.
- No se usa más el borde azul de "activo".
- **Niveles de carga**: los mismos cortes que el calendario del Resumen (1 / 30 / 60 / 90 /
  120 HRSS → `--rampa-1` … `--rampa-5`).
- **Legibilidad sobre la rampa** (la rampa es azul, como Carrera): el número del día va en
  `--texto` en los niveles 1–2 y en `--fondo` en los niveles 3–5 (funciona en claro y en
  oscuro, porque en oscuro la rampa se aclara al subir). Los puntos de deporte llevan un
  anillo de 1,5px `--superficie` para leerse sobre cualquier fondo.
- La explicación de los puntos es una leyenda chica con los deportes del mes (punto + nombre),
  no un texto.

### Navegación lateral
- Grupos ("ENTRENAMIENTOS") en `--tx-etiqueta` `--texto-muted`.
- Íconos SVG de trazo 1,75px y 18px, siempre `currentColor`. No se usan emojis.
- Marca del sitio: título en `--tx-titulo`; "actualizado…" en `--tx-chico` `--texto-muted`.

---

## 5. Prohibido

- Colores escritos a mano fuera de los tokens (en CSS o en JS).
- Tamaños de fuente fuera de la escala, radios fuera de los dos tokens.
- Usar un color de deporte o de serie para estados de interfaz.
- Degradados, glassmorphism, sombras en tarjetas, emojis como íconos.
- Leyendas con una sola serie, unidades repetidas en cada marca del eje.
- Párrafos explicativos fijos dentro de las tarjetas.
- Píldoras (`border-radius: 999px`) y `<select>` nativos sin estilo.

---

## 6. Tokens nuevos (se agregan a los existentes de `estilos.css`)

```css
:root {
  --fuente: "Barlow", system-ui, sans-serif;
  --fuente-num: "Barlow Semi Condensed", "Barlow", system-ui, sans-serif;

  --tx-etiqueta: 11px; --tx-chico: 13px; --tx-base: 15px; --tx-titulo: 17px;
  --tx-pagina: 24px;   --tx-kpi: 30px;   --tx-hero: 44px;

  --e1: 4px; --e2: 8px; --e3: 12px; --e4: 16px; --e5: 24px; --e6: 32px;
  --radio: 10px; --radio-chico: 6px;
  --alto-control: 32px;

  --tinta: #0b0b0b;
  --seleccion: rgba(11, 11, 11, 0.06);
  --bien: #1f8a4c; --mal: #d03b3b;
  --sombra-flotante: 0 6px 20px rgba(0, 0, 0, 0.15);
  --velo: rgba(0, 0, 0, 0.45);
}
/* En los dos bloques de modo oscuro (media query y [data-theme="dark"]): */
  --tinta: #ffffff;
  --seleccion: rgba(255, 255, 255, 0.08);
  --bien: #3fb871; --mal: #e66767;
  --sombra-flotante: 0 6px 20px rgba(0, 0, 0, 0.5);
  --velo: rgba(0, 0, 0, 0.6);
```

`--acento` se mantiene temporalmente como alias de `--tinta` hasta terminar la migración,
y después se borra.
