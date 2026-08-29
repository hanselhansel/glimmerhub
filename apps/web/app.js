/* GlimmerHub v1 prototype */
(function () {
  const entities = GLIMMER_DATA.entities;
  let state = {
    view: 'feed',
    period: 'weekly',
    search: '',
    topic: '',
    compareIds: [],
    selected: null
  };

  const formatNum = n => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : n);
  const esc = s => (s || '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

  function sparkline(values, color = 'var(--accent)') {
    const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
    const width = 120, height = 34;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function score(e) {
    const s = e.briefing.signals;
    return (s.activity + s.releaseCadence + s.contributorGrowth + s.issueResolution) / 4;
  }

  function sortEntities(list, period) {
    return list.slice().sort((a, b) => {
      if (period === 'monthly') return b.starsGainedMonth - a.starsGainedMonth;
      if (period === 'yearly') return b.stars - a.stars;
      return b.starsGainedWeek - a.starsGainedWeek;
    });
  }

  function filtered() {
    let list = entities;
    if (state.topic) list = list.filter(e => e.topics.includes(state.topic));
    const q = state.search.trim().toLowerCase();
    if (q) list = list.filter(e => (e.name + ' ' + e.owner + ' ' + e.description + ' ' + e.topics.join(' ')).toLowerCase().includes(q));
    return sortEntities(list, state.period);
  }

  function badgeClass(m) {
    return m === 'rising' ? 'momentum-rising' : 'momentum-steady';
  }

  function renderFeed() {
    const list = filtered();
    const html = list.map((e, i) => {
      const rank = i + 1;
      const selected = state.compareIds.includes(e.id);
      return `
        <li class="card" data-id="${esc(e.id)}" onclick="openDetail('${esc(e.id)}')">
          <div class="card-header">
            <span class="rank">#${rank}</span>
            <div style="flex:1">
              <h3 class="card-title">${esc(e.owner)}/${esc(e.name)}</h3>
              <div class="card-meta">${esc(e.description)}</div>
              <div class="card-badges">
                <span class="badge ${badgeClass(e.momentum)}">${esc(e.momentum)}</span>
                ${e.status ? `<span class="badge">${esc(e.status)}</span>` : ''}
                ${e.topics.map(t => `<span class="badge topic">${esc(t)}</span>`).join('')}
              </div>
            </div>
            <label class="compare-check" onclick="event.stopPropagation()">
              <input type="checkbox" data-id="${esc(e.id)}" ${selected ? 'checked' : ''}> Compare
            </label>
          </div>
          <div class="card-row">
            <div><strong>${formatNum(e.stars)}</strong> stars</div>
            <div><strong>+${formatNum(e.starsGainedWeek)}</strong> this week</div>
            <div><strong>${esc(e.language)}</strong></div>
            <div><strong>${score(e).toFixed(0)}</strong> health</div>
            ${sparkline(e.activity)}
          </div>
        </li>
      `;
    }).join('');
    document.getElementById('feed-list').innerHTML = html || '<p class="helper">No matches.</p>';
    document.querySelectorAll('#feed-list input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => toggleCompare(cb.dataset.id, cb.checked));
    });
  }

  function renderTopics() {
    const counts = {};
    entities.forEach(e => e.topics.forEach(t => counts[t] = (counts[t] || 0) + 1));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    document.getElementById('topic-cloud').innerHTML = sorted.map(([t, c]) =>
      `<button class="topic-pill ${state.topic === t ? 'active' : ''}" data-topic="${esc(t)}">${esc(t)} <span style="color:var(--text-dim)">(${c})</span></button>`
    ).join('');
    document.querySelectorAll('.topic-pill').forEach(btn => {
      btn.onclick = () => { state.topic = state.topic === btn.dataset.topic ? '' : btn.dataset.topic; switchView('feed'); };
    });
  }

  function renderMentions() {
    const mentions = [];
    entities.forEach(e => e.mentions.forEach(m => mentions.push({ ...m, entity: e })));
    document.getElementById('mention-list').innerHTML = mentions.map(m => `
      <li class="mention-item">
        <div class="mention-source">${esc(m.source)}</div>
        <p class="mention-quote">"${esc(m.quote)}"</p>
        <div class="mention-link"><a href="${esc(m.url)}" target="_blank" rel="noopener">See mention</a> about ${esc(m.entity.owner)}/${esc(m.entity.name)}</div>
      </li>
    `).join('') || '<p class="helper">No mentions yet.</p>';
  }

  function renderInsights() {
    const counts = {};
    entities.forEach(e => e.topics.forEach(t => counts[t] = (counts[t] || 0) + e.starsGainedWeek));
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

  function openDetail(id) {
    const e = entities.find(x => x.id === id);
    if (!e) return;
    state.selected = e;
    const s = e.briefing.signals;
    document.getElementById('detail-panel').innerHTML = `
      <div class="modal-header">
        <div>
          <h2>${esc(e.owner)}/${esc(e.name)}</h2>
          <div class="card-meta">${esc(e.description)}</div>
        </div>
        <button class="close-btn" onclick="closeDetail()">&times;</button>
      </div>
      <div class="briefing">
        <h3>What it does</h3>
        <p>${esc(e.briefing.whatItDoes)}</p>
        <h3>Why it is trending</h3>
        <p>${esc(e.briefing.whyTrending)}</p>
        ${e.briefing.recentChanges.length ? `<h3>Recent changes</h3>${evidenceList(e.briefing.recentChanges)}` : ''}
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
          <select id="ask-select">
            <option value="what">What does this project do?</option>
            <option value="why">Why is it trending?</option>
            <option value="changed">What changed recently?</option>
            <option value="momentum">How credible is the momentum?</option>
            <option value="ready">Is it production-ready?</option>
            <option value="alternatives">What are the alternatives?</option>
          </select>
          <button onclick="ask()">Answer</button>
          <div id="ask-answer" class="ask-answer" style="display:none"></div>
        </div>
      </div>
    `;
    document.getElementById('detail').classList.add('open');
  }

  window.closeDetail = function () { document.getElementById('detail').classList.remove('open'); state.selected = null; };

  window.ask = function () {
    const e = state.selected;
    if (!e) return;
    const q = document.getElementById('ask-select').value;
    const a = document.getElementById('ask-answer');
    let text = '';
    const s = e.briefing.signals;
    switch (q) {
      case 'what': text = e.briefing.whatItDoes; break;
      case 'why': text = e.briefing.whyTrending; break;
      case 'changed': text = e.briefing.recentChanges.length ? e.briefing.recentChanges.map(c => `${c.title}: ${c.summary}`).join('. ') : 'No notable recent changes on record.'; break;
      case 'momentum': text = `It gained ${formatNum(e.starsGainedWeek)} stars this week across ${e.sources.length} tracked source(s). Health score is ${score(e).toFixed(0)}. ${e.momentum === 'rising' && score(e) > 60 ? 'The rise is broad across activity, releases, and contributors.' : 'The signal is noisy or concentrated in one metric, so treat it as early.'}`; break;
      case 'ready': text = s.activity > 60 && s.issueResolution > 50 ? 'It looks active and responsive, but it is still early. Try it for side projects before production.' : 'It is still new. Use it experimentally and watch issue resolution.'; break;
      case 'alternatives': text = e.briefing.alternatives.length ? e.briefing.alternatives.map(x => x.name).join(', ') : 'No tracked alternatives yet.'; break;
    }
    a.innerHTML = esc(text);
    a.style.display = 'block';
  };

  function toggleCompare(id, on) {
    if (on) { if (!state.compareIds.includes(id)) state.compareIds.push(id); }
    else { state.compareIds = state.compareIds.filter(x => x !== id); }
    renderComparePool();
    renderFeed();
  }

  function openCompare() {
    const selected = state.compareIds.map(id => entities.find(e => e.id === id)).filter(Boolean);
    if (selected.length < 2) return;
    document.getElementById('compare-panel').innerHTML = `
      <div class="modal-header"><h2>Compare</h2><button class="close-btn" onclick="closeCompare()">&times;</button></div>
      <div class="compare-grid">
        ${selected.map(e => `
          <div class="compare-col">
            <h3>${esc(e.owner)}/${esc(e.name)}</h3>
            <p><strong>Stars:</strong> ${formatNum(e.stars)} (+${formatNum(e.starsGainedWeek)} this week)</p>
            <p><strong>Language:</strong> ${esc(e.language)} · <strong>License:</strong> ${esc(e.license)}</p>
            <p>${esc(e.briefing.whatItDoes)}</p>
            <p><strong>Why trending:</strong> ${esc(e.briefing.whyTrending)}</p>
            <p><strong>Health:</strong> ${score(e).toFixed(0)}</p>
            ${e.briefing.alternatives.length ? `<p><strong>Alternatives:</strong> ${e.briefing.alternatives.map(a => `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a>`).join(', ')}</p>` : ''}
            <div style="margin-top:0.5rem">${sparkline(e.activity)}</div>
          </div>
        `).join('')}
      </div>
    `;
    document.getElementById('compare').classList.add('open');
  }

  window.closeCompare = function () { document.getElementById('compare').classList.remove('open'); };

  function switchView(view) {
    state.view = view;
    document.querySelectorAll('.nav-tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === view));
    if (view === 'topics') renderTopics();
    if (view === 'mentions') renderMentions();
    if (view === 'insights') renderInsights();
    if (view === 'feed') renderFeed();
  }

  function init() {
    document.querySelectorAll('.nav-tabs button').forEach(btn => btn.onclick = () => switchView(btn.dataset.view));
    document.querySelectorAll('.period-tabs button').forEach(btn => btn.onclick = () => {
      document.querySelectorAll('.period-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.period = btn.dataset.period;
      renderFeed();
    });
    document.getElementById('search').addEventListener('input', e => { state.search = e.target.value; renderFeed(); });
    document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light');
    document.getElementById('compare-action').onclick = openCompare;
    document.getElementById('clear-compare').onclick = () => { state.compareIds = []; renderComparePool(); renderFeed(); };
    document.querySelectorAll('.modal-backdrop').forEach(b => b.onclick = () => {
      document.getElementById('detail').classList.remove('open');
      document.getElementById('compare').classList.remove('open');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeDetail(); closeCompare(); }
    });
    window.openDetail = openDetail;
    window.toggleCompare = toggleCompare;
    renderFeed();
    renderComparePool();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
