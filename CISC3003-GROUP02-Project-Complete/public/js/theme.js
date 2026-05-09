// Dark-mode toggle with localStorage + prefers-color-scheme fallback.
// The inline snippet in <head> sets the theme before paint to avoid flashing.
(function () {
  const KEY = 'cornerstone-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch {}
    document.querySelectorAll('[data-theme-label]').forEach((el) => {
      el.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    });
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Sync labels on load (inline script already set the attribute)
    applyTheme(currentTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      });
    });
  });
})();
