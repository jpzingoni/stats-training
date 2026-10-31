# Lo que opinó Juan

Leer antes de cada propuesta. Lo más nuevo, arriba.

## 2026-10-31 · Ajustes directos al tablero y referencia Nivea

Lo que hizo y dijo (probando él mismo desde el inspector, aplicado en `app/`):
- **Un solo tema, el claro**, sin botón de tema, mientras se rediseña.
- **Fondos:** página `#f2f7f5`, tarjetas `#ffffff`, barra lateral `#ECECEC`, días sin actividad
  `#ECECEC`.
- **No le gusta que los mismos colores se usen para muchas cosas.** Cada color, una sola cosa.
- **Calendario de "Este mes":** los días entrenados de **un solo color** (no por carga) y **verde**:
  "da la sensación de día ganado". Eligió el verde fuerte (`#2f9e5f`) con número blanco.
- **Referencia nueva:** https://www.nivea.com.ar/productos/gel-de-afeitar-sensitive-40058082291230087.html
  Le gustan los colores y la letra; del producto, "ese blanco, azul y verde". Se armó la prueba
  `propuestas/v6-nivea/` (paleta + Nunito en lugar de NIVEA Brand Type, que es de marca).

## 2026-10-16 · Sobre la v4 "Pulso" (con el ajuste de la barra lateral)

Lo que dijo: todavía no encuentra la estética que le gusta, ni la letra ni la paleta. Pidió
páginas para mirar e inspirarse por su cuenta.

- Ninguna de las tipografías propuestas lo convenció (Barlow, Archivo, Instrument Sans). Le gustó
  General Sans, que no se puede usar.
- Ninguna paleta lo convenció del todo (neutra, verde racing, monocromo + naranja).
- **Próximo paso:** que traiga 3 a 5 referencias propias y diga qué le gusta de cada una; antes de
  otra versión completa, mostrarle un muestrario de opciones aplicadas al tablero real para elegir.

## 2026-10-13 (noche) · Sobre la v4 "Pulso" (vista en su navegador)

Lo que dijo: no le gusta cómo queda la banda naranja del objetivo arriba; quiere que la parte
principal vuelva a mostrar **calendario, actividades, KPI y gráficos**. Barra lateral con fondo
**`#F8F8F8`** y letras **negras `rgb(0, 0, 0)`**. Fondo general de la página: **casi blanco, apenas
más gris que el blanco**.

### Reglas
- **Nada de bandas, héroes ni bloques de color grandes arriba de la portada.** "Este mes" abre
  directo con el calendario, los KPI, las actividades y el gráfico diario. El objetivo de 10 km,
  si aparece, va como un dato más (KPI o línea de contexto), nunca como bloque protagonista.
- **Barra lateral clara:** fondo `#F8F8F8`, texto negro `#000000`. Nada de barras laterales oscuras.
- **Fondo de página casi blanco** (más claro que la barra lateral). Las tarjetas blancas se separan
  con un borde muy suave.
- El naranja queda **solo en los datos** (Carrera, la última sesión): ya no tiene un bloque propio.

### Ajustes de la v4
- Sacar la banda de "Este mes" y de "Carrera"; lateral `#F8F8F8` + texto negro; fondo `#FCFCFC`;
  tarjetas con borde `rgba(0, 0, 0, 0.06)` en claro.

## 2026-10-13 (tarde) · Referencia propia: rachel-pt.framer.website

Lo que dijo: le gustan **la tipografía y el estilo de colores** de https://rachel-pt.framer.website/
y quiere tomar de ahí la paleta y las tipografías.

Qué tiene esa página (medido con `mirar.py`, capturas en `v4-rachel/`):
- Blanco y gris muy claro (`#F8F8F8`), secciones casi negras (`#121212`, `#1C1C1C`), texto gris
  `#767676` y **un único acento naranja `#F9652F`**, usado en las tarjetas destacadas y los botones
  principales.
- **General Sans** (titulares de 48–65px, peso 500, letras apretadas `-0.04em`; texto de 14–16px).
- Números grandes con una etiqueta chica gris debajo ("+102 / Women Coached"), tarjetas grises con
  esquinas muy redondeadas y botones negros con una flecha.

### Reglas (reemplazan a las de la paleta Aston Martin de la mañana)
- **Paleta: monocromo (blanco, grises, casi negro) + un solo acento naranja.** El verde racing y el
  lima quedan descartados. El naranja es escaso y significa "lo importante / el objetivo".
- **Tipografía de la familia de General Sans:** neogrotesca, titulares grandes en peso medio con
  tracking negativo; nada de mayúsculas espaciadas. General Sans en sí **no se puede usar**: su
  licencia (ITF/Fontshare) no permite subir los archivos a un repo público y **no tiene cifras
  tabulares** (probado). Se usa la alternativa libre más parecida: **Instrument Sans** (OFL).
- Siguen valiendo: identidad propia (no planilla), tono que empuje hacia los 10 km, banda del
  objetivo y homogeneidad.

### Ajustes
- La v3 "Racing" no se implementa: la v4 hereda su estructura y su banda del objetivo, con la
  paleta y la tipografía nuevas.

## 2026-10-13 · Sobre la v2 "Sistema"

Lo que dijo: no le gusta la tipografía; el tablero es muy sobrio, se siente "chato"; quiere una
paleta con color, al estilo de la marca **Aston Martin** (un verde o un azulado); el tablero
tiene que **transmitirle algo** que lo empuje hacia el objetivo del entrenamiento.

### Reglas (valen para todas las versiones desde ahora)
- **Barlow queda descartada** (interfaz y números). La próxima tipografía tiene que tener
  **carácter propio** (que no parezca la de una planilla) y seguir teniendo **cifras tabulares**
  para los números. Se prueba con texto y números reales antes de proponerla.
- **El tablero tiene identidad de color.** Hay un color de marca dominante, **verde profundo
  tipo "racing green", con matices azulados o petróleo**, que se ve en la interfaz (barra lateral,
  encabezados, superficies destacadas), no solo en los datos. Se abandona la regla v1/v2 de
  "interfaz neutra en tinta".
- **Acentos con más saturación y algo de brillo** (estilo automovilismo: un acento claro y
  vivo sobre el verde oscuro). Los neutros pueden seguir existiendo, pero no son el protagonista.
- **Tono:** no solo "instrumento" preciso; tiene que **motivar**. Cada pantalla conecta con el
  **objetivo actual (llegar a correr 10 km, según `coach/CLAUDE.md`)** y muestra el avance hacia él.
- **Sigue valiendo** la regla del 2026-10-12: homogeneidad (mismas fuentes, misma paleta usada
  siempre igual, mismos tamaños y componentes). Más color no significa más colores sueltos: el
  sistema de roles de la v2 se mantiene.

### Ajustes de la v2
- Ninguno: la v2 no se corrige. Su **estructura** (plantilla de vista, componentes únicos,
  roles de color, gramática de gráficos) es la base de la v3; cambian tipografía, paleta y tono.

## 2026-10-12 · Sobre la evaluación del tablero v1.2

- **Objetivo principal: que el tablero sea homogéneo.** Mismas fuentes, misma paleta usada
  siempre igual, mismos tamaños, mismos componentes en todas las vistas. Es lo que busca lograr
  con el estudio de diseño y es el eje de la v2 (`propuestas/v2-sistema/`).
- **Delega las decisiones de datos menores** ("lo que vos consideres mejor, de última lo
  modifico"). Caso concreto: eficiencia (m/latido) en lugar de potencia como cuarto KPI de
  Carrera. Se decidió **eficiencia** (une ritmo y FC; la potencia del Amazfit es estimada).
- Implicancia para próximas propuestas: priorizar **reglas que se repiten** (una plantilla de
  vista, un solo componente de cada tipo) por sobre ideas sueltas o vistas nuevas. Las ideas
  nuevas (dumbbell, sparklines) entran solo si se pueden expresar como componente del sistema.
