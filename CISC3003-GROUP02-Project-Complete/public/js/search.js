// Search + filter for programmes and jobs pages.
(function () {
  const ns = (window.cornerstone = window.cornerstone || {});

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatRegion(region) {
    const value = String(region || '').trim();
    return value === 'HongKong' ? 'Hong Kong' : value;
  }

  function programmeCard(p) {
    const region = formatRegion(p.region);
    const metaBits = [p.duration, p.tuition].filter(Boolean);

    return `
      <article class="card programme-card">
        <div class="card-head">
          <div>
            <span class="tier-badge tier-${escapeHtml(p.tier)}">${escapeHtml(p.tier)} · ${escapeHtml(region)}</span>
            <h3>${escapeHtml(p.university)}</h3>
            <p class="card-meta">Master's programme</p>
          </div>
          <button class="btn-heart" data-item-type="programme" data-item-id="${p.id}" aria-pressed="false" aria-label="Add to My List" type="button"></button>
        </div>
        <h4 class="programme-name">${escapeHtml(p.name)}</h4>
        ${
          metaBits.length
            ? `<p class="programme-meta">${metaBits
                .map((bit) => `<span>${escapeHtml(bit)}</span>`)
                .join('')}</p>`
            : ''
        }
        <p class="programme-summary">${escapeHtml(p.highlight || '')}</p>
        <div class="programme-footer">
          <span class="programme-region-label">${escapeHtml(region)}</span>
          ${p.url ? `<a class="card-cta" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">Visit official site ↗</a>` : ''}
        </div>
      </article>
    `;
  }

  function jobCard(j) {
    return `
      <article class="card job-card" data-reveal>
        <div class="card-head">
          <div>
            <span class="tier-badge role-${escapeHtml(j.role_type)}">${escapeHtml(j.role_type)}</span>
            <h3>${escapeHtml(j.company)}</h3>
            <p class="card-meta">${escapeHtml(j.title)}</p>
          </div>
          <button class="btn-heart" data-item-type="job" data-item-id="${j.id}" aria-pressed="false" aria-label="Add to My List" type="button"></button>
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

  function buildQueryString(state) {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return params.toString();
  }

  async function renderProgrammes(root, state) {
    const resultsEl = root.querySelector('[data-results]');
    const countEl = root.querySelector('[data-count]');
    try {
      const qs = buildQueryString(state);
      const res = await ns.api.get('/api/programmes' + (qs ? '?' + qs : ''));
      const items = res.items || [];
      if (countEl) countEl.textContent = `${items.length} programme${items.length === 1 ? '' : 's'}`;
      if (items.length === 0) {
        resultsEl.innerHTML =
          '<div class="empty-state"><h3>No programmes match your filters.</h3><p>Try loosening the region or tier selection.</p></div>';
      } else {
        resultsEl.innerHTML = `<div class="grid-2">${items.map(programmeCard).join('')}</div>`;
      }
      if (ns.refreshShortlistIds) ns.refreshShortlistIds();
    } catch (err) {
      resultsEl.innerHTML = `<div class="empty-state"><h3>Could not load programmes.</h3><p>${err.message}</p></div>`;
    }
  }

  async function renderJobs(root, state) {
    const resultsEl = root.querySelector('[data-results]');
    const countEl = root.querySelector('[data-count]');
    try {
      const qs = buildQueryString(state);
      const res = await ns.api.get('/api/jobs' + (qs ? '?' + qs : ''));
      const items = res.items || [];
      if (countEl) countEl.textContent = `${items.length} opening${items.length === 1 ? '' : 's'}`;
      if (items.length === 0) {
        resultsEl.innerHTML =
          '<div class="empty-state"><h3>No openings match your filters.</h3><p>Try changing the role or clearing the search text.</p></div>';
      } else {
        resultsEl.innerHTML = `<div class="grid-2">${items.map(jobCard).join('')}</div>`;
      }
      if (ns.reveal) ns.reveal(resultsEl);
      if (ns.refreshShortlistIds) ns.refreshShortlistIds();
    } catch (err) {
      resultsEl.innerHTML = `<div class="empty-state"><h3>Could not load jobs.</h3><p>${err.message}</p></div>`;
    }
  }

  function initSearchUI(root, render, stateKeys) {
    const params = new URLSearchParams(window.location.search);
    const state = {};
    stateKeys.forEach((k) => {
      const v = params.get(k);
      if (v) state[k] = v;
    });

    const searchInput = root.querySelector('[data-search-input]');
    if (searchInput && state.q) searchInput.value = state.q;
    if (searchInput && !state.q) searchInput.value = '';

    const updateUrl = () => {
      const qs = buildQueryString(state);
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    };

    const syncFilterPressed = () => {
      root.querySelectorAll('.tag-filter').forEach((btn) => {
        const key = btn.dataset.filterKey;
        const value = btn.dataset.filterValue || '';
        const currentValue = state[key] || '';
        btn.setAttribute('aria-pressed', currentValue === value ? 'true' : 'false');
      });
    };

    if (!root.dataset.searchInitialized) {
      if (searchInput) {
        const onChange = debounce(() => {
          state.q = searchInput.value.trim();
          updateUrl();
          render(root, state);
        }, 250);
        searchInput.addEventListener('input', onChange);
      }

      root.querySelectorAll('.tag-filter').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.filterKey;
          const value = btn.dataset.filterValue || '';
          state[key] = value;
          updateUrl();
          syncFilterPressed();
          render(root, state);
        });
      });

      root.dataset.searchInitialized = 'true';
    }

    syncFilterPressed();
    render(root, state);
  }

  function initSearchPages() {
    const programmesRoot = document.querySelector('[data-programmes-search]');
    if (programmesRoot) initSearchUI(programmesRoot, renderProgrammes, ['q', 'region', 'tier']);

    const jobsRoot = document.querySelector('[data-jobs-search]');
    if (jobsRoot) initSearchUI(jobsRoot, renderJobs, ['q', 'role']);
  }

  document.addEventListener('DOMContentLoaded', initSearchPages);
  window.addEventListener('pageshow', initSearchPages);
})();
