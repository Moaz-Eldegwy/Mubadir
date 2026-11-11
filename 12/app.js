// Mobader homepage (x3-v0): mobile menu toggle + demo form (no submit), ported from page.tsx state.
(function () {
  var nav = document.getElementById('main-nav');
  var toggle = document.querySelector('.menu-toggle');
  if (nav && toggle) {
    var iconMenu = toggle.querySelector('.icon-menu');
    var iconX = toggle.querySelector('.icon-x');

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      iconMenu.hidden = open;
      iconX.hidden = !open;
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
  }

  var form = document.querySelector('.booking-form');
  if (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  }
})();
