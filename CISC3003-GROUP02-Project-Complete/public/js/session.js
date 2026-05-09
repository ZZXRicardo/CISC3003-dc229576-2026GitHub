// Header session state: toggles login/signup vs. user menu; exposes currentUser.
(function () {
  const ns = (window.cornerstone = window.cornerstone || {});
  ns.currentUser = null;

  const subscribers = [];
  ns.onSession = (fn) => {
    subscribers.push(fn);
    if (ns.currentUser !== undefined) fn(ns.currentUser);
  };

  function render() {
    const guestArea = document.querySelector('[data-auth="guest"]');
    const userArea = document.querySelector('[data-auth="user"]');
    const nameSlot = document.querySelector('[data-user-name]');

    if (ns.currentUser) {
      if (guestArea) guestArea.hidden = true;
      if (userArea) userArea.hidden = false;
      if (nameSlot) nameSlot.textContent = ns.currentUser.displayName || ns.currentUser.email;
    } else {
      if (guestArea) guestArea.hidden = false;
      if (userArea) userArea.hidden = true;
    }
  }

  async function refresh() {
    try {
      const res = await ns.api.get('/api/auth/me');
      ns.currentUser = res.user;
    } catch {
      ns.currentUser = null;
    }
    render();
    subscribers.forEach((fn) => fn(ns.currentUser));
  }

  async function logout() {
    try { await ns.api.post('/api/auth/logout'); } catch {}
    ns.currentUser = null;
    render();
    subscribers.forEach((fn) => fn(ns.currentUser));
    ns.toast('You have been signed out.');
    setTimeout(() => (window.location.href = '/'), 600);
  }

  ns.refreshSession = refresh;
  ns.logout = logout;

  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    document.querySelectorAll('[data-logout]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    });
  });
})();
