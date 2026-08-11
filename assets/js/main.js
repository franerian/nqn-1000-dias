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

  function render() {
    const list = OBRAS.filter((o) =>
      (state.eje === 'todos' || o.eje === state.eje) &&
      (state.estado === 'todos' || o.estado === state.estado)
    );

    grid.innerHTML = '';
    list.forEach((o, i) => {
      const el = document.createElement('article');
      el.className = 'obra obra--' + colorEje(o.eje);
      el.style.animationDelay = Math.min(i * 0.035, 0.4) + 's';
      el.innerHTML =
        '<div class="obra__top">' +
          '<span class="obra__eje">' + nombreEje(o.eje) + '</span>' +
          '<span class="obra__estado est--' + o.estado + '">' + nombreEstado(o.estado) + '</span>' +
        '</div>' +
        '<p class="obra__dato">' + o.dato + '<small>' + o.unidad + '</small></p>' +
        '<h3 class="obra__titulo">' + o.titulo + '</h3>' +
        '<p class="obra__detalle">' + o.detalle + '</p>' +
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
    el.innerHTML =
      '<span class="razon__ini" aria-hidden="true">' + r.nombre.replace('Don ', '').charAt(0) + '</span>' +
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

  /* ---------------- Modal del spot ---------------- */
  const modal = $('#modalSpot');
  const video = $('#spotVideo');

  function openSpot() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    video.play().catch(() => {});
  }
  function closeSpot() {
    modal.hidden = true;
    document.body.style.overflow = '';
    video.pause();
  }

  // Si el archivo del spot no está en el deploy, avisamos en vez de
  // dejar un reproductor negro.
  video.addEventListener('error', () => {
    const box = video.parentNode;
    if (box.querySelector('.modal__falta')) return;
    const aviso = document.createElement('p');
    aviso.className = 'modal__falta';
    aviso.textContent = 'El spot todavía no está cargado en este deploy.';
    box.appendChild(aviso);
  });

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
