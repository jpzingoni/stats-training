---
description: Evalúa el tablero actual (o una vista) y escribe un informe de diseño
argument-hint: "[vista o tema, opcional: inicio, carrera, gráficos, celular…]"
---

Evaluá el diseño del tablero. Alcance: $ARGUMENTS (si está vacío, todas las vistas).

1. Leé `referencias/gustos.md` (si existe), `../app/DESIGN.md`, `../app/index.html`,
   `../app/css/estilos.css` y los JS de las vistas del alcance.
2. Capturá cada vista del alcance con `python herramientas/mirar.py tablero:<vista> eval-AAAA-MM-DD-<vista>`
   y **mirá las imágenes** (escritorio, celular y celular oscuro).
3. Si un problema tiene una solución conocida, buscá cómo lo resuelven otros (2 o 3 referencias),
   capturalas con `mirar.py` y anotalas en `referencias/notas.md`.
4. Escribí `evaluaciones/AAAA-MM-DD-<tema>.md` con:
   - **Lo que funciona** (para no perderlo en una próxima versión).
   - **Problemas**, priorizados (alta / media / baja), cada uno con dónde está, qué criterio
     rompe y la solución que elegís.
   - **Ideas** que no son correcciones sino mejoras posibles (otra forma de mostrar algo, una
     vista nueva), con la referencia que las inspira.
   - **Recomendación**: ¿alcanza con corregir la guía vigente o conviene una nueva versión?
   - Al final, un **prompt listo para pegar en la sesión de `app/`** con las correcciones de
     prioridad alta y media.
5. Respondeme con un resumen de 5 a 8 líneas y la ruta del informe.
