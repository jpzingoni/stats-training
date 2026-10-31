# v5 · prueba de paleta "Hues" (Happy Hues, paleta 14)

**Qué es:** una copia exacta del tablero actual (v1.3, con los cambios sin commitear del
2026-10-16) donde **solo cambian los colores**. Misma estructura, misma tipografía (Montserrat),
mismos tamaños y mismo código. No es una guía completa: es una prueba para decidir la paleta.

- Abrir con doble clic: `diseno/propuestas/v5-hues/tablero/index.html`
- Usa el JS, los datos y las fuentes de `app/` (no hay copias): siempre muestra los datos del día.
- Capturas lado a lado (tablero actual vs. prueba): `referencias/v5-hues/` (`actual-*` y `hues-*`).

## Historial de pruebas en esta misma copia

| Fecha | Paleta | Resultado |
|---|---|---|
| 2026-10-16 | Happy Hues verde petróleo (`#004643` / `#f9bc60` / `#abd1c6`), oscura | Probada; Juan pidió probar otra. |
| 2026-10-16 | **Happy Hues 14** (https://www.happyhues.co/palettes/14), clara | **La que está aplicada ahora.** |

## Paleta 14

background `#fffffe` · headline `#272343` · paragraph `#2d334a` · button `#ffd803` ·
button text `#272343` · stroke `#272343` · main `#fffffe` · highlight `#ffd803` ·
secondary `#e3f6f5` · tertiary `#bae8e8`. Se tomó la combinación de su sección "Color terminology":
fondo `#e3f6f5` con tarjetas `#fffffe`.

## Qué color va a cada cosa

| Token del tablero | Valor | De dónde sale |
|---|---|---|
| `--fondo-pagina` (fondo general) | `#e3f6f5` | secondary |
| `--superficie` (tarjetas) | `#fffffe` | card background |
| `--superficie-2` (celdas, hover) | `#e3f6f5` | secondary |
| `--borde` | azul marino al 12 % | stroke |
| Barra lateral | `#272343` con texto `#fffffe` | stroke / la tarjeta oscura de la paleta |
| `--texto` / `--texto-sec` | `#272343` / `#2d334a` | headline / paragraph |
| `--texto-muted` | `#6b6884` | headline aclarado (5,3:1 sobre blanco) |
| Control activo y barra del ítem activo | `#ffd803` con texto `#272343` | button / button text |
| Foco y "hoy" | `#272343` | headline (el amarillo no se ve sobre blanco) |
| Carrera (`--serie-1`) | `#272343` | headline: el dato protagonista, en el color más fuerte |
| Pádel (`--serie-2`) | `#b89600` | highlight oscurecido (el `#ffd803` como línea no se ve sobre blanco: 1,4:1) |
| Caminata (`--serie-3`) | `#2b8f91` | tertiary `#bae8e8` oscurecido |
| Ciclismo (`--serie-4`) | `#7a76a3` | headline aclarado (lavanda) |
| Pasos / sueño y carga de los calendarios | `#ffd803`, de suave a pleno | highlight (como relleno sí funciona) |
| `--bien` / `--mal` | `#1f8a5c` / `#d64545` | derivados: la paleta no trae verde ni rojo |
| Zonas de FC (`--zona-1…7`) | sin cambios | convención gris → rojo del tablero |

**Modo claro y oscuro:** la paleta es clara, así que la prueba se ve igual en los dos modos.

## Lo que hay que mirar al decidir

- **El amarillo es relleno, nunca línea ni texto:** botones activos, barras de pasos y calendarios.
  En líneas y textos va el azul marino.
- **Pádel en amarillo oscuro** (`#b89600`) queda justo en contraste (2,8:1). Si molesta, puede pasar
  a un tono derivado del turquesa o del lavanda.
- **Carrera en azul marino** es el mismo color que el texto: se distingue por el punto y la línea,
  no por el texto.

## Prompt para la sesión de `app/` (si Juan la aprueba)

```
Aplicá la paleta de prueba "Hues 14" al tablero, sin tocar nada más (ni estructura, ni
tipografía, ni tamaños). Está lista en diseno/propuestas/v5-hues/tablero/css/estilos.css: es el
bloque final "PRUEBA DE PALETA" (tokens en :root más cuatro reglas solo de color: .lateral con
sus propios tonos, el texto del botón activo, el foco y "hoy"). Copiá esos valores en los tokens de
app/css/estilos.css (modo claro y los dos bloques de modo oscuro) y agregá las cuatro reglas.
Las zonas (--zona-1…7) no cambian. Actualizá la sección de color de app/DESIGN.md con la tabla de
diseno/propuestas/v5-hues/CAMBIOS.md. Verificá todas las vistas a 1440×900 y a 390px.
```
