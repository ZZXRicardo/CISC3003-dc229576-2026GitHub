// Tabs, accordion single-open, IntersectionObserver fade-in, progress bars.
(function () {
  const ns = (window.cornerstone = window.cornerstone || {});
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let revealObserver = null;

  function initTabs(root) {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = [...root.querySelectorAll('[role="tabpanel"]')];
    const storageKey = root.dataset.tabsKey || ('tabs-' + (root.id || Math.random()));

    function activate(tab) {
      tabs.forEach((t) => {
        const isActive = t === tab;
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        t.tabIndex = isActive ? 0 : -1;
      });
      panels.forEach((p) => {
        const shouldShow = p.id === tab.getAttribute('aria-controls');
        p.hidden = !shouldShow;
      });
      try { sessionStorage.setItem(storageKey, tab.id); } catch {}
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (e) => {
        const idx = tabs.indexOf(tab);
        let nextIdx = null;
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
        if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') nextIdx = 0;
        if (e.key === 'End') nextIdx = tabs.length - 1;
        if (nextIdx !== null) {
          e.preventDefault();
          tabs[nextIdx].focus();
          activate(tabs[nextIdx]);
        }
      });
    });

    let initial = tabs[0];
    try {
      const stored = sessionStorage.getItem(storageKey);
      const match = tabs.find((t) => t.id === stored);
      if (match) initial = match;
    } catch {}
    if (initial) activate(initial);
  }

  function initAccordion(root) {
    if (root.dataset.accordion !== 'single') return;
    const items = [...root.querySelectorAll('details')];
    items.forEach((details) => {
      details.addEventListener('toggle', () => {
        if (details.open) {
          items.forEach((other) => {
            if (other !== details && other.open) other.open = false;
          });
        }
      });
    });
  }

  function ensureObserver() {
    if (revealObserver) return revealObserver;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return null;
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    return revealObserver;
  }

  function reveal(root) {
    const scope = root || document;
    const nodes = scope.querySelectorAll('[data-reveal]:not(.is-visible)');
    if (!nodes.length) return;
    const observer = ensureObserver();
    if (!observer) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return;
    }
    nodes.forEach((n) => {
      // If the node is already in view (common for search results above the fold),
      // mark it immediately so we don't wait for the next scroll tick.
      const rect = n.getBoundingClientRect();
      const inView = rect.top < (window.innerHeight || 0) && rect.bottom > 0;
      if (inView) {
        n.classList.add('is-visible');
      } else {
        observer.observe(n);
      }
    });
  }

  ns.reveal = reveal;

  function initProgress() {
    const bars = document.querySelectorAll('[data-progress]');
    if (!bars.length) return;
    if (!('IntersectionObserver' in window)) {
      bars.forEach((bar) => {
        const fill = bar.querySelector('.progress-bar-fill');
        if (fill) fill.style.width = (bar.dataset.progress || '0') + '%';
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const fill = bar.querySelector('.progress-bar-fill');
            const value = parseInt(bar.dataset.progress || '0', 10);
            if (fill) {
              requestAnimationFrame(() => {
                fill.style.width = (prefersReducedMotion ? value : value) + '%';
              });
            }
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((bar) => observer.observe(bar));
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tabs]').forEach(initTabs);
    document.querySelectorAll('.accordion').forEach(initAccordion);
    reveal();
    initProgress();
  });
})();
