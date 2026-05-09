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

  function programmeRow(programme) {
    return `
      <article class="card programme-card">
        <div class="card-head">
          <div>
            <span class="tier-badge tier-${escapeHtml(programme.tier)}">${escapeHtml(programme.tier)} · ${escapeHtml(programme.region)}</span>
            <h3>${escapeHtml(programme.university)}</h3>
            <p class="card-meta">${escapeHtml(programme.name)}</p>
          </div>
          <button class="btn-heart" data-item-type="programme" data-item-id="${programme.id}" aria-pressed="true" aria-label="Remove from My List" type="button"></button>
        </div>
        <p class="programme-meta">
          <span>${escapeHtml(programme.duration || '')}</span>
          <span>${escapeHtml(programme.tuition || '')}</span>
        </p>
        <p>${escapeHtml(programme.highlight || '')}</p>
        ${programme.url ? `<a class="card-cta" href="${escapeHtml(programme.url)}" target="_blank" rel="noopener">Visit official site →</a>` : ''}
      </article>
    `;
  }

  function jobRow(job) {
    return `
      <article class="card job-card">
        <div class="card-head">
          <div>
            <span class="tier-badge role-${escapeHtml(job.role_type)}">${escapeHtml(job.role_type)}</span>
            <h3>${escapeHtml(job.company)}</h3>
            <p class="card-meta">${escapeHtml(job.title)}</p>
          </div>
          <button class="btn-heart" data-item-type="job" data-item-id="${job.id}" aria-pressed="true" aria-label="Remove from My List" type="button"></button>
        </div>
        <p class="job-meta">
          <span>${escapeHtml(job.location || '')}</span>
          ${job.level ? `<span>${escapeHtml(job.level)}</span>` : ''}
        </p>
        <p>${escapeHtml(job.highlight || '')}</p>
        ${job.url ? `<a class="card-cta" href="${escapeHtml(job.url)}" target="_blank" rel="noopener">Visit careers page →</a>` : ''}
      </article>
    `;
  }

  function updateCounts(programmes, jobs) {
    const programmeCount = document.querySelector('[data-list-programme-count]');
    const jobCount = document.querySelector('[data-list-job-count]');
    const totalCount = document.querySelector('[data-list-total-count]');
    if (programmeCount) programmeCount.textContent = String(programmes.length);
    if (jobCount) jobCount.textContent = String(jobs.length);
    if (totalCount) totalCount.textContent = String(programmes.length + jobs.length);
  }

  async function loadList() {
    const programmeRoot = document.querySelector('[data-list-programmes]');
    const jobRoot = document.querySelector('[data-list-jobs]');
    if (!programmeRoot || !jobRoot) return;

    try {
      const data = await ns.api.get('/api/shortlist');
      const programmes = data.programmes || [];
      const jobs = data.jobs || [];

      updateCounts(programmes, jobs);

      if (programmes.length) {
        programmeRoot.innerHTML = `<div class="grid-2">${programmes.map(programmeRow).join('')}</div>`;
      } else {
        programmeRoot.innerHTML = '<div class="empty-state"><h3>No saved programmes yet.</h3><p>Go to <a href="/masters.html">Master\'s Preparation</a> and tap the heart button to add a programme to My List.</p></div>';
      }

      if (jobs.length) {
        jobRoot.innerHTML = `<div class="grid-2">${jobs.map(jobRow).join('')}</div>`;
      } else {
        jobRoot.innerHTML = '<div class="empty-state"><h3>No saved jobs yet.</h3><p>Go to <a href="/jobs.html">Jobs</a> and save roles you want to revisit later.</p></div>';
      }

      if (ns.refreshShortlistIds) ns.refreshShortlistIds();
      if (ns.reveal) {
        ns.reveal(programmeRoot);
        ns.reveal(jobRoot);
      }
    } catch (err) {
      programmeRoot.innerHTML = `<div class="empty-state"><h3>Could not load My List.</h3><p>${escapeHtml(err.message)}</p></div>`;
      jobRoot.innerHTML = '';
      updateCounts([], []);
    }
  }

  function gate(user) {
    const signedOut = document.querySelector('[data-list-signed-out]');
    const authed = document.querySelector('[data-list-authed]');
    if (user) {
      if (signedOut) signedOut.hidden = true;
      if (authed) authed.hidden = false;
      loadList();
    } else {
      if (signedOut) signedOut.hidden = false;
      if (authed) authed.hidden = true;
      updateCounts([], []);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('page-list')) return;

    ns.onSession(gate);

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.btn-heart')) return;
      setTimeout(loadList, 200);
    });
  });
})();
