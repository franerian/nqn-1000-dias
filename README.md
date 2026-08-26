# 1000 días · 1000 obras · 1000 razones

Landing de campaña por los 1000 días de gestión del Gobierno de la Provincia
del Neuquén. Sitio estático, sin build ni dependencias: se abre con cualquier
servidor de archivos.

## Cómo verla

```bash
python3 -m http.server 4321
```

Y abrir http://localhost:4321 — la raíz del repo es la raíz del sitio.

En Vercel se importa como framework **Other**, sin tocar el Root Directory.

## Acceso provisorio

Antes de la landing hay una pantalla que pide una clave: **`NQN`**, en
mayúsculas y exacta. Con la clave correcta entra y lo recuerda mientras dure la
pestaña (`sessionStorage`); con cualquier otra cosa redirige a Google.

No es seguridad real: la clave está en el HTML y el contenido se descarga
igual. Es una cortina para que la vista previa no quede a la vista de
cualquiera. Está toda en el bloque `<script>` del final de `index.html` y en
el `<script>` del `<head>` — se saca borrando esos dos bloques y el `div.gate`.

Para algo serio, Vercel tiene *Deployment Protection* con contraseña a nivel
de plataforma, que corta antes de servir el HTML.

## Estructura

```
.
├── index.html              Todo el marcado, en secciones comentadas
└── assets/
    ├── css/style.css       Sistema visual completo
    ├── js/data.js          TODO el contenido: textos, cifras y datos
    ├── js/main.js          Interacciones: scroll, filtros, carrusel, players
    ├── img/
    │   ├── hero-poster.jpg     Fallback del hero si el video no carga
    │   ├── mano-telefono.webp  Marco del bloque vertical (hoy oculto)
    │   └── razones/            Retratos de las historias
    └── video/
        ├── hero-loop.mp4       1,8 MB · loop muteado del hero
        ├── counter.mp4         340 KB · contador entre manifiesto y cifras
        └── spot-1000-dias.mp4  12,6 MB · spot completo (hoy sin uso: los
                                reproductores apuntan a YouTube)
```

**Para editar contenido no hace falta tocar HTML ni CSS: está todo en
`assets/js/data.js`.**

## Secciones

| # | Sección | Qué hay |
|---|---|---|
| 1 | **Hero** | Video en loop muteado + los tres "mil" |
| 2 | **Manifiesto** | El texto de campaña, revelado línea por línea |
| 3 | **Contador** | Franja con `counter.mp4` |
| 4 | **Film · spot** | Reproductor del spot institucional |
| 5 | **Las cifras** | 7 contadores animados del hito |
| 6 | **Film · provincia** | Reproductor del corte de rutas |
| 7 | **Explorar obras** | Filtros por eje y estado + Plan de Obras 2026 por rubro |
| 8 | **7 regiones** | Panel con localidades y obras destacadas de cada región |
| 9 | **Antes / después** | Lo que encontramos → lo que hicimos |
| 10 | **Contexto** | PBG, empleo, exportaciones |
| 11 | **Mil razones** | Carrusel con las siete historias |
| 12 | **Cierre** | Firma "Neuquén está cambiando." |

Entre la sección 6 y la 7 hay un bloque vertical (video en un teléfono)
**comentado en el HTML**. Para reactivarlo alcanza con sacar los comentarios:
el reproductor se monta solo y el CSS de `.fono` sigue en su lugar.

## Cómo funcionan las partes con lógica

### Reproductores de video

Los spots están en YouTube y se montan con la IFrame API, pero con
`controls=0` y **controles propios** encima, para que no aparezca la interfaz
de YouTube. Se declaran en el HTML con `data-yt="<id>"`:

```html
<div class="player" data-yt="g6TEiOkjJ20" data-titulo="Mil días..."></div>
```

Los de la página arrancan **en mute** (única forma de que el navegador permita
el autoplay) y muestran un botón "Activar sonido"; el del modal arranca con
audio porque lleva `data-sonido="1"`. Para cambiar un video se cambia el id en
`data-yt` — hoy hay tres: el spot (`g6TEiOkjJ20`), el corte de rutas
(`cd37gVXy954`) y el vertical (`y0DMsRT2U1U`).

`hero-loop.mp4` y `counter.mp4` sí son archivos locales, porque son loops
decorativos sin sonido.

### Explorador de obras

36 tarjetas con hechos verificables del informe, filtrables por **eje** (7) y
**estado** (finalizada / en ejecución / a licitar). Cada tarjeta se arma desde
`OBRAS` en `data.js`:

```js
{ eje, estado | estados[], region, titulo, dato, unidad, detalle,
  programa?, parteDe?, rubro?, resalta? }
```

- `estados: []` para una obra que atraviesa varias etapas a la vez.
- `programa` conecta la cifra con uno de los planes de `PROGRAMAS`
  (pavimentación, repavimentación, Neuquén Habita, m² de salud), que aportan el
  total y el desglose por etapa. Sirve para que una tarjeta muestre "117 km" y
  aclare de qué plan de 1.000 km forma parte.
- `parteDe` marca que la cifra es un tramo dentro de una etapa.
- `rubro` toma el desglose de `PLAN_OBRAS` (los 9 rubros del plan 2026).

### Carrusel de las razones

Rail con scroll horizontal que se puede **arrastrar con el mouse**, mover con
las flechas ← → o con la rueda. Las flechas se deshabilitan solas en los
extremos.

### Animaciones

Reveal al entrar en viewport, contadores, barras del plan y parallax suave.
Todo tiene doble red: `IntersectionObserver` más un chequeo en scroll, así el
contenido aparece igual si el observer no dispara. Y respeta
`prefers-reduced-motion`.

## Sobre los datos

Las cifras salen del **Informe de Gestión Neuquén 2026 (V17 27/07)** y de la
presentación creativa de campaña. No hay datos inventados.

Los **retratos de las historias son generados digitalmente**: no corresponden a
personas reales, y así se aclara al pie del carrusel. Si se reemplazan por
fotos de gente real hay que sacar ese aviso y conseguir las autorizaciones.

**Pendiente:** el listado obra por obra (las 1000). Hoy el explorador muestra
los hechos verificables del informe; `PLAN_OBRAS` suma 682 obras entre los 9
rubros, y el resto llega con el plan vial. La estructura de `OBRAS` ya está
lista para recibir el dataset completo.

## Pendientes

- Logos oficiales (Provincia del Neuquén / Gobierno / NQN) — la marca es tipográfica
- Fotos reales de obras
- Mapa SVG de la provincia con las 7 regiones clicables (hoy es un selector de lista)
- Tipografía institucional (hoy Poppins, como sustituto de la geométrica de las piezas)
- Sacar la pantalla de acceso antes de publicar, o reemplazarla por la protección de Vercel
- `assets/img/razones/extra-*.jpg` son cinco retratos que no se usan: sirven si
  se suman historias nuevas, o se pueden borrar
