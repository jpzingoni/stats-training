# DESIGN.md: guía visual del tablero (v2 · "Sistema")

Este archivo es la fuente de verdad del aspecto del tablero. Todo lo que se agregue o se
cambie en `css/` y en los gráficos de `js/` tiene que seguirlo. Si algo no está contemplado,
se agrega acá primero y después se implementa.

## Dirección

**"Instrumento de entrenamiento", armado como un sistema.** Sobrio, preciso, legible de un
vistazo, y sobre todo **homogéneo**: quien aprende a leer una vista ya sabe leer todas.

La v1 definió buenos componentes, pero dejó libres la estructura de cada vista, el color de lo
que no es un deporte, los altos y las alturas de los gráficos. Ahí aparecieron las diferencias:
cada vista resolvía lo mismo a su manera. La v2 cierra esas decisiones.

Cuatro ideas ordenan todo:

1. **La interfaz es neutra y los datos tienen color.** Botones, navegación, selección y foco
   van en tinta. Cuando algo tiene color, significa algo, y **cada color significa una sola
   cosa** en todo el sitio (ver §2).
2. **Los números mandan.** Cada vista tiene un dato que responde su pregunta, y ese dato está
   arriba. Los números usan una fuente condensada con cifras tabulares.
3. **Una plantilla de vista.** Todas las vistas de detalle tienen las mismas partes, en el mismo
   orden y con las mismas medidas (§4).
4. **Un componente por función.** Hay una tarjeta, un KPI, una tabla, un control, una leyenda y
   una nota. No hay variantes "para esta vista".

---

## 1. Tipografía

| Rol | Fuente | Pesos |
|---|---|---|
| Interfaz (`--fuente`) | **Barlow** | 400, 600 |
| Números (`--fuente-num`) | **Barlow Semi Condensed** | 500, 600 |

- Las fuentes están **incluidas en `app/vendor/fuentes/`** (woff2 + `@font-face`). Respaldo
  `system-ui, sans-serif`. El archivo `barlow-500.woff2` queda sin uso y se puede borrar.
- Todo valor numérico (KPI, celdas numéricas, ejes, tooltips, sparklines) lleva
  `font-family: var(--fuente-num)` y `font-variant-numeric: tabular-nums`.
- Barlow Semi Condensed no tiene 400: **los números van en 500** (normal) o **600** (énfasis).
  Nunca se pide 400 en un número, porque el navegador lo dibuja en 500 igual y se pierde la
  diferencia con el énfasis.

### Escala (no existe otro tamaño)

| Token | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| `--tx-etiqueta` | 11px / 16px, MAYÚSCULAS, `letter-spacing: .06em` | 600 | etiqueta de KPI, encabezado de tabla, grupo de navegación, nombre de bloque en gráficos |
| `--tx-chico` | 13px / 18px | 400 | subtítulo de tarjeta, contexto de KPI, **celdas de tabla**, ejes, leyendas, tooltips, notas |
| `--tx-base` | 15px / 22px | 400 | cuerpo, navegación, controles, listas |
| `--tx-titulo` | 17px / 24px | 600 | título de tarjeta **y título de la barra superior** |
| `--tx-pagina` | 24px / 30px | 600 | encabezado de período (el mes en "Este mes" y en Calendario) |
| `--tx-kpi` | 30px / 34px | 600 · num | valor de KPI |
| `--tx-hero` | 44px / 48px | 600 · num | **un** dato protagonista, solo en "Este mes" |

**Asignación cerrada** (lo que no está en esta lista usa `--tx-base`):

| Elemento | Token |
|---|---|
| Título de la barra superior (`.titulo-vista`) | `--tx-titulo` |
| Título de tarjeta (`h2`) | `--tx-titulo` |
| Subtítulo de tarjeta | `--tx-chico` `--texto-sec` |
| Sub-encabezado dentro de una tarjeta (`h3`, panel de small multiple) | `--tx-etiqueta` `--texto-sec` |
| Encabezado de tabla | `--tx-etiqueta` `--texto-sec` |
| Celda de tabla | `--tx-chico` (texto `--fuente`, números `--fuente-num` 500) |
| Celda protagonista | `--tx-chico` `--fuente-num` 600 `--texto` |
| Ejes, leyendas, tooltips, etiquetas directas | `--tx-chico` |
| Nombre de bloque / fase en gráficos | `--tx-etiqueta` |
| Notas (`<details>`), avisos, estados vacíos | `--tx-chico` |
| Marcas ("aproximada", "en uso") | `--tx-etiqueta` `--texto-muted`, sin borde |

### Formato de números y fechas (en `formato.js`, un solo lugar)
- Miles con punto (130.588), decimales con coma (6,69), ritmo m:ss (6:38), duraciones
  `52 min` / `1 h 03 min`; en KPI, las duraciones largas compactas (`7:16` con unidad `h`).
- **Fechas:** en tablas, listas, tooltips y selectores, siempre `sáb 4 oct`. En ejes de
  gráficos, `4 oct` (sin día de la semana). No existe `04/10`.
- **Unidades:** en KPI, pegada al valor en `--tx-base` `--texto-sec`. En tablas, en el
  encabezado ("RITMO /KM"). En gráficos, en el subtítulo de la tarjeta. **Nunca** en cada
  celda ni en cada marca de eje. Única excepción: las **duraciones** (`52 min`, `1 h 03 min`),
  porque su formato ya es la unidad.

---

## 2. Color

### Regla general: cada color, una sola cosa

| Rol | Colores | Se usa para | Nunca para |
|---|---|---|---|
| **Interfaz** | `--tinta`, `--seleccion`, `--borde` | controles activos, navegación, foco, hoy | datos |
| **Deporte** | `--serie-1` Carrera · `--serie-2` Pádel · `--serie-3` Caminata · `--serie-4` Ciclismo · `--serie-otras` | marcas que representan actividades de ese deporte | métricas que no son de un deporte, sesiones, subtipos de otro deporte |
| **Dato general** | `--tinta` | la serie principal de una métrica que no es de un deporte (pasos, sueño, FC en reposo, fitness) | interfaz |
| **Contexto** | `--texto-muted` (secundario), `--eje` (fondo) | series de comparación: anteriores, máximo, valor diario detrás de una media, promedios | lo principal |
| **Intensidad** | `--rampa-1` … `--rampa-7` (**violeta**) | zonas de FC y carga diaria (calendarios): todo lo ordinal | deportes |
| **Valoración** | `--bien`, `--mal` | variaciones buenas o malas para el atleta | nada más |

**Cambio de paleta respecto de v1 (el único):** la rampa pasa de **azul a violeta**. En v1 la
rampa era el mismo azul que Carrera, así que un día de caminata intensa o la zona 4 del pádel
"parecían carrera". El violeta no lo usa ningún deporte. Las series 5 a 8 desaparecen (solo las
usaba la comparación de sesiones, que ahora va en grises).

### Color de la vista
Cada vista de deporte tiene **un solo color de dato**, el de su deporte, más los grises de
contexto, la rampa (zonas) y `--bien`/`--mal`:

| Vista | Color de dato |
|---|---|
| Carrera | `--serie-1` |
| Pádel | `--serie-2` |
| Ciclismo | `--serie-4` (líneas de 2,5px: el amarillo pierde contraste en 2px) |
| Otras actividades | color del deporte de cada fila (Caminata, Otras) |
| Este mes, Resumen, Calendario | colores de deporte para actividades; `--tinta` para todo lo demás |
| Recuperación | `--tinta` (no hay deporte) |

Dentro de una vista de deporte, **las variantes del mismo deporte son tonos de su color**:
relleno al 100 % (Bloques), 55 % (Series) y 15 % (Libre) con `conAlfa`, **siempre con contorno
de 1,5px en el color pleno** (sin contorno, el 15 % desaparece en modo oscuro). En la
dispersión, además, cambia la forma del punto: círculo, triángulo, cuadrado.

### Comparar cosas del mismo tipo (sesiones, partidos, períodos)

| Qué | Color | Grosor |
|---|---|---|
| La más reciente (o la elegida) | color de la vista (o `--tinta` si la vista no tiene deporte) | 2,5px |
| La inmediatamente anterior | `--texto-muted` | 1,5px |
| Todas las demás | `--eje` | 1,5px |

- El punto de la tabla, el cuadradito de la lista y la etiqueta directa usan el mismo color.
- De un vistazo se lee "¿la última está arriba o abajo del resto?", que es la pregunta.

### Valoraciones

| Token | Claro | Oscuro |
|---|---|---|
| `--bien` | `#1f8a4c` | `#3fb871` |
| `--mal` | `#d03b3b` | `#e66767` |

- El color depende de si el cambio es **bueno o malo para el atleta** (`mejorSi: "sube" |
  "baja" | null` en `formato.js`). Con `null`, la variación va en `--texto-sec`.
- Formato: `▲ 1.530 vs. sep` / `▼ 0:12 vs. anteriores`, en `--tx-chico`.
- **Solo se compara contra una base completa:** si el período anterior tiene datos en menos
  del 75 % de sus días, o hay menos de 3 sesiones, no hay flecha. En su lugar va "sin base para
  comparar" en `--texto-muted`.

### Rampa de intensidad (violeta)

| Nivel | Claro | Oscuro | Número encima |
|---|---|---|---|
| vacío | `#f0efec` | `#252524` | `--texto-sec` |
| 1 | `#d4cef3` | `#2e2470` | `--texto` |
| 2 | `#b9b0ec` | `#3f3296` | `--texto` |
| 3 | `#9586df` | `#5646b8` | `--texto` |
| 4 | `#7462cc` | `#8070d8` | `--fondo` |
| 5 | `#5a45b5` | `#9586df` | `--fondo` |
| 6 | `#46329a` | `#b9b0ec` | `--fondo` |
| 7 | `#2e2070` | `#dcd8f5` | `--fondo` |

Contraste del número sobre la celda ≥ 4,5:1 en los 7 niveles y en los dos modos (en oscuro,
la rampa se aclara al subir, así que la regla "1–3 `--texto`, 4–7 `--fondo`" sirve en ambos).

---

## 3. Espaciado, medidas y superficies

- **Espaciado** (múltiplos de 4): `--e1 4` · `--e2 8` · `--e3 12` · `--e4 16` · `--e5 24` · `--e6 32` (px).
- **Un solo padding de tarjeta: `--e4`** (escritorio y celular, en todas las vistas). Desaparece
  la excepción de "Este mes".
- **Separaciones:** entre tarjetas `--e4`; entre el título y el cuerpo de una tarjeta `--e3`;
  entre secciones de la plantilla de vista `--e4`. Márgenes de `main`: `--e4` a los lados.
- **Radios:** `--radio` 10px (tarjetas, diálogo, menús), `--radio-chico` 6px (controles, celdas
  del mini calendario, tooltip, marcas) y **`--radio-celda` 3px solo para las celdas de 18px del
  calendario de carga** (un radio de 6px en una celda de 18px la vuelve un círculo). `50%` solo
  en puntos.
- **Bordes:** `1px solid var(--borde)` en tarjetas y controles; `--grilla` en separadores internos.
- **Sombras solo en lo que flota** (`--sombra-flotante`): tooltip, menú, diálogo, barra lateral en
  el celular. Velo: `--velo`.
- **Alturas de gráfico (tokens, no números sueltos):**

| Token | Escritorio | Celular (≤ 800px) | Uso |
|---|---|---|---|
| `--alto-principal` | 320px | 240px | gráfico principal de la vista |
| `--alto-grafico` | 240px | 200px | gráficos secundarios |
| `--alto-panel` | 120px | 100px | small multiples (dinámica, forma) |
| `--alto-sparkline` | 24px | 24px | sparkline de KPI |

- **Ninguna altura depende de la ventana** (`vh`), salvo la portada "Este mes" (§4). Las
  tarjetas miden lo que mide su contenido.
- **Ancho de lectura:** `main` hasta 1400px. Los gráficos de tendencia son apaisados (al menos
  3:1 en escritorio) para no exagerar pendientes.

---

## 4. Plantilla de vista

### Vistas de detalle (Carrera, Pádel, Ciclismo, Otras, Recuperación, Resumen)
Siempre las mismas cinco partes, en este orden:

```
┌ BARRA SUPERIOR ─────────────────────────────────────────────────────────┐
│ Título (--tx-titulo)   [controles de la vista]            [rango fechas]│
└─────────────────────────────────────────────────────────────────────────┘
  Contexto: una línea --tx-chico --texto-sec ("3 sesiones de 25 MIN CO · 26 ago – 8 sep")
┌ KPI ┐┌ KPI ┐┌ KPI ┐┌ KPI ┐        ← 1. fila de 4 KPI (2 × 2 en celular)
┌ TARJETA PRINCIPAL (ancha) ──────┐   ← 2. el gráfico que responde la pregunta de la vista
┌ TABLA DE SESIONES (ancha) ──────┐   ← 3. si la vista tiene sesiones
┌ secundaria ┐┌ secundaria ┐        ← 4. grilla de 2 columnas (1 en celular)
▸ Más análisis                      ← 5. opcional: <details> con lo exploratorio
```

| Vista | Pregunta | KPI | Principal | Tabla |
|---|---|---|---|---|
| Carrera | ¿la última sesión de esta plantilla fue mejor? | ritmo, FC y eficiencia del bloque principal, distancia (última vs. anteriores) | curvas superpuestas de la sesión | sesiones de la plantilla |
| Pádel | ¿cómo fue el último partido? | sesiones, tiempo, carga media, FC media | FC minuto a minuto con bandas de zona | partidos |
| Ciclismo | ¿cómo vengo en bici? | salidas, distancia, velocidad, desnivel | km por semana | salidas |
| Otras | ¿cuánto camino? | sesiones, tiempo, distancia, carga | horas por semana | sesiones |
| Recuperación | ¿descanso bien? | FC en reposo, sueño, puntaje, pasos (con sparkline) | FC en reposo | — |
| Resumen | ¿cómo viene la carga? | sesiones, tiempo, km, carga | estado de forma | últimas sesiones |

- **Los controles de la vista van en la barra superior**, no en una fila aparte: el período
  (segmentado) en Resumen y Recuperación; plantilla, sesiones y etapa (desplegables) en Carrera;
  partido en Pádel. En el celular, la barra se parte en dos filas: título arriba y controles abajo,
  con desplazamiento horizontal si no entran (nunca se apilan uno por fila).
- **El contexto común va una vez**, en la línea debajo de la barra. No se repite en cada KPI.

### Excepciones (las únicas)
- **Este mes (portada):** grilla de 2 × 2 que entra en una pantalla de escritorio (≥ 620px de
  alto) sin scroll: mini calendario · KPI (2 × 2, el primero en `--tx-hero`) · actividades del mes ·
  gráfico diario. Es la única vista con alto atado a la ventana. En el celular se apila.
- **Calendario:** encabezado de período (`--tx-pagina`) y la grilla mensual. En el celular, agenda.
- **Datos:** una tarjeta con la tabla cruda.

---

## 5. Componentes

### Tarjeta (una sola)
```
Título (--tx-titulo)                          [control opcional, a la derecha]
Subtítulo: qué se mide y en qué unidad (--tx-chico --texto-sec, UNA línea)
─ --e3 ─
Cuerpo (gráfico de alto tokenizado, tabla o lista)
▸ Cómo se calcula   (opcional: <details class="nota">, cerrado)
```
- Fondo `--superficie`, borde `--borde`, `--radio`, padding `--e4`, sin sombra.
- **El subtítulo es la única explicación visible.** Todo lo demás va en la nota plegada.
- Los textos que hoy están en párrafos (`#carrera-comp-nota`, deriva, dispersión, aviso de
  Recuperación) pasan a la nota o a la línea de contexto de la vista.

### KPI (uno solo)
```
ETIQUETA                                   (--tx-etiqueta --texto-sec)
8:24 /km                                   (--tx-kpi num 600; unidad --tx-base --texto-sec)
▲ 0:12 vs. anteriores                      (--tx-chico; flecha --bien/--mal)
[sparkline opcional]                       (--alto-sparkline)
```
- Padding `--e3 --e4`. Alto natural, igual para los 4 de la fila (la fila es un grid).
- **Una sola línea de contexto**: la variación, o "sin base para comparar". Nada más.
- **Sparkline opcional** (Recuperación y Carrera): línea de 1,5px en `--texto-sec`, sin ejes ni
  puntos, con el primer y el último valor escritos en las puntas en `--tx-chico` num. Va abajo,
  a todo el ancho del KPI.
- En el celular (2 × 2) el valor no se parte: si no entra, la unidad baja de línea.

### Tabla (una sola)
- Encabezados `--tx-etiqueta` con la unidad ("RITMO /KM", "FC LPM"); números alineados a la
  derecha, texto a la izquierda, nada centrado.
- Celdas `--tx-chico`; números en `--fuente-num` 500; **una** columna protagonista en 600.
- Filas de 36px, separador `--grilla`, hover `--seleccion`, encabezado fijo al hacer scroll.
- **Alto natural**, con `max-height: 420px` y scroll si hay más filas.
- **Celular:** solo las columnas marcadas como esenciales (máximo 4: fecha + 3 datos); el resto
  lleva `.solo-escritorio`. La primera columna queda fija a la izquierda.
- Un punto de color al lado de la fecha solo si la fila es de una sesión comparada (§2) o si la
  tabla mezcla deportes.

### Controles (un solo estilo)
Botones, segmentados, desplegables (`.desplegable`) y `<select>`:
- Alto `--alto-control` (32px), `--radio-chico`, `1px solid var(--borde)`, fondo `--superficie`,
  `--tx-base`, padding horizontal `--e3`.
- Activo: fondo `--tinta`, texto `--fondo`.
- `<select>` siempre con `appearance: none` y la flecha `▾` de `.desplegable`.
- Segmentado: grupo unido, **nunca se parte en dos filas** (`flex-wrap: nowrap`; en el celular
  se acortan los textos: "4 sem", "12 sem", "Todo").
- Etiqueta de un control: `--tx-etiqueta` `--texto-muted`, arriba del control o antes en línea.

### Leyenda (una sola)
- **Si hay una serie, no hay leyenda.** Si hay pocas, etiqueta directa al final de la línea.
- Si hace falta leyenda: arriba a la izquierda, punto de 8px + texto `--tx-chico` `--texto-sec`,
  separación `--e3`. Sin cuadraditos de Chart.js, nunca abajo.

### Gráficos (Chart.js), gramática única
Todas las opciones comunes salen de **un solo helper** en `graficos.js`; las vistas solo pasan datos.
- **Cuadrícula** solo horizontal, `--grilla`, 4 o 5 líneas. Eje X sin cuadrícula, línea base `--eje`.
- **Marcas sin unidad.** La unidad va en el subtítulo de la tarjeta. Sin títulos de eje rotados.
- **Líneas** de 2px (principal) o 1,5px (contexto), sin puntos visibles (aparecen al pasar el
  mouse). Puntos de dispersión de 4px. `tension: 0`.
- **Barras:** máximo 36px de ancho, radio superior de 2px. La barra del período actual va en
  color pleno y el resto al 60 %; en barras de una métrica general (pasos), `--tinta` al 100 % y
  al 25 %.
- **Referencias** (promedio, umbral): línea punteada 1px `--texto-muted` con etiqueta directa
  ("prom. 11.872", "5 %").
- **Bandas de fondo** para tramos: bloques de plantilla (`--superficie-2` alternada, nombre
  arriba en `--tx-etiqueta`) y zonas de FC (rampa al 12 % de opacidad).
- **Ritmo:** el eje se invierte siempre (más rápido = arriba) y el subtítulo lo dice.
- **Eje Y de tendencias:** cubre como mínimo ±10 % del promedio de lo mostrado, para no vender
  variaciones chicas como grandes. Puede no empezar en cero (no son barras).
- **Ejes con mínimo y máximo calculados** (tendencias, curvas recortadas al 3–97 %): no se
  rotulan las marcas de los extremos, que quedarían con valores como `6:41` o `0,87`.
- **Margen para textos fuera del área de dibujo:** los nombres de bloque van arriba del área
  (padding superior 20px) y la etiqueta directa a la derecha del último punto (padding derecho
  64px). Nunca se dibujan encima de las líneas.
- **Eje X temporal:** empieza en el primer dato del período, no en el inicio del período vacío.
- **Tooltip:** `--superficie`, borde `--eje`, `--radio-chico`, título (fecha) en `--fuente` 600 y
  valores en `--fuente-num` con unidad.
- Todo texto dibujado en canvas lee tamaño y fuente de los tokens.

### Small multiples
Paneles de `--alto-panel` con el mismo eje X, título de panel en `--tx-etiqueta`. Se usan cuando
hay que mostrar varias métricas de la misma cosa (dinámica de carrera, forma debajo de
fitness/fatiga, ritmo y FC alineados).

### Nota (`<details class="nota">`)
Resumen "Cómo se calcula" en `--tx-chico` `--texto-sec`, con `▸`. Cerrada por defecto. Adentro,
texto `--tx-chico` de ancho máximo 70 caracteres.

### Estado vacío
Texto `--tx-chico` `--texto-muted` centrado en el alto del gráfico. Una frase: qué falta y cómo
resolverlo ("Elegí al menos una sesión").

### Calendario (mini, mensual y de carga)
- Fondo de cada día según la carga (rampa violeta, cortes 1 / 30 / 60 / 90 / 120 HRSS →
  niveles 1–5), **igual en los tres calendarios**. Sin actividad: `--rampa-vacio`.
- Puntos de deporte de 6px con anillo de 1,5px `--superficie`.
- Hoy: anillo de 2px `--tinta`. Días futuros: solo el número en `--texto-muted`.
- Calendario mensual: las semanas sin actividad dicen "Sin actividad"; las futuras no muestran
  resumen.
- Leyenda: los deportes del mes (punto + nombre) y, en el calendario de carga, los niveles.

### Navegación lateral
- Grupos en `--tx-etiqueta` `--texto-muted`. Ítems en `--tx-base`, íconos SVG de 18px con trazo
  de 1,75px y `currentColor`.
- Activo: fondo `--seleccion`, texto `--texto` 600 y barra de 2px `--tinta` a la izquierda.

---

## 6. Prohibido

- Colores escritos a mano fuera de los tokens (en CSS o en JS).
- **Usar un color de deporte para algo que no sea ese deporte** (sesiones, subtipos de otro
  deporte, métricas de salud, series de comparación).
- Tamaños de fuente fuera de la escala (ningún `rem`, `em` ni `px` suelto en `font-size`).
- Radios fuera de los tres tokens. Píldoras (`999px`).
- **Alturas atadas a la ventana (`vh`)** fuera de la portada.
- Párrafos explicativos fijos: una línea de subtítulo y el resto en la nota.
- Unidades en cada marca de eje o en cada celda.
- Leyendas con una sola serie, leyendas abajo, títulos de eje rotados.
- Comparaciones sin base (períodos casi vacíos, menos de 3 sesiones).
- Controles con estilo propio, `<select>` nativos sin estilo, segmentados partidos.
- Degradados, glassmorphism, sombras en tarjetas, emojis como íconos, anillos o gauges.

---

## 7. Tokens

```css
:root {
  --fuente: "Barlow", system-ui, sans-serif;
  --fuente-num: "Barlow Semi Condensed", "Barlow", system-ui, sans-serif;

  --tx-etiqueta: 11px; --tx-chico: 13px; --tx-base: 15px; --tx-titulo: 17px;
  --tx-pagina: 24px;   --tx-kpi: 30px;   --tx-hero: 44px;

  --e1: 4px; --e2: 8px; --e3: 12px; --e4: 16px; --e5: 24px; --e6: 32px;
  --radio: 10px; --radio-chico: 6px; --radio-celda: 3px;
  --alto-control: 32px;
  --alto-principal: 320px; --alto-grafico: 240px; --alto-panel: 120px; --alto-sparkline: 24px;

  /* Superficies y texto (sin cambios respecto de v1) */
  --fondo: #f9f9f7; --superficie: #fcfcfb; --superficie-2: #f0efec;
  --borde: rgba(11, 11, 11, 0.10);
  --texto: #0b0b0b; --texto-sec: #52514e; --texto-muted: #6f6e69;
  --grilla: #e1e0d9; --eje: #c3c2b7;

  /* Interfaz */
  --tinta: #0b0b0b; --seleccion: rgba(11, 11, 11, 0.06);
  --sombra-flotante: 0 6px 20px rgba(0, 0, 0, 0.15); --velo: rgba(0, 0, 0, 0.45);

  /* Deportes (sin cambios) — las series 5 a 8 se eliminan */
  --serie-1: #2a78d6;   /* Carrera */
  --serie-2: #eb6834;   /* Pádel */
  --serie-3: #1baf7a;   /* Caminata */
  --serie-4: #eda100;   /* Ciclismo */
  --serie-otras: #898781;

  /* Valoración */
  --bien: #1f8a4c; --mal: #d03b3b;

  /* Intensidad: rampa violeta (zonas Z1–Z7 y carga diaria) */
  --rampa-vacio: #f0efec;
  --rampa-1: #d4cef3; --rampa-2: #b9b0ec; --rampa-3: #9586df; --rampa-4: #7462cc;
  --rampa-5: #5a45b5; --rampa-6: #46329a; --rampa-7: #2e2070;
}

@media (max-width: 800px) {
  :root { --alto-principal: 240px; --alto-grafico: 200px; --alto-panel: 100px; }
}

/* Oscuro: mismo bloque en @media (prefers-color-scheme: dark) :root:not([data-theme="light"])
   y en :root[data-theme="dark"] */
  --fondo: #0d0d0d; --superficie: #1a1a19; --superficie-2: #252524;
  --borde: rgba(255, 255, 255, 0.10);
  --texto: #ffffff; --texto-sec: #c3c2b7; --texto-muted: #9a9890;
  --grilla: #2c2c2a; --eje: #383835;
  --tinta: #ffffff; --seleccion: rgba(255, 255, 255, 0.08);
  --sombra-flotante: 0 6px 20px rgba(0, 0, 0, 0.5); --velo: rgba(0, 0, 0, 0.6);
  --serie-1: #3987e5; --serie-2: #d95926; --serie-3: #199e70; --serie-4: #c98500;
  --serie-otras: #6f6e69;
  --bien: #3fb871; --mal: #e66767;
  --rampa-vacio: #252524;
  --rampa-1: #2e2470; --rampa-2: #3f3296; --rampa-3: #5646b8; --rampa-4: #8070d8;
  --rampa-5: #9586df; --rampa-6: #b9b0ec; --rampa-7: #dcd8f5;
```

Se eliminan: `--acento` (alias temporal de v1), `--serie-5` … `--serie-8`.
