// Mobader homepage prototype — small, dependency-free JS
(() => {
  const root = document.documentElement;

  // Prototype style switcher (A / B / C), remembers choice, supports ?style=b
  const param = new URLSearchParams(location.search).get('style');
  const saved = param || localStorage.getItem('mobader-style') || 'a';
  const setStyle = (s) => {
    root.dataset.style = s;
    localStorage.setItem('mobader-style', s);
    document.querySelectorAll('.switcher [data-set]').forEach(b => b.setAttribute('aria-pressed', b.dataset.set === s));
  };
  setStyle(saved);
  document.querySelectorAll('.switcher [data-set]').forEach(b => b.addEventListener('click', () => setStyle(b.dataset.set)));

  // Sticky header border on scroll
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile drawer
  const drawer = document.getElementById('drawer');
  document.getElementById('menuBtn').addEventListener('click', () => drawer.classList.add('open'));
  drawer.addEventListener('click', (e) => { if (e.target === drawer || e.target.tagName === 'A') drawer.classList.remove('open'); });

  // Single-select chips and tabs
  const single = (sel) => document.querySelectorAll(sel).forEach(group => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('button'); if (!btn) return;
      const attr = btn.hasAttribute('aria-selected') ? 'aria-selected' : 'aria-pressed';
      group.querySelectorAll('button').forEach(b => b.setAttribute(attr, b === btn));
    });
  });
  single('.chips'); single('.tabs');

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
