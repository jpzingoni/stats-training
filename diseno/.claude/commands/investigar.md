---
description: Investiga por su cuenta (foros, blogs, apps de entrenamiento, galerías) y arma la biblioteca de referencias
argument-hint: "[tema opcional: portada, comparar sesiones, calendario, tipografía…; si está vacío, todo]"
---

Investigá por tu cuenta buenas prácticas y referencias de diseño para el tablero.
Tema: $ARGUMENTS (si está vacío, cubrí todo: portada "cómo vengo", comparación de sesiones,
gráficos de ritmo/FC, calendario, tablas, tipografía y paleta, celular).

Juan **no te va a pasar páginas ni capturas**: encontrás, elegís y mirás todo vos.

## Cómo

1. **Empezá amplio** con WebSearch en español y en inglés, combinando estos frentes:
   - Apps y plataformas de entrenamiento: Strava, Garmin Connect, Coros, Polar, Whoop, Oura,
     Runalyze, intervals.icu, TrainingPeaks, Final Surge, Stryd (sus blogs, notas de lanzamiento,
     páginas de producto y capturas públicas).
   - Foros y comunidades: Reddit (r/UXDesign, r/dataisbeautiful, r/visualization, r/web_design,
     r/running, r/AdvancedRunning, r/Garmin, r/intervals_icu), Hacker News, foro de intervals.icu,
     DesignerNews.
   - Blogs de diseño y visualización: Datawrapper, Observable, FT Visual Vocabulary, Nightingale
     (Data Visualization Society), Smashing Magazine, Nielsen Norman Group, Refactoring UI.
   - Galerías públicas: Awwwards, Godly, Land-book, Dribbble y Behance (búsquedas como
     "fitness dashboard", "running analytics", "sports data").
2. **Ajustá la búsqueda según lo que encuentres.** Si un hilo menciona una app, una técnica o un
   autor, buscalo. Si una fuente no sirve o pide sesión, descartala y probá otra. Hacé al menos
   3 rondas de búsqueda refinada por tema.
3. **Mirá lo visual.** Para cada referencia prometedora, capturala con
   `python herramientas/mirar.py <url> <nombre>` y abrí las imágenes. Quedate con las que de
   verdad aporten algo (entre 8 y 15 por tema como máximo).
4. **Registrá** en `referencias/notas.md`, agrupado por tema:
   - URL, qué es y por qué sirve.
   - Qué principio tomar (no copiar el diseño): jerarquía, densidad, color, tipografía,
     tipo de gráfico, interacción.
   - Qué evitar.
   - Opiniones de usuarios reales que aparezcan en foros (qué les sirve o les molesta de los
     tableros de entrenamiento), con el enlace.
5. **Cerrá con conclusiones** en `referencias/notas.md`: las 5 a 10 ideas más fuertes para el
   tablero, ordenadas por impacto, y cuáles ya cumple la guía vigente (`../app/DESIGN.md`).

Respondeme con un resumen de 5 a 8 líneas: qué encontraste, las 3 ideas más fuertes y si
justifican una nueva versión.
