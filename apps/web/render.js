function badgeClass(m) {
  return m === 'rising' ? 'momentum-rising' : 'momentum-steady';
}

function sortEntities(list, period) {
  return list.slice().sort((a, b) => {
    if (period === 'monthly') return b.starsGainedMonth - a.starsGainedMonth;
    if (period === 'yearly') return b.stars - a.stars;
    return b.starsGainedWeek - a.starsGainedWeek;
  });
}

function filtered() {
  let list = GLIMMER_DATA.entities;
  if (state.topic) list = list.filter(e => e.topics.includes(state.topic));
  const q = state.search.trim().toLowerCase();
  if (q) list = list.filter(e => (e.name + ' ' + e.owner + ' ' + e.description + ' ' + e.topics.join(' ')).toLowerCase().includes(q));
  return sortEntities(list, state.period);
}

function renderFeed() {
  const list = filtered();
  const html = list.map((e, i) => {
    const rank = i + 1;
    const selected = state.compareIds.includes(e.id);
    const { score } = glimmerScore(e);
    return `
      <li class="card" data-id="${esc(e.id)}">
        <div class="card-header" onclick="openDetail('${esc(e.id)}')">
          <span class="rank">#${rank}</span>
          <div style="flex:1">
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap">
              <h3 class="card-title">${esc(e.owner)}/${esc(e.name)}</h3>
              ${scorePill(e)}
            </div>
            <div class="card-meta">${esc(e.description)}</div>
            <div class="card-badges">
              <span class="badge ${badgeClass(e.momentum)}">${esc(e.momentum)}</span>
              ${e.status ? `<span class="badge">${esc(e.status)}</span>` : ''}
              <span class="badge" style="color:var(--accent)">${esc(scoreHealthLabel(score))}</span>
              ${e.topics.map(t => `<span class="badge topic">${esc(t)}</span>`).join('')}
            </div>
          </div>
          <label class="compare-check" onclick="event.stopPropagation()">
            <input type="checkbox" data-id="${esc(e.id)}" ${selected ? 'checked' : ''} onchange="toggleCompare('${esc(e.id)}', this.checked); renderFeed();"> Compare
          </label>
        </div>
        <div class="card-stats" onclick="openDetail('${esc(e.id)}')">
          <div><strong class="mono">${formatNum(e.stars)}</strong> stars</div>
          <div><strong class="mono" style="color:var(--good)">+${formatNum(e.starsGainedWeek)}</strong> this week</div>
          <div><strong>${esc(e.language)}</strong></div>
          <div>${sparkline(e.activity)}</div>
        </div>
        <div class="card-actions" onclick="event.stopPropagation()">
          <button class="btn-small" onclick="openDetail('${esc(e.id)}')">Explain</button>
          <button class="btn-small" onclick="openDetail('${esc(e.id)}', 'why')">Why now</button>
          <button class="btn-small" onclick="toggleCompare('${esc(e.id)}', !${selected}); renderFeed();">${selected ? 'Remove' : 'Compare'}</button>
        </div>
      </li>
    `;
  }).join('');
  document.getElementById('feed-list').innerHTML = html || '<p class="helper">No matches.</p>';
}

function renderTopics() {
  const counts = {};
  GLIMMER_DATA.entities.forEach(e => e.topics.forEach(t => counts[t] = (counts[t] || 0) + 1));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  document.getElementById('topic-cloud').innerHTML = sorted.map(([t, c]) =>
    `<button class="topic-pill ${state.topic === t ? 'active' : ''}" data-topic="${esc(t)}" onclick="setTopic('${esc(t)}')">${esc(t)} <span style="color:var(--text-dim)">(${c})</span></button>`
  ).join('');
}

function setTopic(topic) {
  state.topic = state.topic === topic ? '' : topic;
  switchView('feed');
}

function renderMentions() {
  const mentions = [];
  GLIMMER_DATA.entities.forEach(e => e.mentions.forEach(m => mentions.push({ ...m, entity: e })));
  document.getElementById('mention-list').innerHTML = mentions.map(m => `
    <li class="mention-item" onclick="openDetail('${esc(m.entity.id)}')">
      <div class="mention-source">${esc(m.source)}</div>
      <p class="mention-quote">"${esc(m.quote)}"</p>
      <div class="mention-link">${esc(m.entity.owner)}/${esc(m.entity.name)} · <a href="${esc(m.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">See mention</a></div>
    </li>
  `).join('') || '<p class="helper">No mentions yet.</p>';
}

function renderInsights() {
  const counts = {};
  GLIMMER_DATA.entities.forEach(e => e.topics.forEach(t => counts[t] = (counts[t] || 0) + e.starsGainedWeek));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] || 1;
  document.getElementById('insight-chart').innerHTML = sorted.map(([t, v]) => `
    <div class="insight-bar">
      <h4>${esc(t)}</h4>
      <div class="bar-track"><div class="bar-fill" style="width:${(v / max * 100).toFixed(1)}%"></div></div>
      <div class="bar-label">+${formatNum(v)} stars this week</div>
    </div>
  `).join('') || '<p class="helper">No data.</p>';
}

function renderComparePool() {
  const pool = document.getElementById('compare-pool');
  const action = document.getElementById('compare-action');
  const clear = document.getElementById('clear-compare');
  pool.innerHTML = state.compareIds.map(id => `<span>${esc(id)}</span>`).join('');
  action.disabled = state.compareIds.length < 2;
  clear.classList.toggle('hidden', !state.compareIds.length);
}

function evidenceList(items) {
  return items.map(it => `
    <div class="evidence">
      <div class="evidence-type">${esc(it.type)}</div>
      <div><strong>${esc(it.title)}</strong> — ${esc(it.summary)}</div>
      <a href="${esc(it.url)}" target="_blank" rel="noopener">View source</a>
    </div>
  `).join('');
}

function openDetail(id, section) {
  const e = GLIMMER_DATA.entities.find(x => x.id === id);
  if (!e) return;
  state.selected = e;
  const s = e.briefing.signals;
  const { score, breakdown } = glimmerScore(e);
  const health = scoreHealthLabel(score);
  document.getElementById('detail-panel').innerHTML = `
    <div class="modal-header">
      <div>
        <h2>${esc(e.owner)}/${esc(e.name)}</h2>
        <div class="card-meta">${esc(e.description)}</div>
      </div>
      <button class="close-btn" onclick="closeDetail()">&times;</button>
    </div>
    <div class="briefing">
      <div class="two-col">
        <div>
          <h3>Glimmer score</h3>
          <div style="display:flex; align-items:center; gap:0.75rem; margin:0.5rem 0">
            ${scoreRingSVG(score, 64)}
            <div>
              <div class="mono" style="font-size:1.5rem; font-weight:800; color:var(--accent)">${score}</div>
              <div style="font-size:0.8rem; color:var(--text-dim)">${esc(health)}</div>
            </div>
          </div>
          ${renderScoreBreakdown(breakdown)}
          <h3>What it does</h3>
          <p>${esc(e.briefing.whatItDoes)}</p>
          <h3>Why it is trending</h3>
          <p>${esc(e.briefing.whyTrending)}</p>
          ${e.briefing.recentChanges.length ? `<h3>Recent changes</h3>${evidenceList(e.briefing.recentChanges)}` : ''}
        </div>
        <div>
          <h3>Signals</h3>
          <div class="signal-grid">
            <div class="signal"><div class="signal-value">${s.activity}</div><div class="signal-label">Activity</div></div>
            <div class="signal"><div class="signal-value">${s.releaseCadence}</div><div class="signal-label">Releases</div></div>
            <div class="signal"><div class="signal-value">${s.contributorGrowth}</div><div class="signal-label">Contributors</div></div>
            <div class="signal"><div class="signal-value">${s.issueResolution}</div><div class="signal-label">Issues</div></div>
          </div>
          ${e.briefing.alternatives.length ? `<h3>Closest alternatives</h3><ul>${e.briefing.alternatives.map(a => `<li><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a></li>`).join('')}</ul>` : ''}
          <h3>Sources</h3>
          <p>${e.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(' · ')}</p>
          <div class="ask-box">
            <h3>Ask a follow-up</h3>
            <div class="ask-chips">
              <button class="btn-small" onclick="ask('what')">What does it do?</button>
              <button class="btn-small" onclick="ask('why')">Why is it trending?</button>
              <button class="btn-small" onclick="ask('changed')">What changed?</button>
              <button class="btn-small" onclick="ask('momentum')">How credible?</button>
              <button class="btn-small" onclick="ask('ready')">Production-ready?</button>
              <button class="btn-small" onclick="ask('alternatives')">Alternatives?</button>
            </div>
            <div id="ask-answer" class="ask-answer" style="display:none"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('detail').classList.add('open');
  if (section) ask(section);
}

function closeDetail() { document.getElementById('detail').classList.remove('open'); state.selected = null; }

function ask(q) {
  const e = state.selected;
  if (!e) return;
  const a = document.getElementById('ask-answer');
  const s = e.briefing.signals;
  const { score } = glimmerScore(e);
  const answers = {
    what: e.briefing.whatItDoes,
    why: e.briefing.whyTrending,
    changed: e.briefing.recentChanges.length ? e.briefing.recentChanges.map(c => `${c.title}: ${c.summary}`).join('. ') : 'No notable recent changes on record.',
    momentum: `It gained ${formatNum(e.starsGainedWeek)} stars this week across ${e.sources.length} tracked source(s). Glimmer score is ${score}. ${score >= 60 ? 'The rise is broad across activity, releases, and contributors.' : 'The signal is noisy or concentrated in one metric, so treat it as early.'}`,
    ready: s.activity > 60 && s.issueResolution > 50 ? 'It looks active and responsive, but it is still early. Try it for side projects before production.' : 'It is still new. Use it experimentally and watch issue resolution.',
    alternatives: e.briefing.alternatives.length ? e.briefing.alternatives.map(x => x.name).join(', ') : 'No tracked alternatives yet.'
  };
  a.innerHTML = esc(answers[q] || 'No answer for that question.');
  a.style.display = 'block';
}

function toggleCompare(id, on) {
  if (on) { if (!state.compareIds.includes(id)) state.compareIds.push(id); }
  else { state.compareIds = state.compareIds.filter(x => x !== id); }
  renderComparePool();
}

function openCompare() {
  const selected = state.compareIds.map(id => GLIMMER_DATA.entities.find(e => e.id === id)).filter(Boolean);
  if (selected.length < 2) return;
  const maxStars = Math.max(...selected.map(e => e.stars));
  const maxScore = Math.max(...selected.map(e => glimmerScore(e).score));
  document.getElementById('compare-panel').innerHTML = `
    <div class="modal-header"><h2>Compare</h2><button class="close-btn" onclick="closeCompare()">&times;</button></div>
    <div class="compare-grid">
      ${selected.map(e => {
        const { score } = glimmerScore(e);
        const starDelta = e.stars - maxStars;
        const scoreDelta = score - maxScore;
        return `
          <div class="compare-col">
            <h3>${esc(e.owner)}/${esc(e.name)}</h3>
            <p><strong>Stars:</strong> <span class="mono">${formatNum(e.stars)}</span> <span class="delta ${starDelta < 0 ? 'negative' : ''}">${starDelta === 0 ? '' : (starDelta > 0 ? '+' : '') + formatNum(starDelta)}</span></p>
            <p><strong>Glimmer:</strong> <span class="mono">${score}</span> <span class="delta ${scoreDelta < 0 ? 'negative' : ''}">${scoreDelta === 0 ? '' : (scoreDelta > 0 ? '+' : '') + scoreDelta}</span></p>
            <p><strong>Language:</strong> ${esc(e.language)} · <strong>License:</strong> ${esc(e.license)}</p>
            <p>${esc(e.briefing.whatItDoes)}</p>
            <p><strong>Why trending:</strong> ${esc(e.briefing.whyTrending)}</p>
            ${e.briefing.alternatives.length ? `<p><strong>Alternatives:</strong> ${e.briefing.alternatives.map(a => `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a>`).join(', ')}</p>` : ''}
            <div style="margin-top:0.5rem">${sparkline(e.activity)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  document.getElementById('compare').classList.add('open');
}

function closeCompare() { document.getElementById('compare').classList.remove('open'); }
