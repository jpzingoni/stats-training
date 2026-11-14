---
description: Audita el tablero contra app/DESIGN.md y propone (o aplica) correcciones visuales
argument-hint: "[vista o archivo, opcional: inicio, carrera, calendario…; por defecto todo]"
---

Revisá el diseño del tablero. Alcance: $ARGUMENTS (si está vacío, todas las vistas).

## Reglas de esta tarea

- La fuente de verdad es `app/DESIGN.md`. Leelo completo antes de empezar.
- **No cambies lógica ni datos**: solo `app/css/`, el marcado de `app/index.html` y las opciones
  visuales de los gráficos en `app/js/` (colores, fuentes, leyendas, ejes, cuadrícula).
- Si algo que necesitás no está en `DESIGN.md`, **proponé el cambio a DESIGN.md primero** y
  esperá mi aprobación.

## Pasos

1. **Inventario.** Con grep, listá en `app/css/` y `app/js/`:
   - Colores escritos a mano (`#hex`, `rgb(`, `rgba(`) fuera de los bloques de tokens.
   - `font-size` o `font-family` fuera de los tokens `--t-*` y `border-radius` fuera de
     `--radio` / `--radio-chico`.
   - `box-shadow` en elementos que no flotan.
   - Tamaños o fuentes fijos en canvas (`ctx.font = "11px …"`).
   - Gráficos con leyenda y una sola serie.
2. **Capturas.** Abrí `app/index.html` en el navegador y mirá la vista en escritorio y celular.
3. **Informe.** Antes de tocar nada, dame una lista priorizada (alta: rompe la jerarquía o
   confunde; media: escala, espaciado o radios; baja: detalles), con dónde está, qué regla
   rompe y qué cambio proponés.
4. **Esperá mi OK.** Después aplicá los cambios de a una vista por vez y verificá de nuevo.
5. Si cambió algo de la guía, actualizá `app/DESIGN.md` y sumá una entrada a `docs/bitacora.md`.
