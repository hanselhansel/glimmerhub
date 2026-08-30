function normalizeVelocity(starsGainedWeek) {
  return clamp(Math.log10((starsGainedWeek || 0) + 1) * 25, 0, 100);
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
  for (const component of GLIMMER_RUBRIC.components) {
    const raw = getComponentValue(entity, component);
    const weighted = raw * component.weight;
    total += weighted;
    breakdown[component.id] = {
      label: component.label,
      raw,
      weighted,
      weight: component.weight
    };
  }
  return { score: Math.round(total), breakdown };
}

function scoreHealthLabel(score) {
  if (score >= 75) return 'Strong signal';
  if (score >= 55) return 'Credible signal';
  if (score >= 40) return 'Early signal';
  return 'Low confidence';
}

function scoreSummary(entity) {
  const result = glimmerScore(entity);
  return { ...result, label: scoreHealthLabel(result.score) };
}
