const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const web = path.join(__dirname, '..', 'apps', 'web');
const context = vm.createContext({ console });

function load(name) {
  const file = path.join(web, name);
  assert.ok(fs.existsSync(file), `${name} must exist`);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: name });
}

function fn(name) {
  return vm.runInContext(`typeof ${name} === 'function' ? ${name} : undefined`, context);
}

function value(name) {
  return vm.runInContext(`typeof ${name} !== 'undefined' ? ${name} : undefined`, context);
}

load('utils.js');
load('rubric.js');
load('score.js');

const physicalEntity = {
  id: 'robotics/arm', owner: 'robotics', name: 'arm', description: 'Embodied robot learning toolkit',
  topics: ['Robotics', 'Embodied AI'], stars: 800, starsGainedWeek: 120,
  briefing: { whatItDoes: 'Trains robot policies', whyTrending: 'New simulation adapters', signals: { activity: 80, releaseCadence: 70, contributorGrowth: 60, issueResolution: 75 } },
  mentions: [{ source: 'GitHub' }]
};
const viralEntity = {
  id: 'agents/viral', owner: 'agents', name: 'viral', description: 'Popular coding agent',
  topics: ['AI agent'], stars: 100000, starsGainedWeek: 5000,
  briefing: { whatItDoes: 'Writes code', whyTrending: 'Large launch', signals: { activity: 90, releaseCadence: 80, contributorGrowth: 85, issueResolution: 70 } },
  mentions: [{ source: 'GitHub' }, { source: 'Hacker News' }]
};
const physicalLens = {
  id: 'physical-ai', name: 'Physical AI',
  themes: [
    { id: 'robotics', label: 'Robotics', aliases: ['robot', 'robotics'], enabled: true },
    { id: 'embodied-ai', label: 'Embodied AI', aliases: ['embodied', 'vla'], enabled: true }
  ],
  exampleEntityIds: [], exclusions: []
};

test('lens and router modules exist', () => {
  load('lens.js');
  load('router.js');
});

test('Physical AI ranks relevant work above an unrelated viral repository', () => {
  const rank = fn('rankEntitiesForLens');
  assert.equal(typeof rank, 'function');
  const result = rank([viralEntity, physicalEntity], physicalLens, 'weekly');
  assert.equal(result[0].entity.id, physicalEntity.id);
  assert.ok(result[0].relevance >= 50);
});

test('lens matches explain which themes qualified an entity', () => {
  const match = fn('matchEntityToLens');
  assert.equal(typeof match, 'function');
  const result = match(physicalEntity, physicalLens, [physicalEntity, viralEntity]);
  assert.ok(result.reasons.some(reason => reason.includes('Robotics')));
  assert.ok(result.reasons.some(reason => reason.includes('Embodied AI')));
});

test('lens exclusions suppress otherwise matching entities', () => {
  const match = fn('matchEntityToLens');
  const excluded = { ...physicalLens, exclusions: ['robot learning'] };
  const normal = match(physicalEntity, physicalLens, [physicalEntity]);
  const blocked = match(physicalEntity, excluded, [physicalEntity]);
  assert.ok(blocked.relevance < normal.relevance);
});

test('custom lens ids are readable and collision resistant', () => {
  const makeLensId = fn('makeLensId');
  assert.equal(makeLensId('Physical AI', 123456), 'physical-ai-123456');
});

test('invalid stored preferences fall back to General and light mode', () => {
  const sanitize = fn('sanitizePreferences');
  const result = sanitize('{broken json', [{ id: 'general' }, { id: 'physical-ai' }]);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    version: 1, activeLensId: 'general', customLenses: [], theme: 'light'
  });
});

test('a missing active custom lens is repaired to General', () => {
  const sanitize = fn('sanitizePreferences');
  const stored = JSON.stringify({ version: 1, activeLensId: 'deleted', customLenses: [], theme: 'dark' });
  const result = sanitize(stored, [{ id: 'general' }, { id: 'physical-ai' }]);
  assert.equal(result.activeLensId, 'general');
  assert.equal(result.theme, 'dark');
});

test('project routes encode repository slashes and parse back to the id', () => {
  const routeForProject = fn('routeForProject');
  const parseRoute = fn('parseRoute');
  const hash = routeForProject('huggingface/lerobot');
  assert.equal(hash, '#project/huggingface%2Flerobot');
  assert.deepEqual(JSON.parse(JSON.stringify(parseRoute(hash))), { name: 'project', id: 'huggingface/lerobot' });
});

test('compare routes preserve both entity ids', () => {
  const routeForCompare = fn('routeForCompare');
  const parseRoute = fn('parseRoute');
  const hash = routeForCompare(['one/repo', 'two/repo']);
  assert.deepEqual(JSON.parse(JSON.stringify(parseRoute(hash))), {
    name: 'compare', ids: ['one/repo', 'two/repo']
  });
});

test('returning from research routes restores the briefing position', () => {
  const shouldRestore = fn('shouldRestoreFeedScroll');
  assert.equal(shouldRestore({ name: 'project' }, { name: 'briefing' }), true);
  assert.equal(shouldRestore({ name: 'compare' }, { name: 'briefing' }), true);
  assert.equal(shouldRestore({ name: 'topics' }, { name: 'briefing' }), false);
});

test('built-in lenses expose General and Physical AI', () => {
  load('lenses.js');
  const lenses = value('GLIMMER_LENSES');
  assert.ok(lenses.some(lens => lens.id === 'general'));
  assert.ok(lenses.some(lens => lens.id === 'physical-ai'));
});
