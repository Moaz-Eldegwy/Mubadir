// Mobader d5 "Concierge" — vanilla JS, no dependencies
(() => {
  const img = (id, w) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

  // Sticky header border
  const hdr = document.getElementById('hdr');
  const onScroll = () => hdr.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  const nav = document.getElementById('mainNav'), mb = document.getElementById('menuBtn');
  mb.addEventListener('click', () => { const o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') { nav.classList.remove('open'); mb.setAttribute('aria-expanded', false); } });

  // Expanding service panels (hover on desktop, tap/focus everywhere)
  const panels = [...document.querySelectorAll('.panel')];
  const open = (p) => panels.forEach(x => x.classList.toggle('on', x === p));
  const desktop = matchMedia('(min-width: 1081px)');
  panels.forEach(p => {
    p.addEventListener('mouseenter', () => desktop.matches && open(p));
    p.addEventListener('focus', () => open(p));
    p.addEventListener('click', () => open(p));
  });

  // Situations switcher
  const data = [
    { img: 6975192, title: 'رعاية يومية لكبار السن في بيتهم',
      items: ['مرافق صحي مقيم أو بالساعات يعتني بالأدوية والنظافة والحركة', 'زيارة طبيب دورية لمتابعة الضغط والسكر', 'تقرير أسبوعي للأهل من المنسق الطبي'],
      rec: 'مرافق صحي مقيم + زيارة طبيب شهرية', msg: 'أبي رعاية لكبير سن' },
    { img: 8088861, title: 'متابعة بعد العملية بدون مراجعات',
      items: ['ممرضة تغير الجروح وتتابع العلامات الحيوية', 'إبر ومغذيات حسب وصفة الطبيب', 'جلسات علاج طبيعي لاستعادة الحركة'],
      rec: 'تمريض منزلي + علاج طبيعي', msg: 'أبي متابعة بعد عملية' },
    { img: 5998455, title: 'طبيب يكشف على طفلك في البيت',
      items: ['كشف كامل بدون انتظار في الطوارئ', 'وصفة طبية وطلب تحاليل في نفس الزيارة', 'طبيبة عند الطلب'],
      rec: 'زيارة طبيب منزلية', msg: 'أبي طبيب لطفلي' },
    { img: 4506073, title: 'علاج طبيعي يجيك لين البيت',
      items: ['تقييم أولي وخطة جلسات مكتوبة', 'تمارين تأهيل للظهر والركبة وبعد الجلطات', 'متابعة التحسن جلسة بجلسة'],
      rec: 'باقة جلسات علاج طبيعي', msg: 'أبي جلسات علاج طبيعي' },
  ];
  const card = document.getElementById('sitBody');
  const pic = document.getElementById('sitImg');
  const check = '<svg class="ico"><use href="#check"/></svg>';
  const render = (k) => {
    const d = data[k];
    pic.style.opacity = 0;
    const next = new Image(); next.src = img(d.img, 1000);
    next.onload = () => { pic.src = next.src; pic.style.opacity = 1; };
    card.classList.remove('fade'); void card.offsetWidth; card.classList.add('fade');
    card.innerHTML = `<h3>${d.title}</h3><ul>${d.items.map(i => `<li>${check}${i}</li>`).join('')}</ul>
      <div class="rec"><div><span>ننصحك بـ</span><b>${d.rec}</b></div>
      <a class="btn btn-plum" href="https://wa.me/966114170700?text=${encodeURIComponent(d.msg)}"><svg class="ico"><use href="#wa"/></svg>اسأل المنسق</a></div>`;
  };
  document.querySelectorAll('.sit-btn').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.sit-btn').forEach(x => x.setAttribute('aria-selected', x === b));
    render(+b.dataset.k);
  }));
  render(0);

  // Reviews row arrows (RTL: "next" scrolls toward the left)
  const row = document.getElementById('rvRow');
  document.querySelectorAll('.row-ctrl button').forEach(b => b.addEventListener('click', () => {
    row.scrollBy({ left: -b.dataset.dir * (row.clientWidth * .8), behavior: 'smooth' });
  }));
})();
