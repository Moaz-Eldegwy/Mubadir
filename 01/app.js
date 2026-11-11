// Mobader d8-soft: WhatsApp prefilled links + mobile menu. No scroll animations.
(function () {
  var WA = 'https://wa.me/966114170700';

  // Any element with data-wa gets a WhatsApp link with that message prefilled.
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    var msg = a.getAttribute('data-wa');
    if (msg) a.href = WA + '?text=' + encodeURIComponent(msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  var use = btn.querySelector('use');

  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    menu.hidden = !open;
    if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
  }

  btn.addEventListener('click', function () {
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && !menu.hidden) setOpen(false);
  });
})();
