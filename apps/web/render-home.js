function searchedRankedEntities(lens) {
  const ranked = rankEntitiesForLens(GLIMMER_DATA.entities, lens, state.period);
  const query = normalizedText(state.search);
  if (!query) return ranked;
  return ranked.filter(item => entityCorpus(item.entity).includes(query));
}

function renderPeriodSwitch() {
  return `
    <div class="period-switch" aria-label="Briefing period">
      ${['daily', 'weekly', 'monthly', 'yearly'].map(period => `
        <button class="period-button" data-period="${period}" aria-pressed="${state.period === period}">${period[0].toUpperCase() + period.slice(1)}</button>
      `).join('')}
    </div>
  `;
}

function renderSignalRow(item, index) {
  const entity = item.entity;
  const selected = state.compareIds.includes(entity.id);
  return `
    <li class="signal-row">
      <a class="signal-row-link" href="${routeForProject(entity.id)}" data-remember-scroll aria-label="Read briefing for ${esc(entity.owner)}/${esc(entity.name)}">
        <span class="signal-rank">${String(index).padStart(2, '0')}</span>
        <span>
          <span class="signal-title">${esc(entity.owner)}/${esc(entity.name)}</span>
          <span class="signal-thesis">${esc(entityHeadline(entity))}</span>
          <span class="signal-proof evidence-marker">${esc(evidenceProof(entity, item.reasons))}</span>
        </span>
        <span class="signal-delta">+${formatNum(metricForPeriod(entity))}</span>
        <span class="signal-score">${item.score}<span>signal</span></span>
      </a>
      <button class="button button-quiet button-small compare-add" data-compare-id="${esc(entity.id)}" aria-pressed="${selected}">${selected ? 'Selected' : 'Compare'}</button>
    </li>
  `;
}

function renderLead(item, lens) {
  const entity = item.entity;
  const contributorGrowth = entity.briefing.signals.contributorGrowth;
  return `
    <article class="lead-briefing">
      <div class="lead-topline">
        <span class="micro-label evidence-marker">Lead signal</span>
        <span class="lead-score">GLIMMER ${item.score}</span>
      </div>
      <h2 class="lead-headline">${esc(entityHeadline(entity))}</h2>
      <p class="lead-thesis">${esc(entity.briefing.whyTrending)}</p>
      <div class="lead-metrics" aria-label="Lead project metrics">
        <div class="lead-metric"><strong>+${formatNum(metricForPeriod(entity))}</strong><span>${esc(periodLabel())}</span></div>
        <div class="lead-metric"><strong>${contributorGrowth}</strong><span>contributor signal</span></div>
        <div class="lead-metric"><strong>${entity.sources.length}</strong><span>confirming ${entity.sources.length === 1 ? 'source' : 'sources'}</span></div>
      </div>
      <a class="lead-link" href="${routeForProject(entity.id)}" data-remember-scroll>Read the briefing <span aria-hidden="true">→</span></a>
    </article>
  `;
}

function topThemes(ranked) {
  const counts = {};
  ranked.forEach(item => (item.entity.topics || []).forEach(topic => counts[topic] = (counts[topic] || 0) + 1));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, count]) => ({ label, count }));
}

function renderBriefingAside(lens, ranked) {
  const themes = lens.id === 'general'
    ? topThemes(ranked).map(theme => ({ label: theme.label, meta: `${theme.count} projects` }))
    : lens.themes.filter(theme => theme.enabled !== false).map(theme => ({ label: theme.label, meta: 'included' }));
  const examples = (lens.exampleEntityIds || []).map(entityById).filter(Boolean);
  return `
    <aside class="briefing-aside" aria-label="Briefing context">
      <section class="aside-section">
        <p class="micro-label evidence-marker">The pattern this week</p>
        <h2>${esc(lens.editorial.patternTitle)}</h2>
        <p>${esc(lens.editorial.patternSummary)}</p>
      </section>
      <section class="aside-section">
        <p class="micro-label">Inside this lens</p>
        <ul class="lens-theme-list">
          ${themes.map(theme => `<li><span>${esc(theme.label)}</span><span>${esc(theme.meta)}</span></li>`).join('')}
        </ul>
      </section>
      ${examples.length ? `
        <section class="aside-section">
          <p class="micro-label">Learning from examples</p>
          <ul class="example-list">${examples.map(entity => `<li>${esc(entity.owner)}/${esc(entity.name)}<small>Include adjacent projects</small></li>`).join('')}</ul>
        </section>
      ` : ''}
      <a class="button" href="${lens.id === 'general' ? '#lens/new' : routeForLensEdit(lens.id)}">${lens.id === 'general' ? 'Create a lens' : 'Adjust this lens'}</a>
    </aside>
  `;
}

function renderHome(root) {
  const lens = activeLens();
  const ranked = searchedRankedEntities(lens);
  let lead = ranked.find(item => item.entity.id === lens.editorial.leadEntityId);
  if (!lead || state.search) lead = ranked[0];
  const secondary = ranked.filter(item => !lead || item.entity.id !== lead.entity.id).slice(0, 8);

  if (!lead) {
    root.innerHTML = `
      <section class="page-shell">
        <div class="empty-state">
          <p class="micro-label">No matching signals</p>
          <h1 class="route-heading" tabindex="-1">Nothing matches “${esc(state.search)}” inside ${esc(lens.name)}.</h1>
          <p>Clear the search, adjust this lens, or return to the General briefing.</p>
          <button class="button button-primary" data-clear-search>Clear search</button>
          <button class="button" data-lens-id="general">View General</button>
        </div>
      </section>
    `;
    announceRoute(`${lens.name} briefing`);
    return;
  }

  root.innerHTML = `
    <section class="page-shell briefing-grid">
      <div>
        <header class="briefing-header">
          <div class="briefing-topline">
            <span class="micro-label">Your ${esc(state.period)} briefing · ${ranked.length} signals reviewed</span>
            <div class="briefing-tools">${renderPeriodSwitch()}</div>
          </div>
          <div class="briefing-title-row">
            <h1 class="briefing-title route-heading" tabindex="-1">${esc(lens.name)}</h1>
            ${lens.id !== 'general' ? `<a class="lens-edit-link" href="${routeForLensEdit(lens.id)}">Edit lens</a>` : ''}
          </div>
          <p class="briefing-scope">${esc(lens.description)}</p>
        </header>
        ${renderLead(lead, lens)}
        <div class="section-heading"><h2>Also moving</h2><p>Ranked by ${lens.id === 'general' ? 'credible momentum' : 'lens relevance, then momentum'}</p></div>
        <ol class="signal-list">${secondary.map((item, index) => renderSignalRow(item, index + 2)).join('')}</ol>
      </div>
      ${renderBriefingAside(lens, ranked)}
    </section>
  `;
  announceRoute(`${lens.name} briefing`);
}
