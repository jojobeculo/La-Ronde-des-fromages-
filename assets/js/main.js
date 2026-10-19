/* =========================================================================
   Le Buron — animations & interactions
   GSAP (ScrollTrigger, SplitText) + Lenis pour le défilement fluide.
   Tout le contenu reste lisible sans JavaScript ou en « mouvement réduit ».
   ========================================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motion = hasGSAP && !reduceMotion;

  let lenis = null;
  const scroll = { velocity: 0, direction: 1 };

  /* ---------- Fonctions toujours actives (avec ou sans animations) ---------- */
  initYear();
  initOpenStatus();
  initStory();
  initCalculator();
  initDialogs();
  initMenu();

  if (!motion) {
    const preloader = $('.preloader');
    if (preloader) preloader.remove();
    return;
  }

  /* ---------- Animations ---------- */
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  initLenis();
  initAnchors();
  initHeader();
  initCursor();
  initButtons();
  initMarquees();

  runPreloader().then(() => {
    const heroIntro = initHero();
    initSplits();
    initReveals();
    initManifesto();
    initCounters();
    initBands();
    initFromages();
    initStoryLoops();
    initCluster();
    initAccords();
    initInfos();
    initFooter();
    ScrollTrigger.refresh();
    heroIntro.play();
  });

  /* =======================================================================
     Défilement fluide
     ======================================================================= */
  function initLenis() {
    if (typeof window.Lenis === 'undefined') return;
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, stopInertiaOnNavigate: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function initAnchors() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href');
      const target = hash === '#top' ? document.body : (hash.length > 1 ? document.getElementById(hash.slice(1)) : null);
      if (!target) return;
      e.preventDefault();
      const done = () => {
        if (target === document.body) return;
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      };
      if (lenis) {
        lenis.scrollTo(target === document.body ? 0 : target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), onComplete: done });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
        done();
      }
    });
  }

  /* =======================================================================
     Préchargement
     ======================================================================= */
  function runPreloader() {
    const el = $('.preloader');
    if (!el) return Promise.resolve();
    const count = $('[data-preloader-count]', el);
    const counter = { v: 0 };

    gsap.to('.preloader__spin', { rotation: 360, svgOrigin: '0 0', duration: 2.6, ease: 'none', repeat: -1 });
    gsap.to('.preloader__wedge', { x: 12, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    const pageReady = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 3500));
    const ready = Promise.race([Promise.all([pageReady, fontsReady]), timeout]);

    const countUp = new Promise((resolve) => {
      gsap.to(counter, {
        v: 100, duration: 1.5, ease: 'power2.inOut',
        onUpdate: () => { count.textContent = Math.round(counter.v); },
        onComplete: resolve,
      });
    });

    return Promise.all([countUp, ready]).then(() => {
      gsap.timeline({ onComplete: () => el.remove() })
        .to('.preloader__inner', { yPercent: -30, opacity: 0, duration: 0.6, ease: 'power3.in' })
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' }, 0.25);
      return new Promise((resolve) => setTimeout(resolve, 450));
    });
  }

  /* =======================================================================
     En-tête : masquage au défilement, fond, barre de progression
     ======================================================================= */
  function initHeader() {
    const header = $('[data-header]');
    const bar = $('.progress span');
    const setBar = bar ? gsap.quickSetter(bar, 'scaleX') : () => {};
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const y = self.scroll();
        scroll.velocity = self.getVelocity();
        scroll.direction = self.direction;
        header.classList.toggle('is-scrolled', y > 40);
        if (!root.classList.contains('menu-open')) {
          header.classList.toggle('is-hidden', self.direction === 1 && y > 420);
        }
        setBar(self.progress);
      },
    });
    // la vitesse retombe doucement quand on arrête de défiler
    gsap.ticker.add(() => { scroll.velocity *= 0.92; });
  }

  /* =======================================================================
     Curseur personnalisé
     ======================================================================= */
  function initCursor() {
    if (!finePointer) return;
    const cursor = $('.cursor');
    if (!cursor) return;
    root.classList.add('has-cursor');
    cursor.classList.add('is-hidden');

    const dot = $('.cursor__dot', cursor);
    const ring = $('.cursor__ring', cursor);
    const label = $('.cursor__label', cursor);
    const dotX = gsap.quickSetter(dot, 'x', 'px');
    const dotY = gsap.quickSetter(dot, 'y', 'px');
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    let labelled = null;
    let pointer = null;

    const refresh = (t) => {
      const withLabel = t ? t.closest('[data-cursor]') : null;
      const interactive = t ? t.closest('a, button, label, input, select, textarea') : null;
      cursor.classList.toggle('is-label', !!withLabel);
      cursor.classList.toggle('is-link', !withLabel && !!interactive);
      cursor.classList.toggle('is-dark', !!(t && t.closest('[data-dark]')));
      if (withLabel && withLabel !== labelled) label.textContent = withLabel.dataset.cursor;
      labelled = withLabel;
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer = { x: e.clientX, y: e.clientY };
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
      cursor.classList.remove('is-hidden');
      refresh(e.target instanceof Element ? e.target : null);
    }, { passive: true });

    // la page défile sous un curseur immobile : on réévalue l’élément survolé
    let queued = false;
    window.addEventListener('scroll', () => {
      if (!pointer || queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        refresh(document.elementFromPoint(pointer.x, pointer.y));
      });
    }, { passive: true });

    root.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  }

  /* =======================================================================
     Boutons : remplissage depuis le curseur + effet magnétique
     ======================================================================= */
  function initButtons() {
    $$('.btn').forEach((btn) => {
      const setOrigin = (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--x', `${e.clientX - r.left}px`);
        btn.style.setProperty('--y', `${e.clientY - r.top}px`);
      };
      btn.addEventListener('pointerenter', setOrigin);
      btn.addEventListener('pointerleave', setOrigin);
    });

    if (!finePointer) return;
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* =======================================================================
     Défilements infinis (vitesse et sens liés au défilement de la page)
     ======================================================================= */
  function initMarquees() {
    $$('[data-marquee]').forEach((el) => {
      const group = $('.marquee__group', el);
      if (!group) return;
      const inner = document.createElement('div');
      inner.className = 'marquee__inner';
      el.insertBefore(inner, group);
      inner.appendChild(group);

      let width = 0;
      const fill = () => {
        $$('.marquee__group[aria-hidden]', inner).forEach((n) => n.remove());
        width = group.offsetWidth;
        const copies = Math.max(1, Math.ceil((el.offsetWidth * 2) / Math.max(width, 1)));
        for (let i = 0; i < copies; i++) {
          const clone = group.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          inner.appendChild(clone);
        }
      };
      fill();
      if (document.fonts) document.fonts.ready.then(fill);
      window.addEventListener('resize', debounce(fill, 200));

      const speed = parseFloat(el.dataset.speed) || 60;
      const dir = parseFloat(el.dataset.direction) || 1;
      const isBig = el.classList.contains('marquee--big');
      const setX = gsap.quickSetter(inner, 'x', 'px');
      const skewTo = isBig ? gsap.quickTo(inner, 'skewX', { duration: 0.6, ease: 'power3' }) : null;
      let x = 0;
      let visible = true;
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(el);

      gsap.ticker.add((time, delta) => {
        if (!visible || !width) return;
        const dt = Math.min(delta, 60) / 1000;
        const boost = 1 + Math.min(Math.abs(scroll.velocity) / 350, 7);
        x -= speed * dir * scroll.direction * boost * dt;
        x = gsap.utils.wrap(-width, 0, x);
        setX(x);
        if (skewTo) skewTo(gsap.utils.clamp(-12, 12, -scroll.velocity / 200));
      });
    });
  }

  /* =======================================================================
     Hero : apparition + parallaxe (défilement et souris)
     ======================================================================= */
  function initHero() {
    const hero = $('.hero');
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    if (!hero) return tl;

    const title = $('.hero__title', hero);
    let split = null;
    if (window.SplitText && title) {
      split = SplitText.create(title, { type: 'lines,chars', mask: 'lines', linesClass: 'hero__line' });
    }

    tl.from('.hero__sun', { y: 220, duration: 2.2 }, 0)
      .from('.hero__far', { y: 90, duration: 1.8 }, 0.05)
      .from('.hero__mid', { y: 180, duration: 1.8 }, 0.15)
      .from('.hero__near', { y: 260, duration: 1.8 }, 0.25)
      .from('.hero__cloud', { x: -120, opacity: 0, duration: 2, stagger: 0.15 }, 0.2)
      .from('.hero__badge', { y: 20, opacity: 0, duration: 1 }, 0.35);
    if (split) {
      tl.from(split.chars, { yPercent: 115, rotate: 10, duration: 1.3, stagger: 0.022, onComplete: () => split.revert() }, 0.3);
    }
    tl.from('.hero__lead', { y: 30, opacity: 0, duration: 1.1 }, 0.75)
      .from('.hero__ctas .btn', { y: 30, opacity: 0, duration: 1.1, stagger: 0.1 }, 0.85)
      .from('.hero__scroll', { opacity: 0, duration: 1 }, 1.1);

    // Petites vies du paysage (en pause hors écran)
    const life = [
      gsap.to('.hero__clouds use', { xPercent: 35, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 2, from: 'random' } }),
      gsap.to('.hero__birds .bird', { y: '-=12', x: '+=20', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4 }),
      gsap.to('.hero__birds .bird', { scaleY: 0.4, transformOrigin: '50% 50%', duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.12 }),
      gsap.to('.hero__cow', { y: -3, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: 2.5, stagger: 1.1 }),
    ];
    ScrollTrigger.create({
      trigger: hero, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => life.forEach((t) => (self.isActive ? t.resume() : t.pause())),
    });

    // Parallaxe au défilement : le ciel et le titre restent, les collines montent et l’avalent
    gsap.matchMedia().add('(min-width: 641px)', () => {
      gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
        .to('.hero__back', { yPercent: 28, ease: 'none' }, 0)
        .to('.hero__title-wrap', { yPercent: 110, ease: 'none' }, 0)
        .to('.hero__front', { yPercent: -8, ease: 'none' }, 0)
        .to('.hero__bottom', { opacity: 0, y: -40, ease: 'none' }, 0);
    });

    // Parallaxe à la souris
    if (finePointer) {
      const layers = [
        { el: $('.hero__back', hero), depth: -14 },
        { el: $('.hero__title-wrap', hero), depth: -6 },
        { el: $('.hero__front', hero), depth: 22 },
      ].filter((l) => l.el).map((l) => ({ ...l, to: gsap.quickTo(l.el, 'x', { duration: 1.4, ease: 'power3' }) }));
      hero.addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        layers.forEach((l) => l.to(nx * l.depth));
      });
    }
    return tl;
  }

  /* =======================================================================
     Titres découpés en lignes qui montent
     ======================================================================= */
  function initSplits() {
    if (!window.SplitText) return;
    $$('[data-split]').forEach((el) => {
      const split = SplitText.create(el, { type: 'lines,words', mask: 'lines' });
      gsap.from(split.words, {
        yPercent: 110, rotate: 4, duration: 1.2, ease: 'expo.out', stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onComplete: () => split.revert(),
      });
    });
  }

  /* =======================================================================
     Apparitions génériques
     ======================================================================= */
  function initReveals() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    gsap.set(items, { y: 50, opacity: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
    });
  }

  /* =======================================================================
     Manifeste : les mots s’allument au fil du défilement
     ======================================================================= */
  function initManifesto() {
    const text = $('[data-highlight]');
    if (!text) return;
    const parts = splitWords(text);
    gsap.set(parts, { opacity: 0.14 });
    gsap.to(parts, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 55%', scrub: true },
    });
    $$('.inline-pill', text).forEach((pill) => {
      gsap.from(pill, {
        scale: 0, rotate: -25, duration: 1, ease: 'back.out(2.2)',
        scrollTrigger: { trigger: pill, start: 'top 78%', toggleActions: 'play none none reverse' },
      });
    });

    const ring = $('.spin-badge__ring');
    if (ring) {
      const spin = gsap.to(ring, { rotation: 360, duration: 22, ease: 'none', repeat: -1 });
      gsap.ticker.add(() => spin.timeScale(1 + Math.min(Math.abs(scroll.velocity) / 120, 12)));
      gsap.to('.spin-badge__wheel', {
        rotation: -360, ease: 'none',
        scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  }

  // Découpe un paragraphe en mots (en conservant les espaces insécables et les éléments)
  function splitWords(el) {
    const out = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/([ \t\n\r]+)/).forEach((piece) => {
            if (!piece) return;
            if (/^[ \t\n\r]+$/.test(piece)) { frag.appendChild(document.createTextNode(' ')); return; }
            const span = document.createElement('span');
            span.className = 'w';
            span.textContent = piece;
            frag.appendChild(span);
            out.push(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.classList.contains('inline-pill')) out.push(child);
          else walk(child);
        }
      });
    };
    walk(el);
    return out;
  }

  /* =======================================================================
     Compteurs
     ======================================================================= */
  function initCounters() {
    const fmt = new Intl.NumberFormat('fr-FR');
    $$('[data-count-to]').forEach((el) => {
      const to = parseFloat(el.dataset.countTo);
      const obj = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(obj, { v: to, duration: 2.2, ease: 'expo.out', onUpdate: () => { el.textContent = fmt.format(Math.round(obj.v)).replace(/\u202f/g, '\u00a0'); } }),
      });
    });
  }

  /* =======================================================================
     Bandeaux de couleur qui s’ouvrent jusqu’aux bords
     ======================================================================= */
  function initBands() {
    $$('.band').forEach((band) => {
      const bg = $('.band__bg', band);
      if (!bg) return;
      gsap.fromTo(bg,
        { clipPath: 'inset(6% 3.5% 0% 3.5% round 44px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'top 30%', scrub: true } });
    });
  }

  /* =======================================================================
     Fromages : défilement horizontal épinglé (grand écran)
     ======================================================================= */
  function initFromages() {
    const section = $('.fromages');
    if (!section) return;
    const pin = $('.fromages__pin', section);
    const track = $('.fromages__track', section);
    const bar = $('.fromages__progress span', section);
    const cards = $$('.cheese-card', section);
    const mm = gsap.matchMedia();

    mm.add('(min-width: 901px)', () => {
      section.classList.add('has-pin');
      const distance = () => Math.max(0, track.scrollWidth - root.clientWidth);
      const tween = gsap.to(track, { x: () => -distance(), ease: 'none' });
      ScrollTrigger.create({
        trigger: pin, start: 'top top', end: () => `+=${distance()}`,
        pin: true, scrub: 0.8, animation: tween, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => { if (bar) gsap.set(bar, { scaleX: self.progress }); },
      });
      const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' });
      const tick = () => skewTo(gsap.utils.clamp(-6, 6, -scroll.velocity / 300));
      gsap.ticker.add(tick);

      cards.forEach((card) => {
        const art = $('.cheese-card__art svg', card);
        gsap.from(art, {
          rotate: -16, scale: 0.65, y: 40, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 100%', end: 'left 50%', scrub: true },
        });
        gsap.from($('.cheese-card__name', card), {
          xPercent: 30, opacity: 0, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'left 60%', scrub: true },
        });
      });
      return () => {
        gsap.ticker.remove(tick);
        section.classList.remove('has-pin');
      };
    });

    mm.add('(max-width: 900px)', () => {
      gsap.from(cards, {
        x: 80, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: track, start: 'top 85%', once: true },
      });
    });
  }

  /* =======================================================================
     Histoire : les scènes changent avec les étapes (fonctionne aussi sans GSAP)
     ======================================================================= */
  function initStory() {
    const scenes = $$('.story__scene');
    const steps = $$('.story__step');
    const num = $('[data-story-num]');
    if (!scenes.length || !steps.length || !('IntersectionObserver' in window)) return;
    const show = (index) => {
      scenes.forEach((s, i) => s.classList.toggle('is-active', i <= index));
      steps.forEach((s, i) => s.classList.toggle('is-active', i === index));
      if (num) num.textContent = String(index + 1).padStart(2, '0');
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) show(steps.indexOf(entry.target)); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach((s) => io.observe(s));
  }

  function initStoryLoops() {
    const story = $('.story');
    if (!story) return;
    const loops = gsap.timeline({ repeat: -1, paused: true });
    loops.to('.story__wheel', { y: '-=14', duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 1, stagger: { each: 0.35, from: 'random' } })
      .to({}, { duration: 0.8 });
    const knife = gsap.to('.story__knife', { y: '+=58', duration: 0.6, ease: 'power2.inOut', yoyo: true, repeat: -1, repeatDelay: 0.4, paused: true });
    const part = gsap.to('.story__part', { x: '+=18', y: '+=4', duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
    ScrollTrigger.create({
      trigger: story, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => [loops, knife, part].forEach((t) => (self.isActive ? t.play() : t.pause())),
    });
  }

  /* =======================================================================
     Calculateur de plateau
     ======================================================================= */
  function initCalculator() {
    const calc = $('[data-calc]');
    if (!calc) return;
    const range = $('#calc-guests', calc);
    const out = $('#calc-guests-out', calc);
    const weightEl = $('[data-calc-weight]', calc);
    const countEl = $('[data-calc-count]', calc);
    const listEl = $('[data-calc-list]', calc);
    const order = $('[data-calc-order]', calc);
    const pieces = $('.calc__pieces', calc);
    const anim = hasGSAP && !reduceMotion;

    // Grammes de fromage par personne (fourchette basse, haute)
    const RULES = { dessert: [50, 80], apero: [80, 120], repas: [150, 200], raclette: [200, 250] };
    const OCCASIONS = { dessert: 'fin de repas', apero: 'apéritif', repas: 'repas fromage', raclette: 'raclette' };
    const CHEESES = [
      { name: 'Saint-Nectaire fermier', rind: '#d9bf9c', paste: '#fde17e' },
      { name: 'Cantal entre-deux', rind: '#dccdaa', paste: '#fbe49a' },
      { name: 'Fourme d’Ambert', rind: '#e3d9c2', paste: '#fbf0dc', veins: true },
      { name: 'Salers', rind: '#d1ad7b', paste: '#fbd77a' },
      { name: 'Gaperon', rind: '#f7f0e2', paste: '#fdf5e4', pepper: true },
      { name: 'Bleu d’Auvergne', rind: '#efe6d2', paste: '#fbf0dc', veins: true },
      { name: 'un chèvre fermier', rind: '#efe7d8', paste: '#fffaf2' },
    ];
    const RACLETTE = [
      { name: 'Raclette nature', rind: '#e6b45c', paste: '#fbe49a' },
      { name: 'Raclette fumée', rind: '#b98a4e', paste: '#f8d77e' },
      { name: 'un Saint-Nectaire pour les audacieux', rind: '#d9bf9c', paste: '#fde17e' },
    ];
    const SVG_NS = 'http://www.w3.org/2000/svg';
    let lastKey = '';

    const formatWeight = (grams) => {
      if (grams < 1000) return `${Math.round(grams / 50) * 50} g`;
      return `${(Math.round(grams / 100) / 10).toLocaleString('fr-FR')} kg`;
    };
    const sector = (r, half) => {
      const t = (half * Math.PI) / 180;
      const x = (r * Math.cos(t)).toFixed(2);
      const y = (r * Math.sin(t)).toFixed(2);
      return `M0,0 L${x},${-y} A${r},${r} 0 0,1 ${x},${y} Z`;
    };
    const node = (tag, attrs) => {
      const n = document.createElementNS(SVG_NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      return n;
    };

    const renderBoard = (list) => {
      const key = list.map((c) => c.name).join('|');
      if (key === lastKey) return;
      lastKey = key;
      const build = () => {
        pieces.textContent = '';
        const n = list.length;
        const half = Math.min(36, 180 / n - 6);
        list.forEach((c, i) => {
          const holder = node('g', { transform: `rotate(${-90 + (i * 360) / n})` });
          const piece = node('g', { class: 'calc__piece', transform: 'translate(40 0)' });
          piece.appendChild(node('path', { d: sector(108, half), fill: c.rind, stroke: '#3c422e', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
          piece.appendChild(node('path', { d: sector(98, half - 2.5), fill: c.paste }));
          if (c.veins || c.pepper) {
            for (let k = 0; k < 7; k++) {
              const rr = 34 + k * 9;
              const a = ((k % 2 ? 1 : -1) * half * 0.4 * Math.PI) / 180;
              piece.appendChild(node('circle', {
                cx: (rr * Math.cos(a)).toFixed(1), cy: (rr * Math.sin(a)).toFixed(1),
                r: c.veins ? 3 - (k % 3) * 0.6 : 1.4, fill: c.veins ? '#50665c' : '#3c422e',
              }));
            }
          }
          holder.appendChild(piece);
          pieces.appendChild(holder);
        });
        if (anim) {
          gsap.from($$('.calc__piece', pieces), {
            scale: 0, rotation: -40, transformOrigin: '0% 50%', duration: 0.9, ease: 'back.out(1.8)', stagger: 0.07,
          });
        }
      };
      const old = $$('.calc__piece', pieces);
      if (anim && old.length) {
        gsap.to(old, { scale: 0, transformOrigin: '0% 50%', duration: 0.28, ease: 'power2.in', stagger: 0.03, onComplete: build });
      } else {
        build();
      }
    };

    const update = () => {
      const guests = parseInt(range.value, 10);
      const checked = $('input[name="occasion"]:checked', calc);
      const occasion = checked ? checked.value : 'dessert';
      const [lo, hi] = RULES[occasion];
      const weight = `${formatWeight(guests * lo)} à ${formatWeight(guests * hi)}`;
      const list = occasion === 'raclette' ? RACLETTE : CHEESES.slice(0, guests <= 4 ? 3 : guests <= 10 ? 5 : 7);

      out.value = String(guests);
      out.textContent = String(guests);
      weightEl.textContent = weight;
      countEl.textContent = occasion === 'raclette' ? 'Nos idées' : `${list.length} fromages`;
      listEl.textContent = list.map((c) => c.name).join(', ');
      range.style.setProperty('--fill', `${((guests - range.min) / (range.max - range.min)) * 100}%`);

      if (order) {
        const email = order.dataset.email || '';
        const subject = `Commande de plateau — ${guests} personnes`;
        const body = [
          'Bonjour,',
          '',
          `Je souhaiterais commander un plateau pour ${guests} personnes (${OCCASIONS[occasion]}), soit environ ${weight} de fromage.`,
          `Sélection suggérée : ${listEl.textContent}.`,
          '',
          'Date souhaitée : ',
          'Nom : ',
          'Téléphone : ',
          '',
          'Merci !',
        ].join('\n');
        order.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      renderBoard(list);
    };

    range.addEventListener('input', () => {
      update();
      if (anim) gsap.fromTo(out, { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', transformOrigin: '0% 80%' });
    });
    $$('input[name="occasion"]', calc).forEach((radio) => radio.addEventListener('change', update));
    update();
  }

  /* =======================================================================
     Nuage de mots
     ======================================================================= */
  function initCluster() {
    const field = $('.cluster__field');
    if (!field) return;
    const words = $$('.cluster__word', field);
    const inners = words.map((w) => w.firstElementChild);
    const oval = $('.cluster__oval path', field);
    const depth = (w) => parseFloat(getComputedStyle(w).getPropertyValue('--d')) || 1;

    if (oval) gsap.set(oval, { attr: { pathLength: 1 }, strokeDasharray: 1, strokeDashoffset: 1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: field, start: 'top 72%', once: true } });
    tl.from(inners, {
      opacity: 0, scale: 0.4,
      x: () => gsap.utils.random(-260, 260), y: () => gsap.utils.random(-180, 180), rotation: () => gsap.utils.random(-60, 60),
      duration: 1.5, ease: 'expo.out', stagger: { each: 0.06, from: 'random' },
    }).from('.cluster__title', { opacity: 0, scale: 0.85, duration: 1.2, ease: 'expo.out' }, 0.15);
    if (oval) tl.to(oval, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, '-=0.7');

    inners.forEach((inner, i) => {
      const d = depth(words[i]);
      gsap.fromTo(inner, { yPercent: 35 * d }, {
        yPercent: -35 * d, ease: 'none',
        scrollTrigger: { trigger: field, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    if (!finePointer) return;
    const movers = words.map((w) => ({
      d: depth(w),
      x: gsap.quickTo(w, 'x', { duration: 1.3, ease: 'power3' }),
      y: gsap.quickTo(w, 'y', { duration: 1.3, ease: 'power3' }),
    }));
    field.addEventListener('pointermove', (e) => {
      const r = field.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      movers.forEach((m) => { m.x(nx * 70 * m.d); m.y(ny * 46 * m.d); });
    });
    field.addEventListener('pointerleave', () => movers.forEach((m) => { m.x(0); m.y(0); }));
  }

  /* =======================================================================
     Accords : la carte du fromage suit le curseur
     ======================================================================= */
  function initAccords() {
    if (!finePointer) return;
    const list = $('.accords__list');
    const preview = $('.accords__preview');
    if (!list || !preview) return;
    const wheel = $('[data-preview-wheel]', preview);
    const part = $('[data-preview-part]', preview);
    const label = $('[data-preview-label]', preview);
    const xTo = gsap.quickTo(preview, 'x', { duration: 0.65, ease: 'power3' });
    const yTo = gsap.quickTo(preview, 'y', { duration: 0.65, ease: 'power3' });
    const rTo = gsap.quickTo(preview, 'rotation', { duration: 0.9, ease: 'power3' });
    let lastX = 0;
    let calm = null;

    gsap.set(preview, { autoAlpha: 0, scale: 0.5 });
    list.addEventListener('pointerenter', (e) => {
      gsap.set(preview, { x: e.clientX, y: e.clientY });
      gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.7)', overwrite: 'auto' });
    });
    list.addEventListener('pointerleave', () => gsap.to(preview, { autoAlpha: 0, scale: 0.5, duration: 0.35, ease: 'power2.in', overwrite: 'auto' }));
    list.addEventListener('pointermove', (e) => {
      xTo(e.clientX); yTo(e.clientY);
      rTo(gsap.utils.clamp(-20, 20, (e.clientX - lastX) * 0.9));
      lastX = e.clientX;
      clearTimeout(calm);
      calm = setTimeout(() => rTo(0), 120);
    });
    $$('.accord', list).forEach((row) => {
      row.addEventListener('pointerenter', () => {
        const key = row.dataset.cheese;
        wheel.setAttribute('href', `#${key}-wheel`);
        part.setAttribute('href', `#${key}-part`);
        label.textContent = row.dataset.label;
        gsap.fromTo(preview.firstElementChild, { scale: 0.9, rotate: -6 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2.5)' });
      });
    });
  }

  /* =======================================================================
     Infos : la devanture se met en place
     ======================================================================= */
  function initInfos() {
    const shop = $('.infos__shop');
    if (!shop) return;
    gsap.timeline({ scrollTrigger: { trigger: shop, start: 'top 78%', once: true } })
      .from('.shop__sign', { rotation: -8, y: -30, opacity: 0, transformOrigin: '50% 0%', duration: 1.2, ease: 'elastic.out(1, 0.45)' })
      .from('.shop__awning', { scaleY: 0, transformOrigin: '50% 0%', duration: 1.3, ease: 'elastic.out(1, 0.5)' }, 0.15)
      .from('.shop__window use', { y: -24, opacity: 0, duration: 0.8, ease: 'back.out(2)', stagger: 0.08 }, 0.4)
      .from('.shop__board', { x: 60, opacity: 0, duration: 1, ease: 'expo.out', clearProps: 'transform' }, 0.6);
  }

  /* =======================================================================
     Pied de page
     ======================================================================= */
  function initFooter() {
    const footer = $('.footer');
    if (!footer) return;
    const word = $('.footer__word', footer);
    if (word) {
      const chars = [...word.textContent].map((ch) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch === ' ' ? '\u00a0' : ch;
        return span;
      });
      word.textContent = '';
      chars.forEach((c) => word.appendChild(c));
      gsap.from(chars, {
        yPercent: 100, rotate: 6, duration: 1.4, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: word, start: 'top 95%', toggleActions: 'play none none reverse' },
      });
    }
    gsap.from('.footer__ridge--back', {
      y: 60, ease: 'none',
      scrollTrigger: { trigger: footer, start: 'top bottom', end: 'top 40%', scrub: true },
    });
  }

  /* =======================================================================
     Horaires : « ouvert / fermé » en direct (heure de Paris)
     ======================================================================= */
  function initOpenStatus() {
    const rows = $$('[data-hours] tr[data-day]');
    if (!rows.length) return;
    const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + (m || 0); };
    const fmt = (min) => { const h = Math.floor(min / 60); const m = min % 60; return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`; };
    const schedule = {};
    rows.forEach((r) => {
      schedule[r.dataset.day] = (r.dataset.hours || '').split(',').map((s) => s.trim()).filter(Boolean)
        .map((range) => range.split('-').map(toMin));
    });

    const parisNow = () => {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const get = (type) => (parts.find((p) => p.type === type) || {}).value;
      const day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
      return { day, minutes: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    };

    const compute = () => {
      const { day, minutes } = parisNow();
      const today = schedule[day] || [];
      const current = today.find(([a, b]) => minutes >= a && minutes < b);
      if (current) return { open: true, text: `Ouvert · jusqu’à ${fmt(current[1])}`, today: day };
      const laterToday = today.find(([a]) => a > minutes);
      if (laterToday) return { open: false, text: `Fermé · réouverture à ${fmt(laterToday[0])}`, today: day };
      for (let i = 1; i <= 7; i++) {
        const d = (day + i) % 7;
        const slots = schedule[d] || [];
        if (slots.length) {
          const when = i === 1 ? 'demain' : DAY_NAMES[d];
          return { open: false, text: `Fermé · ouvre ${when} à ${fmt(slots[0][0])}`, today: day };
        }
      }
      return { open: false, text: 'Fermé', today: day };
    };

    const render = () => {
      const s = compute();
      $$('[data-status]').forEach((el) => el.classList.toggle('is-open', s.open));
      $$('[data-status-text]').forEach((el) => { el.textContent = s.text; });
      $$('[data-status-pill]').forEach((el) => el.classList.toggle('is-open', s.open));
      $$('[data-status-short]').forEach((el) => { el.textContent = s.open ? 'Ouvert' : 'Fermé'; });
      $$('[data-shop-sign]').forEach((el) => { el.textContent = s.open ? 'OUVERT' : 'FERMÉ'; });
      rows.forEach((r) => r.classList.toggle('is-today', Number(r.dataset.day) === s.today));
    };
    render();
    setInterval(render, 60 * 1000);
  }

  /* =======================================================================
     Fiches recettes (boîtes de dialogue natives)
     ======================================================================= */
  function initDialogs() {
    $$('[data-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dialog = document.getElementById(btn.dataset.dialog);
        if (!dialog || typeof dialog.showModal !== 'function') return;
        dialog.showModal();
        root.classList.add('dialog-open');
        if (lenis) lenis.stop();
      });
    });
    $$('dialog.recipe').forEach((dialog) => {
      dialog.addEventListener('close', () => {
        root.classList.remove('dialog-open');
        if (lenis) lenis.start();
      });
      dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    });
  }

  /* =======================================================================
     Menu plein écran (mobile)
     ======================================================================= */
  function initMenu() {
    const btn = $('.nav__burger');
    const menu = $('#menu');
    const header = $('[data-header]');
    if (!btn || !menu) return;
    const anim = hasGSAP && !reduceMotion;

    const open = () => {
      menu.hidden = false;
      root.classList.add('menu-open');
      header.classList.remove('is-hidden');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Fermer le menu');
      if (lenis) lenis.stop();
      if (anim) {
        gsap.fromTo(menu, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: 0.9, ease: 'expo.inOut' });
        gsap.fromTo('.menu__links a span', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
      }
      const first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    };
    const close = (restoreFocus = true) => {
      root.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Ouvrir le menu');
      if (lenis) lenis.start();
      if (anim) {
        gsap.to(menu, { clipPath: 'circle(0% at 100% 0%)', duration: 0.6, ease: 'expo.inOut', onComplete: () => { menu.hidden = true; } });
      } else {
        menu.hidden = true;
      }
      if (restoreFocus) btn.focus({ preventScroll: true });
    };

    btn.addEventListener('click', () => (root.classList.contains('menu-open') ? close() : open()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) close(); });
  }

  /* =======================================================================
     Divers
     ======================================================================= */
  function initYear() {
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  function debounce(fn, wait) {
    let t = null;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }
})();
