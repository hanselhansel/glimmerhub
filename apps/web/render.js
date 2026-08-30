function entityById(id) {
  return GLIMMER_DATA.entities.find(entity => entity.id === id);
}

function activeLens() {
  return findLens(state.preferences.activeLensId, state.preferences);
}

function metricForPeriod(entity, period = state.period) {
  if (period === 'daily') return (entity.activity || []).at(-1) || 0;
  if (period === 'monthly') return entity.starsGainedMonth || 0;
  if (period === 'yearly') return entity.stars || 0;
  return entity.starsGainedWeek || 0;
}

function periodLabel(period = state.period) {
  return { daily: 'today', weekly: 'this week', monthly: 'this month', yearly: 'total' }[period] || 'this week';
}

function entityHeadline(entity) {
  return entity.briefing.editorialHeadline || entity.briefing.whyTrending;
}

function evidenceProof(entity, reasons = []) {
  const change = entity.briefing.recentChanges && entity.briefing.recentChanges[0];
  const parts = [];
  if (reasons.length && reasons[0] !== 'General momentum') parts.push(reasons.slice(0, 2).join(' + '));
  if (change) parts.push(change.title);
  parts.push(`${entity.sources.length} ${entity.sources.length === 1 ? 'source' : 'sources'}`);
  return parts.join(' · ');
}

function visibleLenses() {
  return allLenses(state.preferences);
}

function renderLensRail() {
  const rail = document.getElementById('lens-rail-list');
  if (!rail) return;
  rail.innerHTML = visibleLenses().map(lens => `
    <button class="lens-tab" data-lens-id="${esc(lens.id)}" aria-current="${lens.id === state.preferences.activeLensId}">${esc(lens.name)}</button>
  `).join('') + '<a class="lens-tab lens-tab-add" href="#lens/new">+ New lens</a>';
  requestAnimationFrame(() => rail.querySelector('[aria-current="true"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' }));
}

function renderHeaderState(route) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const target = link.dataset.route;
    const active = target === route.name || (target === 'briefing' && ['project', 'compare'].includes(route.name));
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-global-search]').forEach(input => {
    if (input.value !== state.search) input.value = state.search;
  });
  document.getElementById('theme-toggle')?.setAttribute('aria-label', state.preferences.theme === 'dark' ? 'Use light theme' : 'Use dark theme');
}

function renderCompareTray() {
  const root = document.getElementById('compare-tray-root');
  if (!root) return;
  if (!state.compareIds.length) {
    root.innerHTML = '';
    return;
  }
  const entities = state.compareIds.map(entityById).filter(Boolean);
  root.innerHTML = `
    <div class="compare-tray" role="status">
      <div>
        <strong>${entities.length} selected</strong>
        <div class="compare-tray-list">${entities.map(entity => esc(entity.name)).join(' · ')}</div>
      </div>
      <button class="button button-small" data-clear-compare>Clear</button>
      <button class="button button-small" data-open-compare ${entities.length < 2 ? 'disabled' : ''}>Compare</button>
    </div>
  `;
}

function renderRoute() {
  state.route = parseRoute();
  renderLensRail();
  renderHeaderState(state.route);
  const root = document.getElementById('app-root');
  if (!root) return;
  if (state.route.name === 'briefing') renderHome(root);
  else if (state.route.name === 'project') renderDossier(root, state.route.id);
  else if (state.route.name === 'compare') renderComparison(root, state.route.ids);
  else if (state.route.name === 'lens-new' || state.route.name === 'lens-edit') renderLensEditor(root, state.route);
  else if (state.route.name === 'topics') renderTopicsPage(root);
  else if (state.route.name === 'sources') renderSourcesPage(root);
  else renderNotFound(root);
  renderCompareTray();
  if (state.route.name === 'briefing' && state.restoreFeedScroll) {
    requestAnimationFrame(() => window.scrollTo(0, state.feedScrollY));
    state.restoreFeedScroll = false;
  } else {
    window.scrollTo(0, 0);
  }
}

function renderNotFound(root) {
  root.innerHTML = `
    <section class="page-shell narrow-page">
      <div class="empty-state">
        <p class="micro-label">Not found</p>
        <h1 class="route-heading" tabindex="-1">That briefing is not available.</h1>
        <p>The link may be old, or the project may no longer be in this prototype.</p>
        <a class="button button-primary" href="#briefings">Back to briefing</a>
      </div>
    </section>
  `;
  announceRoute('Not found');
}
