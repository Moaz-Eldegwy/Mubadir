/* Mobader D3 "Bento" — small vanilla JS. No dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function replay(el, cls) {
    if (reduceMotion || !el) return;
    el.classList.remove(cls);
    void el.offsetWidth; // restart animation
    el.classList.add(cls);
  }

  /* ---------- Header: border on scroll + mobile menu ---------- */
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Segmented tabs (services + packages) ---------- */
  var tabGroups = [];

  function initTabs(list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var thumb = list.querySelector('.seg-thumb');

    function moveThumb(tab) {
      if (!thumb) return;
      thumb.style.left = tab.offsetLeft + 'px';
      thumb.style.width = tab.offsetWidth + 'px';
    }

    function select(tab, opts) {
      opts = opts || {};
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          panel.classList.toggle('is-active', on);
          if (on && opts.animate) replay(panel, 'is-entering');
        }
      });
      moveThumb(tab);
      if (opts.focus) tab.focus();
      if (opts.animate && list.scrollWidth > list.clientWidth) {
        tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, { animate: true }); });
      tab.addEventListener('keydown', function (e) {
        var n = tabs.length, j = null;
        // RTL: Left arrow moves forward, Right arrow moves back.
        if (e.key === 'ArrowLeft') j = (i + 1) % n;
        else if (e.key === 'ArrowRight') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j !== null) { e.preventDefault(); select(tabs[j], { animate: true, focus: true }); }
      });
    });

    var group = {
      list: list,
      refresh: function () {
        var cur = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
        moveThumb(cur);
      },
      selectById: function (panelId) {
        var t = tabs.filter(function (x) { return x.getAttribute('aria-controls') === panelId; })[0];
        if (t) select(t, { animate: true });
      }
    };
    tabGroups.push(group);
    group.refresh();
    return group;
  }

  var groups = {};
  document.querySelectorAll('[data-tabs]').forEach(function (list) {
    groups[list.getAttribute('data-tabs')] = initTabs(list);
  });
  function refreshThumbs() { tabGroups.forEach(function (g) { g.refresh(); }); }
  window.addEventListener('resize', refreshThumbs);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshThumbs);
  window.addEventListener('load', refreshThumbs);

  /* ---------- Booking widget ---------- */
  var form = document.getElementById('bookForm');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.book-step'));
  var stepperItems = Array.prototype.slice.call(document.querySelectorAll('#stepper li'));
  var fill = document.getElementById('stepperFill');
  var count = document.getElementById('bookCount');
  var done = document.getElementById('bookDone');
  var btnNext = document.getElementById('bookNext');
  var btnBack = document.getElementById('bookBack');
  var btnAgain = document.getElementById('bookAgain');
  var phone = document.getElementById('phone');
  var phoneErr = document.getElementById('phoneErr');
  var phoneField = phone.closest('.phone-field');
  var total = steps.length;
  var current = 1;
  var finished = false;

  function val(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  function render() {
    steps.forEach(function (s) {
      var on = !finished && Number(s.getAttribute('data-step')) === current;
      if (on && !s.classList.contains('is-active')) {
        s.classList.add('is-active');
      } else if (!on) {
        s.classList.remove('is-active');
      }
    });
    done.classList.toggle('is-active', finished);

    stepperItems.forEach(function (li, i) {
      var n = i + 1;
      var isDone = finished || n < current;
      li.classList.toggle('is-done', isDone);
      li.classList.toggle('is-active', !finished && n === current);
      if (!finished && n === current) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    fill.style.width = (finished ? 100 : (current / total) * 100) + '%';
    count.textContent = finished ? 'تم إرسال الطلب' : 'الخطوة ' + current + ' من ' + total;

    form.classList.toggle('at-first', current === 1);
    form.classList.toggle('at-last', current === total);
    form.classList.toggle('is-done', finished);

    if (current === 3) {
      document.getElementById('sumService').textContent = val('service');
      document.getElementById('sumTime').textContent = val('day') + '، ' + val('time');
    }
  }

  // Disable time slots that already passed today (Riyadh time).
  function riyadhHour() {
    try {
      var h = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Riyadh' }).format(new Date());
      return parseInt(h, 10) % 24;
    } catch (e) { return new Date().getHours(); }
  }
  function updateTimes() {
    var today = val('day') === 'اليوم';
    var nowH = riyadhHour();
    var needReset = false;
    form.querySelectorAll('input[name="time"][data-hour]').forEach(function (inp) {
      var past = today && Number(inp.getAttribute('data-hour')) <= nowH + 1;
      inp.disabled = past;
      if (past && inp.checked) needReset = true;
    });
    if (needReset) form.querySelector('input[name="time"]:not([data-hour])').checked = true;
  }
  form.querySelectorAll('input[name="day"]').forEach(function (r) { r.addEventListener('change', updateTimes); });

  function cleanPhone() {
    var d = phone.value.replace(/[^\d٠-٩]/g, '').replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); });
    if (d.indexOf('966') === 0) d = d.slice(3);
    if (d.charAt(0) === '0') d = d.slice(1);
    return d;
  }
  function validPhone() {
    var ok = /^5\d{8}$/.test(cleanPhone());
    phoneField.classList.toggle('has-err', !ok);
    phone.setAttribute('aria-invalid', String(!ok));
    phoneErr.textContent = ok ? '' : 'اكتب رقم جوال سعودي صحيح، مثل 5X XXX XXXX';
    return ok;
  }
  phone.addEventListener('input', function () {
    if (phoneField.classList.contains('has-err')) validPhone();
  });

  function go(n, focus) {
    current = Math.max(1, Math.min(total, n));
    if (current === 2) updateTimes();
    render();
    if (focus) {
      var target = current === 3 ? phone : steps[current - 1].querySelector('input:checked');
      if (target) target.focus({ preventScroll: true });
    }
  }

  btnNext.addEventListener('click', function () { go(current + 1, true); });
  btnBack.addEventListener('click', function () { go(current - 1, true); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (current !== total) { go(current + 1, true); return; }
    if (!validPhone()) { phone.focus(); return; }
    // Prototype only: no network request. Connect to the real form handler in WordPress.
    finished = true;
    render();
    done.focus({ preventScroll: true });
  });

  // Enter in the phone field submits; Enter elsewhere moves forward.
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.type === 'radio') { e.preventDefault(); go(current + 1, true); }
  });

  btnAgain.addEventListener('click', function () {
    finished = false;
    phone.value = '';
    phoneErr.textContent = '';
    phoneField.classList.remove('has-err');
    go(1, true);
  });

  // "Book this service" buttons across the page pre-fill the widget.
  document.querySelectorAll('[data-book]').forEach(function (a) {
    a.addEventListener('click', function () {
      var name = a.getAttribute('data-book');
      var radio = form.querySelector('input[name="service"][value="' + name + '"]');
      if (radio) radio.checked = true;
      finished = false;
      go(2, false);
    });
  });

  // "See packages" from the companion service opens the right package tab.
  document.querySelectorAll('[data-pack]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (groups.pk) groups.pk.selectById('pk-' + a.getAttribute('data-pack'));
    });
  });

  render();
})();
