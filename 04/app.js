/* Mobader 04: menu, two faux-UI moments, WhatsApp codes, demo form.
   The HTML already holds every final state, so with no JS or with
   reduced motion everything is visible. Scripts only replay the story. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- Mobile menu ---------- */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      nav.classList.toggle('is-open', open);
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* Run fn once when el is half in view */
  function onView(el, fn) {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); fn(); }
      });
    }, { threshold: 0.45 });
    io.observe(el);
  }

  /* ---------- 1. WhatsApp booking chat ---------- */
  var chat = document.querySelector('[data-chat]');
  if (chat) {
    var msgs = Array.prototype.slice.call(chat.querySelectorAll('.msg'));
    var card = chat.querySelector('.card-bubble');
    var tap = chat.querySelector('.tap');
    var cta = chat.querySelector('[data-chat-cta]');
    var run = 0;

    var playChat = async function () {
      var id = ++run;
      var alive = function () { return id === run; };
      cta.classList.add('is-waiting');
      // Snap to the opening frame: the first message only.
      msgs.forEach(function (m, i) { m.classList.remove('is-typing'); m.classList.toggle('is-pending', i > 0); });
      chat.classList.add('chat-unconfirmed');
      await sleep(900); if (!alive()) return;

      for (var i = 1; i < msgs.length; i++) {
        var m = msgs[i];
        if (m.classList.contains('in')) {
          m.classList.add('is-typing');
          await sleep(i === 3 ? 1300 : 1100); if (!alive()) return;
          m.classList.remove('is-typing');
        }
        m.classList.remove('is-pending');
        if (i === 3) {
          // The customer reads the summary, then taps confirm.
          await sleep(1700); if (!alive()) return;
          tap.classList.remove('is-on'); void tap.offsetWidth; tap.classList.add('is-on');
          await sleep(220); if (!alive()) return;
          chat.classList.remove('chat-unconfirmed');
        }
        await sleep(950); if (!alive()) return;
      }
      cta.classList.remove('is-waiting');
    };

    if (!reduce) {
      cta.classList.add('is-waiting');
      onView(chat, playChat);
    }
  }

  /* ---------- 2. Visit status card ---------- */
  var visit = document.querySelector('[data-visit]');
  var stepsWrap = document.querySelector('[data-steps]');
  if (visit && stepsWrap) {
    var STATES = [
      { status: 'وصلنا طلبكم', note: 'قلتوا لنا وش تحتاجون ووين البيت، ونرتب الخدمة المناسبة.' },
      { status: 'الممرض في الطريق لكم', note: 'رتبنا الخدمة المناسبة، والممرض جاي لكم بأدواته.' },
      { status: 'نطمّن عليكم بعد الزيارة', note: 'نتابع الحالة معكم، ونرتب أي خطوة بعدها.' }
    ];
    var LAST = STATES.length - 1;
    var statusEl = visit.querySelector('[data-status]');
    var noteEl = visit.querySelector('[data-note]');
    var segs = visit.querySelectorAll('[data-track] i');
    var stepBtns = stepsWrap.querySelectorAll('[data-step]');
    var current = 1;
    var auto = 0;

    var setStep = function (n, animate) {
      if (n === current && animate) return;
      current = n;
      stepBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === n)); });
      segs.forEach(function (s, i) {
        s.classList.toggle('done', i < n || (n === LAST && i === LAST));
        s.classList.toggle('current', i === n && n !== LAST);
      });
      var s = STATES[n];
      if (!animate || reduce) { statusEl.textContent = s.status; noteEl.textContent = s.note; return; }
      statusEl.classList.add('is-out');
      noteEl.classList.add('is-fading');
      setTimeout(function () {
        statusEl.textContent = s.status;
        noteEl.textContent = s.note;
        statusEl.classList.remove('is-out');
        statusEl.classList.add('is-in');
        void statusEl.offsetWidth;
        statusEl.classList.remove('is-in');
        noteEl.classList.remove('is-fading');
      }, 300);
    };

    stepBtns.forEach(function (b) {
      b.addEventListener('click', function () { auto++; setStep(Number(b.dataset.step), true); });
    });

    if (!reduce) {
      onView(visit, async function () {
        var id = ++auto;
        setStep(0, false);
        for (var n = 1; n <= LAST; n++) {
          await sleep(2400); if (id !== auto) return;
          setStep(n, true);
        }
      });
    }
  }

  /* ---------- 3. WhatsApp links get a request code ---------- */
  var code = 'M-' + Math.floor(1000 + Math.random() * 9000);
  document.querySelectorAll('[data-wa-svc]').forEach(function (a) {
    a.href = 'https://wa.me/966114170700?text=' + encodeURIComponent('مرحبا، أبي أحجز ' + a.dataset.waSvc + '. رمز الطلب: ' + code);
  });

  /* ---------- 4. Callback form (demo only, sends nothing) ---------- */
  var form = document.getElementById('cbForm');
  if (form) {
    var err = document.getElementById('cbErr');
    var done = document.getElementById('cbDone');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = ['name', 'phone', 'district'].every(function (n) { return form.elements[n].value.trim() !== ''; });
      err.hidden = ok;
      if (!ok) return;
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
  }
})();
