function renderEvidenceThread(entity) {
  const evidence = [
    ...(entity.briefing.recentChanges || []).map(item => ({ ...item, sourceLabel: 'Repository evidence' })),
    ...(entity.mentions || []).map(item => ({ type: 'mention', title: item.source, summary: item.quote, url: item.url, sourceLabel: 'External mention' }))
  ];
  if (!evidence.length) return '<p class="muted">GlimmerHub has not found a confirming source yet.</p>';
  return `
    <ol class="evidence-thread">
      ${evidence.map(item => `
        <li class="evidence-item">
          <div class="evidence-type">${esc(item.type)}</div>
          <div class="evidence-title">${esc(item.title)}</div>
          <p class="evidence-summary">${esc(item.summary)}</p>
          <a class="evidence-source" href="${esc(item.url)}" target="_blank" rel="noopener">View source</a>
        </li>
      `).join('')}
    </ol>
  `;
}

function renderScoreTable(entity) {
  const { score, breakdown } = scoreSummary(entity);
  return `
    <div class="credibility-score"><strong>${score}</strong><span>/ 100 · ${esc(scoreHealthLabel(score))}</span></div>
    <table class="score-table">
      <tbody>
        ${Object.values(breakdown).map(item => `
          <tr>
            <th scope="row">${esc(item.label)}</th>
            <td><div class="score-bar-track" aria-hidden="true"><div class="score-bar-fill" style="width:${Math.round(item.raw)}%"></div></div></td>
            <td>${Math.round(item.raw)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderDossier(root, id) {
  const entity = entityById(id);
  if (!entity) {
    renderNotFound(root);
    return;
  }
  const selected = state.compareIds.includes(entity.id);
  const risks = entity.briefing.risks || ['Early project maturity', 'Adoption evidence is still limited'];
  root.innerHTML = `
    <article class="page-shell route-page">
      <a class="back-link" href="#briefings" data-back-to-feed><span aria-hidden="true">←</span> Back to ${esc(activeLens().name)}</a>
      <header class="dossier-header">
        <div class="dossier-repo">
          <div>
            <div class="dossier-repo-name">${esc(entity.owner)}/${esc(entity.name)}</div>
            <div class="dossier-repo-meta">${esc(entity.language || 'Unknown language')} · ${esc(entity.license || 'Unknown license')} · ${formatNum(entity.stars)} stars</div>
          </div>
          <a class="button" href="${esc(entity.url)}" target="_blank" rel="noopener">View on GitHub</a>
        </div>
        <p class="micro-label evidence-marker">GlimmerHub briefing</p>
        <h1 class="dossier-headline route-heading" tabindex="-1">${esc(entityHeadline(entity))}</h1>
        <p class="dossier-dek">${esc(entity.briefing.whyTrending)}</p>
      </header>
      <div class="dossier-grid">
        <div>
          <section class="dossier-section">
            <h2>What it does</h2>
            <p>${esc(entity.briefing.whatItDoes)}</p>
          </section>
          <section class="dossier-section">
            <h2>Why it is moving now</h2>
            <p>${esc(entity.briefing.whyTrending)}</p>
          </section>
          <section class="dossier-section">
            <h2>Evidence thread</h2>
            ${renderEvidenceThread(entity)}
          </section>
          <section class="dossier-section">
            <h2>Momentum credibility</h2>
            ${renderScoreTable(entity)}
          </section>
        </div>
        <aside class="dossier-aside">
          <section class="dossier-aside-section">
            <h2>Decision signals</h2>
            <p>+${formatNum(entity.starsGainedWeek)} stars this week</p>
            <p>${entity.sources.length} tracked ${entity.sources.length === 1 ? 'source' : 'sources'}</p>
            <p>${entity.briefing.signals.contributorGrowth}/100 contributor signal</p>
          </section>
          <section class="dossier-aside-section">
            <h2>Risks and unknowns</h2>
            <ul>${risks.map(risk => `<li>${esc(risk)}</li>`).join('')}</ul>
          </section>
          <section class="dossier-aside-section">
            <h2>Closest alternatives</h2>
            ${entity.briefing.alternatives.length ? `<ul>${entity.briefing.alternatives.map(item => `<li><a class="text-link" href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.name)}</a></li>`).join('')}</ul>` : '<p>No tracked alternatives yet.</p>'}
          </section>
          <section class="dossier-aside-section">
            <h2>Sources</h2>
            <ul>${entity.sources.map(source => `<li><a class="text-link" href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.name)}</a></li>`).join('')}</ul>
          </section>
          <button class="button ${selected ? '' : 'button-primary'}" data-compare-id="${esc(entity.id)}" aria-pressed="${selected}">${selected ? 'Remove from compare' : 'Add to compare'}</button>
        </aside>
      </div>
    </article>
  `;
  announceRoute(`${entity.owner}/${entity.name}`);
}

function comparisonValue(entity, key) {
  const summary = scoreSummary(entity);
  const values = {
    signal: `${summary.score} / 100`,
    growth: `+${formatNum(entity.starsGainedWeek)} this week`,
    language: entity.language || 'Unknown',
    license: entity.license || 'Unknown',
    thesis: entityHeadline(entity),
    activity: `${entity.briefing.signals.activity} / 100`,
    issues: `${entity.briefing.signals.issueResolution} / 100`
  };
  return values[key];
}

function renderComparison(root, ids) {
  const entities = ids.slice(0, 2).map(entityById).filter(Boolean);
  if (entities.length < 2) {
    root.innerHTML = `<section class="page-shell narrow-page"><div class="empty-state"><p class="micro-label">Compare</p><h1 class="route-heading" tabindex="-1">Choose two projects first.</h1><p>Add projects from a briefing, then return here.</p><a class="button button-primary" href="#briefings">Browse signals</a></div></section>`;
    announceRoute('Compare projects');
    return;
  }
  const rows = [
    ['signal', 'Glimmer signal'], ['growth', 'Momentum'], ['language', 'Language'], ['license', 'License'],
    ['thesis', 'Why now'], ['activity', 'Activity'], ['issues', 'Issue resolution']
  ];
  root.innerHTML = `
    <section class="page-shell route-page">
      <a class="back-link" href="#briefings" data-back-to-feed><span aria-hidden="true">←</span> Back to briefing</a>
      <header class="compare-heading"><p class="micro-label">Decision support</p><h1 class="route-title route-heading" tabindex="-1">Compare projects</h1><p class="route-subtitle">The same evidence model, side by side.</p></header>
      <div class="compare-table">
        <div class="compare-cell compare-label">Project</div>
        ${entities.map(entity => `<div class="compare-cell compare-project">${esc(entity.owner)}/${esc(entity.name)}</div>`).join('')}
        ${rows.map(([key, label]) => `
          <div class="compare-cell compare-label">${esc(label)}</div>
          ${entities.map(entity => `<div class="compare-cell">${esc(comparisonValue(entity, key))}</div>`).join('')}
        `).join('')}
      </div>
    </section>
  `;
  announceRoute('Compare projects');
}
