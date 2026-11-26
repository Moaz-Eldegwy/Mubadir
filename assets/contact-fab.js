/* Mobader floating contact buttons (shared). Adds three stacked circle buttons at the bottom right:
   AI assistant (placeholder panel), WhatsApp, call. Include with:
   <link rel="stylesheet" href="../assets/contact-fab.css"> and <script src="../assets/contact-fab.js" defer></script> */
(function () {
  'use strict';
  if (document.querySelector('.mfab')) return;
  var PHONE = '+966114170700';
  var code = 'M-' + Math.floor(1000 + Math.random() * 9000);
  var wa = 'https://wa.me/966114170700?text=' + encodeURIComponent('مرحبا، أبي أحجز خدمة منزلية. رمز الطلب: ' + code);
  var I = {
    ai: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21l1.65-3.8A9 9 0 1 1 7.6 20.1z"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" style="stroke-width:1.9"/></svg>',
    call: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>'
  };
  var wrap = document.createElement('div');
  wrap.className = 'mfab';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'تواصل مع مبادر');
  wrap.innerHTML =
    '<a class="mfab-btn mfab-wa" href="' + wa + '" target="_blank" rel="noopener" aria-label="احجز عبر واتساب">' + I.wa + '<span class="mfab-tip">واتساب</span></a>' +
    '<a class="mfab-btn mfab-call" href="tel:' + PHONE + '" aria-label="اتصل الحين 011 417 0700">' + I.call + '<span class="mfab-tip">اتصل الحين</span></a>' +
    '<button type="button" class="mfab-btn mfab-ai" aria-haspopup="dialog" aria-expanded="false" aria-controls="mfab-panel">' + I.ai + '<span class="mfab-tip">مساعد مبادر</span><span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">مساعد مبادر الذكي</span></button>';
  var panel = document.createElement('div');
  panel.className = 'mfab-panel';
  panel.id = 'mfab-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'مساعد مبادر');
  panel.innerHTML =
    '<div class="mfab-panel-top"><span class="mfab-av">' + I.ai + '</span><div><b>مساعد مبادر</b><small>قريباً</small></div>' +
    '<button type="button" class="mfab-close" aria-label="إغلاق">×</button></div>' +
    '<p>قريباً تقدرون تسألون المساعد عن خدماتنا وطريقة الحجز، ويرد عليكم على طول. وإلى ذاك الوقت، فريقنا على واتساب على مدار الساعة.</p>' +
    '<a href="' + wa + '" target="_blank" rel="noopener">' + I.wa + 'كلّمونا على واتساب</a>';
  document.body.appendChild(panel);
  document.body.appendChild(wrap);
  document.body.classList.add('has-mfab');

  var ai = wrap.querySelector('.mfab-ai');
  var setOpen = function (open) {
    panel.hidden = !open;
    ai.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('.mfab-close').focus();
  };
  ai.addEventListener('click', function () { setOpen(panel.hidden); });
  panel.querySelector('.mfab-close').addEventListener('click', function () { setOpen(false); ai.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); ai.focus(); } });
})();
