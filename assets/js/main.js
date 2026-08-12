/* =========================================================
   1000 días · interacciones
   ========================================================= */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nf = new Intl.NumberFormat('es-AR');

  /* ---------------- Reveal on scroll ----------------
     Doble red: IntersectionObserver + chequeo en scroll. Si el observer
     no dispara (pestañas en segundo plano, navegadores viejos), el
     contenido igual aparece. */
  document.documentElement.classList.add('js');

  const pending = new Set();

  const show = (el) => { el.classList.add('is-in'); pending.delete(el); };

  const io = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' })
    : null;

  /* Registro genérico "cuando esto sea visible, hacé esto" */
  const once = [];
  const whenVisible = (el, cb) => { once.push({ el: el, cb: cb }); };

  function checkPending() {
    const vh = window.innerHeight;
    if (pending.size) {
      Array.from(pending).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) show(el);
      });
    }
    for (let i = once.length - 1; i >= 0; i--) {
      const r = once[i].el.getBoundingClientRect();
      if (r.top < vh * 0.85 && r.bottom > 0) { once[i].cb(once[i].el); once.splice(i, 1); }
    }
  }

  function observeReveals(root) {
    $$('.reveal', root || document).forEach((el) => {
      if (el.classList.contains('is-in') || pending.has(el)) return;
      pending.add(el);
      if (io) io.observe(el);
    });
    checkPending();
  }

  /* ---------------- Nav + barra de progreso ---------------- */
  const nav = $('#nav');
  const bar = $('#progressBar');

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 80);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    parallax(y);
    checkPending();
  }

  /* ---------------- Parallax ---------------- */
  const layers = $$('[data-parallax]').map((el) => ({ el, speed: parseFloat(el.dataset.parallax), anchor: null }));

  function parallax(y) {
    if (reduce) return;
    layers.forEach((l) => {
      // Ancla: posición del elemento en el documento medida una sola vez,
      // sin desplazamiento aplicado. Así en el load el offset siempre es 0.
      if (l.anchor === null) {
        const r = l.el.getBoundingClientRect();
        l.anchor = r.top + window.scrollY + r.height / 2 - window.innerHeight / 2;
      }
      const r = l.el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > window.innerHeight + 300) return;
      const raw = (y - l.anchor) * l.speed;
      const offset = Math.max(-160, Math.min(160, raw));
      l.el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    });
  }

  window.addEventListener('resize', () => { layers.forEach((l) => { l.el.style.transform = ''; l.anchor = null; }); });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });

  /* ---------------- Marquee ----------------
     Rellenamos el track hasta cubrir el doble del ancho de la ventana y
     después lo duplicamos: así el translateX(-50%) empalma sin huecos
     por más ancha que sea la pantalla. */
  const track = $('#marqueeTrack');

  function fillMarquee() {
    const base = track.firstElementChild;
    if (!base) return;
    track.innerHTML = '';
    track.appendChild(base);

    const objetivo = Math.max(window.innerWidth * 2, 2600);
    let guard = 0;
    while (track.scrollWidth < objetivo && guard++ < 40) {
      track.appendChild(base.cloneNode(true));
    }
    // Segunda mitad idéntica para que el loop empalme.
    Array.from(track.children).forEach((g) => track.appendChild(g.cloneNode(true)));
  }
  fillMarquee();

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(fillMarquee, 200);
  });

  /* ---------------- Manifiesto ---------------- */
  const mBody = $('#manifiestoBody');
  MANIFIESTO.forEach((linea, i) => {
    const p = document.createElement('p');
    p.className = 'reveal';
    p.style.setProperty('--d', (i * 0.06) + 's');
    p.textContent = linea;
    mBody.appendChild(p);
  });

  /* ---------------- Cifras con contador ---------------- */
  const cGrid = $('#cifrasGrid');
  CIFRAS.forEach((c, i) => {
    const el = document.createElement('article');
    el.className = 'cifra cifra--' + c.color + ' reveal';
    el.style.setProperty('--d', (i * 0.05) + 's');
    el.innerHTML =
      '<span class="cifra__num" data-count="' + c.valor + '" data-suf="' + c.sufijo + '">0</span>' +
      '<h3 class="cifra__lbl">' + c.label + '</h3>' +
      '<p class="cifra__nota">' + c.nota + '</p>';
    cGrid.appendChild(el);
  });

  function countUp(el) {
    const target = parseInt(el.dataset.count, 10);
    const suf = el.dataset.suf || '';
    if (reduce) { el.textContent = nf.format(target) + suf; return; }
    const dur = 1500;
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = nf.format(Math.round(target * eased)) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  $$('[data-count]').forEach((el) => whenVisible(el, countUp));

  /* ---------------- Explorador de obras ---------------- */
  const state = { eje: 'todos', estado: 'todos' };
  const chipsEje = $('#chipsEje');
  const chipsEstado = $('#chipsEstado');
  const grid = $('#obrasGrid');
  const vacio = $('#vacio');
  const contador = $('#contadorObras');
  const limpiar = $('#limpiar');

  function chip(label, value, group, color) {
    const b = document.createElement('button');
    b.className = 'chip' + (value === 'todos' ? ' is-on' : '');
    b.textContent = label;
    b.dataset.value = value;
    b.dataset.group = group;
    if (color) b.dataset.color = color;
    b.setAttribute('aria-pressed', value === 'todos' ? 'true' : 'false');
    return b;
  }

  chipsEje.appendChild(chip('Todos', 'todos', 'eje'));
  EJES.forEach((e) => chipsEje.appendChild(chip(e.nombre, e.id, 'eje', e.color)));
  chipsEstado.appendChild(chip('Todos', 'todos', 'estado'));
  ESTADOS.forEach((e) => chipsEstado.appendChild(chip(e.nombre, e.id, 'estado', e.color)));

  function setFilter(group, value) {
    state[group] = value;
    const cont = group === 'eje' ? chipsEje : chipsEstado;
    $$('.chip', cont).forEach((c) => {
      const on = c.dataset.value === value;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    render();
  }

  document.addEventListener('click', (ev) => {
    const c = ev.target.closest('.chip');
    if (c) setFilter(c.dataset.group, c.dataset.value);
  });

  limpiar.addEventListener('click', () => { setFilter('eje', 'todos'); setFilter('estado', 'todos'); });

  const nombreEje = (id) => (EJES.find((e) => e.id === id) || {}).nombre || '';
  const colorEje  = (id) => (EJES.find((e) => e.id === id) || {}).color || 'teal';
  const nombreEstado = (id) => (ESTADOS.find((e) => e.id === id) || {}).nombre || '';
  const nombreRegion = (id) => (REGIONES.find((r) => r.id === id) || {}).nombre || '';

  /* Contexto de la tarjeta: a qué plan pertenece la cifra y cuánto
     representa dentro de ese total. Sin esto, "56 km" o "141 km"
     quedan sueltos y pierden el sentido que tienen en el informe. */
  const ORDEN_ESTADOS = ['finalizada', 'ejecucion', 'licitar'];
  // Género de la unidad, para que el texto concuerde: "los 403 km en
  // ejecución", "las 3.296 soluciones finalizadas".
  const FEMENINO = { obras: true, soluciones: true };
  const art = (u) => (FEMENINO[u] ? 'las' : 'los');
  const etiquetaEstado = (id, u) => {
    if (id === 'finalizada') return FEMENINO[u] ? 'finalizadas' : 'finalizados';
    return nombreEstado(id).charAt(0).toLowerCase() + nombreEstado(id).slice(1);
  };

  function contextoObra(o) {
    if (o.programa && PROGRAMAS[o.programa]) {
      const p = PROGRAMAS[o.programa];
      // Tarjeta de plan completo: la etapa que se resalta es la que el
      // usuario tenga filtrada; sin filtro, se muestran las tres.
      const esPlan = !!o.estados;
      const resalta = esPlan
        ? (state.estado !== 'todos' ? state.estado : null)
        : (o.parteDe || o.estado);
      return {
        titulo: esPlan ? 'Avance del plan' : p.nombre,
        plan: esPlan ? p.plan : p.nombre + ' · ' + p.plan,
        total: p.total, unidad: p.unidad,
        partes: p.partes, resalta: resalta, dentroDe: o.parteDe || null,
        propio: o.parteDe ? o.dato : null, nota: p.nota, esPlan: esPlan
      };
    }
    if (o.rubro) {
      const r = PLAN_OBRAS.find((x) => x.rubro === o.rubro);
      if (!r) return null;
      return {
        titulo: r.rubro, plan: 'Plan de Obras Neuquén 2026', total: r.total, unidad: 'obras',
        partes: { finalizada: r.finalizada, ejecucion: r.ejecucion, licitar: r.licitar },
        resalta: o.resalta || null, dentroDe: null, propio: null, nota: ''
      };
    }
    return null;
  }

  function ctxHTML(o) {
    const c = contextoObra(o);
    if (!c) return '';

    const segs = ORDEN_ESTADOS.map((id) => {
      const v = c.partes[id] || 0;
      const on = !c.resalta || c.resalta === id;
      return '<span class="obra__seg obra__seg--' + id + (on ? ' is-on' : '') + '"' +
             ' style="width:' + (v / c.total * 100).toFixed(2) + '%"' +
             ' title="' + nf.format(v) + ' ' + c.unidad + ' ' + etiquetaEstado(id, c.unidad) + '"></span>';
    }).join('');

    const detalle = ORDEN_ESTADOS
      .filter((id) => (c.partes[id] || 0) > 0)
      .map((id) => nf.format(c.partes[id]) + ' ' + etiquetaEstado(id, c.unidad))
      .join(' · ');

    let lead;
    if (c.dentroDe) {
      lead = '<strong>' + c.propio + ' ' + c.unidad + '</strong> dentro de ' + art(c.unidad) + ' ' +
             nf.format(c.partes[c.dentroDe]) + ' ' + c.unidad + ' ' + etiquetaEstado(c.dentroDe, c.unidad);
    } else if (c.esPlan) {
      const id = c.resalta || 'finalizada';
      lead = '<strong>' + nf.format(c.partes[id]) + ' de ' + nf.format(c.total) + ' ' + c.unidad + '</strong> ' +
             etiquetaEstado(id, c.unidad);
    } else if (c.resalta) {
      lead = '<strong>' + nf.format(c.partes[c.resalta]) + '</strong> de ' + nf.format(c.total) + ' ' + c.unidad;
    } else {
      lead = '<strong>' + nf.format(c.total) + ' ' + c.unidad + '</strong> en total';
    }

    return '<div class="obra__ctx">' +
        '<p class="obra__ctxtit">' + c.titulo +
          (c.esPlan ? '' : ' · ' + nf.format(c.total) + ' ' + c.unidad) +
          (c.plan ? '<span>' + c.plan + '</span>' : '') + '</p>' +
        '<div class="obra__bar" role="img" aria-label="' + detalle + ' sobre ' + nf.format(c.total) + ' ' + c.unidad + '">' + segs + '</div>' +
        '<p class="obra__ctxtxt">' + lead + '</p>' +
        '<p class="obra__ctxdet">' + detalle + (c.nota ? ' · ' + c.nota : '') + '</p>' +
      '</div>';
  }

  // Una tarjeta de plan abarca las tres etapas: aparece con cualquier
  // filtro de estado y muestra resaltada la que se esté mirando.
  const estadosDe = (o) => o.estados || [o.estado];

  function render() {
    const list = OBRAS.filter((o) =>
      (state.eje === 'todos' || o.eje === state.eje) &&
      (state.estado === 'todos' || estadosDe(o).indexOf(state.estado) !== -1)
    );

    grid.innerHTML = '';
    list.forEach((o, i) => {
      const el = document.createElement('article');
      el.className = 'obra obra--' + colorEje(o.eje) + (o.estados ? ' obra--plan' : '');
      el.style.animationDelay = Math.min(i * 0.035, 0.4) + 's';
      el.innerHTML =
        '<div class="obra__top">' +
          '<span class="obra__eje">' + nombreEje(o.eje) + '</span>' +
          (o.estados
            ? '<span class="obra__estado est--plan">Plan completo</span>'
            : '<span class="obra__estado est--' + o.estado + '">' + nombreEstado(o.estado) + '</span>') +
        '</div>' +
        '<p class="obra__dato">' + o.dato + '<small>' + o.unidad + '</small></p>' +
        '<h3 class="obra__titulo">' + o.titulo + '</h3>' +
        '<p class="obra__detalle">' + o.detalle + '</p>' +
        ctxHTML(o) +
        (o.region ? '<span class="obra__region">' + nombreRegion(o.region) + '</span>' : '');
      grid.appendChild(el);
    });

    contador.textContent = list.length;
    vacio.hidden = list.length !== 0;
    limpiar.hidden = state.eje === 'todos' && state.estado === 'todos';
  }
  render();

  /* ---------------- Plan de obras: barras ---------------- */
  const planList = $('#planList');
  PLAN_OBRAS.forEach((r) => {
    const row = document.createElement('div');
    row.className = 'plan__row';
    row.innerHTML =
      '<span class="plan__rubro">' + r.rubro + '</span>' +
      '<div class="plan__bar">' +
        '<span class="plan__seg plan__seg--finalizada" data-w="' + (r.finalizada / r.total * 100) + '" title="' + r.finalizada + ' finalizadas"></span>' +
        '<span class="plan__seg plan__seg--ejecucion"  data-w="' + (r.ejecucion  / r.total * 100) + '" title="' + r.ejecucion  + ' en ejecución"></span>' +
        '<span class="plan__seg plan__seg--licitar"    data-w="' + (r.licitar    / r.total * 100) + '" title="' + r.licitar    + ' a licitar"></span>' +
      '</div>' +
      '<span class="plan__total">' + r.total + '</span>';
    planList.appendChild(row);
  });

  $$('.plan__row').forEach((row) => whenVisible(row, (r) => {
    $$('.plan__seg', r).forEach((s, i) => {
      setTimeout(() => { s.style.width = s.dataset.w + '%'; }, i * 90);
    });
  }));

  /* ---------------- Regiones ---------------- */
  const rList = $('#regionesList');
  const rPanel = $('#regionesPanel');

  REGIONES.forEach((r, i) => {
    const b = document.createElement('button');
    b.className = 'region-btn' + (i === 0 ? ' is-on' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.dataset.id = r.id;
    b.innerHTML = '<span>' + r.nombre + '</span><span class="region-btn__n">0' + (i + 1) + '</span>';
    b.addEventListener('click', () => selectRegion(r.id));
    rList.appendChild(b);
  });

  function selectRegion(id) {
    const r = REGIONES.find((x) => x.id === id);
    $$('.region-btn', rList).forEach((b) => {
      const on = b.dataset.id === id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
    });

    const obrasRegion = OBRAS.filter((o) => o.region === id);

    rPanel.innerHTML =
      '<h3 class="panel__nombre">' + r.nombre + '</h3>' +
      '<p class="panel__hito">' + r.hito + '</p>' +
      '<p class="panel__sub">Localidades</p>' +
      '<div class="panel__locs">' + r.localidades.map((l) => '<span class="loc">' + l + '</span>').join('') + '</div>' +
      (obrasRegion.length
        ? '<p class="panel__sub">Obras destacadas</p><div class="panel__obras">' +
            obrasRegion.map((o) => '<div class="panel__obra"><i></i><span><strong>' + o.titulo + '</strong> — ' + o.detalle + '</span></div>').join('') +
          '</div>'
        : '');
    rPanel.style.animation = 'none';
    void rPanel.offsetWidth;
    rPanel.style.animation = 'pop .5s cubic-bezier(.22,.9,.28,1)';
  }
  selectRegion(REGIONES[0].id);

  /* ---------------- Antes / Después ---------------- */
  const camGrid = $('#cambiosGrid');
  CAMBIOS.forEach((c, i) => {
    const el = document.createElement('article');
    el.className = 'cambio reveal';
    el.style.setProperty('--d', (i * 0.05) + 's');
    el.innerHTML =
      '<h3 class="cambio__tit">' + c.titulo + '</h3>' +
      '<div class="cambio__vs">' +
        (c.antes && c.antes !== '—'
          ? '<div class="cambio__antes"><span class="cambio__k">Antes</span><span class="cambio__v">' + c.antes + '</span></div>' +
            '<span class="cambio__arrow" aria-hidden="true">→</span>'
          : '') +
        '<div class="cambio__despues"><span class="cambio__k">Hoy</span><span class="cambio__v">' + c.despues + '</span></div>' +
      '</div>' +
      '<div class="cambio__track"><span class="cambio__fill" data-w="' + c.pct + '"></span></div>' +
      '<p class="cambio__nota">' + c.nota + '</p>';
    camGrid.appendChild(el);
  });

  $$('.cambio__fill').forEach((f) => whenVisible(f, (el) => { el.style.width = el.dataset.w + '%'; }));

  /* ---------------- Contexto ---------------- */
  const ctxGrid = $('#contextoGrid');
  CONTEXTO.forEach((c, i) => {
    const el = document.createElement('article');
    el.className = 'ctx reveal';
    el.style.setProperty('--d', (i * 0.05) + 's');
    el.innerHTML =
      '<p class="ctx__dato">' + c.dato + '</p>' +
      '<h3 class="ctx__lbl">' + c.label + '</h3>' +
      '<p class="ctx__nota">' + c.nota + '</p>';
    ctxGrid.appendChild(el);
  });

  /* ---------------- Mil razones ---------------- */
  const rail = $('#razonesRail');
  RAZONES.forEach((r, i) => {
    const el = document.createElement('article');
    el.className = 'razon reveal';
    el.style.setProperty('--d', (i * 0.05) + 's');
    // El retrato tapa la inicial dentro del mismo círculo. Si la imagen
    // falta o falla, se quita sola y queda la letra: la tarjeta nunca
    // muestra un ícono roto. Decorativo: el nombre va escrito debajo.
    el.innerHTML =
      '<span class="razon__av" aria-hidden="true">' +
        r.nombre.replace('Don ', '').charAt(0) +
        (r.foto
          ? '<img class="razon__foto" src="' + r.foto + '" alt="" loading="lazy" ' +
            'decoding="async" width="54" height="54" onerror="this.remove()">'
          : '') +
      '</span>' +
      '<h3 class="razon__nombre">' + r.nombre + '</h3>' +
      '<p class="razon__meta">' + r.edad + ' · ' + r.lugar + '</p>' +
      '<p class="razon__frase">' + r.frase + '</p>' +
      '<p class="razon__razon">' + r.razon + '</p>';
    rail.appendChild(el);
  });

  /* ---------------- Carrusel: arrastre y flechas ---------------- */
  const prevBtn = $('#razonesPrev');
  const nextBtn = $('#razonesNext');

  function pasoRail() {
    const card = rail.querySelector('.razon');
    if (!card) return 340;
    const gap = parseFloat(getComputedStyle(rail).gap) || 18;
    return card.getBoundingClientRect().width + gap;
  }

  function actualizarFlechas() {
    const max = rail.scrollWidth - rail.clientWidth;
    prevBtn.disabled = rail.scrollLeft <= 2;
    nextBtn.disabled = rail.scrollLeft >= max - 2;
  }

  prevBtn.addEventListener('click', () => { rail.scrollLeft -= pasoRail(); });
  nextBtn.addEventListener('click', () => { rail.scrollLeft += pasoRail(); });
  rail.addEventListener('scroll', actualizarFlechas, { passive: true });
  actualizarFlechas();

  // Arrastre con mouse/lápiz. En touch dejamos el scroll nativo.
  let arrastrando = false, xInicial = 0, scrollInicial = 0, movido = 0;

  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    arrastrando = true;
    movido = 0;
    xInicial = e.clientX;
    scrollInicial = rail.scrollLeft;
    rail.classList.add('is-dragging');
    rail.setPointerCapture(e.pointerId);
  });

  rail.addEventListener('pointermove', (e) => {
    if (!arrastrando) return;
    const delta = e.clientX - xInicial;
    movido = Math.abs(delta);
    rail.scrollLeft = scrollInicial - delta;
  });

  function soltar(e) {
    if (!arrastrando) return;
    arrastrando = false;
    rail.classList.remove('is-dragging');
    if (e.pointerId != null && rail.hasPointerCapture(e.pointerId)) {
      rail.releasePointerCapture(e.pointerId);
    }
  }
  rail.addEventListener('pointerup', soltar);
  rail.addEventListener('pointercancel', soltar);
  rail.addEventListener('pointerleave', soltar);
  // Un arrastre no debe dispararse como clic.
  rail.addEventListener('click', (e) => { if (movido > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

  // Rueda vertical → desplazamiento horizontal dentro del riel.
  rail.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const puede = (e.deltaY > 0 && rail.scrollLeft < max - 2) || (e.deltaY < 0 && rail.scrollLeft > 2);
    if (!puede) return;
    e.preventDefault();
    rail.scrollLeft += e.deltaY;
  }, { passive: false });

  /* ---------------- Reproductores de YouTube con UI propia ----------------
     Cargamos el iframe con controls=0 y montamos encima nuestros propios
     controles, para que el reproductor no traiga la interfaz de YouTube.
     Los de la página arrancan en mute (única forma de que el navegador
     permita el autoplay) y el usuario decide si activa el sonido. */
  const SVG = {
    play:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.4v14H7zm6.6 0H17v14h-3.4z"/></svg>',
    on:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.6L12 5.6v12.8L7.6 14.5H4zm11.4-.8a4.4 4.4 0 0 1 0 6.6l-1.2-1.3a2.7 2.7 0 0 0 0-4zM17.6 6a7.4 7.4 0 0 1 0 12l-1.2-1.3a5.7 5.7 0 0 0 0-9.4z"/></svg>',
    off:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.6L12 5.6v12.8L7.6 14.5H4zm11 .1 1.3-1.3 2 2 2-2 1.3 1.3-2 2 2 2-1.3 1.3-2-2-2 2-1.3-1.3 2-2z"/></svg>',
    full:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5v2H6v3zm11-5h5v5h-2V6h-3zM4 15h2v3h3v2H4zm14 0h2v5h-5v-2h3z"/></svg>'
  };

  let apiPedida = false, apiLista = false;
  const enCola = [];

  function cuandoYT(cb) {
    if (apiLista) return cb();
    enCola.push(cb);
    if (apiPedida) return;
    apiPedida = true;
    window.onYouTubeIframeAPIReady = function () {
      apiLista = true;
      enCola.splice(0).forEach((f) => f());
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  const mmss = (s) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  };

  let nPlayer = 0;

  function montarPlayer(cont) {
    const videoId = cont.dataset.yt;
    const conSonido = cont.dataset.sonido === '1';   // el modal arranca con audio
    const uid = 'yt-' + (++nPlayer);

    cont.innerHTML =
      '<div class="player__frame"><div id="' + uid + '"></div></div>' +
      '<button class="player__big" type="button" aria-label="Reproducir">' + SVG.play + '</button>' +
      '<div class="player__ui">' +
        '<button class="pbtn" type="button" data-act="play" aria-label="Pausar">' + SVG.pause + '</button>' +
        '<div class="player__track" data-act="seek" role="slider" tabindex="0" aria-label="Progreso del video"' +
             ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="player__fill"></span></div>' +
        '<span class="player__time">0:00</span>' +
        '<button class="pbtn" type="button" data-act="mute" aria-label="Activar sonido">' + SVG.off + '</button>' +
        '<button class="pbtn" type="button" data-act="full" aria-label="Pantalla completa">' + SVG.full + '</button>' +
      '</div>' +
      (conSonido ? '' : '<button class="player__sonido" type="button">' + SVG.on + ' Activar sonido</button>');

    const frame  = $('.player__frame', cont);
    const big    = $('.player__big', cont);
    const bPlay  = $('[data-act="play"]', cont);
    const bMute  = $('[data-act="mute"]', cont);
    const track  = $('.player__track', cont);
    const fill   = $('.player__fill', cont);
    const tiempo = $('.player__time', cont);
    const pill   = $('.player__sonido', cont);

    let yt = null, timer = null, pausadoAMano = false;
    // Estado propio: isMuted() del iframe tarda en reflejar el cambio.
    let muteado = !conSonido;

    const estaMuteado = () => muteado;

    function pintarSonido() {
      const m = estaMuteado();
      bMute.innerHTML = m ? SVG.off : SVG.on;
      bMute.setAttribute('aria-label', m ? 'Activar sonido' : 'Silenciar');
      cont.classList.toggle('has-audio', !m);
    }

    function pintarTiempo() {
      if (!yt || !yt.getDuration) return;
      const d = yt.getDuration() || 0;
      const t = yt.getCurrentTime() || 0;
      const p = d ? (t / d) * 100 : 0;
      fill.style.width = p + '%';
      track.setAttribute('aria-valuenow', Math.round(p));
      tiempo.textContent = mmss(t) + ' / ' + mmss(d);
    }

    function correr(on) {
      clearInterval(timer);
      if (on) timer = setInterval(pintarTiempo, 250);
    }

    cuandoYT(() => {
      yt = new YT.Player(uid, {
        videoId: videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1,
          rel: 0, playsinline: 1, iv_load_policy: 3,
          loop: conSonido ? 0 : 1, playlist: videoId
        },
        events: {
          onReady: function () {
            if (conSonido) { yt.unMute(); } else { yt.mute(); }
            pintarSonido();
            pintarTiempo();
            cont.classList.add('is-ready');
            if (!conSonido && !reduce) verSiSeVe();
          },
          onStateChange: function (e) {
            const yendo = e.data === YT.PlayerState.PLAYING;
            cont.classList.toggle('is-playing', yendo);
            bPlay.innerHTML = yendo ? SVG.pause : SVG.play;
            bPlay.setAttribute('aria-label', yendo ? 'Pausar' : 'Reproducir');
            correr(yendo);
            pintarTiempo();
          }
        }
      });
    });

    /* Reproducción según visibilidad: arranca cuando entra en pantalla y
       se detiene al salir, salvo que el usuario lo haya pausado a mano. */
    function verSiSeVe() {
      if (!yt || !yt.getPlayerState) return;
      const r = cont.getBoundingClientRect();
      const visible = r.top < window.innerHeight * 0.75 && r.bottom > window.innerHeight * 0.25;
      const estado = yt.getPlayerState();
      if (visible && !pausadoAMano && estado !== YT.PlayerState.PLAYING) yt.playVideo();
      if (!visible && estado === YT.PlayerState.PLAYING) yt.pauseVideo();
    }
    if (!conSonido) window.addEventListener('scroll', verSiSeVe, { passive: true });

    function alternar() {
      if (!yt || !yt.getPlayerState) return;
      if (yt.getPlayerState() === YT.PlayerState.PLAYING) { pausadoAMano = true; yt.pauseVideo(); }
      else { pausadoAMano = false; yt.playVideo(); }
    }

    frame.addEventListener('click', alternar);
    big.addEventListener('click', alternar);
    bPlay.addEventListener('click', alternar);

    function sonido() {
      if (!yt) return;
      if (muteado) { yt.unMute(); yt.setVolume(100); muteado = false; }
      else { yt.mute(); muteado = true; }
      pintarSonido();
    }
    bMute.addEventListener('click', sonido);
    if (pill) pill.addEventListener('click', () => { sonido(); if (yt) yt.playVideo(); });

    $('[data-act="full"]', cont).addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (cont.requestFullscreen) cont.requestFullscreen();
    });

    function buscar(clientX) {
      if (!yt || !yt.getDuration) return;
      const r = track.getBoundingClientRect();
      const p = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
      yt.seekTo(p * yt.getDuration(), true);
      pintarTiempo();
    }
    track.addEventListener('click', (e) => { e.stopPropagation(); buscar(e.clientX); });
    track.addEventListener('keydown', (e) => {
      if (!yt || !yt.getCurrentTime) return;
      if (e.key === 'ArrowRight') { yt.seekTo(yt.getCurrentTime() + 5, true); pintarTiempo(); }
      if (e.key === 'ArrowLeft')  { yt.seekTo(Math.max(0, yt.getCurrentTime() - 5), true); pintarTiempo(); }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); alternar(); }
    });

    return {
      play:  () => { pausadoAMano = false; if (yt && yt.playVideo) yt.playVideo(); },
      pause: (aMano) => { if (aMano) pausadoAMano = true; if (yt && yt.pauseVideo) yt.pauseVideo(); }
    };
  }

  const players = {};
  $$('.player[data-yt]').forEach((cont) => { players[cont.id || cont.dataset.yt] = montarPlayer(cont); });

  /* ---------------- Modal del spot ---------------- */
  const modal = $('#modalSpot');
  const spot = players.playerModal;

  function openSpot() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    // Nada de dos audios a la vez: los de la página se detienen.
    Object.keys(players).forEach((k) => { if (k !== 'playerModal') players[k].pause(true); });
    if (spot) spot.play();
  }
  function closeSpot() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (spot) spot.pause();
  }

  $$('[data-open-spot]').forEach((b) => b.addEventListener('click', openSpot));
  $('#modalClose').addEventListener('click', closeSpot);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeSpot(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeSpot(); });

  /* ---------------- Init ---------------- */
  observeReveals();
  onScroll();
  window.addEventListener('load', () => { observeReveals(); onScroll(); });
  setTimeout(checkPending, 400);
})();
