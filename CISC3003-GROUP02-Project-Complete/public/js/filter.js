// In-page tag filter for static card collections such as careers.html.
(function () {
  function updateLive(root, count, label) {
    let live = root.querySelector('[data-live]');
    if (!live) {
      live = document.createElement('p');
      live.className = 'sr-only';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('data-live', '');
      root.insertBefore(live, root.firstChild);
    }
    live.textContent = `Showing ${count} ${label}${count === 1 ? '' : 's'}.`;
  }

  function updateCount(root, count, value, label) {
    const countEl = root.querySelector('[data-filter-count]');
    if (!countEl) return;

    if (!value || value === 'all') {
      countEl.textContent = `Showing all ${count} ${label}${count === 1 ? '' : 's'}.`;
      return;
    }

    countEl.textContent = `Showing ${count} ${label}${count === 1 ? '' : 's'} in ${value.toUpperCase()}.`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-card-filter]').forEach((root) => {
      const cards = [...root.querySelectorAll('[data-tags]')];
      const chips = [...root.querySelectorAll('.tag-filter')];
      const emptyState = root.querySelector('[data-filter-empty]');
      const allOnlySections = [...document.querySelectorAll('[data-filter-all-only]')];
      const url = new URL(window.location.href);
      const initialValue = url.searchParams.get('area') || 'all';
      const label = root.dataset.filterLabel || 'career path';

      function apply(value) {
        let visible = 0;

        cards.forEach((card) => {
          const tags = (card.dataset.tags || '').split(/\s+/).filter(Boolean);
          const show = !value || value === 'all' || tags.includes(value);
          card.hidden = !show;
          card.style.display = show ? '' : 'none';
          if (show) visible++;
        });

        chips.forEach((chip) => {
          chip.setAttribute(
            'aria-pressed',
            (chip.dataset.filterValue || 'all') === value ? 'true' : 'false'
          );
        });

        allOnlySections.forEach((section) => {
          const showSection = !value || value === 'all';
          section.hidden = !showSection;
          section.style.display = showSection ? '' : 'none';
        });

        if (emptyState) emptyState.hidden = visible > 0;
        updateLive(root, visible, label);
        updateCount(root, visible, value, label);

        if (!value || value === 'all') {
          url.searchParams.delete('area');
        } else {
          url.searchParams.set('area', value);
        }
        history.replaceState(null, '', url.pathname + url.search);
      }

      chips.forEach((chip) => {
        chip.addEventListener('click', () => apply(chip.dataset.filterValue || 'all'));
      });

      apply(initialValue);
    });
  });
})();
