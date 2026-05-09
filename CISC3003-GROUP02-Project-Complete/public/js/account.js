// Account page: renders My List + history; handles remove buttons.
(function () {
  const ns = (window.cornerstone = window.cornerstone || {});

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value) {
    if (!value) return '';
    const d = new Date(value.replace(' ', 'T') + 'Z');
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  function programmeRow(p) {
    return `
      <article class="card programme-card">
        <div class="card-head">
          <div>
            <span class="tier-badge tier-${escapeHtml(p.tier)}">${escapeHtml(p.tier)} · ${escapeHtml(p.region)}</span>
            <h3>${escapeHtml(p.university)}</h3>
            <p class="card-meta">${escapeHtml(p.name)}</p>
          </div>
          <button class="btn-heart" data-item-type="programme" data-item-id="${p.id}" aria-pressed="true" aria-label="Remove from My List" type="button"></button>
        </div>
        <p class="programme-meta">
          <span>${escapeHtml(p.duration || '')}</span>
          <span>${escapeHtml(p.tuition || '')}</span>
        </p>
        <p>${escapeHtml(p.highlight || '')}</p>
        ${p.url ? `<a class="card-cta" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">Visit official site ↗</a>` : ''}
      </article>
    `;
  }

  function jobRow(j) {
    return `
      <article class="card job-card">
        <div class="card-head">
          <div>
            <span class="tier-badge role-${escapeHtml(j.role_type)}">${escapeHtml(j.role_type)}</span>
            <h3>${escapeHtml(j.company)}</h3>
            <p class="card-meta">${escapeHtml(j.title)}</p>
          </div>
          <button class="btn-heart" data-item-type="job" data-item-id="${j.id}" aria-pressed="true" aria-label="Remove from My List" type="button"></button>
        </div>
        <p class="job-meta">
          <span>${escapeHtml(j.location || '')}</span>
          ${j.level ? `<span>${escapeHtml(j.level)}</span>` : ''}
        </p>
        <p>${escapeHtml(j.highlight || '')}</p>
        ${j.url ? `<a class="card-cta" href="${escapeHtml(j.url)}" target="_blank" rel="noopener">Visit careers page ↗</a>` : ''}
      </article>
    `;
  }

  function historyRow(h) {
    const typeLabel = h.item_type === 'programme' ? 'Programme'
      : h.item_type === 'job' ? 'Job'
      : 'Page';
    return `
      <li class="history-item">
        <span class="history-type">${typeLabel}</span>
        <span>${escapeHtml(h.label || '')}</span>
        <span class="history-date">${formatDate(h.viewed_at)}</span>
      </li>
    `;
  }

  async function loadShortlist() {
    const progContainer = document.querySelector('[data-shortlist-programmes]');
    const jobContainer = document.querySelector('[data-shortlist-jobs]');
    if (!progContainer || !jobContainer) return;

    try {
      const res = await ns.api.get('/api/shortlist');
      const progs = res.programmes || [];
      const jobs = res.jobs || [];

      if (progs.length) {
        progContainer.innerHTML = `<div class="grid-2">${progs.map(programmeRow).join('')}</div>`;
      } else {
        progContainer.innerHTML = '<div class="empty-state"><h3>No saved programmes yet.</h3><p>Browse the <a href="/masters.html">Master\'s Preparation</a> page and tap the heart icon to add a programme to My List.</p></div>';
      }

      if (jobs.length) {
        jobContainer.innerHTML = `<div class="grid-2">${jobs.map(jobRow).join('')}</div>`;
      } else {
        jobContainer.innerHTML = '<div class="empty-state"><h3>No saved jobs yet.</h3><p>Browse the <a href="/jobs.html">Jobs</a> page and save openings you want to return to in My List.</p></div>';
      }

      if (ns.reveal) {
        ns.reveal(progContainer);
        ns.reveal(jobContainer);
      }
      if (ns.refreshShortlistIds) ns.refreshShortlistIds();
    } catch (err) {
      if (err.status === 401) return; // handled by gating
      progContainer.innerHTML = `<div class="empty-state"><h3>Could not load My List.</h3><p>${err.message}</p></div>`;
    }
  }

  async function loadHistory() {
    const container = document.querySelector('[data-history-list]');
    if (!container) return;
    try {
      const res = await ns.api.get('/api/history?limit=50');
      const items = res.items || [];
      if (!items.length) {
        container.innerHTML = '<div class="empty-state"><h3>No browsing history yet.</h3><p>Your recent page visits will appear here once you start exploring.</p></div>';
        return;
      }
      container.innerHTML = `<ul class="history-list">${items.map(historyRow).join('')}</ul>`;
    } catch (err) {
      if (err.status === 401) return;
      container.innerHTML = `<div class="empty-state"><h3>Could not load history.</h3><p>${err.message}</p></div>`;
    }
  }

  async function clearHistory() {
    try {
      await ns.api.del('/api/history');
      ns.toast('History cleared');
      loadHistory();
    } catch (err) {
      ns.toast(err.message, 'error');
    }
  }

  function gate(user) {
    const gatedSections = document.querySelectorAll('[data-account-authed]');
    const signedOut = document.querySelector('[data-account-signed-out]');
    if (user) {
      gatedSections.forEach((el) => (el.hidden = false));
      if (signedOut) signedOut.hidden = true;
      loadShortlist();
      loadHistory();
    } else {
      gatedSections.forEach((el) => (el.hidden = true));
      if (signedOut) signedOut.hidden = false;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const onAccountPage = document.body.classList.contains('page-account');
    if (!onAccountPage) return;

    ns.onSession(gate);

    // Re-fetch shortlist after remove
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear-history]')) {
        e.preventDefault();
        clearHistory();
      }
      const heart = e.target.closest('.btn-heart');
      if (heart) {
        setTimeout(() => loadShortlist(), 200);
      }
    });
  });
})();
