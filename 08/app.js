// Mobader e3 — small vanilla JS: care console tabs, mobile menu, quotes scroller, WhatsApp booking form.
(function () {
  'use strict';

  // ----- Header shadow on scroll -----
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile menu -----
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.getElementById('mobile-nav');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    mobileNav.hidden = !open;
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });

  // ----- Care console (ARIA tabs, automatic activation, RTL arrow keys) -----
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    var select = document.getElementById('f-service');
    if (select) select.value = tab.dataset.service;
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      // In RTL, ArrowLeft moves forward (visually next), ArrowRight moves back.
      var next = null;
      if (e.key === 'ArrowLeft') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowRight') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  // Links that open a given service in the console
  document.querySelectorAll('[data-open]').forEach(function (link) {
    link.addEventListener('click', function () {
      var tab = document.querySelector('.tab[data-service="' + link.dataset.open + '"]');
      if (tab) selectTab(tab, false);
    });
  });

  // ----- Testimonials scroller -----
  var track = document.getElementById('quotes');
  var prev = document.querySelector('[data-dir="prev"]');
  var next = document.querySelector('[data-dir="next"]');
  function step() { var card = track.querySelector('.quote'); return card ? card.getBoundingClientRect().width + 24 : 300; }
  function updateCtrl() {
    // RTL: scrollLeft runs from 0 to negative values in modern browsers.
    var max = track.scrollWidth - track.clientWidth;
    var pos = Math.abs(track.scrollLeft);
    prev.disabled = pos < 4;
    next.disabled = pos > max - 4;
    var hide = max < 4;
    prev.parentElement.hidden = hide;
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  prev.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
  next.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
  track.addEventListener('scroll', updateCtrl, { passive: true });
  window.addEventListener('resize', updateCtrl);
  updateCtrl();

  // ----- Booking form: builds a WhatsApp message, sends nothing to any server -----
  var form = document.getElementById('book-form');
  var phone = document.getElementById('f-phone');
  var err = document.getElementById('f-phone-err');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = phone.value.replace(/[\s-]/g, '').replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); });
    if (!/^(05\d{8}|\+?9665\d{8})$/.test(raw)) {
      phone.setAttribute('aria-invalid', 'true');
      err.textContent = 'اكتب رقم جوال سعودي صحيح، مثل 0512345678';
      phone.focus();
      return;
    }
    phone.removeAttribute('aria-invalid');
    err.textContent = '';
    var service = document.getElementById('f-service');
    var area = document.getElementById('f-area').value.trim();
    var msg = 'السلام عليكم، أبغى أحجز: ' + service.options[service.selectedIndex].text +
      (area ? '\nالحي: ' + area : '') + '\nرقم الجوال: ' + raw;
    window.open('https://wa.me/966114170700?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
  phone.addEventListener('input', function () {
    if (phone.getAttribute('aria-invalid')) { phone.removeAttribute('aria-invalid'); err.textContent = ''; }
  });
})();
