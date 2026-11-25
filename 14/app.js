/* Mobader · option 14 "Guided care, new copy" · small vanilla JS, no dependencies */
(() => {
  'use strict';

  const WA = 'https://wa.me/966114170700';
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const newCode = () => `G-${Math.floor(1000 + Math.random() * 9000)}`;
  const waLink = (msg) => `${WA}?text=${encodeURIComponent(msg)}`;
  let code = newCode();

  /* ---------- Prefilled WhatsApp links (general + per service) ---------- */
  const fillWaLinks = () => {
    document.querySelectorAll('[data-wa]').forEach(a => {
      a.href = waLink(`مرحبا، أبي أحجز خدمة منزلية. رمز الطلب: ${code}`);
    });
    document.querySelectorAll('[data-wa-svc]').forEach(a => {
      a.href = waLink(`مرحبا، أبي أحجز ${a.dataset.waSvc}. رمز الطلب: ${code}`);
    });
  };
  fillWaLinks();

  /* ---------- Hero chooser: who → what → WhatsApp ---------- */
  const WHO = {
    elder: { q: 'وش يحتاج الوالد أو الوالدة؟', wa: 'والدي أو والدتي' },
    child: { q: 'وش يحتاج طفلكم؟', wa: 'طفلي' },
    me: { q: 'وش تحتاج؟', wa: 'نفسي' },
    postop: { q: 'وش يحتاج بعد العملية؟', wa: 'شخص بعد عملية' }
  };

  const flow = document.getElementById('flow');
  if (flow) {
    const steps = [...flow.querySelectorAll('.flow-step')];
    const bars = [...flow.querySelectorAll('.flow-progress i')];
    const progress = flow.querySelector('.flow-progress');
    const count = document.getElementById('flowCount');
    const back = document.getElementById('flowBack');
    const needQ = document.getElementById('needQ');
    const whoBtns = [...flow.querySelectorAll('.who')];
    const needBtns = [...flow.querySelectorAll('.need')];
    const state = { step: 1, who: null, svc: null };
    let busy = false;

    const updateBar = () => {
      bars.forEach((b, i) => b.classList.toggle('on', i < state.step));
      progress.setAttribute('aria-valuenow', String(state.step));
      count.textContent = `${state.step} من 3`;
      back.hidden = state.step === 1;
      flow.dataset.step = String(state.step);
    };

    // On phones, keep the top of the card visible after a step change.
    const keepInView = () => {
      const top = flow.getBoundingClientRect().top;
      const headerH = document.getElementById('header')?.offsetHeight || 0;
      if (top < headerH || top > window.innerHeight * 0.5) {
        window.scrollTo({ top: window.scrollY + top - headerH - 12, behavior: reduceMotion() ? 'auto' : 'smooth' });
      }
    };

    const showStep = (n, dir = 'fwd') => {
      if (busy || n === state.step) return;
      const from = steps[state.step - 1];
      const to = steps[n - 1];
      const done = () => {
        from.hidden = true;
        from.classList.remove('is-leaving', 'from-back', 'is-active');
        to.hidden = false;
        to.classList.toggle('from-back', dir === 'back');
        to.classList.add('is-entering', 'is-active');
        state.step = n;
        updateBar();
        to.querySelector('.flow-q')?.focus({ preventScroll: true });
        keepInView();
        setTimeout(() => to.classList.remove('is-entering', 'from-back'), 450);
        busy = false;
      };
      busy = true;
      if (reduceMotion()) { done(); return; }
      from.classList.toggle('from-back', dir === 'back');
      from.classList.add('is-leaving');
      setTimeout(done, 190);
    };

    const pause = (fn) => setTimeout(fn, reduceMotion() ? 0 : 240);

    whoBtns.forEach(btn => btn.addEventListener('click', () => {
      if (busy) return;
      whoBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      state.who = btn.dataset.who;
      needQ.textContent = WHO[state.who].q;
      pause(() => showStep(2));
    }));

    needBtns.forEach(btn => btn.addEventListener('click', () => {
      if (busy) return;
      needBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      state.svc = btn.dataset.svc;
      const msg = `مرحبا، أبي أحجز ${state.svc} لـ${WHO[state.who].wa}. رمز الطلب: ${code}`;
      document.getElementById('recMsg').textContent = msg;
      document.getElementById('recWa').href = waLink(msg);
      pause(() => showStep(3));
    }));
    needBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));

    back.addEventListener('click', () => showStep(state.step - 1, 'back'));

    document.getElementById('restart').addEventListener('click', () => {
      [...whoBtns, ...needBtns].forEach(b => b.setAttribute('aria-pressed', 'false'));
      state.who = state.svc = null;
      code = newCode();
      fillWaLinks();
      showStep(1, 'back');
    });

    updateBar();
  }

  /* ---------- Callback form (prototype: no sending) ---------- */
  const form = document.getElementById('cbForm');
  if (form) {
    const err = document.getElementById('cbErr');
    const doneBox = document.getElementById('cbDone');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll('input')];
      let ok = true;
      fields.forEach(f => {
        const bad = !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 9);
        f.setAttribute('aria-invalid', String(bad));
        if (bad) ok = false;
      });
      err.hidden = ok;
      if (!ok) { fields.find(f => f.getAttribute('aria-invalid') === 'true')?.focus(); return; }
      form.hidden = true;
      doneBox.hidden = false;
      doneBox.focus();
    });
  }

  /* ---------- Header: border on scroll + mobile menu ---------- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });
})();
