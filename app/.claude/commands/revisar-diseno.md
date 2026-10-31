---
description: Audita el tablero contra DESIGN.md y propone (o aplica) correcciones visuales
argument-hint: "[vista o archivo, opcional: inicio, carrera, calendario…; por defecto todo]"
---

En esta tarea trabajás como **diseñador de interfaz y de visualización de datos** del tablero.
Alcance: $ARGUMENTS (si está vacío, todas las vistas).

## Reglas de esta tarea

- La fuente de verdad es `DESIGN.md`. Leelo completo antes de empezar.
- **No cambies lógica ni datos**: solo `css/`, el marcado de `index.html` y las opciones visuales
  de los gráficos en `js/` (colores, fuentes, leyendas, ejes, cuadrícula).
- Si algo que necesitás no está en `DESIGN.md`, **proponé el cambio a DESIGN.md primero** y
  esperá mi aprobación.

## Pasos

1. **Inventario.** Con `grep`, listá en `css/` y `js/`:
   - Colores escritos a mano (`#hex`, `rgb(`, `rgba(`) fuera de los bloques de tokens.
   - `font-size` fuera de la escala `--tx-*` y `border-radius` fuera de `--radio`/`--radio-chico`.
   - `box-shadow` en elementos que no flotan.
   - Tamaños o fuentes fijos en canvas (`ctx.font = "11px …"`).
   - Gráficos con `legend.display` activo y una sola serie.
2. **Capturas.** Si hay Playwright o Chromium disponibles, abrí `index.html` (file://) y sacá
   capturas de la vista en escritorio (1280×800) y celular (390×844), en claro y en oscuro.
   Guardalas en `../.capturas/` (agregá esa carpeta a `.gitignore` si no está). Miralas.
3. **Informe.** Antes de tocar nada, dame una lista priorizada:
   - **Alta:** rompe la jerarquía o confunde (color con doble significado, dato protagonista
     poco visible, controles inconsistentes).
   - **Media:** inconsistencias de escala, espaciado o radios.
   - **Baja:** detalles.
   Para cada punto: dónde está (archivo:línea o componente), qué regla de DESIGN.md rompe y
   qué cambio proponés.
4. **Esperá mi OK.** Después aplicá los cambios en el orden de prioridad, de a una vista por vez.
5. **Verificación.** Repetí las capturas, comparalas con las anteriores y confirmá que:
   - El modo oscuro y el celular siguen bien.
   - El paso 1 no encuentra nada nuevo.
6. Si cambió algo de la guía, actualizá `DESIGN.md`. Al terminar una etapa, sumá una entrada a
   `../docs/bitacora.md` (qué se cambió y por qué).
