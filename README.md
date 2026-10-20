# LFA · Waivers

Web estática para ver jugadores sin roster en la liga Sleeper `1388976988894543872`.

## Publicar en GitHub Pages

Subir **el contenido de esta carpeta** a la raíz del repositorio `ImpostorNFL/waivers`. En **Settings → Pages**, seleccionar **Deploy from a branch → main → /(root)**.

Archivos: `index.html`, `styles.css`, `app.js`, `lfa-escudo.png` y este README.

La página no requiere inicio de sesión. Usa la API pública de Sleeper; muestra únicamente QB, RB, WR y TE. Identifica jugadores sin roster, no garantiza disponibilidad inmediata mientras están sujetos a waivers. Las tendencias de 24 horas son globales. El catálogo de jugadores se cachea en el navegador por 24 horas.

## Versión oscura / FLEX

Esta edición utiliza siempre tema oscuro y agrega filtro FLEX (RB + WR + TE). Subir archivos descomprimidos a raíz de `main` y sobrescribir los existentes. Si GitHub Pages aún muestra colores claros, hacer recarga forzada (Ctrl + F5) y esperar el despliegue.

## Puntos fantasy
Se consultan las estadísticas reales acumuladas de la temporada de Sleeper y se utiliza la modalidad Standard, Half PPR o PPR según el valor de recepciones de la liga. Las bonificaciones personalizadas pueden hacer que los puntos difieran. La API de estadísticas puede no estar disponible desde ciertos navegadores; en ese caso aparece «—», nunca un valor inventado.

## Corrección de orden por puntos

La consulta de estadísticas usa `/stats/nfl/{temporada}?season_type=regular`, normaliza respuestas tanto en lista como en diccionario, y ordena los puntos como números descendentes. Si la API no entrega puntos, se deshabilita la opción y se muestra una advertencia para evitar que parezca un orden alfabético por puntos.
