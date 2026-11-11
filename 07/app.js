/* Mobader e1: sentence form, photo swap, menu. Plain JS, no dependencies. */
(function () {
  'use strict';

  var WA = 'https://wa.me/966114170700';
  var IMG = 'https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=1200';
  var SERVICES = {
    doctor:    { id: '7653136',  alt: 'طبيبة تزور أم وطفلها في البيت', cap: 'طبيب يجي للبيت: كشف كامل بدون انتظار ولا زحمة.' },
    nursing:   { id: '7345476',  alt: 'ممرض يقيس ضغط رجل كبير في السن في بيته', cap: 'تمريض منزلي: جروح، إبر ومغذيات، ومتابعة العلامات الحيوية.' },
    companion: { id: '7345465',  alt: 'مرافقة صحية مع رجل كبير في السن في غرفة مشمسة', cap: 'مرافق صحي مقيم: الأدوية، النظافة الشخصية، والحركة كل يوم.' },
    physio:    { id: '20860588', alt: 'أخصائي علاج طبيعي يمدد رجل مريض', cap: 'علاج طبيعي: جلسات تأهيل بعد العمليات والإصابات، في بيتك.' },
    cupping:   { id: '9127577',  alt: 'جد بالثوب مع حفيده في البيت', cap: 'حجامة منزلية: أدوات معقمة وكادر مرخص، للرجال والنساء.' }
  };

  var form = document.getElementById('book');
  var service = document.getElementById('f-service');
  var who = document.getElementById('f-who');
  var area = document.getElementById('f-area');
  var text = document.getElementById('f-text');
  var heroImg = document.getElementById('hero-img');
  var heroCap = document.getElementById('hero-cap');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Size each select to its chosen option, so the sentence reads as one line of text. */
  var probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;inset-block-start:-999px';
  document.body.appendChild(probe);

  function fit(el) {
    var cs = getComputedStyle(el);
    probe.style.font = cs.font;
    probe.textContent = el.tagName === 'SELECT'
      ? el.options[el.selectedIndex].text
      : (el.value || el.placeholder);
    var pad = parseFloat(cs.paddingInlineEnd || cs.paddingLeft) || 0;
    el.style.width = Math.ceil(probe.getBoundingClientRect().width + pad + 4) + 'px';
  }
  function fitAll() { fit(service); fit(who); fit(area); }

  function swapPhoto() {
    var s = SERVICES[service.value];
    if (!s) return;
    var src = IMG.replace(/\{id\}/g, s.id);
    if (heroImg.src === src) return;
    heroCap.textContent = s.cap;
    if (reduced) { heroImg.src = src; heroImg.alt = s.alt; return; }
    var pre = new Image();
    pre.onload = function () {
      heroImg.classList.add('is-swapping');
      setTimeout(function () {
        heroImg.src = src; heroImg.alt = s.alt;
        heroImg.classList.remove('is-swapping');
      }, 200);
    };
    pre.src = src;
  }

  service.addEventListener('change', function () { fit(service); swapPhoto(); });
  who.addEventListener('change', function () { fit(who); });
  area.addEventListener('input', function () { fit(area); });

  /* Arabic "for": الوالدة -> للوالدة, طفلي -> لطفلي */
  function forWho(w) { return w.indexOf('ال') === 0 ? 'ل' + w.slice(1) : 'ل' + w; }

  /* Build the WhatsApp message from the sentence. */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var place = area.value.trim();
    var msg = 'السلام عليكم، أبغى ' + service.options[service.selectedIndex].text +
      ' ' + forWho(who.value) + (place ? ' في حي ' + place : '') + '.';
    text.value = msg;
    window.open(WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  /* Service rows write into the sentence, then bring you back to it. */
  document.querySelectorAll('.svc-pick').forEach(function (btn) {
    btn.addEventListener('click', function () {
      service.value = btn.getAttribute('data-service');
      fit(service); swapPhoto();
      form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      setTimeout(function () { area.focus({ preventScroll: true }); }, reduced ? 0 : 450);
    });
  });

  document.querySelectorAll('[data-focus-form]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      closeMenu();
      form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      setTimeout(function () { area.focus({ preventScroll: true }); }, reduced ? 0 : 450);
    });
  });

  /* Mobile menu */
  var menuBtn = document.querySelector('.menu-btn');
  var drawer = document.getElementById('drawer');
  function closeMenu() {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'فتح القائمة');
  }
  menuBtn.addEventListener('click', function () {
    var open = drawer.hidden;
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); } });

  /* Header hairline after scrolling */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener('resize', fitAll);
})();
