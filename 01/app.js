// Mobader d8-soft: WhatsApp prefilled links, mobile menu, callback form (prototype). No scroll animations.
(function () {
  var WA = 'https://wa.me/966114170700';
  var code = 'M-' + Math.floor(1000 + Math.random() * 9000);

  function waLink(service) {
    return WA + '?text=' + encodeURIComponent('مرحبا، أبي أحجز ' + service + '. رمز الطلب: ' + code);
  }

  // data-wa = general booking; data-wa-svc = booking for one service.
  document.querySelectorAll('[data-wa], [data-wa-svc]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa-svc') || 'خدمة منزلية');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Callback form: prototype only, nothing is sent.
  var form = document.getElementById('cbForm');
  if (form) {
    var err = document.getElementById('cbErr');
    var done = document.getElementById('cbDone');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      form.querySelectorAll('input').forEach(function (f) {
        var bad = !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 9);
        f.setAttribute('aria-invalid', String(bad));
        if (bad && !first) first = f;
      });
      err.hidden = !first;
      if (first) { first.focus(); return; }
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
  }

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
