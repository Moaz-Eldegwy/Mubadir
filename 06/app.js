// Mobader homepage prototype — small, dependency-free JS
(() => {
  const root = document.documentElement;

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

})();
