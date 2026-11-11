/* Mobader e5: menu + three faux-UI moments.
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
    var replay = chat.querySelector('[data-replay]');
    var run = 0;

    var playChat = async function () {
      var id = ++run;
      var alive = function () { return id === run; };
      replay.hidden = true;
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
      replay.hidden = false;
    };

    if (!reduce) {
      onView(chat, playChat);
      replay.addEventListener('click', playChat);
    }
  }

  /* ---------- 2. Visit status card ---------- */
  var visit = document.querySelector('[data-visit]');
  var stepsWrap = document.querySelector('[data-steps]');
  if (visit && stepsWrap) {
    var STATES = [
      { status: 'تم استلام طلبك', note: 'وصلنا طلبك من واتساب، والمنسق الطبي بيتصل عليك.' },
      { status: 'المنسق أكد الموعد', note: 'فهمنا حالة المريض، وثبتنا الموعد اللي يناسبك.' },
      { status: 'الطبيبة في الطريق لك', note: 'المنسق أكد الموعد معك، والطبيبة معها ملف الحالة.' },
      { status: 'تقرير الزيارة جاهز', note: 'التشخيص والوصفة وخطة المتابعة، في رسالة وحدة.' }
    ];
    var statusEl = visit.querySelector('[data-status]');
    var noteEl = visit.querySelector('[data-note]');
    var segs = visit.querySelectorAll('[data-track] i');
    var stepBtns = stepsWrap.querySelectorAll('[data-step]');
    var current = 2;
    var auto = 0;

    var setStep = function (n, animate) {
      if (n === current && animate) return;
      current = n;
      stepBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === n)); });
      segs.forEach(function (s, i) {
        s.classList.toggle('done', i < n || (n === 3 && i === 3));
        s.classList.toggle('current', i === n && n !== 3);
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
        for (var n = 1; n < 4; n++) {
          await sleep(2400); if (id !== auto) return;
          setStep(n, true);
        }
      });
    }
  }

  /* ---------- 3. Daily report ---------- */
  var report = document.querySelector('[data-report]');
  if (report && !reduce) {
    var items = report.querySelectorAll('.rp-list li');
    var count = report.querySelector('[data-count]');
    onView(report, async function () {
      items.forEach(function (li) { li.classList.remove('is-done'); });
      count.textContent = 'تم 0 من 4';
      await sleep(600);
      for (var i = 0; i < items.length; i++) {
        items[i].classList.add('is-done');
        count.textContent = 'تم ' + (i + 1) + ' من 4';
        await sleep(650);
      }
    });
  }
})();
