# DESIGN.md: guía visual del tablero (v3 · "Racing")

Este archivo es la fuente de verdad del aspecto del tablero. Todo lo que se agregue o se
cambie en `css/` y en los gráficos de `js/` tiene que seguirlo. Si algo no está contemplado,
se agrega acá primero y después se implementa.

## Dirección

**"Equipo de carreras rumbo a los 10 km".** El tablero tiene la identidad de un equipo de
automovilismo británico: verde racing profundo, un lima vivo que aparece poco y siempre con
intención, y una tipografía ancha que da velocidad. No es una planilla: **cada vez que lo abrís,
te dice cuánto te falta para el objetivo y si la última sesión te acercó.**

Cinco ideas ordenan todo:

1. **El verde es la marca.** La barra lateral, la banda del objetivo y los controles activos son
   verdes. Los neutros tienen un tinte verde. Nunca hay gris puro ni negro puro.
2. **El lima es el objetivo.** El lima significa una sola cosa: **correr y avanzar hacia los
   10 km**. Es el color de Carrera, de la barra de progreso del objetivo y de la última sesión
   comparada. Si algo es lima, es lo que te acerca a la meta.
3. **Los números mandan, y se ven rápidos.** Títulos, KPI y etiquetas usan Archivo expandida;
   el texto y las tablas, Archivo de ancho normal. Siempre con cifras tabulares.
4. **Una plantilla de vista** (de la v2): todas las vistas de detalle tienen las mismas partes,
   en el mismo orden y con las mismas medidas.
5. **Un componente por función** (de la v2): una tarjeta, un KPI, una tabla, un control, una
   leyenda y una nota. Ningún componente tiene variantes "para esta vista".

---

## 1. Tipografía

**Una sola familia: [Archivo](https://fonts.google.com/specimen/Archivo)** (Omnibus-Type, licencia
OFL), variable, con ejes de ancho (`wdth` 62–125) y de peso (`wght` 100–900). Se usan tres anchos y
cuatro pesos.

- **Se incluye dentro de `app/vendor/fuentes/`**: `archivo-variable.woff2` (subconjuntos latin y
  latin-ext) y su `OFL.txt`. Así funciona con `file://`, sin conexión y en Cloudflare.
  ```css
  @font-face {
    font-family: "Archivo"; src: url("../vendor/fuentes/archivo-variable.woff2") format("woff2");
    font-weight: 100 900; font-stretch: 62% 125%; font-display: swap;
  }
  ```
- El ancho se pide con `font-stretch` (tokens `--ancho-*`), nunca con `font-variation-settings`.
- Respaldo: `system-ui, sans-serif`. Se borran todos los archivos de Barlow.
- Todo valor numérico lleva `font-variant-numeric: tabular-nums` (Archivo tiene cifras tabulares
  verdaderas: se probó en `diseno/referencias/v3-tipografias/`).

| Token de ancho | Valor | Uso |
|---|---|---|
| `--ancho-normal` | 100% | texto corrido, tablas, ejes, tooltips, controles |
| `--ancho-medio` | 112% | títulos de tarjeta, valores de KPI |
| `--ancho-expandido` | 125% | título de vista, encabezado de período, dato héroe, etiquetas en mayúsculas |

### Escala (no existe otro tamaño)

| Token | Tamaño / interlineado | Ancho | Peso | Uso |
|---|---|---|---|---|
| `--tx-etiqueta` | 11px / 16px, MAYÚSCULAS, `letter-spacing: .08em` | expandido | 600 | etiqueta de KPI, encabezado de tabla, grupo de navegación, nombre de bloque |
| `--tx-chico` | 13px / 18px | normal | 400 | subtítulo de tarjeta, contexto, celdas, ejes, leyendas, tooltips, notas |
| `--tx-base` | 15px / 22px | normal | 400 | cuerpo, navegación, controles, listas |
| `--tx-titulo` | 17px / 24px | medio | 600 | título de tarjeta |
| `--tx-pagina` | 26px / 32px | expandido | 700 | título de vista y encabezado de período |
| `--tx-kpi` | 30px / 34px | medio | 700 · tnum | valor de KPI |
| `--tx-hero` | 52px / 56px (celular 40px / 44px) | expandido | 800 · tnum | **un** dato héroe por vista (el del objetivo) |

**Asignación cerrada** (lo que no está en esta lista usa `--tx-base`, ancho normal, 400):

| Elemento | Token |
|---|---|
| Título de la vista (barra superior) | `--tx-pagina` |
| Título de tarjeta | `--tx-titulo` |
| Subtítulo de tarjeta | `--tx-chico` `--texto-sec` |
| Sub-encabezado dentro de una tarjeta | `--tx-etiqueta` `--texto-sec` |
| Encabezado de tabla | `--tx-etiqueta` `--texto-sec` |
| Celda de tabla | `--tx-chico`; números en peso 500 |
| Celda protagonista | `--tx-chico` peso 700 `--texto` |
| Ejes, leyendas, tooltips, etiquetas directas | `--tx-chico` |
| Nombre de bloque en gráficos | `--tx-etiqueta` |
| Notas, avisos, estados vacíos | `--tx-chico` |
| Marcas ("aprox.", "en uso") | `--tx-etiqueta` `--texto-muted`, sin borde |

### Formato de números y fechas (en `formato.js`, un solo lugar)
- Miles con punto (130.588), decimales con coma (6,69), ritmo m:ss (6:38), duraciones `52 min` /
  `1 h 03 min`; en KPI, las duraciones largas compactas (`7:16` con unidad `h`).
- Fechas: en tablas, listas, tooltips y selectores `sáb 4 oct`; en ejes `4 oct`. No existe `04/10`.
- Unidades: en KPI, pegada al valor en `--tx-base` ancho normal `--texto-sec`. En tablas, en el
  encabezado. En gráficos, en el subtítulo. Nunca en cada celda ni en cada marca de eje (excepción:
  las duraciones, cuyo formato ya es la unidad).

---

## 2. Color

### Marca

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--marca-profunda` | `#00231F` | `#00231F` | barra lateral (igual en los dos modos: es la firma) |
| `--banda` | `#00231F` | `#00403A` | fondo de la banda del objetivo; en oscuro, más luminosa para destacarse del fondo `#061A17` |
| `--marca` | `#00665E` | `#0E8577` | control activo, foco, enlaces, ítem activo de la navegación en el celular |
| `--marca-suave` | `#E2EEEA` | `rgba(14, 133, 119, 0.18)` | selección, hover, fila elegida |
| `--lima` | `#CEDC00` | `#CEDC00` | **solo** sobre `--marca-profunda`: barra de progreso y dato héroe del objetivo |

Contrastes: texto blanco sobre `--marca` 6,9:1 (claro) y 4,5:1 (oscuro); lima sobre
`--marca-profunda` 11:1; texto blanco sobre `--marca-profunda` 16,7:1.

### Neutros con tinte verde

| Token | Claro | Oscuro |
|---|---|---|
| `--fondo` | `#F3F6F2` | `#061A17` |
| `--superficie` | `#FFFFFF` | `#0D2823` |
| `--superficie-2` | `#EBF0EC` | `#133530` |
| `--borde` | `rgba(0, 35, 31, 0.12)` | `rgba(255, 255, 255, 0.10)` |
| `--texto` | `#0B201C` | `#EEF4EF` |
| `--texto-sec` | `#3F4D48` | `#B4C4BD` |
| `--texto-muted` | `#5D6B66` | `#87998F` |
| `--grilla` | `#E1E8E3` | `#1C3D36` |
| `--eje` | `#C4CFCA` | `#2F4A43` |
| Sobre `--marca-profunda` | texto `#FFFFFF`, secundario `#A9C7BD`, apagado `#7FA398` | ídem |

### Roles: cada color, una sola cosa

| Rol | Colores | Se usa para | Nunca para |
|---|---|---|---|
| **Marca** | `--marca-profunda`, `--marca`, `--marca-suave` | superficies de identidad, controles activos, foco, selección | datos |
| **Objetivo / Carrera** | `--serie-carrera` (lima; en claro, lima oscuro para que se lea sobre blanco) y `--lima` sobre la marca | carreras, la última sesión comparada en Carrera, el progreso hacia los 10 km | cualquier otra cosa |
| **Deporte** | `--serie-padel`, `--serie-caminata`, `--serie-ciclismo`, `--serie-otras` | actividades de ese deporte | métricas que no son de un deporte |
| **Dato general** | `--texto` (tinta) | serie principal de una métrica que no es de un deporte (pasos, sueño, FC en reposo, fitness) | interfaz |
| **Contexto** | `--texto-muted`, `--eje` | series de comparación, valor diario detrás de una media, máximos, promedios | lo principal |
| **Intensidad** | `--rampa-1` … `--rampa-7` (verde, de menta a racing) | zonas de FC y carga diaria (calendarios) | deportes |
| **Valoración** | `--bien`, `--mal` | variaciones buenas o malas para el atleta | nada más |

> La rampa de intensidad es de la familia de la marca a propósito: **más esfuerzo = más verde
> racing**. No compite con la marca porque la marca está en superficies grandes y controles, y
> la rampa en celdas y barras dentro de las tarjetas.

### Deportes

| Token | Claro | Oscuro | Contraste sobre la tarjeta (claro / oscuro) |
|---|---|---|---|
| `--serie-carrera` | `#678C00` (lima oscuro) | `#CEDC00` (lima) | 3,9 / 10,7 |
| `--serie-padel` | `#D4700A` (ámbar) | `#FF9F43` | 3,4 / 7,3 |
| `--serie-caminata` | `#1F7FC8` (azul cielo) | `#5DB2F2` | 4,3 / 6,5 |
| `--serie-ciclismo` | `#7656E6` (violeta) | `#A693FF` | 5,0 / 5,8 |
| `--serie-otras` | `#8A8F8A` | `#8F9B96` | 3,3 / 5,2 |

Ningún deporte es verde: el verde es de la marca y de la intensidad.

### Color de la vista
Cada vista de deporte tiene un solo color de dato, el de su deporte, más los grises de contexto,
la rampa (zonas) y `--bien`/`--mal`. Este mes, Resumen y Calendario usan los colores de deporte
para actividades y tinta para lo demás. Recuperación usa tinta. **Variantes del mismo deporte**
(Bloques / Series / Libre): relleno al 100 %, 55 % y 15 % con contorno de 1,5px en el color pleno;
en dispersión, además, cambia la forma del punto (círculo, triángulo, cuadrado).

### Comparar cosas del mismo tipo (sesiones, partidos, períodos)

| Qué | Color | Grosor |
|---|---|---|
| La más reciente | color de la vista (en Carrera, `--serie-carrera`) | 2,5px |
| La inmediatamente anterior | `--texto-muted` | 1,5px |
| Las demás | `--eje` | 1,5px |

### Valoraciones

| Token | Claro | Oscuro |
|---|---|---|
| `--bien` | `#14875A` | `#4CD39A` |
| `--mal` | `#D23B3B` | `#FF6B62` |

- El color depende de si el cambio es bueno o malo **para el atleta** (`mejorSi` en `formato.js`).
  Con `null`, la variación va en `--texto-sec`.
- Formato: `▲ 1.530 vs. sep` / `▼ 0:11 vs. anteriores`, en `--tx-chico`.
- **Solo se compara contra una base completa** (≥ 75 % de días con dato o ≥ 3 sesiones). Si no,
  "sin base para comparar" en `--texto-muted`.

### Rampa de intensidad (verde)

| Nivel | Claro | Oscuro | Número encima (claro / oscuro) |
|---|---|---|---|
| vacío | `#EBF0EC` | `#133530` | `--texto-sec` |
| 1 | `#CDEBDD` | `#18463C` | `--texto` / `--texto` |
| 2 | `#9FD7BF` | `#1D5C4D` | `--texto` / `--texto` |
| 3 | `#67BC9D` | `#24775F` | `--texto` / `--texto` |
| 4 | `#2F9B7C` | `#3A9878` | `--texto` / `--fondo` |
| 5 | `#0F7A63` | `#62BC97` | `#FFFFFF` / `--fondo` |
| 6 | `#005F50` | `#95D9BA` | `#FFFFFF` / `--fondo` |
| 7 | `#00403A` | `#CBF0DE` | `#FFFFFF` / `--fondo` |

Todos los pares cumplen 4,5:1 o más (el más justo: nivel 3 oscuro, 4,85:1). Los cortes de carga
son 1 / 30 / 60 / 90 / 120 HRSS → niveles 1–5.

---

## 3. Espaciado, medidas y superficies

- **Espaciado** (múltiplos de 4): `--e1 4` · `--e2 8` · `--e3 12` · `--e4 16` · `--e5 24` · `--e6 32` (px).
- **Un solo padding de tarjeta: `--e4`.** Entre tarjetas `--e4`; entre el título y el cuerpo `--e3`.
- **Radios:** `--radio` 12px (tarjetas, banda del objetivo, diálogo, menús), `--radio-chico` 6px
  (controles, celdas del mini calendario, tooltip) y `--radio-celda` 3px (solo celdas de 18px del
  calendario de carga). `50%` solo en puntos. Sin píldoras.
- **Bordes:** `1px solid var(--borde)` en tarjetas y controles; `--grilla` en separadores internos.
  La banda del objetivo no lleva borde.
- **Filete de marca:** las tarjetas principales (la primera de cada vista) llevan un filete
  superior de 3px en el color de la vista (en Carrera, `--serie-carrera`). Es el único adorno.
- **Sombras solo en lo que flota** (`--sombra-flotante`). Velo: `--velo`.
- **Alturas de gráfico:** `--alto-principal` 320px (celular 240), `--alto-grafico` 240px (200),
  `--alto-panel` 120px (100), `--alto-sparkline` 24px. Ninguna altura depende de la ventana, salvo
  la portada.

---

## 4. Plantilla de vista

### Vistas de detalle (Carrera, Pádel, Ciclismo, Otras, Recuperación, Resumen)

```
┌ BARRA SUPERIOR ──────────────────────────────────────────────────────┐
│ Título (--tx-pagina expandido)   [controles de la vista]     [rango] │
└──────────────────────────────────────────────────────────────────────┘
╔ BANDA DEL OBJETIVO (solo Carrera) ═══════════════════════════════════╗
  Contexto: una línea --tx-chico --texto-sec
┌ KPI ┐┌ KPI ┐┌ KPI ┐┌ KPI ┐        ← 1. fila de 4 KPI (2 × 2 en celular)
┌ TARJETA PRINCIPAL (con filete) ─┐   ← 2. el gráfico que responde la pregunta de la vista
┌ TABLA DE SESIONES ──────────────┐   ← 3. si la vista tiene sesiones
┌ secundaria ┐┌ secundaria ┐        ← 4. grilla de 2 columnas (1 en celular)
▸ Más análisis                      ← 5. opcional
```

| Vista | Pregunta | KPI | Principal |
|---|---|---|---|
| Carrera | ¿la última sesión me acercó a los 10 km? | ritmo, FC y eficiencia del bloque principal, distancia (última vs. anteriores) | curvas superpuestas de la sesión |
| Pádel | ¿cómo fue el último partido? | sesiones, tiempo, carga media, FC media | FC minuto a minuto con bandas de zona |
| Ciclismo | ¿cómo vengo en bici? | salidas, distancia, velocidad, desnivel | km por semana |
| Otras | ¿cuánto camino? | sesiones, tiempo, distancia, carga | horas por semana |
| Recuperación | ¿descanso bien? | FC en reposo, sueño, puntaje, pasos (con sparkline) | FC en reposo |
| Resumen | ¿cómo viene la carga? | sesiones, tiempo, km, carga | estado de forma |

- Los controles de la vista van en la barra superior. En el celular, segunda fila con scroll
  horizontal; nunca uno por fila. El contexto común va una sola vez.

### Excepciones
- **Este mes (portada):** encabezado de período → **banda del objetivo** → grilla de 2 × 2 (mini
  calendario · KPI 2 × 2 · actividades del mes · gráfico diario). En escritorio entra sin scroll en
  ≥ 700px de alto; en el celular se apila.
- **Calendario:** encabezado de período y grilla mensual (agenda en el celular).
- **Datos:** una tarjeta con la tabla cruda.

---

## 5. Componentes

### Banda del objetivo ("Camino a los 10 km") · nuevo
La pieza que da el tono: aparece **arriba de "Este mes" y de "Carrera"**, y en ningún otro lado.
```
╔══ fondo --banda, --radio, padding --e4 --e5, dos columnas ═══════════════════════════════════╗
  OBJETIVO · CORRER 10 KM          6,7 últ. 4 sem.                                   (marca blanca)
  7,1 / 10 km              [▮▮▮▮▮▮▮|▯▯▯]  barra segmentada en 10 km (lima · blanco 14 %)
                            1  2  3  4  5  6  7  8  9  10                   (--tx-etiqueta apagado)
                           Te faltan 2,9 km · tu carrera más larga pasó de 4,9 a 7,1 km desde jul
╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
izquierda: etiqueta (--tx-etiqueta --sobre-marca-sec) y dato (--tx-hero lima, "/ 10 km" --tx-titulo blanco)
derecha: marca de las últimas 4 semanas, barra, números de km y una línea --tx-chico --sobre-marca-sec
```
En el celular, las dos columnas se apilan. Alto en escritorio: unos 110px.
- **Dato:** la carrera más larga (`distancia_m` máxima de Carrera) contra la meta de 10 km, que
  viene de `coach/CLAUDE.md` ("Objetivo actual"). Una marca blanca muestra la más larga de las
  **últimas 4 semanas**, para ver si el avance es reciente.
- **Barra segmentada:** 10 segmentos de 1 km separados por 3px; el segmento parcial se llena
  proporcionalmente. Alto 10px, radio 2px.
- **Una línea de texto, con datos y sin frases motivacionales.** La marca de las últimas 4
  semanas va sobre la barra y no se repite en el texto.
- En el celular, el dato héroe baja a 40px y el texto se parte en dos líneas.
- Cuando el objetivo tenga fecha (hoy está "[COMPLETAR]" en la ficha del coach), se agrega a la
  derecha "faltan N semanas" en `--tx-titulo` blanco. Mientras no la tenga, no se inventa.

### Tarjeta
Fondo `--superficie`, borde `--borde`, `--radio`, padding `--e4`, sin sombra. Título
(`--tx-titulo`, ancho medio) + subtítulo de una línea (`--tx-chico` `--texto-sec`) + cuerpo + nota
plegada opcional. La primera tarjeta de cada vista lleva el filete superior de 3px.

### KPI
```
ETIQUETA                          (--tx-etiqueta expandida, --texto-sec)
6:48 /km                          (--tx-kpi ancho medio 700; unidad --tx-base normal --texto-sec)
▼ 0:11 vs. anteriores             (--tx-chico; flecha --bien/--mal)
6:59 ───────╱ 6:48                (sparkline opcional, --alto-sparkline)
```
Padding `--e3 --e4`; una sola línea de contexto; sparkline de 1,5px en `--texto-sec` con el
primer y el último valor escritos en las puntas.

### Tabla
Encabezados `--tx-etiqueta` con la unidad; números a la derecha y texto a la izquierda; celdas
`--tx-chico`; números en 500 y la protagonista en 700; filas de 36px, separador `--grilla`, hover
`--marca-suave`; alto natural con `max-height: 420px`. Celular: fecha + 3 columnas esenciales
(`.solo-escritorio` para el resto), con la fecha fija.

### Controles
Alto 32px, `--radio-chico`, borde `--borde`, fondo `--superficie`, `--tx-base`. **Activo: fondo
`--marca`, texto blanco.** Foco: `outline: 2px solid var(--marca); outline-offset: 2px`.
`<select>` con `appearance: none` y la flecha `▾`. Segmentado unido, que nunca se parte.

### Navegación lateral
- Fondo `--marca-profunda` **en los dos modos**. Marca del sitio en `--tx-titulo` expandido blanco;
  "actualizado…" en `--tx-chico` `#7FA398`.
- Grupos en `--tx-etiqueta` `#7FA398`; ítems en `--tx-base` `#A9C7BD` con íconos de 18px y trazo
  de 1,75px.
- Activo: fondo `rgba(255, 255, 255, 0.08)`, texto blanco 600 y barra de 2px blanca a la izquierda.
- En el celular, la barra lateral es el menú desplegable (mismo fondo).

### Leyenda, gráficos, small multiples, nota, estado vacío
Sin cambios respecto de la v2:
- Sin leyenda con una sola serie. Si hay pocas, etiqueta directa a la derecha del último punto.
  Si hace falta leyenda, va arriba a la izquierda, con puntos de 8px.
- Cuadrícula solo horizontal. Marcas sin unidad. Sin títulos de eje rotados. Ejes calculados sin
  rótulo en los extremos.
- Eje Y de tendencias con ±10 % como mínimo. Eje X desde el primer dato.
- Líneas de 2px (principal) y 1,5px (contexto), sin puntos visibles. Barras de 36px como máximo.
- Referencias punteadas con etiqueta directa. Bandas de fondo para bloques y zonas, con el nombre
  arriba del área.
- Ritmo con el eje invertido. Un solo helper de opciones en `graficos.js`.
- Tooltip: fondo `--superficie`, borde `--eje`, `--radio-chico`; fecha en peso 600 y valores en
  tabulares.

### Calendarios
Fondo de carga con la rampa verde en los tres calendarios; puntos de deporte de 6px con anillo de
1,5px `--superficie`; hoy con un anillo de 2px `--marca`; días futuros solo con el número en
`--texto-muted`. En el mensual, "Sin actividad" y sin resumen en las semanas futuras.

---

## 6. Prohibido

- Colores escritos a mano fuera de los tokens. Grises puros (`#888`) o negro puro (`#000`).
- **Lima para algo que no sea correr o el objetivo.** `--lima` fuera de `--marca-profunda`.
- Colores de deporte para algo que no sea ese deporte. Deportes en verde.
- Tamaños fuera de la escala; anchos de fuente fuera de los tres tokens; otra familia que no sea
  Archivo.
- Radios fuera de los tres tokens; píldoras.
- Alturas con `vh` fuera de la portada.
- Párrafos fijos, unidades en cada marca o celda, leyendas con una serie o abajo, títulos de eje
  rotados.
- Comparaciones sin base completa.
- Frases motivacionales genéricas, rachas o cualquier mensaje que culpe por no entrenar.
- Degradados, glassmorphism, sombras en tarjetas, emojis como íconos, anillos o gauges.

---

## 7. Tokens

```css
:root {
  --fuente: "Archivo", system-ui, sans-serif;
  --ancho-normal: 100%; --ancho-medio: 112%; --ancho-expandido: 125%;

  --tx-etiqueta: 11px; --tx-chico: 13px; --tx-base: 15px; --tx-titulo: 17px;
  --tx-pagina: 26px;   --tx-kpi: 30px;   --tx-hero: 52px;

  --e1: 4px; --e2: 8px; --e3: 12px; --e4: 16px; --e5: 24px; --e6: 32px;
  --radio: 12px; --radio-chico: 6px; --radio-celda: 3px;
  --alto-control: 32px;
  --alto-principal: 320px; --alto-grafico: 240px; --alto-panel: 120px; --alto-sparkline: 24px;

  /* Marca (Aston Martin: #00665E, #00231F, #CEDC00) */
  --marca-profunda: #00231F; --marca: #00665E; --marca-suave: #E2EEEA; --lima: #CEDC00;
  --banda: #00231F;
  --sobre-marca: #FFFFFF; --sobre-marca-sec: #A9C7BD; --sobre-marca-muted: #7FA398;

  /* Neutros con tinte verde */
  --fondo: #F3F6F2; --superficie: #FFFFFF; --superficie-2: #EBF0EC;
  --borde: rgba(0, 35, 31, 0.12);
  --texto: #0B201C; --texto-sec: #3F4D48; --texto-muted: #5D6B66;
  --grilla: #E1E8E3; --eje: #C4CFCA;
  --sombra-flotante: 0 8px 24px rgba(0, 35, 31, 0.18); --velo: rgba(0, 20, 18, 0.5);

  /* Deportes */
  --serie-carrera: #678C00; --serie-padel: #D4700A; --serie-caminata: #1F7FC8;
  --serie-ciclismo: #7656E6; --serie-otras: #8A8F8A;

  /* Valoración */
  --bien: #14875A; --mal: #D23B3B;

  /* Intensidad: rampa verde (zonas Z1–Z7 y carga diaria) */
  --rampa-vacio: #EBF0EC;
  --rampa-1: #CDEBDD; --rampa-2: #9FD7BF; --rampa-3: #67BC9D; --rampa-4: #2F9B7C;
  --rampa-5: #0F7A63; --rampa-6: #005F50; --rampa-7: #00403A;
  --rampa-texto-alto: #FFFFFF;   /* número sobre los niveles altos (5–7 en claro) */
}

@media (max-width: 800px) {
  :root { --tx-hero: 40px; --alto-principal: 240px; --alto-grafico: 200px; --alto-panel: 100px; }
}

/* Oscuro: mismo bloque en @media (prefers-color-scheme: dark) :root:not([data-theme="light"])
   y en :root[data-theme="dark"] */
  --marca: #0E8577; --marca-suave: rgba(14, 133, 119, 0.18); --banda: #00403A;
  --fondo: #061A17; --superficie: #0D2823; --superficie-2: #133530;
  --borde: rgba(255, 255, 255, 0.10);
  --texto: #EEF4EF; --texto-sec: #B4C4BD; --texto-muted: #87998F;
  --grilla: #1C3D36; --eje: #2F4A43;
  --sombra-flotante: 0 8px 24px rgba(0, 0, 0, 0.5); --velo: rgba(0, 0, 0, 0.6);
  --serie-carrera: #CEDC00; --serie-padel: #FF9F43; --serie-caminata: #5DB2F2;
  --serie-ciclismo: #A693FF; --serie-otras: #8F9B96;
  --bien: #4CD39A; --mal: #FF6B62;
  --rampa-vacio: #133530;
  --rampa-1: #18463C; --rampa-2: #1D5C4D; --rampa-3: #24775F; --rampa-4: #3A9878;
  --rampa-5: #62BC97; --rampa-6: #95D9BA; --rampa-7: #CBF0DE;
  --rampa-texto-alto: #061A17;   /* en oscuro, niveles 4–7 */
```

Se eliminan respecto de v1: `--fuente-num`, `--tinta`, `--seleccion`, `--acento`,
`--serie-1` … `--serie-8` (reemplazadas por los nombres de deporte) y las fuentes Barlow.
