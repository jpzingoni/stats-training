# v4 · "Pulso": cambios contra la guía vigente (v1)

**La idea en una frase:** monocromo con un solo latido naranja: titulares grandes y apretados,
números enormes con su etiqueta chica debajo, barra lateral clara y el mes a la vista.

**De dónde sale:** Juan trajo una referencia propia, https://rachel-pt.framer.website/, y pidió
tomar de ahí la paleta y la tipografía (`referencias/gustos.md`, 2026-10-13 a la tarde). La v4
reemplaza a la v3 "Racing" en color y tipografía y hereda de la v2 todo el sistema: plantilla de vista, componentes únicos, roles de color y gramática de gráficos.
**La v2 y la v3 no se implementan por separado.**

Maqueta: `maqueta.html` ("Este mes" y "Carrera" con datos reales; botones de claro/oscuro y
escritorio/celular). Capturas revisadas: `referencias/v4-maqueta/`.

## Cómo leí la referencia (y por qué)

De la referencia tomé el **sistema visual**: un solo acento, titulares en peso medio y apretados,
números grandes con la etiqueta debajo, tarjetas blancas sin borde sobre gris muy claro y radios
grandes. No tomé su **estructura de página de venta** (fotos, testimonios, precios). Dos
decisiones salen de pensar en comparar sesiones y ver progreso:
- **El naranja significa una sola cosa: correr.** En la referencia marca "lo importante" (la
  tarjeta destacada, el botón principal). En el tablero, lo importante es la última sesión. Así, en la comparación, la línea naranja es la de hoy
  y todo lo demás es gris.
- **La intensidad (zonas, carga) va en grises.** Con un estilo monocromo, una rampa de color
  competiría con el naranja. En gris, los puntos de cada deporte y la línea de Carrera se leen
  sobre cualquier celda.

## Referencias usadas

| Referencia | URL | Qué tomé |
|---|---|---|
| Rachel · Fitness Personal Trainer (elegida por Juan) | https://rachel-pt.framer.website/ | Paleta medida (`#F8F8F8`, `#121212`, `#1C1C1C`, `#767676`, acento `#F9652F`), titulares de 48–65px en peso 500 con −0,04em, números grandes con la etiqueta debajo y tarjetas sin borde |
| Licencia de General Sans (Fontshare/ITF) | https://licenseorg.com/guide/fonts/fontshare · https://madegooddesigns.com/fontshare/ | La fuente de la referencia no se puede redistribuir en un repo público |
| Alternativas libres a General Sans | https://fontalternatives.com/alternatives/general-sans/ | Punto de partida para la comparación (sugiere Inter y Work Sans) |
| Instrument Sans (Google Fonts) | https://fonts.google.com/specimen/Instrument+Sans | La elegida: OFL, variable, con cifras tabulares |
| Muestrario propio | `referencias/v4-tipografias/muestrario.png` | General Sans al lado de 9 alternativas libres con números reales; prueba de cifras tabulares (General Sans no las tiene) |
| Sistema | `propuestas/v2-sistema/` | Toda la estructura (plantilla de vista, componentes, gráficos) |

Detalle en `referencias/notas.md` §9.

## Diferencias contra la vigente (v1)

| # | Qué cambia | Por qué | Archivos del tablero |
|---|---|---|---|
| 1 | **Tipografía: Instrument Sans** (variable, OFL) en lugar de Barlow + Barlow Semi Condensed. Pesos 400/500/600, tracking negativo en lo grande y **sin mayúsculas espaciadas**. | Juan eligió General Sans (la de la referencia); no se puede usar por licencia y porque no tiene cifras tabulares. Instrument Sans es la alternativa libre más parecida. | `vendor/fuentes/` (agregar `instrument-sans-variable.woff2` + `OFL.txt`, borrar Barlow), `estilos.css`, `graficos.js` |
| 2 | **Escala:** etiqueta 12px, título de tarjeta 18px, título de vista 32px, KPI 34px, protagonista 48px (celular: 24, 28 y 36px). | Titulares grandes y apretados como en la referencia. | `estilos.css` |
| 3 | **KPI con el número primero** y la etiqueta gris en minúscula debajo. | Patrón de la referencia ("+102 / Women Coached"): el número es lo primero que se lee. | `componentes.js`, `estilos.css`, textos de etiquetas en las secciones |
| 4 | **Paleta monocroma** (fondo `#FCFCFC` casi blanco, tarjetas `#FFFFFF`, grises; oscuro `#121212`/`#1C1C1C`) **+ un acento `#F9652F`**. | La paleta de la referencia, con el fondo casi blanco que pidió Juan. | `estilos.css` |
| 5 | **El naranja = Carrera** (la línea y el punto de la última sesión comparada). Nunca interfaz, texto sobre claro ni fondo de un bloque. | Un color, un significado; el acento escaso que pidió Juan. | `estilos.css`, `graficos.js`, `carrera.js` |
| 6 | **Deportes nuevos:** Pádel violeta, Caminata azul, Ciclismo verde agua, Otras gris. Tokens con nombre (`--serie-padel`…). | El naranja pasó a Carrera; ningún otro deporte puede ser naranja, rojo ni amarillo. | `estilos.css`, `graficos.js` y las secciones que usan `--serie-N` |
| 7 | **`--mal` frambuesa** (`#D92D5B`) en lugar de rojo. | Que no se confunda con el naranja. | `estilos.css` |
| 8 | **Intensidad en grises** (zonas y carga). | Estilo monocromo; el naranja y los puntos de deporte se leen sobre cualquier celda. | `estilos.css`, `calendario.js`, `inicio.js`, `resumen.js` |
| 9 | **Barra lateral clara `#F8F8F8` con texto negro `#000000`** (oscuro: `#161616` con texto claro); **controles activos negros** (claro) o blancos (oscuro). | Pedido de Juan; los botones negros son de la referencia. | `estilos.css`, `index.html` |
| 10 | **Tarjetas blancas con un borde muy suave** (`rgba(0, 0, 0, 0.06)`), radio de 16px y padding de 24px (16px en el celular). | Sobre un fondo casi blanco, el borde suave las separa; más aire que la v1. | `estilos.css` |
| 11 | **Sin banda del objetivo** (estaba en la primera versión de la v4 y en la v3). El objetivo de 10 km no tiene un bloque propio. | Juan no quiso un bloque protagonista arriba de la portada. Si más adelante se quiere mostrar, va como un KPI más. | — |
| 12 | **Portada sin barra superior en escritorio** (el título es el mes) y **sin bandas ni bloques de color arriba**: abre con calendario, KPI, actividades y gráfico diario; el primer KPI en 48px. | Juan descartó la banda naranja del objetivo; evita repetir "Este mes" / "Octubre 2026". | `estilos.css`, `index.html` |
| 13 | **Todo el sistema de la v2** (plantilla de vista, sin `vh`, alturas como tokens, KPI con sparkline y base completa, KPI de Carrera con eficiencia, comparación por recencia, tabla para el celular, nota plegada, gramática única de gráficos y fechas en un formato). | Corrige lo que encontró la evaluación y logra la homogeneidad que pidió Juan. | Ver `propuestas/v2-sistema/CAMBIOS.md` filas 2 a 17 |

**No cambia:** la escala de espaciado, las reglas de valoración (según convenga al atleta), el
formato de los números, los ítems y los íconos de la navegación, y el diálogo de detalle.

## Riesgos y cómo los cubre la guía

| Riesgo | Dónde | Cómo se cubre |
|---|---|---|
| El **naranja como línea sobre blanco** está justo en 3:1. | Modo claro, Carrera | Alcanza para gráficos (WCAG pide 3:1 en elementos no textuales); la línea de la última sesión va en 2,5px. Nunca se usa como texto sobre claro. |
| **Demasiado gris** (que vuelva a sentirse "chato"), ahora sin banda ni barra lateral oscura. | Todo | El carácter lo dan la tipografía (titulares y números grandes y apretados) y el naranja en los datos de Carrera. Si Juan lo siente apagado, el siguiente paso es usar el naranja también en las sparklines de Carrera y en el punto de la tabla, no sumar colores. |
| **Zonas en gris** menos intuitivas que una rampa de color. | Carrera, Pádel | Leyenda Z1–Z7 siempre visible; el orden claro → oscuro es ordinal y se lee. |
| Fondo **casi blanco** y tarjetas **blancas**: poca diferencia. | Modo claro | Borde de tarjeta `rgba(0, 0, 0, 0.06)` (token `--borde-tarjeta`); se puede subir a 0,08 sin tocar componentes. |
| **Tracking negativo** con tamaños chicos se lee apretado. | Celular | El tracking negativo solo va en `--tx-titulo` para arriba; el texto chico va en 0. |
| **Pádel violeta y Caminata azul** cerca para daltonismo azul-amarillo. | Calendario, Resumen | Siempre con leyenda; revisarlo con el simulador de DevTools al implementar. |
| La **maqueta carga la fuente de Google Fonts** (necesita conexión). | Solo la maqueta | En el tablero la fuente va en `vendor/` y funciona sin conexión. |

---

## Prompt para la sesión de `app/`

```
Implementá la guía v4 "Pulso" del tablero. Objetivo: estilo monocromo con un solo acento
naranja (#F9652F) y tipografía Instrument Sans, tomado de la referencia que eligió Juan
(https://rachel-pt.framer.website/), con la barra lateral clara (#F8F8F8, texto negro) y el
fondo casi blanco (#FCFCFC); y homogeneidad (una plantilla de vista y un componente por función).

Fuentes:
- Guía nueva: diseno/propuestas/v4-pulso/DESIGN.md → copiala tal cual a app/DESIGN.md
  (reemplaza a la v1).
- Diferencias, motivos y riesgos: diseno/propuestas/v4-pulso/CAMBIOS.md
- Sistema heredado de la v2: diseno/propuestas/v2-sistema/CAMBIOS.md (su prompt, etapas 3 a 7,
  sigue valiendo salvo en color y tipografía, que manda la v4).
- Maqueta de referencia (no es código para copiar): diseno/propuestas/v4-pulso/maqueta.html.
  Fijate en kpi() (número primero, hero en el primero de "Este mes"), ETIQUETA_DIRECTA, BANDAS, REFERENCIA,
  sinExtremos(), sparkline() y variacion().
- Ignorá diseno/propuestas/v3-racing (reemplazada por esta).

Trabajá por etapas, con un commit "app:" por etapa. Verificá cada una en claro y en oscuro, a
1440×900 y a 390px. Al final, subí la versión a v4.0 y anotá la etapa en docs/bitacora.md.

ETAPA 1 · Fuente
- Descargá Instrument Sans variable (ejes wght 400–700 y wdth 75–100, subconjuntos latin y
  latin-ext) desde Google Fonts a app/vendor/fuentes/instrument-sans-variable.woff2 (si viene en
  dos archivos por subconjunto, incluí los dos con unicode-range), con su OFL.txt.
- @font-face según DESIGN.md §1. Borrá los woff2 de Barlow y sus @font-face. --fuente =
  "Instrument Sans"; eliminá --fuente-num.
- Escala y asignación cerrada de §1: pesos 400/500/600 (nunca 700), tracking con los tokens
  --track-*, sin text-transform: uppercase en ningún lado (etiquetas, encabezados de tabla y
  grupos de navegación en minúscula y gris). tabular-nums en todos los números.
- graficos.js: Chart.defaults.font.family = --fuente; títulos de tooltip en 500.

ETAPA 2 · Paleta
- Tokens de §7 en claro y en los dos bloques de oscuro: base monocroma (--fondo #FCFCFC),
  --lateral, --lateral-texto, --tinta, --acento, deportes con nombre (--serie-carrera = --acento, --serie-padel,
  --serie-caminata, --serie-ciclismo, --serie-otras), --bien, --mal (frambuesa), rampa gris y
  --rampa-texto-alto, --borde-tarjeta (rgba(0, 0, 0, 0.06) en claro).
- Reemplazá todos los usos de --serie-1…8 y --seleccion; --acento deja de ser alias de la
  interfaz: ahora es el naranja de Carrera (solo datos).
  · Controles activos: fondo --tinta, texto --superficie. Foco: outline 2px --texto.
  · Hover y selección: --superficie-2.
  · Barra lateral: fondo --lateral (#F8F8F8), borde derecho --borde, todo el texto en
    --lateral-texto (#000000) salvo "actualizado…" en --texto-muted; hover y activo según §5.
  · "Dato general" (pasos, sueño, FC en reposo, fitness): --texto.
- Calendarios: rampa gris con el color del número por nivel y modo (§2); hoy con un anillo de
  2px --texto.

ETAPA 3 · Componentes con el estilo de la referencia
- KPI (componentes.js): valor + unidad PRIMERO, etiqueta gris en minúscula DEBAJO, después
  una línea de variación y la sparkline opcional (§5). Reescribí las etiquetas en minúscula y
  más descriptivas ("ritmo del bloque principal", "pasos por día, promedio").
- Tarjetas con borde var(--borde-tarjeta), --radio 16px, padding
  --e5 (--e4 en ≤ 800px). Controles de 36px con --radio-chico 8px.
- Tabla: encabezados en --tx-etiqueta 500 --texto-muted (minúsculas, con la unidad), filas
  de 40px, protagonista en 600.
- "Este mes": sin barra superior en escritorio (sí en ≤ 900px, por el botón de menú) y sin
  ningún bloque arriba de la grilla: encabezado del mes → calendario · KPI · actividades ·
  gráfico diario. El primer KPI (pasos del mes) en --tx-hero (48px).

ETAPA 4 · Sistema de la v2
- Aplicá las etapas 3 a 7 del prompt de diseno/propuestas/v2-sistema/CAMBIOS.md (plantilla de
  vista, componentes, gráficos, Carrera, calendarios), con los colores de la v4:
  · Comparación por recencia: la última en --serie-carrera 2,5px, la anterior --texto-muted y
    el resto --eje.
  · Subtipos de carrera: --serie-carrera al 100/55/15 % con contorno pleno.
  · Nombres de bloque en los gráficos en minúscula (el principal en 500 --texto, el resto en
    400 --texto-muted), arriba del área de dibujo.
  · Sin filetes de color en las tarjetas.

Al terminar, revisá que no queden en css/ ni en js/: "Barlow", --fuente-num, --serie-[0-9],
--seleccion, uppercase, font-weight 700, colores hex fuera de los tokens, font-size en rem/em,
vh fuera de la portada, border-radius distinto de los tres tokens. Revisá violeta, azul y
naranja con el simulador de daltonismo de DevTools (Rendering → Emulate vision deficiencies).
```
