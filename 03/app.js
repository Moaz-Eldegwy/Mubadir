/* Mobader · D4 "Guided care" · small vanilla JS, no dependencies */
(() => {
  'use strict';

  const WA = 'https://wa.me/966114170700';
  const img = (id, w) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Content model for the guided flow ---------- */
  const SERVICES = {
    doctor: {
      name: 'زيارة طبيب منزلية',
      photo: 7653136, alt: 'طبيبة تزور أما وطفلها في البيت',
      includes: ['كشف كامل في البيت بدون انتظار', 'تشخيص ووصفة طبية في نفس الزيارة']
    },
    nursing: {
      name: 'متابعة تمريض',
      photo: 8088861, alt: 'يد مقدمة الرعاية تعطي الدواء لشخص كبير في السن',
      includes: ['ممرضة مرخصة للإبر والمغذيات والجروح', 'قياس العلامات الحيوية ومتابعة الأدوية']
    },
    companion: {
      name: 'مرافق صحي',
      photo: 7345465, alt: 'مقدمة رعاية مع رجل كبير في السن في غرفة مشمسة',
      includes: ['عناية يومية بالأدوية والنظافة والحركة', 'بالساعات أو مقيم، حسب احتياجكم']
    },
    physio: {
      name: 'جلسات علاج طبيعي',
      photo: 20860588, alt: 'أخصائي علاج طبيعي يحرك ساق مريض',
      includes: ['أخصائي علاج طبيعي يجيكم البيت', 'خطة تمارين تناسب الحالة وتتابع معها']
    },
    cupping: {
      name: 'حجامة منزلية',
      photo: 7984733, alt: 'رجل سعودي بالشماغ يبتسم أمام حاسوبه',
      includes: ['حجامة طبية بأدوات معقمة', 'كادر مرخص، للرجال والنساء']
    }
  };

  const WHO = {
    elder: {
      q: 'وش يحتاج الوالد أو الوالدة؟', for: 'لوالدك أو والدتك', waFor: 'للوالد أو الوالدة',
      needs: [
        ['كشف ومتابعة مع طبيب', 'doctor'],
        ['أدوية وقياس ضغط وسكر', 'nursing'],
        ['أحد يكون معه خلال اليوم', 'companion'],
        ['يمشي ويتحرك أحسن', 'physio'],
        ['جروح أو قسطرة', 'nursing']
      ]
    },
    child: {
      q: 'وش يحتاج طفلك؟', for: 'لطفلك', waFor: 'لطفلي',
      needs: [
        ['حرارة أو كحة', 'doctor'],
        ['كشف عام في البيت', 'doctor'],
        ['إبرة أو مغذي', 'nursing']
      ]
    },
    me: {
      q: 'وش تحتاج؟', for: 'لك', waFor: 'لي',
      needs: [
        ['كشف طبيب بدون انتظار', 'doctor'],
        ['مغذي أو إبرة', 'nursing'],
        ['آلام ظهر أو مفاصل', 'physio'],
        ['حجامة', 'cupping']
      ]
    },
    postop: {
      q: 'وش يحتاج بعد العملية؟', for: 'لمن رجع البيت بعد عملية', waFor: 'لشخص بعد عملية',
      needs: [
        ['تغيير الجروح والضماد', 'nursing'],
        ['تأهيل وعلاج طبيعي', 'physio'],
        ['مرافق بعد الخروج من المستشفى', 'companion'],
        ['متابعة مع طبيب', 'doctor']
      ]
    }
  };
  const UNSURE = ['مو متأكد، أبي أستشير', 'doctor'];

  /* ---------- Flow state ---------- */
  const flow = document.getElementById('flow');
  if (flow) {
    const steps = [...flow.querySelectorAll('.flow-step')];
    const bars = [...flow.querySelectorAll('.flow-progress i')];
    const progress = flow.querySelector('.flow-progress');
    const count = document.getElementById('flowCount');
    const back = document.getElementById('flowBack');
    const needsBox = document.getElementById('needs');
    const needQ = document.getElementById('needQ');
    const toRec = document.getElementById('toRec');
    const whoBtns = [...flow.querySelectorAll('.who')];
    const check = '<span class="need-box" aria-hidden="true"><svg class="ic"><use href="#i-check"/></svg></span>';

    const state = { step: 1, who: null, picked: [] };
    let busy = false;

    const showStep = (n, dir = 'fwd') => {
      if (busy || n === state.step) return;
      const from = steps[state.step - 1];
      const to = steps[n - 1];
      const done = () => {
        from.hidden = true;
        from.classList.remove('is-leaving', 'from-back');
        to.hidden = false;
        to.classList.toggle('from-back', dir === 'back');
        to.classList.add('is-entering', 'is-active');
        from.classList.remove('is-active');
        state.step = n;
        updateBar();
        const q = to.querySelector('.flow-q');
        if (q) q.focus({ preventScroll: true });
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

    const updateBar = () => {
      bars.forEach((b, i) => b.classList.toggle('on', i < state.step));
      progress.setAttribute('aria-valuenow', String(state.step));
      count.textContent = `${state.step} من 3`;
      back.hidden = state.step === 1;
      flow.dataset.step = String(state.step);
    };

    // On phones, keep the top of the flow card visible after a step change.
    const keepInView = () => {
      const top = flow.getBoundingClientRect().top;
      const headerH = document.getElementById('header')?.offsetHeight || 0;
      if (top < headerH || top > window.innerHeight * 0.5) {
        window.scrollTo({ top: window.scrollY + top - headerH - 12, behavior: reduceMotion() ? 'auto' : 'smooth' });
      }
    };

    const renderNeeds = () => {
      const who = WHO[state.who];
      needQ.textContent = who.q;
      const list = [...who.needs, UNSURE];
      needsBox.innerHTML = list.map(([label, svc], i) =>
        `<button type="button" class="need${i === list.length - 1 ? ' need--unsure' : ''}" aria-pressed="false" data-i="${i}" data-svc="${svc}">${check}<span>${label}</span></button>`
      ).join('');
      state.picked = [];
      toRec.disabled = true;
    };

    whoBtns.forEach(btn => btn.addEventListener('click', () => {
      if (busy) return;
      const changed = state.who !== btn.dataset.who;
      whoBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      state.who = btn.dataset.who;
      if (changed || !needsBox.children.length) renderNeeds();
      // Short pause so the selected state is seen before moving on.
      setTimeout(() => showStep(2), reduceMotion() ? 0 : 260);
    }));

    needsBox.addEventListener('click', (e) => {
      const btn = e.target.closest('.need');
      if (!btn) return;
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      const i = Number(btn.dataset.i);
      state.picked = on ? [...state.picked, i] : state.picked.filter(x => x !== i);
      toRec.disabled = state.picked.length === 0;
    });

    const renderRec = () => {
      const who = WHO[state.who];
      const list = [...who.needs, UNSURE];
      const keys = [];
      state.picked.forEach(i => { const k = list[i][1]; if (!keys.includes(k)) keys.push(k); });
      const top = keys.slice(0, 2);
      const names = top.map(k => SERVICES[k].name);
      const title = `ننصحك بـ: ${names.join(' + ')}`;
      const first = SERVICES[top[0]];

      document.getElementById('recTitle').textContent = title;
      document.getElementById('recLead').textContent =
        `حسب اختياراتك، هذا اللي يناسب ${who.for}. نجهز الكادر المناسب ونتابع معكم بعد الزيارة.`;

      const items = top.flatMap(k => SERVICES[k].includes).concat('منسق طبي يتواصل معك ويرتب الموعد');
      document.getElementById('recList').innerHTML = items
        .map(t => `<li><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg><span>${t}</span></li>`).join('');

      const im = document.getElementById('recImg');
      im.src = img(first.photo, 900);
      im.alt = first.alt;

      const msg = `السلام عليكم، أبي أحجز ${names.join(' و')} ${who.waFor}.`;
      document.getElementById('recWa').href = `${WA}?text=${encodeURIComponent(msg)}`;
    };

    toRec.addEventListener('click', () => {
      if (!state.picked.length) return;
      renderRec();
      showStep(3);
    });

    back.addEventListener('click', () => showStep(state.step - 1, 'back'));

    document.getElementById('restart').addEventListener('click', () => {
      whoBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      state.who = null;
      needsBox.innerHTML = '';
      showStep(1, 'back');
    });

    updateBar();
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

  /* ---------- Services carousel buttons (RTL aware) ---------- */
  const car = document.getElementById('car');
  if (car) {
    const isRTL = getComputedStyle(car).direction === 'rtl';
    const stepSize = () => {
      const card = car.querySelector('.svc');
      return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(car).columnGap || 16) : 320;
    };
    document.querySelectorAll('[data-car]').forEach(btn => btn.addEventListener('click', () => {
      const dir = btn.dataset.car === 'next' ? 1 : -1;
      // In RTL, "next" moves toward negative scrollLeft.
      car.scrollBy({ left: (isRTL ? -dir : dir) * stepSize(), behavior: reduceMotion() ? 'auto' : 'smooth' });
    }));
  }
})();
