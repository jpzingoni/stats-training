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

**Una sola familia para todo: Montserrat** (`--fuente`). Títulos de página, de tarjetas y de
gráficos, texto, números, ejes y tooltips usan la misma letra. No hay una fuente aparte para
los números: Montserrat trae cifras de ancho fijo y se activan con `tabular-nums`.

- Pesos incluidos: **400** (texto), **500** (controles y ejes), **600** (títulos, etiquetas y
  valores) y **700** (solo título de página y dato protagonista).
- Las fuentes se **incluyen dentro de `app/vendor/fuentes/`** (woff2 + `@font-face`, licencia
  OFL), no se cargan desde Google Fonts. Así funcionan con `file://`, sin conexión y en Cloudflare.
- Respaldo: `system-ui, sans-serif`.
- Montserrat es ancha y de letra alta: por eso la escala es más chica que la de otras familias.

### La variable: un token por rol

Cada rol tiene **un único token** con peso, tamaño e interlineado juntos, y se aplica siempre
con `font: var(--t-…)`. Así no se puede mezclar el tamaño de un rol con el peso de otro.

| Token | `font` (peso tamaño/interlineado) | Espaciado | Mayúsculas | Se usa en |
|---|---|---|---|---|
| `--t-hero` | 700 40px/44px | −0,02em | no | **un** dato protagonista por vista |
| `--t-kpi` | 600 28px/32px | −0,01em | no | valor de cada tarjeta |
| `--t-pagina` | 700 22px/28px | −0,01em | no | título de vista y del mes ("Octubre 2026") |
| `--t-titulo` | 600 16px/22px | 0 | no | título de tarjeta **y de gráfico** |
| `--t-base` | 400 14px/20px | 0 | no | texto, filas de tabla, navegación, unidades |
| `--t-control` | 500 13px/20px | 0 | no | botones, selectores, segmentados |
| `--t-chico` | 400 12px/16px | 0 | no | contexto de tarjetas, subtextos, leyendas, tooltips |
| `--t-eje` | 500 11px/14px | 0 | no | marcas de los ejes de los gráficos |
| `--t-etiqueta` | 600 10px/14px | +0,06em | **sí** | etiqueta de tarjeta, encabezado de tabla, grupo de navegación, nombre de bloque en gráficos |

### Reglas (se respetan siempre)

1. **Ningún `font-size` ni `font-family` suelto.** Todo texto usa uno de los 9 tokens, también
   el que se dibuja en los gráficos: Chart.js y los plugins leen los tokens del CSS
   (`Tablero.graficos.tipografia()`), nada de `11px` escrito en JS.
2. **Números con cifras de ancho fijo** (`font-variant-numeric: tabular-nums`, clase `.num`):
   valores de tarjetas, celdas numéricas, ejes y tooltips.
3. **Máximo 3 roles por tarjeta** (por ejemplo, título + valor + chico).
4. **Mayúsculas solo en `--t-etiqueta`.**
5. **Peso 700 solo en `--t-pagina` y `--t-hero`.** El único énfasis permitido fuera del token
   es `font-weight: 600` sobre `--t-base` o `--t-chico` (por ejemplo, la columna protagonista
   de una tabla o el nombre de un deporte en una lista).
6. `/revisar-diseno` marca como error cualquier tamaño, peso o familia fuera de estos tokens.

### Formato de números (ya resuelto en `formato.js`, mantenerlo)
Miles con punto (130.588), decimales con coma (6,69), ritmo m:ss (6:38). La unidad va
pegada al número, en `--t-base` y `--texto-sec` (en tablas, la unidad va en el encabezado,
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
| Zonas de FC Z1–Z7 | `--zona-1` … `--zona-7` | Escala propia: gris (Z1) → celeste → verde → naranja → rojo (Z5); Z6 y Z7 oscurecen el rojo. Igual en claro y oscuro. No usar la rampa azul para zonas. |
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
- Formato: `▲ 1.530 vs. sep` / `▼ 28 min vs. sep`, en `--t-chico`.
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
Selects, desplegables (`.desplegable`), segmentados (`.segmentado`, `.filtro`) y botones del
calendario comparten:

- Alto 32px, `--radio-chico`, `1px solid var(--borde)`, fondo `--superficie`, `--t-control`.
- Activo (`aria-pressed="true"`): fondo `--tinta`, texto `--fondo`.
- **No hay `<select>` nativo sin estilo.** "Etapa" en Carrera pasa a `.desplegable` o se
  le aplica `appearance: none` con la misma flecha `▾`.
- El segmentado es un grupo unido (botones pegados, un solo borde exterior), no píldoras sueltas.

### Encabezado de vista
`--t-pagina` para el título. Debajo, en `--t-chico` `--texto-sec`, el contexto que hoy se
repite en cada KPI ("8 sesiones · toda la sesión · 26 ago – 29 sep").

### KPI
```
ETIQUETA                       (--t-etiqueta, --texto-sec)
8:24 /km                       (--t-kpi, cifras tabulares) (unidad --t-base --texto-sec)
▲ 0:12 vs. anteriores · última 7:13   (--t-chico; flecha en --bien/--mal)
```
- Como máximo una línea de contexto. Lo que es igual para todos los KPI va en el encabezado
  de la vista.
- En "Este mes", el primer KPI puede ir en `--t-hero` como dato protagonista.
- **En celular** (KPI en 2 × 2), el valor no se parte: si no entra, la unidad baja a la línea
  siguiente. Las duraciones largas se escriben compactas (`7:16` con unidad `h`, no
  `7 h 16 min`).

### Tabla
- Encabezados en `--t-etiqueta`, con la unidad en el encabezado ("RITMO /km", "FC lpm").
- Celdas numéricas con cifras de ancho fijo (`.num`), alineadas a la derecha.
- Filas de 40px, separador `--grilla`, hover `--seleccion`.
- Máximo 8 columnas visibles en escritorio. Lo demás va al diálogo de detalle. Prioridad
  en Carrera: fecha · plantilla · km · tiempo · ritmo entrenamiento · FC media · carga.
- La columna "protagonista" (ritmo de entrenamiento) va en peso 600.
- "(aproximada)" como marca chica `--t-etiqueta` `--texto-muted`, no como texto entre paréntesis.

### Gráficos (Chart.js)
- Leyenda: no hay leyenda si hay una sola serie. Si hay varias, mejor etiqueta directa al
  final de la línea. Si no entra, va la leyenda arriba a la izquierda, en `--t-chico`.
- Ejes en `--t-eje`; tooltips en `--t-chico`; nombres de bloque dibujados en el gráfico en
  `--t-etiqueta`.
- Cuadrícula: solo horizontal, `--grilla`, máximo 4 o 5 líneas. Eje X sin cuadrícula.
- Unidades: van en el título del eje o en el título del gráfico, no en cada marca
  (marcas "6:40", no "6:40 /km").
- Líneas de 2px, sin puntos visibles (aparecen al pasar el mouse).
- Promedios y referencias: línea punteada `--texto-muted` 1px con etiqueta directa
  ("prom. 11.872").
- **Bloques de plantilla**: bandas de fondo alternadas (`--superficie` / `--superficie-2`)
  en lugar de líneas punteadas, con el nombre arriba en `--t-etiqueta`. El bloque de
  Entrenamiento puede llevar un fondo apenas más marcado.
- Barras: máximo 36px de ancho y radio superior de 2px. El valor de "hoy" o del período
  actual va en el color pleno y el resto al 60%.
- Textos explicativos: en un ícono ⓘ con tooltip o en un `<details>`, no en un párrafo fijo
  dentro de la tarjeta.
- Todo texto dibujado en canvas lee tamaño y fuente de los tokens (nada de `11px` fijo en JS).

### Calendario (mini y mensual)
- Días futuros: solo el número en `--texto-muted`, sin borde.
- Días pasados sin actividad: celda `--rampa-vacio`, sin borde.
- Días con actividad (calendario chico): **un solo color**, el naranja de las métricas
  diarias al 45 % sobre `--superficie`, sin importar la carga del día; puntos por deporte
  (colores de deporte).
- Hoy: anillo de 2px `--tinta`.
- No se usa más el borde azul de "activo".
- El número del día va en `--texto` (600) sobre el color. Los puntos de deporte llevan un
  anillo de 1,5px `--superficie` para leerse sobre cualquier fondo.
- La carga por día queda solo en el calendario de carga del Resumen.
- La explicación de los puntos es una leyenda chica con los deportes del mes (punto + nombre),
  no un texto.

### Navegación lateral
- Grupos ("ENTRENAMIENTOS") en `--t-etiqueta` `--texto-muted`.
- Íconos SVG de trazo 1,75px y 18px, siempre `currentColor`. No se usan emojis.
- Marca del sitio: título en `--t-titulo`; "actualizado…" en `--t-chico` `--texto-muted`.
- Ítems de navegación en `--t-base`.

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

## 6. Tokens (además de los colores de `estilos.css`)

```css
:root {
  --fuente: "Montserrat", system-ui, sans-serif;

  /* Tipografía: un token por rol (font: peso tamaño/interlineado familia) */
  --t-hero:     700 40px/44px var(--fuente);
  --t-kpi:      600 28px/32px var(--fuente);
  --t-pagina:   700 22px/28px var(--fuente);
  --t-titulo:   600 16px/22px var(--fuente);
  --t-base:     400 14px/20px var(--fuente);
  --t-control:  500 13px/20px var(--fuente);
  --t-chico:    400 12px/16px var(--fuente);
  --t-eje:      500 11px/14px var(--fuente);
  --t-etiqueta: 600 10px/14px var(--fuente);   /* + uppercase, letter-spacing .06em */

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
