// Mobader service page (prototype): WhatsApp prefilled links, menu, form, slider. Based on design 01.
(function () {
  var WA = 'https://wa.me/966114170700';
  var code = 'M-' + Math.floor(1000 + Math.random() * 9000);

  function waLink(service) {
    return WA + '?text=' + encodeURIComponent('مرحبا، أبي أحجز ' + service + '. رمز الطلب: ' + code);
  }

  // data-wa = general booking; data-wa-svc = booking for one service.
  document.querySelectorAll('[data-wa], [data-wa-svc]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa-svc') || 'زيارة طبيب في البيت');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Floating WhatsApp button (contact-fab.js runs first): use this page's message.
  var fabWa = document.querySelector('.mfab-wa');
  if (fabWa) fabWa.href = waLink('زيارة طبيب في البيت');

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

  // Reviews slider: prev/next arrows (RTL: "next" scrolls toward the left).
  var track = document.getElementById('rvTrack');
  if (track) {
    var rtl = getComputedStyle(track).direction === 'rtl';
    var prev = document.querySelector('.rv-btn[data-dir="prev"]');
    var next = document.querySelector('.rv-btn[data-dir="next"]');
    var step = function () {
      var c = track.firstElementChild;
      return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
    };
    var sync = function () {
      var max = track.scrollWidth - track.clientWidth;
      var pos = Math.abs(track.scrollLeft);
      if (prev) prev.disabled = pos <= 2;
      if (next) next.disabled = pos >= max - 2;
    };
    [prev, next].forEach(function (b) {
      if (!b) return;
      b.addEventListener('click', function () {
        var dir = b.getAttribute('data-dir') === 'next' ? 1 : -1;
        track.scrollBy({ left: dir * step() * (rtl ? -1 : 1), behavior: 'smooth' });
      });
    });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  // Option B: one panel at a time. Tabs, chooser and any #anchor open the matching panel.
  (function () {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
    if (!panels.length) return;
    function show(id, scroll) {
      var p = document.getElementById(id);
      if (!p || !p.classList.contains('panel')) return false;
      panels.forEach(function (x) { x.hidden = x !== p; });
      tabs.forEach(function (t) { t.setAttribute('aria-current', t.getAttribute('href') === '#' + id ? 'true' : 'false'); });
      var nav = document.querySelector('.tab-nav');
      var cur = document.querySelector('.tab[aria-current="true"]');
      if (nav && cur && nav.scrollWidth > nav.clientWidth) {
        var nr = nav.getBoundingClientRect(), cr = cur.getBoundingClientRect();
        nav.scrollLeft += (cr.left + cr.width / 2) - (nr.left + nr.width / 2);
      }
      if (scroll) p.scrollIntoView({ block: 'start', behavior: scroll === 'smooth' ? 'smooth' : 'auto' });
      return true;
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (show(id, 'smooth')) { e.preventDefault(); history.replaceState(null, '', '#' + id); }
    });
    window.addEventListener('hashchange', function () { show(location.hash.slice(1), 'smooth'); });
    var h = decodeURIComponent(location.hash.slice(1));
    if (!show(h, true)) show(panels[0].id, false);
  })();

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
