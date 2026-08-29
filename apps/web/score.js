function normalizeVelocity(starsGainedWeek) {
  return clamp(Math.log10(starsGainedWeek + 1) * 25, 0, 100);
}

function normalizeCrossSource(mentions) {
  return clamp((mentions ? mentions.length : 0) * 30, 0, 100);
}

function getComponentValue(entity, component) {
  const signals = (entity.briefing && entity.briefing.signals) || {};
  switch (component.id) {
    case 'velocity': return normalizeVelocity(entity.starsGainedWeek);
    case 'activity': return signals.activity || 0;
    case 'releases': return signals.releaseCadence || 0;
    case 'contributors': return signals.contributorGrowth || 0;
    case 'issues': return signals.issueResolution || 0;
    case 'crossSource': return normalizeCrossSource(entity.mentions);
    default: return 0;
  }
}

function glimmerScore(entity) {
  let total = 0;
  const breakdown = {};
  for (const c of GLIMMER_RUBRIC.components) {
    const raw = getComponentValue(entity, c);
    const weighted = raw * c.weight;
    total += weighted;
    breakdown[c.id] = { label: c.label, raw, weighted, weight: c.weight };
  }
  return { score: Math.round(total), breakdown };
}

function scoreRingSVG(score, size = 44) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamp(score, 0, 100) / 100);
  return `
    <svg class="score-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle class="track" cx="${size/2}" cy="${size/2}" r="${r}" stroke-dasharray="${c}"/>
      <circle class="fill" cx="${size/2}" cy="${size/2}" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
    </svg>
  `;
}

function scorePill(entity) {
  const { score } = glimmerScore(entity);
  return `<span class="score-pill mono" title="Glimmer score: ${score}">${scoreRingSVG(score)} <strong>${score}</strong></span>`;
}

function renderScoreBreakdown(breakdown) {
  return `
    <div class="score-breakdown">
      ${Object.values(breakdown).map(b => `
        <div class="score-bar">
          <span style="width:120px; font-size:0.82rem; color:var(--text-dim)">${esc(b.label)}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${clamp(b.raw,0,100)}%"></div></div>
          <span class="mono" style="width:3rem; text-align:right; font-size:0.82rem">${b.raw.toFixed(0)}</span>
          <span style="font-size:0.75rem; color:var(--text-dim); width:3.5rem; text-align:right">x${(b.weight*100).toFixed(0)}%</span>
        </div>
      `).join('')}
    </div>
  `;
}

function scoreHealthLabel(score) {
  if (score >= 75) return 'Strong';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Early';
  return 'Noise';
}
