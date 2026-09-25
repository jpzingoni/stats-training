# Guía de implementación

Pasos en orden. Cada fase termina con algo funcionando antes de pasar a la siguiente.
(Podés borrar este archivo del repo cuando termines.)

---

## Fase 0: crear el repositorio

1. Copiá a `datos/` tus CSV actuales (`actividades.csv`, `bloques.csv`, `bienestar.csv`,
   `registro.log`) y tu `config.json` a la raíz del proyecto (no se sube: está en `.gitignore`).
2. Probá localmente desde la raíz: `python scripts/diario.py`.
3. Creá en GitHub un repositorio **público** vacío (sin README ni .gitignore), por ejemplo
   `entrenamiento`.
4. Desde la carpeta del proyecto:
   ```
   git init
   git add .
   git status        ← verificá que config.json NO aparezca en la lista
   git commit -m "Estructura inicial del proyecto"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/entrenamiento.git
   git push -u origin main
   ```

## Fase 1: automatización con GitHub Actions

1. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
   Creá dos secretos:
   - `INTERVALS_ATHLETE_ID` → tu Athlete ID (ej. i723827)
   - `INTERVALS_API_KEY` → tu API key
2. Pestaña **Actions** → "Actualización diaria de datos" → **Run workflow** para probarlo a mano.
3. Si termina en verde, vas a ver un commit nuevo `datos: actualización AAAA-MM-DD`.
   Desde ahí corre solo todos los días a las 09:00.
4. En tu compu, antes de trabajar: `git pull` para tener los datos al día.

Nota: GitHub pausa los workflows programados de repos públicos tras 60 días sin actividad.
Como el workflow hace un commit por día (el `registro.log` siempre cambia), no debería pasar.

## Fase 2: tablero local con Claude Code

Abrí la terminal en `app/` y ejecutá `claude`. Primer prompt sugerido:

```
Leé CLAUDE.md. Quiero construir el tablero de entrenamiento desde cero.
Antes de escribir código, proponeme: estructura de archivos de app/, qué librería de
gráficos usarías y por qué, las secciones del tablero y qué mostraría cada una a partir
de los datos disponibles. Además, el diseño de ../scripts/generar_datos_app.py (qué JSON
genera en app/data/). Esperá mi aprobación antes de implementar.
```

Después iterá sección por sección. Usá `/clear` entre tareas grandes.

## Fase 3: publicar en tu dominio (Cloudflare Pages)

Cuando el tablero funcione localmente, en la sesión de `app/`:

```
Quiero publicar app/ en Cloudflare Pages conectado a este repositorio de GitHub, y después
usar mi dominio personal. Guiame paso a paso: configuración del proyecto en Cloudflare
(sin comando de build, output directory "app"), dominio personalizado y cómo verificar que
cada commit diario del workflow redespliegue el tablero con los datos nuevos.
```

## Fase 4: coach virtual

Abrí la terminal en `coach/` y ejecutá `claude`. Primer prompt sugerido:

```
Leé CLAUDE.md. Revisá la ficha del atleta y preguntame los datos marcados como
[COMPLETAR]. Cuando te los dé, actualizá la ficha. Después corré /evaluar-semana.
```

Luego, cuando quieras: `/plan-10k` y, cada semana o dos, `/revisar-plan`.

## Fase 5: el coach dentro del tablero

En la sesión de `app/`:

```
Agregá al tablero una pestaña "Coach" que muestre el último informe de ../coach/informes/
(usando su frontmatter) y el plan de ../coach/planes/ comparado con lo realizado.
Extendé generar_datos_app.py para copiar esos datos a app/data/.
```

## Fase 6 (opcional): chat con el coach en la web

Requiere un backend (por ejemplo, Cloudflare Workers) que llame a la API de Claude. La API
se paga aparte de la suscripción. Evaluarlo cuando las fases anteriores estén andando.

---

**Al cerrar cada fase:** pedile a Claude Code "agregá una entrada en docs/bitacora.md con lo
que hicimos en esta fase" y hacé commit.
