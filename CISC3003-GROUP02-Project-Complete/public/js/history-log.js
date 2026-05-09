// Logs the current page view for authenticated users. Safe to include on every page.
(function () {
  const ns = (window.cornerstone = window.cornerstone || {});

  function logPageView() {
    if (!ns.currentUser) return;
    const body = { itemType: 'page', pagePath: window.location.pathname };
    ns.api.post('/api/history', body).catch(() => {});
  }

  function logItemView(itemType, itemId) {
    if (!ns.currentUser) return;
    ns.api.post('/api/history', { itemType, itemId: parseInt(itemId, 10) }).catch(() => {});
  }

  ns.logItemView = logItemView;

  document.addEventListener('DOMContentLoaded', () => {
    ns.onSession((user) => {
      if (user) logPageView();
    });
  });
})();
