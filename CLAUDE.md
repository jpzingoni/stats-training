# Entrenamiento: datos, tablero y coach

Proyecto personal y **público** (portfolio). Datos de un reloj Amazfit que llegan a
Intervals.icu, se guardan en CSV mediante GitHub Actions y se muestran en un tablero web.

| Carpeta | Qué contiene | Sesión de Claude Code |
|---|---|---|
| `scripts/` + `datos/` | Descarga de datos desde la API de Intervals.icu → CSV | raíz |
| `.github/workflows/` | Actualización diaria automática | raíz |
| `app/` | Tablero web (se publica en Cloudflare Pages) | abrir en `app/` |
| `coach/` | Coach virtual: ficha del atleta, informes y planes | abrir en `coach/` |
| `docs/` | Bitácora del proyecto para el portfolio | cualquiera |

## Reglas generales

- Idioma: español rioplatense.
- **Nunca** commitear credenciales (`config.json`, `.env`, `.dev.vars`) ni mostrar la API key.
  En GitHub Actions se usan los secretos `INTERVALS_ATHLETE_ID` e `INTERVALS_API_KEY`.
- Los CSV de `datos/` los actualiza el workflow: no editarlos a mano.
- Los scripts de datos hacen upsert por clave: nunca duplicar filas.
- Al cerrar una etapa, agregar una entrada en `docs/bitacora.md` (qué se hizo, qué se
  decidió y por qué, qué problema apareció).
- Commits con mensajes claros en español, con prefijo: `datos:`, `app:`, `coach:`, `ci:`, `docs:`.
