# Sleeper Wire — Fantasy NFL

Mini página estática que muestra los jugadores sin roster de la liga Sleeper `1388976988894543872`.

## Publicar gratis con GitHub Pages

1. Creá un repositorio público nuevo en GitHub (por ejemplo `sleeper-wire`).
2. Subí a la raíz del repositorio `index.html`, `styles.css`, `app.js` y este `README.md` (no hace falta subir el ZIP).
3. Entrá a **Settings → Pages → Build and deployment**.
4. Elegí **Deploy from a branch**, rama **main** y carpeta **/(root)**. Guardá.
5. Abrí la URL que te indique GitHub Pages, normalmente `https://TU-USUARIO.github.io/sleeper-wire/`.

No hay que configurar tokens, contraseñas, servidor, dependencias ni variables de entorno.

## Qué muestra

- Jugadores activos del catálogo NFL que **no están en ninguno de los rosters** de la liga.
- Búsqueda por nombre y equipo NFL; filtros QB, RB, WR, TE, K y DEF.
- Ordenamiento por nombre, equipo y cantidad de altas globales Sleeper (últimas 24 horas, si la API las informa).
- Estado de lesión publicado en el catálogo.
- Botón para actualizar. Catálogo cacheado por 24 horas en el navegador para respetar las recomendaciones de la API; los rosters se vuelven a consultar en cada actualización.

## Importante sobre waivers

La API pública de Sleeper permite identificar qué jugadores **no están en un roster**, pero no ofrece un campo documentado por jugador para garantizar que se puedan agregar inmediatamente. Un jugador mostrado puede estar en waivers o bajo restricciones de la liga. Esta página **no afirma** que todos sean free agents inmediatamente incorporables.

## Cambiar de liga

Modificá `LEAGUE_ID` al comienzo de `app.js` y el enlace a Sleeper en `index.html`.

## API

Documentación oficial: https://docs.sleeper.com/

- `GET /v1/league/{id}`
- `GET /v1/league/{id}/rosters`
- `GET /v1/players/nfl?active=true`
- `GET /v1/players/nfl/trending/add?lookback_hours=24&limit=200`

Proyecto independiente, no afiliado a Sleeper. Destinado a uso no comercial.
