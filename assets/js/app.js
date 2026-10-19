/* =========================================================================
   Au Buron — pages, fiches et commande
   Transitions entre pages, horaires, fiches fromages, recettes et click & collect.
   Les données viennent de assets/js/data.js.
   ========================================================================= */
(() => {
  'use strict';

  const D = window.LB_DATA;
  if (!D) return;

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AST = '<svg class="ast" aria-hidden="true"><use href="#ast"/></svg>';
  const ARROW = '<svg class="icon-arrow" aria-hidden="true"><use href="#arrow"/></svg>';

  const cheeseById = Object.fromEntries(D.cheeses.map((c) => [c.id, c]));
  const recipeById = Object.fromEntries(D.recipes.map((r) => [r.id, r]));

  const esc = (str) => String(str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const euro = (n) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  const euroKg = (n) => `${n.toLocaleString('fr-FR')} € / kg`;
  const grams = (g) => (g >= 1000 ? `${(Math.round(g / 100) / 10).toLocaleString('fr-FR')} kg` : `${Math.round(g)} g`);
  const storage = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* stockage indisponible */ } },
  };

  /* ---------- Illustration d’un fromage ---------- */
  const artSvg = (c, cls = '') => {
    const vars = c.colors ? Object.entries(c.colors).map(([k, v]) => `--${k}:${v}`).join(';') : '';
    return `<svg class="${cls}" viewBox="0 0 240 180" aria-hidden="true" style="${vars}"><use class="cheese-card__wheel" href="#${c.art}-wheel"/><use class="cheese-card__part" href="#${c.art}-part"/></svg>`;
  };
  const photo = (name, alt, cls = '', sizes = '(max-width: 900px) 100vw, 50vw') =>
    `<img class="${cls}" src="assets/photos/${name}.jpg" srcset="assets/photos/${name}-s.jpg 640w, assets/photos/${name}.jpg 1400w" sizes="${sizes}" alt="${esc(alt)}" loading="lazy" decoding="async">`;

  /* =======================================================================
     Transitions entre les pages
     ======================================================================= */
  const curtain = $('.curtain');
  const curtainTitle = $('[data-curtain-title]');
  const PAGE_NAMES = { 'index.html': 'Au Buron', 'fromages.html': 'Nos fromages', 'recettes.html': 'Recettes', 'commande.html': 'Click & collect' };
  const pageOf = (url) => (url.pathname.split('/').pop() || 'index.html');
  const samePage = (url) => url.origin === location.origin && pageOf(url) === pageOf(location) && url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');

  const scrollToHash = (hash) => {
    const target = hash && hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    const lenis = window.LB && window.LB.lenis;
    if (lenis) lenis.scrollTo(target || 0, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const leave = (url, label) => {
    if (!curtain || reduceMotion) { location.href = url.href; return; }
    if (curtainTitle) curtainTitle.textContent = label || PAGE_NAMES[pageOf(url)] || 'Au Buron';
    root.classList.remove('is-arriving', 'curtain-out');
    root.classList.add('curtain-in');
    try { sessionStorage.setItem('lb-curtain', curtainTitle ? curtainTitle.textContent : '1'); } catch (e) { /* rien */ }
    setTimeout(() => { location.href = url.href; }, 950);
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || /^(mailto|tel|sms):/i.test(href)) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    if (root.classList.contains('menu-open')) $('.nav__burger') && $('.nav__burger').click();
    if (samePage(url)) {
      if (url.search !== location.search) { leave(url); return; }
      history.replaceState(null, '', url.hash || location.pathname);
      scrollToHash(url.hash);
      return;
    }
    leave(url, link.dataset.curtain);
  });

  const arrive = () => {
    if (!root.classList.contains('is-arriving')) return;
    try { sessionStorage.removeItem('lb-curtain'); } catch (e) { /* rien */ }
    requestAnimationFrame(() => {
      root.classList.add('curtain-out');
      setTimeout(() => root.classList.remove('is-arriving', 'curtain-out'), 1300);
    });
  };
  // le DOM est prêt (script différé) : on lève le rideau dès que les polices sont là
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 600))]).then(arrive);
  // retour arrière depuis le cache du navigateur : on retire le rideau
  window.addEventListener('pageshow', (e) => { if (e.persisted) root.classList.remove('curtain-in', 'is-arriving', 'curtain-out'); });

  /* =======================================================================
     Retours au clic : le bouton s’enfonce puis rebondit, une onde et des
     éclats (trous de fromage, pastilles, astérisques) jaillissent du clic
     ======================================================================= */
  const CLICKABLE = 'button, .btn, .arrow-link, .link, .pill, .chip, .check, .tab, .filter, .cave-card, .recipe-tile, .cheese-card, .nav__logo, .menu a';
  const BIT_COLORS = ['var(--mustard)', 'var(--green)', 'var(--lime)', 'var(--ink)', '#f3a76b'];
  const rand = (a, b) => a + Math.random() * (b - a);
  const canAnimate = !reduceMotion && typeof Element.prototype.animate === 'function';

  const fxLayer = (host) => {
    const layer = document.createElement('div');
    layer.className = 'fx-layer';
    layer.setAttribute('aria-hidden', 'true');
    host.appendChild(layer);
    // dans une fenêtre <dialog>, le calque peut être décalé : on compense
    const r = layer.getBoundingClientRect();
    return { layer, dx: -r.left, dy: -r.top };
  };

  const burst = (el, x, y) => {
    const strong = el.matches('.btn--primary, [data-add], [type="submit"]');
    const { layer, dx, dy } = fxLayer(el.closest('dialog[open]') || document.body);
    const px = x + dx;
    const py = y + dy;
    const box = el.getBoundingClientRect();

    const ring = document.createElement('span');
    ring.className = 'fx-ring';
    const size = Math.min(260, Math.max(70, box.width * 0.9));
    Object.assign(ring.style, { left: `${px}px`, top: `${py}px`, width: `${size}px`, height: `${size}px` });
    layer.appendChild(ring);
    ring.animate([
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.9, borderWidth: '6px' },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 0, borderWidth: '1px' },
    ], { duration: 650, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' });

    const count = strong ? 16 : 10;
    for (let i = 0; i < count; i++) {
      const kind = ['dot', 'hole', 'ast'][i % 3];
      const bit = document.createElement('span');
      bit.className = `fx-bit fx-bit--${kind}`;
      if (kind === 'ast') bit.innerHTML = AST;
      const s = kind === 'ast' ? rand(12, 18) : rand(6, 13);
      Object.assign(bit.style, { left: `${px}px`, top: `${py}px`, width: `${s}px`, height: `${s}px`, color: BIT_COLORS[i % BIT_COLORS.length] });
      layer.appendChild(bit);
      const angle = (i / count) * Math.PI * 2 + rand(-0.3, 0.3);
      const dist = strong ? rand(70, 150) : rand(40, 95);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const rot = rand(-260, 260);
      bit.animate([
        { transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)', opacity: 1, easing: 'cubic-bezier(.15, .85, .3, 1)' },
        { transform: `translate(calc(-50% + ${tx * 0.8}px), calc(-50% + ${ty * 0.8}px)) scale(1.15) rotate(${rot * 0.6}deg)`, opacity: 1, offset: 0.4, easing: 'cubic-bezier(.5, 0, .75, 0)' },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty + 34}px)) scale(0) rotate(${rot}deg)`, opacity: 0.6 },
      ], { duration: rand(750, 1050), fill: 'forwards' });
    }
    setTimeout(() => layer.remove(), 1200);
  };

  if (canAnimate) {
    let pressed = null;
    let pressAnim = null;
    const release = () => {
      if (!pressed) return;
      const el = pressed;
      pressed = null;
      pressAnim.cancel();
      el.animate([{ scale: 0.92 }, { scale: 1.06 }, { scale: 0.98 }, { scale: 1 }], { duration: 520, easing: 'ease-out' });
    };
    document.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const el = e.target.closest(CLICKABLE);
      if (!el || el.disabled) return;
      if (pressed) release();
      pressed = el;
      pressAnim = el.animate([{ scale: 1 }, { scale: 0.92 }], { duration: 140, easing: 'ease-out', fill: 'forwards' });
    });
    ['pointerup', 'pointercancel'].forEach((t) => document.addEventListener(t, release));

    let last = { el: null, t: 0 };
    document.addEventListener('click', (e) => {
      const el = e.target.closest(CLICKABLE);
      if (!el || el.disabled) return;
      // un clic sur un <label> déclenche aussi un clic sur sa case : un seul éclat
      const now = performance.now();
      if (last.el === el && now - last.t < 120) return;
      last = { el, t: now };
      let { clientX: x, clientY: y } = e;
      if (!e.detail || (!x && !y)) { // clavier : depuis le centre de l’élément
        const r = el.getBoundingClientRect();
        x = r.left + r.width / 2; y = r.top + r.height / 2;
      }
      burst(el, x, y);
    }, true);
  }

  /* =======================================================================
     Horaires : statut en direct et panneau
     ======================================================================= */
  const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + (m || 0); };
  const fmtTime = (min) => { const h = Math.floor(min / 60); const m = min % 60; return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`; };
  const schedule = Object.fromEntries(Object.entries(D.shop.hours).map(([day, ranges]) => [day, ranges.map((r) => r.split('-').map(toMin))]));

  const parisNow = () => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const get = (type) => (parts.find((p) => p.type === type) || {}).value;
    return { day: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')], minutes: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
  };
  const status = () => {
    const { day, minutes } = parisNow();
    const today = schedule[day] || [];
    const current = today.find(([a, b]) => minutes >= a && minutes < b);
    if (current) return { open: true, text: `Ouvert · jusqu’à ${fmtTime(current[1])}`, day };
    const later = today.find(([a]) => a > minutes);
    if (later) return { open: false, text: `Fermé · réouverture à ${fmtTime(later[0])}`, day };
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if ((schedule[d] || []).length) return { open: false, text: `Fermé · ouvre ${i === 1 ? 'demain' : DAY_NAMES[d]} à ${fmtTime(schedule[d][0][0])}`, day };
    }
    return { open: false, text: 'Fermé', day };
  };
  const hoursText = (d) => ((schedule[d] || []).length ? schedule[d].map(([a, b]) => `${fmtTime(a)} – ${fmtTime(b)}`).join(' · ') : 'Fermé');

  const renderHours = () => {
    const s = status();
    $$('[data-status]').forEach((el) => el.classList.toggle('is-open', s.open));
    $$('[data-status-text]').forEach((el) => { el.textContent = s.text; });
    $$('[data-status-pill]').forEach((el) => el.classList.toggle('is-open', s.open));
    $$('[data-status-short]').forEach((el) => { el.textContent = s.open ? 'Ouvert' : 'Fermé'; });
    $$('[data-shop-sign]').forEach((el) => { el.textContent = s.open ? 'OUVERT' : 'FERMÉ'; });
    const rows = DAY_ORDER.map((d) => `<tr${d === s.day ? ' class="is-today"' : ''}><th scope="row">${DAY_NAMES[d][0].toUpperCase()}${DAY_NAMES[d].slice(1)}</th><td>${hoursText(d)}</td></tr>`).join('');
    $$('[data-hours-table] tbody, table[data-hours] tbody').forEach((tb) => { tb.innerHTML = rows; });
  };
  renderHours();
  setInterval(renderHours, 60 * 1000);

  const panel = $('#hours-panel');
  if (panel) {
    const toggles = $$('[data-hours-toggle]');
    let lastToggle = null;
    const open = (from) => {
      lastToggle = from || null;
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
      toggles.forEach((t) => t.setAttribute('aria-expanded', 'true'));
      const close = $('[data-hours-close]', panel);
      if (close) close.focus({ preventScroll: true });
    };
    const close = () => {
      panel.classList.remove('is-open');
      toggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, reduceMotion ? 0 : 500);
      if (lastToggle) lastToggle.focus({ preventScroll: true });
    };
    toggles.forEach((t) => t.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.contains('is-open') ? close() : open(t); }));
    $('[data-hours-close]', panel).addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('is-open')) close(); });
    document.addEventListener('click', (e) => { if (panel.classList.contains('is-open') && !e.target.closest('.hours-panel__inner')) close(); });
  }

  /* =======================================================================
     Fromages : cartes, grille et fiche détaillée
     ======================================================================= */
  const FEATURED = ['saint-nectaire', 'cantal-entre-deux', 'salers', 'fourme-ambert', 'bleu-auvergne', 'laguiole', 'gaperon', 'murol', 'tomme-fraiche', 'chevre-fermier'];

  const track = $('[data-cheese-track]');
  if (track) {
    $$('.cheese-card', track).forEach((n) => n.remove());
    const html = FEATURED.map((id, i) => {
      const c = cheeseById[id];
      return `<article class="cheese-card" data-cursor="Découvrir">
        <div class="cheese-card__top"><span class="cheese-card__num">${String(i + 1).padStart(2, '0')}</span><span class="cheese-card__tag">${c.aop ? 'AOP' : esc(D.families[c.family])}</span></div>
        <div class="cheese-card__art">${artSvg(c)}</div>
        <h3 class="cheese-card__name">${esc(c.name)}</h3>
        <p class="cheese-card__meta">${esc(c.milk)} · ${esc(c.region)}</p>
        <p class="cheese-card__text">${esc(c.short)}</p>
        <dl class="cheese-card__facts">
          <div><dt>Affinage</dt><dd>${esc(c.aging.split(',')[0])}</dd></div>
          <div><dt>Prix</dt><dd>${euroKg(c.price)}</dd></div>
        </dl>
        <button class="cheese-card__open" type="button" data-cheese-open="${c.id}"><span class="visually-hidden">Découvrir le ${esc(c.name)} en photo</span></button>
      </article>`;
    }).join('') + `<article class="cheese-card cheese-card--more" data-cursor="Entrer">
        <div class="cheese-card__top"><span class="cheese-card__num">+</span><span class="cheese-card__tag">${D.cheeses.length} fromages</span></div>
        <div class="cheese-card__art">${artSvg(cheeseById['bleu-causses'])}</div>
        <h3 class="cheese-card__name">Toute la cave</h3>
        <p class="cheese-card__text">Roquefort, Bleu des Causses, Comté, Brie de Meaux, Reblochon… Retrouvez tous nos fromages, en photo et avec leur prix au kilo.</p>
        <a class="arrow-link" href="fromages.html">Voir tous les fromages ${ARROW}</a>
      </article>`;
    track.insertAdjacentHTML('beforeend', html);
  }

  const grid = $('[data-cheese-grid]');
  const filters = $('[data-cheese-filters]');
  if (grid) {
    grid.innerHTML = D.cheeses.map((c) => `<article class="cave-card" data-family="${c.family}" data-cursor="Découvrir">
        <div class="cave-card__art">${artSvg(c)}</div>
        <div class="cave-card__body">
          <p class="cave-card__family">${c.aop ? 'AOP · ' : ''}${esc(D.families[c.family])}</p>
          <h3 class="cave-card__name">${esc(c.name)}</h3>
          <p class="cave-card__short">${esc(c.short)}</p>
          <p class="cave-card__price"><strong>${euroKg(c.price)}</strong><span>${esc(c.region)}</span></p>
        </div>
        <button class="cheese-card__open" type="button" data-cheese-open="${c.id}"><span class="visually-hidden">Voir la fiche du ${esc(c.name)}</span></button>
      </article>`).join('');
    if (filters) {
      const chips = [['all', 'Tous']].concat(Object.entries(D.families).filter(([k]) => D.cheeses.some((c) => c.family === k)));
      filters.innerHTML = chips.map(([k, label], i) => `<button class="filter${i ? '' : ' is-active'}" type="button" data-filter="${k}" aria-pressed="${i ? 'false' : 'true'}">${esc(label)}</button>`).join('');
      filters.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        const f = btn.dataset.filter;
        $$('[data-filter]', filters).forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
        animateFilter($$('.cave-card', grid), (card) => f === 'all' || card.dataset.family === f);
      });
    }
  }

  // filtre animé : les cartes masquées sortent, les autres se replacent
  function animateFilter(cards, keep) {
    const g = window.gsap;
    const first = cards.map((c) => c.getBoundingClientRect());
    cards.forEach((c) => { c.hidden = !keep(c); });
    if (!g || reduceMotion) return;
    cards.forEach((c, i) => {
      if (c.hidden) return;
      const last = c.getBoundingClientRect();
      const was = first[i];
      if (was.width === 0) g.fromTo(c, { opacity: 0, scale: 0.85, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)', delay: i * 0.02 });
      else g.fromTo(c, { x: was.left - last.left, y: was.top - last.top }, { x: 0, y: 0, duration: 0.7, ease: 'expo.out' });
    });
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  // Fiche fromage (boîte de dialogue)
  let cheeseDialog = null;
  const ensureCheeseDialog = () => {
    if (cheeseDialog) return cheeseDialog;
    cheeseDialog = document.createElement('dialog');
    cheeseDialog.className = 'sheet cheese-sheet';
    cheeseDialog.setAttribute('aria-labelledby', 'cheese-sheet-title');
    document.body.appendChild(cheeseDialog);
    cheeseDialog.addEventListener('click', (e) => { if (e.target === cheeseDialog) cheeseDialog.close(); });
    cheeseDialog.addEventListener('close', () => { root.classList.remove('dialog-open'); if (window.LB && window.LB.lenis && !$('.recipe-view.is-open')) window.LB.lenis.start(); });
    return cheeseDialog;
  };
  const openCheese = (id) => {
    const c = cheeseById[id];
    if (!c) return;
    const dlg = ensureCheeseDialog();
    const quarter = (c.price / 4).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const recipes = D.recipes.filter((r) => r.cheeses.includes(c.id));
    const addHref = `commande.html?add=${c.id}`;
    dlg.innerHTML = `<div class="sheet__inner" data-lenis-prevent>
      <form method="dialog"><button class="sheet__close" type="submit" aria-label="Fermer la fiche">×</button></form>
      <figure class="sheet__photo">${photo(c.photo, `Photo d’illustration pour le ${c.name}`, '', '(max-width: 900px) 100vw, 45vw')}<figcaption>Photo d’illustration · Pexels</figcaption>
        <div class="sheet__art">${artSvg(c)}</div>
      </figure>
      <div class="sheet__body">
        <p class="badge">${AST} ${c.aop ? 'AOP · ' : ''}${esc(D.families[c.family])}</p>
        <h2 class="h" id="cheese-sheet-title">${esc(c.name)}</h2>
        <p class="sheet__lead">${esc(c.short)}</p>
        <p>${esc(c.text)}</p>
        <dl class="sheet__facts">
          <div><dt>Lait</dt><dd>${esc(c.milk)}</dd></div>
          <div><dt>Origine</dt><dd>${esc(c.region)}</dd></div>
          <div><dt>Affinage</dt><dd>${esc(c.aging)}</dd></div>
          <div><dt>En bouche</dt><dd>${esc(c.taste)}</dd></div>
          <div><dt>Accord</dt><dd>${esc(c.pairing)}</dd></div>
        </dl>
        ${recipes.length ? `<p class="sheet__recipes">En cuisine&nbsp;: ${recipes.map((r) => `<a class="link" href="recettes.html#${r.id}">${esc(r.name)}</a>`).join(', ')}</p>` : ''}
        <div class="sheet__buy">
          <p class="sheet__price"><strong>${euroKg(c.price)}</strong><span>soit environ ${quarter}&nbsp;€ les 250&nbsp;g · prix indicatif</span></p>
          <a class="btn btn--primary" href="${addHref}" data-add-cheese="${c.id}"><span class="btn__label"><span data-text="Ajouter à ma commande">Ajouter à ma commande</span></span></a>
        </div>
      </div>
    </div>`;
    root.classList.add('dialog-open');
    if (window.LB && window.LB.lenis) window.LB.lenis.stop();
    dlg.showModal();
    if (window.gsap && !reduceMotion) {
      window.gsap.from($$('.sheet__body > *', dlg), { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.15 });
      window.gsap.from($('.sheet__art', dlg), { scale: 0.4, rotate: -30, opacity: 0, duration: 1, ease: 'back.out(1.8)', delay: 0.3 });
    }
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cheese-open]');
    if (btn) { e.preventDefault(); openCheese(btn.dataset.cheeseOpen); }
  });

  /* =======================================================================
     Recettes : grille, filtres et fiche détaillée
     ======================================================================= */
  const recipeGrid = $('[data-recipe-grid]');
  const view = $('#recipe-view');
  if (recipeGrid) {
    recipeGrid.innerHTML = D.recipes.map((r) => `<article class="recipe-tile" data-type="${r.type}" data-cursor="Miam">
        <div class="recipe-tile__media">${photo(r.photo, r.name, '', '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw')}</div>
        <div class="recipe-tile__body">
          <p class="recipe-tile__type">${esc(D.recipeTypes[r.type])} · ${esc(r.region)}</p>
          <h3 class="recipe-tile__name">${esc(r.name)}</h3>
          <p class="recipe-tile__meta"><span>${r.prep + r.cook}&nbsp;min</span><span>Pour ${r.serves}</span><span>${esc(r.level)}</span></p>
        </div>
        <a class="cheese-card__open" href="#${r.id}" data-recipe-open="${r.id}"><span class="visually-hidden">Voir la recette : ${esc(r.name)}</span></a>
      </article>`).join('');
    const rf = $('[data-recipe-filters]');
    if (rf) {
      const chips = [['all', 'Toutes']].concat(Object.entries(D.recipeTypes).filter(([k]) => D.recipes.some((r) => r.type === k)));
      rf.innerHTML = chips.map(([k, label], i) => `<button class="filter${i ? '' : ' is-active'}" type="button" data-filter="${k}" aria-pressed="${i ? 'false' : 'true'}">${esc(label)}</button>`).join('');
      rf.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        $$('[data-filter]', rf).forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
        animateFilter($$('.recipe-tile', recipeGrid), (t) => btn.dataset.filter === 'all' || t.dataset.type === btn.dataset.filter);
      });
    }
  }

  // quantités recalculées selon le nombre de personnes
  const scaleQty = (q, unit, factor) => {
    if (q === null) return '';
    let v = q * factor;
    if (unit === 'g') { v = v >= 100 ? Math.round(v / 10) * 10 : Math.round(v / 5) * 5; return v >= 1000 ? `${(v / 1000).toLocaleString('fr-FR')} kg` : `${v} g`; }
    if (unit === 'cl') return `${Math.max(1, Math.round(v))} cl`;
    if (unit === '') return `${Math.max(1, Math.round(v * 2) / 2).toLocaleString('fr-FR')}`;
    return `${Math.max(0.5, Math.round(v * 2) / 2).toLocaleString('fr-FR')} ${unit}`;
  };

  let viewServes = 4;
  let lastOpener = null;
  const renderIngredients = (r) => {
    const factor = viewServes / r.serves;
    return r.ingredients.map(([q, unit, label], i) => `<li><label class="check"><input type="checkbox" id="ing-${r.id}-${i}"><span class="check__box" aria-hidden="true"></span><span><strong>${scaleQty(q, unit, factor)}</strong> ${esc(label)}</span></label></li>`).join('');
  };

  const openRecipe = (id, opener) => {
    const r = recipeById[id];
    if (!r || !view) return;
    lastOpener = opener || null;
    viewServes = r.serves;
    const cheeses = r.cheeses.map((cid) => cheeseById[cid]).filter(Boolean);
    view.innerHTML = `<div class="recipe-view__scroll">
      <button class="sheet__close recipe-view__close" type="button" data-recipe-close aria-label="Fermer la recette">×</button>
      <header class="recipe-view__hero">
        ${photo(r.photo, r.name, 'recipe-view__img', '100vw')}
        <div class="recipe-view__hero-text">
          <p class="badge">${AST} ${esc(D.recipeTypes[r.type])} · ${esc(r.region)}</p>
          <h2 class="recipe-view__title" id="recipe-view-title">${esc(r.name)}</h2>
        </div>
      </header>
      <div class="recipe-view__body">
        <p class="recipe-view__intro">${esc(r.intro)}</p>
        <ul class="recipe-view__meta">
          <li><span>Préparation</span><strong>${r.prep}&nbsp;min</strong></li>
          ${r.cook ? `<li><span>Cuisson</span><strong>${r.cook}&nbsp;min</strong></li>` : ''}
          <li><span>Difficulté</span><strong>${esc(r.level)}</strong></li>
          <li class="serves"><span>Pour</span>
            <div class="stepper"><button type="button" data-serves="-1" aria-label="Une personne de moins">−</button><strong data-serves-out>${viewServes}</strong><button type="button" data-serves="1" aria-label="Une personne de plus">+</button></div>
            <span>personnes</span></li>
        </ul>
        <div class="recipe-view__cols">
          <section class="recipe-view__ingredients" aria-labelledby="ing-title">
            <h3 class="recipe-view__sub" id="ing-title">Ingrédients</h3>
            <ul data-ingredients>${renderIngredients(r)}</ul>
          </section>
          <section class="recipe-view__steps" aria-labelledby="steps-title">
            <h3 class="recipe-view__sub" id="steps-title">Préparation <span>· touchez une étape pour la cocher</span></h3>
            <ol>${r.steps.map((st, i) => `<li><button type="button" class="step" aria-pressed="false"><span class="step__num">${String(i + 1).padStart(2, '0')}</span><span class="step__text">${esc(st)}</span></button></li>`).join('')}</ol>
          </section>
        </div>
        <p class="recipe-view__tip"><strong>Le conseil du fromager&nbsp;:</strong> ${esc(r.tip)}</p>
        <section class="recipe-view__cheeses" aria-labelledby="rc-title">
          <h3 class="recipe-view__sub" id="rc-title">Les fromages qu’il vous faut</h3>
          <div class="mini-cheeses">${cheeses.map((c) => `<button class="mini-cheese" type="button" data-cheese-open="${c.id}">${artSvg(c)}<span><strong>${esc(c.name)}</strong><em>${euroKg(c.price)}</em></span></button>`).join('')}</div>
          <a class="btn btn--primary" href="commande.html?recipe=${r.id}"><span class="btn__label"><span data-text="Commander ces fromages">Commander ces fromages</span></span></a>
        </section>
      </div>
    </div>`;
    view.hidden = false;
    view.setAttribute('role', 'dialog');
    view.setAttribute('aria-modal', 'true');
    view.setAttribute('aria-labelledby', 'recipe-view-title');
    root.classList.add('view-open');
    if (window.LB && window.LB.lenis) window.LB.lenis.stop();
    const rect = opener ? opener.getBoundingClientRect() : null;
    view.style.setProperty('--ox', rect ? `${rect.left + rect.width / 2}px` : '50%');
    view.style.setProperty('--oy', rect ? `${rect.top + rect.height / 2}px` : '50%');
    requestAnimationFrame(() => view.classList.add('is-open'));
    $('.recipe-view__scroll', view).scrollTop = 0;
    $('[data-recipe-close]', view).focus({ preventScroll: true });
    if (window.gsap && !reduceMotion) {
      window.gsap.from('.recipe-view__img', { scale: 1.25, duration: 1.6, ease: 'expo.out' });
      window.gsap.from('.recipe-view__hero-text > *', { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.25 });
      window.gsap.from('.recipe-view__body > *', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.4 });
    }
    history.replaceState(null, '', `#${r.id}`);
  };
  const closeRecipe = () => {
    if (!view || !view.classList.contains('is-open')) return;
    view.classList.remove('is-open');
    root.classList.remove('view-open');
    history.replaceState(null, '', location.pathname + location.search);
    setTimeout(() => { if (!view.classList.contains('is-open')) { view.hidden = true; view.innerHTML = ''; } }, reduceMotion ? 0 : 700);
    if (window.LB && window.LB.lenis) window.LB.lenis.start();
    if (lastOpener) lastOpener.focus({ preventScroll: true });
  };

  if (view) {
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-recipe-open]');
      if (opener) { e.preventDefault(); openRecipe(opener.dataset.recipeOpen, opener); return; }
      if (e.target.closest('[data-recipe-close]')) { closeRecipe(); return; }
      const sv = e.target.closest('[data-serves]');
      if (sv && view.contains(sv)) {
        const r = recipeById[location.hash.slice(1)];
        if (!r) return;
        viewServes = Math.min(20, Math.max(1, viewServes + Number(sv.dataset.serves)));
        $('[data-serves-out]', view).textContent = viewServes;
        $('[data-ingredients]', view).innerHTML = renderIngredients(r);
        if (window.gsap && !reduceMotion) window.gsap.from('[data-ingredients] strong', { y: -8, opacity: 0, duration: 0.4, stagger: 0.03 });
        return;
      }
      const step = e.target.closest('.step');
      if (step && view.contains(step)) step.setAttribute('aria-pressed', String(step.getAttribute('aria-pressed') !== 'true'));
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && view.classList.contains('is-open') && !$('dialog[open]')) closeRecipe(); });
    const fromHash = () => { const id = location.hash.slice(1); if (recipeById[id]) openRecipe(id); };
    if (document.readyState === 'complete') setTimeout(fromHash, 300);
    else window.addEventListener('load', () => setTimeout(fromHash, 300), { once: true });
  }

  /* =======================================================================
     Click & collect
     ======================================================================= */
  const builder = $('[data-order-panels]');
  if (builder) initOrder();

  function initOrder() {
    const tabsEl = $('[data-order-tabs]');
    const linesEl = $('[data-cart-lines]');
    const totalEl = $('[data-cart-total]');
    const form = $('[data-pickup]');
    const errorEl = $('[data-pickup-error]');
    const doneEl = $('[data-pickup-done]');
    let cart = storage.get('lb-cart', []);

    // ✏️ À PERSONNALISER : grammages, compositions et prix des à-côtés (indicatifs)
    const OCCASIONS = { dessert: ['Fin de repas', 70], apero: ['Apéritif', 100], repas: ['Repas fromage', 180] };
    const STYLES = {
      classique: ['Le classique', ['saint-nectaire', 'cantal-entre-deux', 'fourme-ambert', 'salers', 'gaperon', 'bleu-auvergne', 'chevre-fermier']],
      auvergne: ['100 % Auvergne', ['saint-nectaire', 'cantal-vieux', 'fourme-ambert', 'salers', 'bleu-auvergne', 'gaperon', 'murol']],
      doux: ['Doux & familial', ['cantal-jeune', 'murol', 'saint-nectaire', 'fourme-ambert', 'brie-meaux', 'reblochon', 'chevre-fermier']],
      caractere: ['Caractère', ['salers', 'cantal-vieux', 'bleu-causses', 'laguiole', 'roquefort', 'comte', 'bleu-auvergne']],
    };
    const EXTRAS = [
      ['pain', 'Pain de campagne', 4.5],
      ['pain-noix', 'Pain aux noix', 5.5],
      ['noix', 'Noix & fruits secs', 4],
      ['raisins', 'Raisins frais', 3.5],
      ['confiture', 'Confiture de cerise noire', 6.5],
    ];
    const SOIREES = {
      raclette: { label: 'Soirée raclette', perPerson: 220, mix: [['__raclette', 1]], note: 'Fromage à raclette au lait cru, tranché pour vous.' },
      fondue: { label: 'Fondue auvergnate', perPerson: 200, mix: [['cantal-entre-deux', 0.45], ['saint-nectaire', 0.4], ['fourme-ambert', 0.15]], note: 'Cantal, Saint-Nectaire et Fourme, râpés ou en dés sur demande.' },
      truffade: { label: 'Truffade', perPerson: 100, mix: [['tomme-fraiche', 1]], note: 'Tomme fraîche de Cantal, à cuisiner le jour même ou le lendemain.' },
      aligot: { label: 'Aligot', perPerson: 100, mix: [['tomme-fraiche', 1]], note: 'Tomme fraîche de l’Aubrac, découpée en lamelles sur demande.' },
    };
    const RACLETTE_PRICE = 24; // € / kg, ✏️ à ajuster
    const BOXES = {
      decouverte: 'Découverte de l’Auvergne',
      aop: 'Les 5 AOP d’Auvergne',
      bleus: 'Les persillés',
      surprise: 'La surprise du fromager',
    };

    const avgPrice = (ids) => ids.reduce((s, id) => s + (cheeseById[id] ? cheeseById[id].price : 0), 0) / Math.max(ids.length, 1);
    const tabs = [['plateau', 'Plateau sur mesure'], ['coupe', 'À la coupe'], ['soiree', 'Soirée fromage'], ['coffret', 'Coffret cadeau']];
    tabsEl.innerHTML = tabs.map(([k, label], i) => `<button class="tab${i ? '' : ' is-active'}" type="button" role="tab" id="tab-${k}" aria-controls="panel-${k}" aria-selected="${i ? 'false' : 'true'}" data-tab="${k}">${label}</button>`).join('');

    const cheeseChecks = D.cheeses.map((c) => `<label class="pick"><input type="checkbox" name="plateau-cheese" value="${c.id}"><span class="pick__art">${artSvg(c)}</span><span class="pick__name">${esc(c.name)}</span><span class="pick__price">${euroKg(c.price)}</span></label>`).join('');
    builder.innerHTML = `
      <section class="panel is-active" id="panel-plateau" role="tabpanel" aria-labelledby="tab-plateau">
        <div class="panel__head"><h2 class="h-sm">Votre plateau, à votre goût</h2><p>Choisissez le nombre de convives, l’occasion et un style. Nous proposons une sélection, que vous pouvez modifier fromage par fromage.</p></div>
        <div class="field"><label class="field__label" for="pl-guests">Nombre de personnes</label><div class="field__range"><input class="calc__range" type="range" id="pl-guests" min="2" max="40" value="8"><output class="field__out" for="pl-guests" id="pl-guests-out">8</output></div></div>
        <fieldset class="field"><legend class="field__label">Occasion</legend><div class="calc__chips">${Object.entries(OCCASIONS).map(([k, [l]], i) => `<label class="chip"><input type="radio" name="pl-occasion" value="${k}"${i === 0 ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>
        <fieldset class="field"><legend class="field__label">Style</legend><div class="calc__chips">${Object.entries(STYLES).map(([k, [l]], i) => `<label class="chip"><input type="radio" name="pl-style" value="${k}"${i === 0 ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>
        <fieldset class="field"><legend class="field__label">Les fromages <span class="field__hint" data-pl-count></span></legend><div class="picks">${cheeseChecks}</div></fieldset>
        <fieldset class="field"><legend class="field__label">Les à-côtés</legend><div class="extras">${EXTRAS.map(([k, l, p]) => `<label class="check"><input type="checkbox" name="pl-extra" value="${k}"><span class="check__box" aria-hidden="true"></span><span>${l} <em>${euro(p)}</em></span></label>`).join('')}</div></fieldset>
        <fieldset class="field"><legend class="field__label">Présentation</legend><div class="calc__chips"><label class="chip"><input type="radio" name="pl-present" value="plateau" checked><span>Dressé, prêt à servir</span></label><label class="chip"><input type="radio" name="pl-present" value="separe"><span>Emballés séparément</span></label></div></fieldset>
        <div class="panel__summary" data-pl-summary></div>
        <button class="btn btn--primary" type="button" data-add="plateau"><span class="btn__label"><span data-text="Ajouter le plateau">Ajouter le plateau</span></span></button>
      </section>

      <section class="panel" id="panel-coupe" role="tabpanel" aria-labelledby="tab-coupe" hidden>
        <div class="panel__head"><h2 class="h-sm">À la coupe</h2><p>Indiquez le poids souhaité pour chaque fromage. Nous coupons au plus près, et vous réglez le poids réel.</p></div>
        <ul class="cut-list">${D.cheeses.map((c) => `<li class="cut" data-cut="${c.id}"><button class="cut__art" type="button" data-cheese-open="${c.id}" aria-label="Voir la fiche du ${esc(c.name)}">${artSvg(c)}</button><span class="cut__name"><strong>${esc(c.name)}</strong><em>${euroKg(c.price)}</em></span><span class="stepper"><button type="button" data-cut-step="-1" aria-label="100 g de moins">−</button><strong data-cut-out>0 g</strong><button type="button" data-cut-step="1" aria-label="100 g de plus">+</button></span></li>`).join('')}</ul>
        <div class="panel__summary" data-cut-summary></div>
        <button class="btn btn--primary" type="button" data-add="coupe"><span class="btn__label"><span data-text="Ajouter la sélection">Ajouter la sélection</span></span></button>
      </section>

      <section class="panel" id="panel-soiree" role="tabpanel" aria-labelledby="tab-soiree" hidden>
        <div class="panel__head"><h2 class="h-sm">Soirée fromage</h2><p>Raclette, fondue, truffade ou aligot&nbsp;: dites-nous combien vous serez, nous préparons la bonne quantité.</p></div>
        <fieldset class="field"><legend class="field__label">La formule</legend><div class="calc__chips">${Object.entries(SOIREES).map(([k, s], i) => `<label class="chip"><input type="radio" name="so-kind" value="${k}"${i === 0 ? ' checked' : ''}><span>${s.label}</span></label>`).join('')}</div></fieldset>
        <div class="field"><label class="field__label" for="so-guests">Nombre de personnes</label><div class="field__range"><input class="calc__range" type="range" id="so-guests" min="2" max="30" value="6"><output class="field__out" for="so-guests" id="so-guests-out">6</output></div></div>
        <fieldset class="field"><legend class="field__label">Appétit</legend><div class="calc__chips"><label class="chip"><input type="radio" name="so-appetite" value="0.85"><span>Léger</span></label><label class="chip"><input type="radio" name="so-appetite" value="1" checked><span>Normal</span></label><label class="chip"><input type="radio" name="so-appetite" value="1.2"><span>Gros mangeurs</span></label></div></fieldset>
        <div class="panel__summary" data-so-summary></div>
        <button class="btn btn--primary" type="button" data-add="soiree"><span class="btn__label"><span data-text="Ajouter la soirée">Ajouter la soirée</span></span></button>
      </section>

      <section class="panel" id="panel-coffret" role="tabpanel" aria-labelledby="tab-coffret" hidden>
        <div class="panel__head"><h2 class="h-sm">Coffret cadeau</h2><p>Un assortiment emballé, accompagné d’un petit mot. Parfait pour un anniversaire, un remerciement ou les fêtes.</p></div>
        <fieldset class="field"><legend class="field__label">Le coffret</legend><div class="calc__chips">${Object.entries(BOXES).map(([k, l], i) => `<label class="chip"><input type="radio" name="co-kind" value="${k}"${i === 0 ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>
        <fieldset class="field"><legend class="field__label">Budget</legend><div class="calc__chips">${[30, 50, 80].map((b, i) => `<label class="chip"><input type="radio" name="co-budget" value="${b}"${i === 1 ? ' checked' : ''}><span>${b}&nbsp;€</span></label>`).join('')}<label class="chip chip--input"><input type="radio" name="co-budget" value="custom"><span>Autre&nbsp;:</span></label><input class="field__small" type="number" min="20" max="500" step="5" id="co-custom" aria-label="Autre budget en euros" placeholder="€"></div></fieldset>
        <div class="field"><label class="field__label" for="co-message">Message sur la carte <span class="field__hint">(facultatif)</span></label><textarea id="co-message" rows="3" maxlength="240" placeholder="Joyeux anniversaire Paul !"></textarea></div>
        <div class="panel__summary" data-co-summary></div>
        <button class="btn btn--primary" type="button" data-add="coffret"><span class="btn__label"><span data-text="Ajouter le coffret">Ajouter le coffret</span></span></button>
      </section>`;

    /* --- onglets --- */
    const showTab = (k) => {
      $$('[data-tab]', tabsEl).forEach((t) => { const on = t.dataset.tab === k; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on)); });
      $$('.panel', builder).forEach((p) => { const on = p.id === `panel-${k}`; p.hidden = !on; p.classList.toggle('is-active', on); });
      const active = $(`#panel-${k}`);
      if (window.gsap && !reduceMotion && active) window.gsap.from($$(':scope > *', active), { y: 24, opacity: 0, duration: 0.6, ease: 'expo.out', stagger: 0.04 });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };
    tabsEl.addEventListener('click', (e) => { const t = e.target.closest('[data-tab]'); if (t) showTab(t.dataset.tab); });
    tabsEl.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const all = $$('[data-tab]', tabsEl);
      const i = all.indexOf(document.activeElement);
      const next = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
      next.focus(); showTab(next.dataset.tab);
    });

    /* --- plateau --- */
    const val = (name) => { const el = $(`input[name="${name}"]:checked`, builder); return el ? el.value : null; };
    const plGuests = $('#pl-guests');
    const plStyle = () => STYLES[val('pl-style')][1];
    const pickCount = (g) => (g <= 4 ? 3 : g <= 10 ? 5 : 7);
    const applyStyle = () => {
      const chosen = plStyle().slice(0, pickCount(+plGuests.value));
      $$('input[name="plateau-cheese"]', builder).forEach((cb) => { cb.checked = chosen.includes(cb.value); });
    };
    const plateau = () => {
      const guests = +plGuests.value;
      const [occLabel, perPerson] = OCCASIONS[val('pl-occasion')];
      const ids = $$('input[name="plateau-cheese"]:checked', builder).map((cb) => cb.value);
      const weight = guests * perPerson;
      const extras = $$('input[name="pl-extra"]:checked', builder).map((cb) => EXTRAS.find((x) => x[0] === cb.value));
      const cheesePrice = (weight / 1000) * avgPrice(ids);
      const price = cheesePrice + extras.reduce((s, x) => s + x[2], 0);
      return { guests, occLabel, ids, weight, extras, price, style: STYLES[val('pl-style')][0], present: val('pl-present') === 'plateau' ? 'dressé, prêt à servir' : 'fromages emballés séparément' };
    };
    const renderPlateau = () => {
      const p = plateau();
      $('#pl-guests-out').textContent = p.guests;
      plGuests.style.setProperty('--fill', `${((p.guests - 2) / 38) * 100}%`);
      const odd = p.ids.length % 2 === 1;
      $('[data-pl-count]').textContent = `· ${p.ids.length} choisi${p.ids.length > 1 ? 's' : ''}${p.ids.length && !odd ? ' (la tradition préfère un nombre impair)' : ''}`;
      $('[data-pl-summary]').innerHTML = p.ids.length
        ? `<p><strong>${grams(p.weight)}</strong> de fromage pour ${p.guests} personnes (${p.occLabel.toLowerCase()}), soit environ ${grams(p.weight / p.ids.length)} de chaque.</p><p class="panel__price">Environ <strong>${euro(p.price)}</strong></p>`
        : '<p>Choisissez au moins un fromage.</p>';
    };
    builder.addEventListener('input', (e) => {
      if (e.target.closest('#panel-plateau')) {
        if (e.target === plGuests || e.target.name === 'pl-style') applyStyle();
        renderPlateau();
      }
    });
    builder.addEventListener('change', (e) => { if (e.target.closest('#panel-plateau')) renderPlateau(); });

    /* --- à la coupe --- */
    const cuts = {};
    const renderCut = () => {
      let total = 0; let weight = 0;
      $$('[data-cut]', builder).forEach((li) => {
        const g = cuts[li.dataset.cut] || 0;
        $('[data-cut-out]', li).textContent = grams(g);
        li.classList.toggle('is-picked', g > 0);
        total += (g / 1000) * cheeseById[li.dataset.cut].price; weight += g;
      });
      $('[data-cut-summary]').innerHTML = weight ? `<p><strong>${grams(weight)}</strong> au total.</p><p class="panel__price">Environ <strong>${euro(total)}</strong></p>` : '<p>Ajoutez du poids avec les boutons +.</p>';
    };
    builder.addEventListener('click', (e) => {
      const step = e.target.closest('[data-cut-step]');
      if (!step) return;
      const id = step.closest('[data-cut]').dataset.cut;
      cuts[id] = Math.min(3000, Math.max(0, (cuts[id] || 0) + Number(step.dataset.cutStep) * 100));
      renderCut();
      if (window.gsap && !reduceMotion) window.gsap.fromTo(step.parentElement.querySelector('[data-cut-out]'), { scale: 1.25 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    });

    /* --- soirée --- */
    const soiree = () => {
      const kind = SOIREES[val('so-kind')];
      const guests = +$('#so-guests').value;
      const weight = Math.round((guests * kind.perPerson * Number(val('so-appetite'))) / 50) * 50;
      const parts = kind.mix.map(([id, share]) => {
        const w = Math.round((weight * share) / 50) * 50;
        const c = id === '__raclette' ? { name: 'Fromage à raclette', price: RACLETTE_PRICE } : cheeseById[id];
        return { name: c.name, w, price: (w / 1000) * c.price };
      });
      return { kind, guests, weight, parts, price: parts.reduce((s, x) => s + x.price, 0) };
    };
    const renderSoiree = () => {
      const s = soiree();
      $('#so-guests-out').textContent = s.guests;
      $('#so-guests').style.setProperty('--fill', `${((s.guests - 2) / 28) * 100}%`);
      $('[data-so-summary]').innerHTML = `<p>${s.parts.map((x) => `<strong>${grams(x.w)}</strong> de ${esc(x.name)}`).join(', ')}.</p><p class="panel__note">${esc(s.kind.note)}</p><p class="panel__price">Environ <strong>${euro(s.price)}</strong></p>`;
    };
    builder.addEventListener('input', (e) => { if (e.target.closest('#panel-soiree')) renderSoiree(); });
    builder.addEventListener('change', (e) => { if (e.target.closest('#panel-soiree')) renderSoiree(); });

    /* --- coffret --- */
    const coffret = () => {
      let budget = val('co-budget');
      const custom = $('#co-custom');
      if (budget === 'custom') budget = Math.max(20, Number(custom.value) || 0);
      return { kind: BOXES[val('co-kind')], budget: Number(budget), message: $('#co-message').value.trim() };
    };
    const renderCoffret = () => {
      const c = coffret();
      $('[data-co-summary]').innerHTML = `<p><strong>${esc(c.kind)}</strong>, autour de ${euro(c.budget)}${c.message ? ', avec votre message' : ''}.</p><p class="panel__price"><strong>${euro(c.budget)}</strong></p>`;
    };
    $('#co-custom').addEventListener('focus', () => { const r = $('input[name="co-budget"][value="custom"]', builder); r.checked = true; renderCoffret(); });
    builder.addEventListener('input', (e) => { if (e.target.closest('#panel-coffret')) renderCoffret(); });
    builder.addEventListener('change', (e) => { if (e.target.closest('#panel-coffret')) renderCoffret(); });

    /* --- ajout au panier --- */
    const addLine = (line) => {
      cart.push({ ...line, key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` });
      storage.set('lb-cart', cart);
      renderCart(true);
    };
    // un petit fromage s’envole du bouton jusqu’au total du panier
    const flyToCart = (from) => {
      if (!canAnimate) return;
      const a = from.getBoundingClientRect();
      const b = totalEl.getBoundingClientRect();
      const x0 = a.left + a.width / 2; const y0 = a.top + a.height / 2;
      const x1 = Math.min(Math.max(b.left + b.width / 2, 20), innerWidth - 20);
      const y1 = Math.min(Math.max(b.top + b.height / 2, 20), innerHeight - 20);
      const lift = Math.min(y0, y1) - Math.max(90, Math.abs(x1 - x0) * 0.35);
      const { layer, dx, dy } = fxLayer(document.body);
      const token = document.createElement('span');
      token.className = 'fx-token';
      Object.assign(token.style, { left: `${dx}px`, top: `${dy}px` });
      layer.appendChild(token);
      const frames = [];
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1;
        const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * lift + t * t * y1;
        frames.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${t * 540}deg) scale(${1 + Math.sin(t * Math.PI) * 0.5 - t * 0.5})` });
      }
      token.animate(frames, { duration: 850, easing: 'cubic-bezier(.45, 0, .25, 1)', fill: 'forwards' }).finished.then(() => {
        layer.remove();
        burst(totalEl, x1, y1);
        totalEl.animate([{ scale: 1 }, { scale: 1.35 }, { scale: 0.95 }, { scale: 1 }], { duration: 500, easing: 'ease-out' });
      }).catch(() => layer.remove());
    };

    builder.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const kind = btn.dataset.add;
      const before = cart.length;
      setTimeout(() => { if (cart.length > before) flyToCart(btn); });
      if (kind === 'plateau') {
        const p = plateau();
        if (!p.ids.length) return;
        addLine({ title: `Plateau « ${p.style} » pour ${p.guests}`, detail: `${p.occLabel}, ${grams(p.weight)} : ${p.ids.map((id) => cheeseById[id].name).join(', ')}${p.extras.length ? `. Avec : ${p.extras.map((x) => x[1].toLowerCase()).join(', ')}` : ''}. Présentation : ${p.present}.`, price: p.price });
      } else if (kind === 'coupe') {
        const ids = Object.keys(cuts).filter((id) => cuts[id] > 0);
        if (!ids.length) return;
        ids.forEach((id) => addLine({ title: cheeseById[id].name, detail: `À la coupe, ${grams(cuts[id])}`, price: (cuts[id] / 1000) * cheeseById[id].price }));
        ids.forEach((id) => { cuts[id] = 0; });
        renderCut();
      } else if (kind === 'soiree') {
        const s = soiree();
        addLine({ title: `${s.kind.label} pour ${s.guests}`, detail: s.parts.map((x) => `${grams(x.w)} de ${x.name}`).join(', '), price: s.price });
      } else if (kind === 'coffret') {
        const c = coffret();
        addLine({ title: `Coffret « ${c.kind} »`, detail: `Budget ${euro(c.budget)}${c.message ? `. Message : « ${c.message} »` : ''}`, price: c.budget });
      }
    });

    /* --- panier --- */
    const renderCart = (bump) => {
      linesEl.innerHTML = cart.length
        ? cart.map((l) => `<li class="cart__line"><div><strong>${esc(l.title)}</strong><span>${esc(l.detail)}</span></div><em>${euro(l.price)}</em><button type="button" data-remove="${l.key}" aria-label="Retirer : ${esc(l.title)}">×</button></li>`).join('')
        : '<li class="cart__empty">Votre panier est vide. Composez un plateau, choisissez vos fromages à la coupe, une soirée ou un coffret.</li>';
      totalEl.textContent = euro(cart.reduce((s, l) => s + l.price, 0));
      if (bump && window.gsap && !reduceMotion) {
        const last = linesEl.lastElementChild;
        if (last) window.gsap.from(last, { x: 60, opacity: 0, duration: 0.7, ease: 'back.out(1.6)' });
        window.gsap.fromTo(totalEl, { scale: 1.3, color: '#3c422e' }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
      }
    };
    linesEl.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-remove]');
      if (!rm) return;
      cart = cart.filter((l) => l.key !== rm.dataset.remove);
      storage.set('lb-cart', cart);
      renderCart();
    });

    /* --- retrait : jour et créneaux selon les horaires --- */
    const dateEl = $('#pickup-date');
    const slotEl = $('#pickup-slot');
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    // premier jour ouvert à partir de demain
    const firstOpen = new Date(tomorrow);
    for (let i = 0; i < 7 && !(schedule[firstOpen.getDay()] || []).length; i++) firstOpen.setDate(firstOpen.getDate() + 1);
    dateEl.min = iso(tomorrow);
    const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 60);
    dateEl.max = iso(maxDate);
    dateEl.value = iso(firstOpen);
    const renderSlots = () => {
      const d = dateEl.value ? new Date(`${dateEl.value}T12:00:00`) : null;
      const ranges = d ? schedule[d.getDay()] || [] : [];
      if (!ranges.length) { slotEl.innerHTML = '<option value="">Fermé ce jour-là</option>'; slotEl.disabled = true; return; }
      slotEl.disabled = false;
      const opts = [];
      ranges.forEach(([a, b]) => { for (let t = a + 30; t <= b - 30; t += 30) opts.push(`${fmtTime(t)} – ${fmtTime(t + 30)}`); });
      slotEl.innerHTML = opts.map((o) => `<option>${o}</option>`).join('');
    };
    dateEl.addEventListener('change', renderSlots);
    renderSlots();

    const orderText = () => {
      const f = new FormData(form);
      const d = new Date(`${f.get('date')}T12:00:00`);
      const when = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      return [
        `Commande click & collect — ${D.shop.name}`,
        '',
        ...cart.map((l) => `• ${l.title} — ${l.detail} (≈ ${euro(l.price)})`),
        '',
        `Total estimé : ${euro(cart.reduce((s, l) => s + l.price, 0))} (réglé en boutique au poids réel)`,
        `Retrait : ${when}, ${f.get('slot')}`,
        `Nom : ${f.get('name')}`,
        `Téléphone : ${f.get('phone')}`,
        f.get('notes') ? `Remarques : ${f.get('notes')}` : '',
      ].filter((x, i, arr) => x !== '' || arr[i - 1] !== '').join('\n');
    };
    const validate = () => {
      const f = new FormData(form);
      const issues = [];
      if (!cart.length) issues.push('ajoutez au moins un article à votre panier');
      if (!f.get('date') || slotEl.disabled) issues.push('choisissez un jour d’ouverture');
      if (!String(f.get('name') || '').trim()) issues.push('indiquez votre nom');
      if (String(f.get('phone') || '').replace(/\D/g, '').length < 10) issues.push('indiquez un numéro de téléphone pour vous joindre');
      errorEl.hidden = !issues.length;
      if (issues.length) errorEl.textContent = `Pour envoyer la commande, ${issues.join(', ')}.`;
      return !issues.length;
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;
      const body = orderText();
      const subject = `Click & collect — ${new FormData(form).get('name')}`;
      location.href = `mailto:${D.shop.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      doneEl.hidden = false;
      doneEl.classList.remove('is-phone');
      doneEl.textContent = `Votre messagerie s’ouvre avec la commande. Envoyez le message : la fromagerie vous confirmera la commande. Sans réponse, appelez le ${D.shop.phone}.`;
    });
    $('[data-copy-order]').addEventListener('click', () => {
      if (!validate()) return;
      const text = orderText();
      const ok = () => { doneEl.hidden = false; doneEl.classList.remove('is-phone'); doneEl.textContent = `Commande copiée. Collez-la dans un message à la fromagerie, ou dictez-la par téléphone au ${D.shop.phone}.`; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, () => { window.prompt('Copiez votre commande :', text); });
      else window.prompt('Copiez votre commande :', text);
    });

    // par téléphone : pas besoin de remplir le formulaire, on affiche le numéro
    // et le récapitulatif à dicter (le lien tel: ouvre l’appel sur mobile)
    $('[data-phone-order]').addEventListener('click', () => {
      const s = status();
      const lines = cart.map((l) => `• ${l.title} — ${l.detail}`);
      errorEl.hidden = true;
      doneEl.hidden = false;
      doneEl.classList.add('is-phone');
      doneEl.textContent = [
        `Appelez le ${D.shop.phone}${s.open ? ' : la boutique est ouverte.' : ` (${s.text.toLowerCase()}).`}`,
        lines.length ? `À dicter :\n${lines.join('\n')}` : 'Dites-nous ce qui vous ferait plaisir, nous préparons tout pour votre passage.',
      ].join('\n');
    });

    /* --- arrivées depuis les autres pages --- */
    const params = new URLSearchParams(location.search);
    if (params.get('type') === 'plateau') {
      if (params.get('guests')) plGuests.value = Math.min(40, Math.max(2, +params.get('guests')));
      const occ = params.get('occasion');
      if (occ === 'raclette') {
        $('input[name="so-kind"][value="raclette"]', builder).checked = true;
        if (params.get('guests')) $('#so-guests').value = Math.min(30, +params.get('guests'));
        showTab('soiree');
      } else if (OCCASIONS[occ]) {
        $(`input[name="pl-occasion"][value="${occ}"]`, builder).checked = true;
      }
    }
    const add = params.get('add');
    if (add && cheeseById[add]) { cuts[add] = 300; showTab('coupe'); }
    const rec = params.get('recipe');
    if (rec && recipeById[rec]) {
      const r = recipeById[rec];
      const kind = { truffade: 'truffade', aligot: 'aligot', 'fondue-auvergnate': 'fondue' }[r.id];
      if (kind) { $(`input[name="so-kind"][value="${kind}"]`, builder).checked = true; $('#so-guests').value = r.serves; showTab('soiree'); }
      else { r.cheeses.forEach((id) => { cuts[id] = 200; }); showTab('coupe'); }
    }
    // dans la fiche fromage ouverte sur cette page, « Ajouter » ajoute directement
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-add-cheese]');
      if (!a) return;
      e.preventDefault();
      const id = a.dataset.addCheese;
      cuts[id] = (cuts[id] || 0) + 300;
      const dlg = a.closest('dialog');
      if (dlg) dlg.close();
      showTab('coupe');
      renderCut();
      const li = $(`[data-cut="${id}"]`, builder);
      if (li) li.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    applyStyle();
    renderPlateau();
    renderCut();
    renderSoiree();
    renderCoffret();
    renderCart();
  }
})();
