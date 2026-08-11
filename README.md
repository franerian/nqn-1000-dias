# 1000 días · 1000 obras · 1000 razones

Landing de campaña — versión local para validar contenido y diseño.

## Cómo verla

```bash
python3 -m http.server 4321 --directory web
```

Y abrir http://localhost:4321

## Estructura

```
web/
├── index.html
└── assets/
    ├── css/style.css      Sistema visual completo
    ├── js/data.js         TODO el contenido (textos y cifras)
    ├── js/main.js         Interacciones, scroll, filtros
    ├── video/
    │   ├── hero-loop.mp4        4 MB · muteado, en loop, sin subtítulos (crop 72%)
    │   └── spot-1000-dias.mp4   13 MB · spot completo con audio (modal)
    └── img/hero-poster.jpg
```

**Para editar contenido no hace falta tocar HTML ni CSS: todo está en `assets/js/data.js`.**

## Secciones

1. **Hero** — video en loop + los tres "mil"
2. **Manifiesto** — el texto de campaña, revelado línea por línea
3. **Las cifras** — 7 contadores animados del hito
4. **Explorar obras** — filtros por eje (7) y estado (3) + Plan de Obras 2026 por rubro
5. **7 regiones** — panel interactivo con localidades y obras destacadas
6. **Antes / después** — lo que encontramos → lo que hicimos
7. **Contexto económico** — PBG, empleo, exportaciones
8. **Mil razones** — carrusel con las historias (Rosa, Camila, Marta, Nelson, Ayelén, Don Ernesto, Marcos)
9. **Cierre** — firma "Neuquén no para"

## Sobre los datos

Todas las cifras salen del **Informe de Gestión Neuquén 2026 (V17 27/07)** y de la
presentación creativa. No hay datos inventados.

**Pendiente:** el listado obra por obra (las 1000). Hoy el explorador muestra 43 tarjetas
con los hechos verificables del informe. La estructura de `OBRAS` en `data.js` ya está
lista para recibir el dataset completo — cada obra necesita: `eje`, `estado`, `region`,
`titulo`, `dato`, `unidad`, `detalle`.

## Pendientes de diseño

- Logos oficiales (Provincia del Neuquén / Gobierno / NQN) — hoy la marca es tipográfica
- Fotos reales de obras y de los protagonistas de las historias
- Mapa SVG de la provincia con las 7 regiones clicables (hoy es un selector de lista)
- Tipografía institucional (hoy usa Poppins como sustituto de la geométrica de las piezas)
