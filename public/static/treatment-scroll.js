/* Patient-first treatment scenes: native scrolling, readable without JavaScript. */
(() => {
  'use strict';
  const sections = [...document.querySelectorAll('.bd-scroll')];
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const number = (value, fallback) => Number.isFinite(Number(value)) && value !== null ? Number(value) : fallback;
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const assetScript = document.querySelector('script[src*="/static/treatment-scroll.js"]');
  const assetQuery = assetScript ? new URL(assetScript.src, location.href).search : '';
  const sequenceURL = '/static/treatment-scroll-sequence.js' + assetQuery;
  let reduced = reducedQuery.matches;
  let raf = 0;
  let headerOffset = 88;
  const states = sections.map(section => {
    const steps = [...section.querySelectorAll('.bd-scroll-step')];
    const visual = section.querySelector('.bd-scroll-visual');
    if (!steps.length || !visual) return null;
    const state = {
      section, visual, steps,
      controls: [...section.querySelectorAll('.bd-scroll-step-control')],
      label: section.querySelector('.bd-scroll-label'),
      counter: section.querySelector('.bd-scroll-counter'),
      toggle: section.querySelector('.bd-scroll-toggle'),
      art: section.querySelector('.bd-scroll-art'), sequence: null, sequenceLoading: false, sequenceFailed: false,
      near: false, paused: false, progress: -1, phase: -1
    };
    section.classList.add('is-enhanced');
    section.setAttribute('data-motion-mode', reduced ? 'reduced' : 'scroll');
    if (state.toggle) {
      state.toggle.hidden = reduced;
      state.toggle.setAttribute('aria-pressed', 'false');
      state.toggle.addEventListener('click', () => {
        state.paused = !state.paused;
        section.setAttribute('data-motion-mode', state.paused ? 'paused' : 'scroll');
        state.toggle.setAttribute('aria-pressed', String(state.paused));
        state.toggle.textContent = state.paused ? state.toggle.dataset.resume : state.toggle.dataset.pause;
        if (!state.paused) requestUpdate();
      });
    }
    const skip = section.querySelector('.bd-scroll-skip');
    skip?.addEventListener('click', event => {
      const target = section.nextElementSibling?.querySelector('h2, h3') || section.querySelector('#bd-scroll-after');
      if (!target) return;
      // Capture before the site's generic smooth-anchor handler, including under
      // reduced motion. Move keyboard focus past the controls as well as the view.
      event.preventDefault();
      event.stopImmediatePropagation();
      target.setAttribute('tabindex', '-1');
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerOffset);
      target.focus({ preventScroll: true });
      window.scrollTo({ top, behavior: 'instant' });
    }, { capture: true });
    state.controls.forEach(control => {
      control.addEventListener('click', () => {
        const index = clamp(number(control.dataset.step, 0), 0, steps.length - 1);
        const step = steps[index];
        if (reduced) {
          step.scrollIntoView({ behavior: 'instant', block: 'center' });
          return;
        }
        const rect = step.getBoundingClientRect();
        const target = window.scrollY + rect.top + rect.height / 2 - readingLine(state);
        // Explicit navigation only. Never intercept wheel, touch, or keyboard scrolling.
        window.scrollTo({ top: Math.max(0, target), behavior: state.paused ? 'auto' : 'smooth' });
        if (state.paused) paint(state, index / Math.max(1, steps.length - 1));
      });
    });
    paint(state, 0);
    return state;
  }).filter(Boolean);

  async function ensureSequence(state) {
    if (reduced || !state.near || !state.art || state.sequence || state.sequenceLoading || state.sequenceFailed) return;
    state.sequenceLoading = true;
    try {
      const module = await import(sequenceURL);
      if (reduced || !state.near || document.hidden) return;
      const config = JSON.parse(state.art.dataset.sequence);
      state.sequence = module.createSequence({ container: state.art, config, onError: () => { state.section.dataset.assetStatus = 'fallback'; }, onReady: () => { state.section.dataset.assetStatus = 'ready'; } });
      state.sequence.update(Math.max(0, state.progress));
    } catch (_) { state.sequenceFailed = true; state.art.classList.remove('has-sequence'); }
    finally { state.sequenceLoading = false; }
  }
  function measureHeader() {
    let bottom = 0;
    document.querySelectorAll('header, nav, #header, #navbar, #main-header, .site-header').forEach(node => {
      if (node.closest('.bd-scroll')) return;
      const style = getComputedStyle(node);
      if (style.position !== 'fixed' && style.position !== 'sticky') return;
      const rect = node.getBoundingClientRect();
      if (rect.top <= 20 && rect.bottom > 0 && rect.bottom < 220) bottom = Math.max(bottom, rect.bottom);
    });
    headerOffset = bottom ? Math.ceil(bottom + 12) : 88;
    states.forEach(state => state.section.style.setProperty('--bd-header-offset', headerOffset + 'px'));
  }
  function readingLine(state) {
    const viewport = window.innerHeight;
    if (mobileQuery.matches) {
      const visualHeight = state.visual.getBoundingClientRect().height;
      const afterVisual = headerOffset + visualHeight;
      return afterVisual + Math.max(60, viewport - afterVisual) * .48;
    }
    return headerOffset + Math.max(150, viewport - headerOffset) * .48;
  }
  function paint(state, progress) {
    const p = clamp(progress);
    const count = state.steps.length;
    const phaseFloat = p * Math.max(1, count - 1);
    const phase = Math.min(count - 1, Math.round(phaseFloat));
    if (Math.abs(state.progress - p) < .0001 && state.phase === phase) return;
    state.progress = p;
    state.sequence?.update(p);
    state.section.style.setProperty('--bd-progress', p.toFixed(5));
    state.section.style.setProperty('--bd-phase-progress', (phaseFloat % 1).toFixed(5));
    state.section.dataset.activeStep = String(phase);
    if (state.phase !== phase) {
      state.phase = phase;
      state.steps.forEach((step, index) => {
        step.classList.toggle('is-active', index === phase);
        step.classList.toggle('is-complete', index < phase);
        if (index === phase) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
      state.controls.forEach(control => {
        if (Number(control.dataset.step) === phase) control.setAttribute('aria-current', 'step');
        else control.removeAttribute('aria-current');
      });
      if (state.label) state.label.textContent = state.steps[phase].dataset.label || '';
      if (state.counter) state.counter.textContent = String(phase + 1).padStart(2, '0') + ' / ' + String(count).padStart(2, '0');
    }
  }
  function update() {
    raf = 0;
    if (document.hidden || reduced) return;
    states.forEach(state => {
      if (!state.near || state.paused) return;
      const first = state.steps[0].getBoundingClientRect();
      const last = state.steps[state.steps.length - 1].getBoundingClientRect();
      const start = first.top + first.height / 2;
      const end = last.top + last.height / 2;
      paint(state, (readingLine(state) - start) / Math.max(1, end - start));
    });
  }
  function requestUpdate() {
    if (!raf && !document.hidden && !reduced) raf = window.requestAnimationFrame(update);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = states.find(item => item.section === entry.target);
      if (!state) return;
      state.near = entry.isIntersecting;
      state.section.classList.toggle('is-near', state.near);
      if (state.near) ensureSequence(state);
    });
    requestUpdate();
  }, { rootMargin: '300px 0px' });
  states.forEach(state => observer.observe(state.section));
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => { measureHeader(); states.forEach(state => state.sequence?.resize()); requestUpdate(); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) { window.cancelAnimationFrame(raf); raf = 0; }
    else { states.forEach(state => { ensureSequence(state); state.sequence?.resize(); }); requestUpdate(); }
  });
  const motionChange = () => {
    reduced = reducedQuery.matches;
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    states.forEach(state => {
      state.section.setAttribute('data-motion-mode', reduced ? 'reduced' : state.paused ? 'paused' : 'scroll');
      if (state.toggle) state.toggle.hidden = reduced;
      if (reduced) { state.sequence?.dispose(); state.sequence = null; paint(state, 0); }
      else ensureSequence(state);
    });
    measureHeader();
    requestUpdate();
  };
  if (reducedQuery.addEventListener) reducedQuery.addEventListener('change', motionChange);
  else reducedQuery.addListener(motionChange);
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(() => { states.forEach(state => state.sequence?.resize()); requestUpdate(); });
    states.forEach(state => resize.observe(state.section));
  }
  measureHeader();
  requestUpdate();
})();
