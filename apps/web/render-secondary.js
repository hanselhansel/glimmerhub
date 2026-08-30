function topicCounts() {
  const counts = {};
  GLIMMER_DATA.entities.forEach(entity => (entity.topics || []).forEach(topic => counts[topic] = (counts[topic] || 0) + 1));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function renderTopicsPage(root) {
  const lenses = visibleLenses();
  root.innerHTML = `
    <section class="page-shell route-page">
      <header class="route-header">
        <p class="micro-label">Discovery</p>
        <h1 class="route-title route-heading" tabindex="-1">Topics and lenses</h1>
        <p class="route-subtitle">Lenses carry an editorial scope. Topics are raw labels from the catalog.</p>
      </header>
      <div class="section-heading"><h2>Your lenses</h2><a class="button button-small" href="#lens/new">New lens</a></div>
      <ul class="saved-lens-list">
        ${lenses.map(lens => `
          <li class="saved-lens-row">
            <div class="saved-lens-copy"><strong>${esc(lens.name)}</strong><span>${esc(lens.description)}</span></div>
            <button class="button button-small" data-lens-id="${esc(lens.id)}">Open</button>
            ${lens.id !== 'general' ? `<a class="button button-small" href="${routeForLensEdit(lens.id)}">${lens.builtIn ? 'Tune' : 'Edit'}</a>` : ''}
          </li>
        `).join('')}
      </ul>
      <div class="section-heading"><h2>Catalog topics</h2><p>Across ${GLIMMER_DATA.entities.length} prototype projects</p></div>
      <ul class="topic-list">
        ${topicCounts().map(([topic, count]) => `<li class="topic-row"><strong>${esc(topic)}</strong><span class="muted">Used to explain and match repository relevance.</span><span class="tertiary">${count} ${count === 1 ? 'project' : 'projects'}</span></li>`).join('')}
      </ul>
    </section>
  `;
  announceRoute('Topics and lenses');
}

function allMentions() {
  return GLIMMER_DATA.entities.flatMap(entity => (entity.mentions || []).map(mention => ({ ...mention, entity })));
}

function renderSourcesPage(root) {
  const mentions = allMentions();
  root.innerHTML = `
    <section class="page-shell route-page">
      <header class="route-header">
        <p class="micro-label">Evidence</p>
        <h1 class="route-title route-heading" tabindex="-1">Tracked sources</h1>
        <p class="route-subtitle">Claims remain connected to the repository, release, or discussion that supports them.</p>
      </header>
      <ul class="source-list">
        ${mentions.map(item => `
          <li class="source-row">
            <span class="source-name evidence-marker">${esc(item.source)}</span>
            <p class="source-quote">“${esc(item.quote)}” <a class="text-link" href="${esc(item.url)}" target="_blank" rel="noopener">View source</a></p>
            <a class="source-project" href="${routeForProject(item.entity.id)}">${esc(item.entity.owner)}/${esc(item.entity.name)}</a>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
  announceRoute('Tracked sources');
}
