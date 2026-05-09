// Header: sticky state, hamburger, smooth anchor scroll, back-to-top.
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    // Sticky header scrolled state
    const header = document.querySelector('.site-header');
    if (header) {
      const update = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 24);
      };
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            update();
            ticking = false;
          });
          ticking = true;
        }
      });
      update();
    }

    // Hamburger aria-expanded sync
    const toggle = document.getElementById('nav-toggle');
    const label = document.querySelector('.nav-toggle-button');
    if (toggle && label) {
      label.setAttribute('role', 'button');
      label.setAttribute('tabindex', '0');
      label.setAttribute('aria-expanded', 'false');
      label.setAttribute('aria-controls', 'site-nav');
      toggle.addEventListener('change', () => {
        label.setAttribute('aria-expanded', toggle.checked ? 'true' : 'false');
      });
      label.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.checked = !toggle.checked;
          toggle.dispatchEvent(new Event('change'));
        }
      });
      // Close menu on outside click
      document.addEventListener('click', (e) => {
        if (!toggle.checked) return;
        if (e.target === toggle || e.target === label || label.contains(e.target)) return;
        const nav = document.getElementById('site-nav');
        if (nav && nav.contains(e.target)) return;
        toggle.checked = false;
        toggle.dispatchEvent(new Event('change'));
      });
    }

    // Smooth anchor scroll
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      history.pushState(null, '', href);
    });

    // Back-to-top
    const btn = document.getElementById('back-to-top');
    if (btn) {
      const update = () => btn.classList.toggle('is-visible', window.scrollY > 600);
      window.addEventListener('scroll', update, { passive: true });
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
      update();
    }
  });
})();
