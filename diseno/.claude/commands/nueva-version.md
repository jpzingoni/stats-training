---
description: Arma una nueva dirección visual completa (DESIGN.md + cambios + maqueta) en propuestas/
argument-hint: "[idea o dirección, opcional; si está vacío, elegís vos]"
---

Armá una nueva propuesta de diseño para el tablero. Dirección pedida: $ARGUMENTS
(si está vacío, elegí vos la dirección que más mejore el tablero según la última evaluación y
`referencias/notas.md`).

1. Leé `referencias/gustos.md` (si existe) y respetalo. Mirá qué versiones hay en `propuestas/`
   y usá el número siguiente (la vigente, `../app/DESIGN.md`, es v1). Carpeta: `propuestas/vN-<nombre>/`.
2. Investigá por tu cuenta: buscá entre 4 y 8 referencias que encajen con la dirección, capturalas
   con `python herramientas/mirar.py <url> vN-<nombre-ref>`, miralas y anotá en
   `referencias/notas.md` qué tomás de cada una. Elegí tipografías de licencia libre que se
   puedan incluir localmente.
3. Decidí vos. Si la dirección admite varias lecturas, elegí la que mejor sirva para comparar
   sesiones y ver progreso, y explicá por qué en `CAMBIOS.md`.
4. Escribí en la carpeta de la versión:
   - `DESIGN.md`: completo, con la misma estructura que la vigente, para que pueda reemplazarla.
   - `CAMBIOS.md`: la idea en una frase, las referencias usadas (con URL), una tabla de
     diferencias contra la vigente, los archivos del tablero que se tocan, los riesgos (celular,
     modo oscuro, legibilidad) y al final un **prompt listo para pegar en la sesión de `app/`**.
   - `maqueta.html`: las pantallas "Este mes" y "Carrera" (primera pantalla) con los tokens de la
     propuesta y datos reales (`<script src="../../../app/data/datos.js"></script>`), con botón
     para cambiar entre claro y oscuro.
5. Capturá tu maqueta (`python herramientas/mirar.py <ruta file:// de maqueta.html> vN-maqueta`),
   mirala con ojo crítico contra los criterios de `CLAUDE.md` y corregí lo que no cumpla.
   Repetí hasta que te convenza.
6. Respondeme con: la idea en una frase, las 3 decisiones principales y la ruta de la maqueta
   para abrirla con doble clic.
