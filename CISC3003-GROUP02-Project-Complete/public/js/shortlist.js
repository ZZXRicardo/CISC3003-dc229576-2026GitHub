// My List heart buttons: toggle + sync with backend.
(function () {
  const ns = (window.cornerstone = window.cornerstone || {});
  let shortlistedIds = { programmes: new Set(), jobs: new Set() };

  async function refreshIds() {
    if (!ns.currentUser) {
      shortlistedIds = { programmes: new Set(), jobs: new Set() };
      applyButtons();
      return;
    }
    try {
      const res = await ns.api.get('/api/shortlist/ids');
      shortlistedIds = {
        programmes: new Set(res.programmes || []),
        jobs: new Set(res.jobs || [])
      };
      applyButtons();
    } catch {
      // ignore
    }
  }

  function applyButtons() {
    document.querySelectorAll('.btn-heart').forEach((btn) => {
      const type = btn.dataset.itemType;
      const id = parseInt(btn.dataset.itemId, 10);
      if (!type || !id) return;
      const set = type === 'programme' ? shortlistedIds.programmes : shortlistedIds.jobs;
      const pressed = set.has(id);
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      btn.setAttribute('aria-label', pressed ? 'Remove from My List' : 'Add to My List');
    });
  }

  async function toggle(btn) {
    const type = btn.dataset.itemType;
    const id = parseInt(btn.dataset.itemId, 10);
    if (!type || !id) return;

    if (!ns.currentUser) {
      ns.toast('Please sign in to save items to My List.', 'error');
      setTimeout(() => {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
      }, 900);
      return;
    }

    const set = type === 'programme' ? shortlistedIds.programmes : shortlistedIds.jobs;
    const currentlySaved = set.has(id);

    try {
      if (currentlySaved) {
        await ns.api.del('/api/shortlist', { itemType: type, itemId: id });
        set.delete(id);
        ns.toast('Removed from My List');
      } else {
        await ns.api.post('/api/shortlist', { itemType: type, itemId: id });
        set.add(id);
        ns.toast('Saved to My List', 'success');
      }
      applyButtons();
    } catch (err) {
      ns.toast(err.message, 'error');
    }
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-heart');
    if (!btn) return;
    e.preventDefault();
    toggle(btn);
  });

  // Watch for newly rendered cards (search results) and refresh their state.
  const observer = new MutationObserver(() => applyButtons());
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
    ns.onSession(refreshIds);
  });

  ns.refreshShortlistIds = refreshIds;
  ns.shortlistHas = (type, id) => {
    const set = type === 'programme' ? shortlistedIds.programmes : shortlistedIds.jobs;
    return set.has(parseInt(id, 10));
  };
})();
