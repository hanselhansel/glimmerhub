const GLIMMER_PREFERENCES_KEY = 'glimmerhub-preferences-v1';

function normalizedText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function entityCorpus(entity) {
  return normalizedText([
    entity.owner, entity.name, entity.description,
    ...(entity.topics || []),
    entity.briefing && entity.briefing.whatItDoes,
    entity.briefing && entity.briefing.whyTrending
  ].filter(Boolean).join(' '));
}

function matchEntityToLens(entity, lens, entities) {
  if (!lens || lens.id === 'general') return { relevance: 100, reasons: ['General momentum'] };
  const corpus = entityCorpus(entity);
  const topicSet = new Set((entity.topics || []).map(normalizedText));
  const reasons = [];
  let points = 0;

  (lens.themes || []).filter(theme => theme.enabled !== false).forEach(theme => {
    const label = normalizedText(theme.label);
    const aliases = [...new Set([theme.label, ...(theme.aliases || [])].map(normalizedText).filter(Boolean))];
    const topicMatch = topicSet.has(label) || aliases.some(alias => topicSet.has(alias));
    const textMatch = aliases.some(alias => corpus.includes(alias));
    if (topicMatch) points += 34;
    else if (textMatch) points += 18;
    if (topicMatch || textMatch) reasons.push(theme.label);
  });

  const examples = (entities || []).filter(item => (lens.exampleEntityIds || []).includes(item.id));
  const exampleTopics = new Set(examples.flatMap(item => item.topics || []).map(normalizedText));
  const sharedTopics = [...topicSet].filter(topic => exampleTopics.has(topic));
  if (sharedTopics.length) {
    points += Math.min(20, sharedTopics.length * 8);
    reasons.push('Similar to your examples');
  }

  (lens.exclusions || []).map(normalizedText).filter(Boolean).forEach(exclusion => {
    if (corpus.includes(exclusion)) {
      points -= 60;
      reasons.push(`Downranked: ${exclusion}`);
    }
  });

  return { relevance: clamp(points, 0, 100), reasons: [...new Set(reasons)] };
}

function periodValue(entity, period) {
  if (period === 'monthly') return entity.starsGainedMonth || 0;
  if (period === 'yearly') return entity.stars || 0;
  if (period === 'daily') return (entity.activity || []).at(-1) || 0;
  return entity.starsGainedWeek || 0;
}

function rankEntitiesForLens(entities, lens, period) {
  return entities
    .map(entity => ({ entity, ...matchEntityToLens(entity, lens, entities), score: glimmerScore(entity).score }))
    .filter(item => !lens || lens.id === 'general' || item.relevance >= 18)
    .sort((a, b) => {
      if (lens && lens.id !== 'general') {
        const bandA = Math.floor(a.relevance / 20);
        const bandB = Math.floor(b.relevance / 20);
        if (bandA !== bandB) return bandB - bandA;
        if (a.relevance !== b.relevance) return b.relevance - a.relevance;
      }
      if (a.score !== b.score) return b.score - a.score;
      return periodValue(b.entity, period) - periodValue(a.entity, period);
    });
}

function makeLensId(name, timestamp = Date.now()) {
  const slug = normalizedText(name).replace(/\s+/g, '-') || 'lens';
  return `${slug}-${timestamp}`;
}

function defaultPreferences() {
  return { version: 1, activeLensId: 'general', customLenses: [], theme: 'light' };
}

function sanitizePreferences(raw, builtInLenses = GLIMMER_LENSES) {
  let parsed;
  try { parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return defaultPreferences(); }
  if (!parsed || typeof parsed !== 'object') return defaultPreferences();
  const customLenses = Array.isArray(parsed.customLenses) ? parsed.customLenses.filter(lens => lens && lens.id && lens.name) : [];
  const validIds = new Set([...builtInLenses, ...customLenses].map(lens => lens.id));
  return {
    version: 1,
    activeLensId: validIds.has(parsed.activeLensId) ? parsed.activeLensId : 'general',
    customLenses,
    theme: parsed.theme === 'dark' ? 'dark' : 'light'
  };
}

function loadPreferences(storage = window.localStorage) {
  return sanitizePreferences(storage.getItem(GLIMMER_PREFERENCES_KEY));
}

function savePreferences(preferences, storage = window.localStorage) {
  const clean = sanitizePreferences(preferences);
  storage.setItem(GLIMMER_PREFERENCES_KEY, JSON.stringify(clean));
  return clean;
}

function allLenses(preferences) {
  return [...GLIMMER_LENSES, ...(preferences.customLenses || [])];
}

function findLens(id, preferences) {
  return allLenses(preferences).find(lens => lens.id === id) || GLIMMER_LENSES[0];
}

function inferThemes(description) {
  const query = normalizedText(description);
  const direct = GLIMMER_TAXONOMY.filter(theme => theme.aliases.some(alias => query.includes(normalizedText(alias))) || query.includes(normalizedText(theme.label)));
  if (query.includes('physical ai')) {
    return GLIMMER_TAXONOMY.filter(theme => ['robotics', 'embodied-ai', 'robot-learning', 'simulation', 'world-models', 'sensor-fusion', 'edge-inference'].includes(theme.id));
  }
  return direct.length ? direct : GLIMMER_TAXONOMY.slice(0, 5);
}
