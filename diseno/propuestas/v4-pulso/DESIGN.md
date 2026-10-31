# DESIGN.md: guía visual del tablero (v4 · "Pulso")

Este archivo es la fuente de verdad del aspecto del tablero. Todo lo que se agregue o se
cambie en `css/` y en los gráficos de `js/` tiene que seguirlo. Si algo no está contemplado,
se agrega acá primero y después se implementa.

## Dirección

**"Pulso": monocromo con un solo latido naranja.** Blanco, grises y casi negro para todo; un
naranja vivo (`#F9652F`) que aparece poco y siempre significa lo mismo: **correr** (la última
sesión, lo que te acerca a los 10 km). Titulares grandes, en peso medio y con las letras apretadas; números enormes con una
etiqueta gris chica debajo. La referencia es el sitio de entrenadora personal que eligió Juan
(https://rachel-pt.framer.website/): se toma su sistema visual, no su estructura de página de venta.

Cinco ideas ordenan todo:

1. **Monocromo + un acento.** La interfaz y casi todos los datos van en blanco, grises y casi
   negro. El naranja es escaso: si algo es naranja, es lo que te acerca a la meta.
2. **Números grandes, etiquetas chicas.** El número va primero y grande; lo que mide va debajo,
   en gris, en minúsculas. Nada de mayúsculas espaciadas.
3. **La portada muestra el mes, no un cartel:** calendario, KPI, actividades y gráfico diario,
   sin bloques de color grandes arriba.
4. **Una plantilla de vista** (de la v2): todas las vistas de detalle tienen las mismas partes,
   en el mismo orden y con las mismas medidas.
5. **Un componente por función** (de la v2): una tarjeta, un KPI, una tabla, un control, una
   leyenda y una nota.

---

## 1. Tipografía

**Una sola familia: [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans)**
(Rodrigo Fuenzalida y Jordan Egstad, licencia OFL), variable, con ejes de peso (`wght` 400–700) y
de ancho (`wdth` 75–100). Es la alternativa libre más parecida a General Sans, la tipografía de la
referencia, que **no se puede usar**: su licencia no permite subir los archivos a un repo público
y no tiene cifras tabulares.

- **Se incluye dentro de `app/vendor/fuentes/`**: `instrument-sans-variable.woff2` (latin +
  latin-ext) y su `OFL.txt`.
  ```css
  @font-face {
    font-family: "Instrument Sans"; src: url("../vendor/fuentes/instrument-sans-variable.woff2") format("woff2");
    font-weight: 400 700; font-stretch: 75% 100%; font-display: swap;
  }
  ```
- Respaldo: `system-ui, sans-serif`. Se borran los archivos de Barlow.
- **Pesos: 400 (texto), 500 (titulares, números y énfasis) y 600 (solo la celda protagonista).**
  Nunca 700: el estilo es de peso medio.
- **Tracking negativo en lo grande** (tokens `--track-*`), cero en el texto chico.
- **Sin mayúsculas** salvo en siglas (FC, HRSS, Z1). Las etiquetas van en minúscula y en gris.
- Todo valor numérico lleva `font-variant-numeric: tabular-nums`.

### Escala (no existe otro tamaño)

| Token | Tamaño / interlineado | Peso | Tracking | Uso |
|---|---|---|---|---|
| `--tx-etiqueta` | 12px / 16px | 400 | 0 | etiqueta debajo del KPI, encabezado de tabla, grupo de navegación, nombre de bloque |
| `--tx-chico` | 13px / 18px | 400 | 0 | subtítulo de tarjeta, contexto, celdas, ejes, leyendas, tooltips, notas |
| `--tx-base` | 15px / 22px | 400 | −0,01em | cuerpo, navegación, controles, listas |
| `--tx-titulo` | 18px / 24px | 500 | −0,02em | título de tarjeta |
| `--tx-pagina` | 32px / 36px | 500 | −0,03em | título de vista y encabezado de período |
| `--tx-kpi` | 34px / 36px | 500 · tnum | −0,03em | valor de KPI |
| `--tx-hero` | 48px / 48px (celular 36px / 36px) | 500 · tnum | −0,04em | **un** dato protagonista: el primer KPI de "Este mes" |

**Asignación cerrada** (lo que no está acá usa `--tx-base` 400):

| Elemento | Token |
|---|---|
| Título de la vista (barra superior) | `--tx-pagina` |
| Título de tarjeta | `--tx-titulo` |
| Subtítulo de tarjeta | `--tx-chico` `--texto-muted` |
| Etiqueta de KPI (debajo del valor) | `--tx-etiqueta` `--texto-muted` |
| Encabezado de tabla | `--tx-etiqueta` peso 500 `--texto-muted` |
| Celda de tabla | `--tx-chico`; números en 400 tabulares |
| Celda protagonista | `--tx-chico` 600 `--texto` |
| Ejes, leyendas, tooltips, etiquetas directas | `--tx-chico` |
| Grupo de navegación, nombre de bloque en gráficos | `--tx-etiqueta` `--texto-muted` |
| Notas, avisos, estados vacíos | `--tx-chico` |

### Formato de números y fechas (en `formato.js`, un solo lugar)
- Miles con punto (130.588), decimales con coma (6,69), ritmo m:ss (6:38), duraciones `52 min` /
  `1 h 03 min`; en KPI, las duraciones largas compactas (`7:16` con unidad `h`).
- Fechas: en tablas, listas, tooltips y selectores `sáb 4 oct`; en ejes `4 oct`.
- Unidades: en KPI, pegada al valor en `--tx-base` `--texto-muted`. En tablas, en el encabezado. En
  gráficos, en el subtítulo. Nunca en cada celda ni en cada marca de eje (excepción: duraciones).

---

## 2. Color

### Base monocroma

| Token | Claro | Oscuro |
|---|---|---|
| `--fondo` | `#FCFCFC` (casi blanco) | `#121212` |
| `--superficie` | `#FFFFFF` | `#1C1C1C` |
| `--superficie-2` | `#F1F1F1` | `#262626` |
| `--borde` | `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.08)` |
| `--texto` | `#121212` | `#F2F2F2` |
| `--texto-sec` | `#5C5C5C` | `#B3B3B3` |
| `--texto-muted` | `#767676` | `#8F8F8F` |
| `--grilla` | `#EBEBEB` | `#2A2A2A` |
| `--eje` | `#D4D4D4` | `#3A3A3A` |
| `--lateral` | `#F8F8F8` | `#161616` |
| `--lateral-texto` | `#000000` | `#F2F2F2` |
| `--tinta` (controles activos) | `#121212` | `#F2F2F2` |

### El acento

| Token | Valor | Uso |
|---|---|---|
| `--acento` | `#F9652F` (los dos modos) | Carrera y la última sesión comparada (solo datos) |

- **El naranja nunca es texto sobre blanco** (3:1, no alcanza): en claro va como relleno, línea o
  punto. Sobre los fondos oscuros sí puede ser texto (5,6:1).
- **El naranja nunca es interfaz:** los controles activos son negros (claro) o blancos (oscuro),
  como los botones de la referencia.

### Roles: cada color, una sola cosa

| Rol | Colores | Se usa para | Nunca para |
|---|---|---|---|
| **Interfaz** | `--tinta`, `--lateral`, grises | controles activos, navegación, foco, hoy | datos |
| **Carrera** | `--acento` | carreras y la última sesión comparada | cualquier otra cosa |
| **Deporte** | `--serie-padel`, `--serie-caminata`, `--serie-ciclismo`, `--serie-otras` | actividades de ese deporte | métricas que no son de un deporte |
| **Dato general** | `--texto` | serie principal de una métrica que no es de un deporte (pasos, sueño, FC en reposo, fitness) | interfaz |
| **Contexto** | `--texto-muted`, `--eje` | series de comparación, valor diario detrás de una media, máximos, promedios | lo principal |
| **Intensidad** | `--rampa-1` … `--rampa-7` (**grises**, de claro a casi negro) | zonas de FC y carga diaria (calendarios) | deportes |
| **Valoración** | `--bien`, `--mal` | variaciones buenas o malas para el atleta | nada más |

> La intensidad es **gris** a propósito: el estilo es monocromo y así el naranja de Carrera y los
> puntos de cada deporte se leen sobre cualquier celda. Más esfuerzo = más oscuro (en modo oscuro,
> más claro: más contraste con el fondo).

### Deportes

| Token | Claro | Oscuro | Contraste sobre la tarjeta (claro / oscuro) |
|---|---|---|---|
| `--serie-carrera` | `#F9652F` (= `--acento`) | `#F9652F` | 3,0 / 5,6 |
| `--serie-padel` | `#7C5CFC` (violeta) | `#A08CFF` | 4,4 / 6,2 |
| `--serie-caminata` | `#2F7BEA` (azul) | `#6AA5FF` | 4,1 / 6,9 |
| `--serie-ciclismo` | `#0E9F9E` (verde agua) | `#3CC8C4` | 3,2 / 8,3 |
| `--serie-otras` | `#8C8C8C` | `#9A9A9A` | 3,4 / 6,1 |

Ningún otro deporte es naranja, rojo ni amarillo, para no confundirse con el acento ni con `--mal`.

### Color de la vista
Cada vista de deporte tiene un solo color de dato (el de su deporte) más los grises de contexto, la
rampa (zonas) y `--bien`/`--mal`. Este mes, Resumen y Calendario usan los colores de deporte para
actividades y `--texto` para lo demás; Recuperación usa `--texto`. **Variantes del mismo deporte**
(Bloques / Series / Libre): relleno al 100 %, 55 % y 15 % con contorno de 1,5px en el color pleno; en
dispersión, además, forma de punto distinta.

### Comparar cosas del mismo tipo

| Qué | Color | Grosor |
|---|---|---|
| La más reciente | color de la vista (en Carrera, `--acento`) | 2,5px |
| La inmediatamente anterior | `--texto-muted` | 1,5px |
| Las demás | `--eje` | 1,5px |

### Valoraciones

| Token | Claro | Oscuro |
|---|---|---|
| `--bien` | `#13884C` | `#3CCF7F` |
| `--mal` | `#D92D5B` (frambuesa, lejos del naranja) | `#FF6B8E` |

El color depende de si el cambio es bueno o malo para el atleta (`mejorSi`). Formato
`▲ 1.530 vs. sep`. Solo se compara contra una base completa (≥ 75 % de días o ≥ 3 sesiones); si no,
"sin base para comparar" en `--texto-muted`.

### Rampa de intensidad (grises)

| Nivel | Claro | Oscuro | Número encima (claro / oscuro) |
|---|---|---|---|
| vacío | `#F1F1F1` | `#262626` | `--texto-muted` |
| 1 | `#E0E0E0` | `#303030` | `--texto` / `--texto` |
| 2 | `#C7C7C7` | `#444444` | `--texto` / `--texto` |
| 3 | `#A8A8A8` | `#5E5E5E` | `--texto` / `--texto` |
| 4 | `#858585` | `#808080` | `--texto` / `#121212` |
| 5 | `#5E5E5E` | `#A3A3A3` | `#FFFFFF` / `#121212` |
| 6 | `#383838` | `#CCCCCC` | `#FFFFFF` / `#121212` |
| 7 | `#121212` | `#F2F2F2` | `#FFFFFF` / `#121212` |

Todos los pares cumplen ≥ 4,5:1. Cortes de carga: 1 / 30 / 60 / 90 / 120 HRSS → niveles 1–5.

---

## 3. Espaciado, medidas y superficies

- **Espaciado** (múltiplos de 4): `--e1 4` · `--e2 8` · `--e3 12` · `--e4 16` · `--e5 24` · `--e6 32` (px).
- **Padding de tarjeta: `--e5`** en escritorio y `--e4` en el celular (la referencia respira más
  que la v1). Entre tarjetas, `--e4`; entre el título y el cuerpo, `--e4`.
- **Radios:** `--radio` 16px (tarjetas, diálogo, menús), `--radio-chico` 8px (controles,
  celdas del mini calendario, tooltip) y `--radio-celda` 3px (solo celdas de 18px del calendario
  de carga). `50%` solo en puntos. Sin píldoras.
- **Bordes:** las tarjetas llevan `1px solid var(--borde-tarjeta)`: muy suave en claro
  (`rgba(0, 0, 0, 0.06)`, porque el fondo es casi blanco) y `rgba(255, 255, 255, 0.08)` en oscuro.
  Separadores internos en `--grilla`.
- **Sombras solo en lo que flota** (`--sombra-flotante`). Velo: `--velo`.
- **Alturas de gráfico:** `--alto-principal` 320px (celular 240), `--alto-grafico` 240px (200),
  `--alto-panel` 120px (100), `--alto-sparkline` 24px. Ninguna altura depende de la ventana, salvo
  la portada.

---

## 4. Plantilla de vista

### Vistas de detalle (Carrera, Pádel, Ciclismo, Otras, Recuperación, Resumen)

```
┌ BARRA SUPERIOR ──────────────────────────────────────────────────────┐
│ Título (--tx-pagina)        [controles de la vista]          [rango] │
└──────────────────────────────────────────────────────────────────────┘
  Contexto: una línea --tx-chico --texto-sec
┌ KPI ┐┌ KPI ┐┌ KPI ┐┌ KPI ┐        ← 1. fila de 4 KPI (2 × 2 en celular)
┌ TARJETA PRINCIPAL ──────────────┐   ← 2. el gráfico que responde la pregunta de la vista
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

- Los controles de la vista van en la barra superior; en el celular, en una segunda fila con
  scroll horizontal. El contexto común va una sola vez.

### Excepciones
- **Este mes (portada):** en escritorio **no lleva barra superior** (el título es el mes, en
  `--tx-pagina`); en el celular sí, por el botón de menú. Encabezado de período → grilla de
  2 × 2 (mini calendario · KPI 2 × 2 · actividades del mes · gráfico diario). **Sin bandas ni bloques
  de color arriba**: lo primero que se ve es el mes.
  En escritorio entra sin scroll en ≥ 720px de alto; en el celular se apila.
- **Calendario:** encabezado de período y grilla mensual (agenda en el celular).
- **Datos:** una tarjeta con la tabla cruda.

---

## 5. Componentes

### Tarjeta
Fondo `--superficie`, borde `--borde-tarjeta`, `--radio`, padding `--e5`.
Título (`--tx-titulo`) + subtítulo de una línea (`--tx-chico` `--texto-muted`) + cuerpo + nota
plegada opcional. Sin filetes ni adornos.

### KPI: número primero
```
6:48 /km                          (--tx-kpi 500; unidad --tx-base --texto-muted)
ritmo del bloque principal        (--tx-etiqueta --texto-muted)
▼ 0:11 vs. anteriores             (--tx-chico; flecha --bien/--mal)
6:59 ───────╱ 6:48                (sparkline opcional, --alto-sparkline)
```
Fondo `--superficie`, `--radio`, padding `--e4 --e5`; una sola línea de contexto. Sparkline de 1,5px
en `--texto-muted` con el primer y el último valor en las puntas.

### Tabla
Encabezados `--tx-etiqueta` 500 `--texto-muted` (minúsculas, con la unidad: "ritmo /km");
números a la derecha y texto a la izquierda; celdas `--tx-chico`; la protagonista en 600; filas
de 40px, separador `--grilla`, hover `--superficie-2`; alto natural con `max-height: 420px`.
Celular: fecha + 3 columnas esenciales, con la fecha fija.

### Controles
Alto 36px (`--alto-control`), `--radio-chico`, borde `--borde`, fondo `--superficie`, `--tx-base`.
**Activo: fondo `--tinta`, texto `--superficie`** (negro en claro, blanco en oscuro). Foco:
`outline: 2px solid var(--texto); outline-offset: 2px`. `<select>` con `appearance: none` y la
flecha `▾`. Segmentado unido, que nunca se parte.

### Navegación lateral
- Fondo `--lateral` (`#F8F8F8` en claro, `#161616` en oscuro) con un borde derecho de 1px
  `--borde`. Todo el texto en `--lateral-texto` (**negro `#000000`** en claro): nombre del sitio en
  `--tx-titulo` 500, ítems en `--tx-base` 400, grupos en `--tx-etiqueta`; "actualizado…" en
  `--tx-chico` `--texto-muted` (es un dato secundario). Íconos de 18px, trazo de 1,75px, `currentColor`.
- Hover: fondo `rgba(0, 0, 0, 0.04)`. Activo: fondo `rgba(0, 0, 0, 0.06)`, peso 500 y una barra
  de 2px `--lateral-texto` a la izquierda. Igual en todos los ítems (en oscuro, con blanco al 6 %/8 %).

### Leyenda, gráficos, small multiples, nota, estado vacío
Sin cambios respecto de la v2:
- Sin leyenda con una sola serie. Si hay pocas, etiqueta directa a la derecha del último punto.
  Si hace falta leyenda, va arriba a la izquierda, con puntos de 8px.
- Cuadrícula solo horizontal. Marcas sin unidad. Sin títulos de eje rotados. Ejes calculados sin
  rótulo en los extremos.
- Eje Y de tendencias con ±10 % como mínimo. Eje X desde el primer dato.
- Líneas de 2px (principal) y 1,5px (contexto). Barras de 36px como máximo.
- Referencias punteadas con etiqueta directa. Bandas de fondo para bloques y zonas, con el nombre
  arriba del área.
- Ritmo con el eje invertido. Un solo helper de opciones en `graficos.js`.
- Tooltip: fondo `--superficie`, borde `--eje`, `--radio-chico`; fecha en peso 500 y valores en
  tabulares.

### Calendarios
Fondo de carga con la rampa gris en los tres calendarios; puntos de deporte de 6px con anillo de
1,5px `--superficie`; hoy con un anillo de 2px `--texto`; días futuros solo con el número en
`--texto-muted`.

---

## 6. Prohibido

- Colores escritos a mano fuera de los tokens.
- **Naranja para algo que no sea correr.** Naranja como texto sobre fondo claro, en controles o
  como fondo de un bloque (bandas, héroes, tarjetas destacadas).
- Barras laterales oscuras.
- Colores de deporte para algo que no sea ese deporte. Deportes en naranja, rojo o amarillo.
- Mayúsculas espaciadas; peso 700; otra familia que no sea Instrument Sans; tamaños fuera de la escala.
- Radios fuera de los tres tokens; píldoras.
- Alturas con `vh` fuera de la portada.
- Párrafos fijos, unidades en cada marca o celda, leyendas con una serie o abajo, títulos de eje
  rotados.
- Comparaciones sin base completa. Frases motivacionales genéricas, rachas o mensajes de culpa.
- Fotos, degradados, glassmorphism, sombras en tarjetas, emojis como íconos, anillos o gauges.

---

## 7. Tokens

```css
:root {
  --fuente: "Instrument Sans", system-ui, sans-serif;
  --track-titular: -0.03em; --track-hero: -0.04em; --track-titulo: -0.02em; --track-base: -0.01em;

  --tx-etiqueta: 12px; --tx-chico: 13px; --tx-base: 15px; --tx-titulo: 18px;
  --tx-pagina: 32px;   --tx-kpi: 34px;   --tx-hero: 48px;

  --e1: 4px; --e2: 8px; --e3: 12px; --e4: 16px; --e5: 24px; --e6: 32px;
  --radio: 16px; --radio-chico: 8px; --radio-celda: 3px;
  --alto-control: 36px;
  --alto-principal: 320px; --alto-grafico: 240px; --alto-panel: 120px; --alto-sparkline: 24px;

  --fondo: #FCFCFC; --superficie: #FFFFFF; --superficie-2: #F1F1F1;
  --borde: rgba(0, 0, 0, 0.08); --borde-tarjeta: rgba(0, 0, 0, 0.06);
  --texto: #121212; --texto-sec: #5C5C5C; --texto-muted: #767676;
  --grilla: #EBEBEB; --eje: #D4D4D4;
  --lateral: #F8F8F8; --lateral-texto: #000000; --tinta: #121212;
  --acento: #F9652F;
  --sombra-flotante: 0 12px 32px rgba(0, 0, 0, 0.12); --velo: rgba(0, 0, 0, 0.5);

  --serie-carrera: #F9652F; --serie-padel: #7C5CFC; --serie-caminata: #2F7BEA;
  --serie-ciclismo: #0E9F9E; --serie-otras: #8C8C8C;
  --bien: #13884C; --mal: #D92D5B;

  --rampa-vacio: #F1F1F1;
  --rampa-1: #E0E0E0; --rampa-2: #C7C7C7; --rampa-3: #A8A8A8; --rampa-4: #858585;
  --rampa-5: #5E5E5E; --rampa-6: #383838; --rampa-7: #121212;
  --rampa-texto-alto: #FFFFFF;   /* número sobre los niveles 5–7 */
}

@media (max-width: 800px) {
  :root { --tx-pagina: 24px; --tx-kpi: 28px; --tx-hero: 36px;
          --alto-principal: 240px; --alto-grafico: 200px; --alto-panel: 100px; }
}

/* Oscuro: mismo bloque en @media (prefers-color-scheme: dark) :root:not([data-theme="light"])
   y en :root[data-theme="dark"] */
  --fondo: #121212; --superficie: #1C1C1C; --superficie-2: #262626;
  --borde: rgba(255, 255, 255, 0.08); --borde-tarjeta: rgba(255, 255, 255, 0.08);
  --texto: #F2F2F2; --texto-sec: #B3B3B3; --texto-muted: #8F8F8F;
  --grilla: #2A2A2A; --eje: #3A3A3A;
  --lateral: #161616; --lateral-texto: #F2F2F2; --tinta: #F2F2F2;
  --sombra-flotante: 0 12px 32px rgba(0, 0, 0, 0.5); --velo: rgba(0, 0, 0, 0.6);
  --serie-padel: #A08CFF; --serie-caminata: #6AA5FF; --serie-ciclismo: #3CC8C4; --serie-otras: #9A9A9A;
  --bien: #3CCF7F; --mal: #FF6B8E;
  --rampa-vacio: #262626;
  --rampa-1: #303030; --rampa-2: #444444; --rampa-3: #5E5E5E; --rampa-4: #808080;
  --rampa-5: #A3A3A3; --rampa-6: #CCCCCC; --rampa-7: #F2F2F2;
  --rampa-texto-alto: #121212;   /* número sobre los niveles 4–7 */
```

Se eliminan respecto de v1: `--fuente-num`, `--seleccion`, `--serie-1` … `--serie-8` (reemplazadas
por nombres de deporte) y las fuentes Barlow. `--acento` cambia de significado: ya no es un alias de
la interfaz, es el naranja de Carrera.
