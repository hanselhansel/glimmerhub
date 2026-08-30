const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const web = path.join(__dirname, '..', 'apps', 'web');
const context = vm.createContext({ console, window: {} });

for (const name of ['utils.js', 'rubric.js', 'score.js', 'lenses.js', 'lens.js']) {
  vm.runInContext(fs.readFileSync(path.join(web, name), 'utf8'), context, { filename: name });
}

function value(expression) {
  return JSON.parse(JSON.stringify(vm.runInContext(expression, context)));
}

test('period values select daily, weekly, monthly, and yearly signals', () => {
  const entity = '{activity:[1,2,3],starsGainedWeek:7,starsGainedMonth:31,stars:900}';
  assert.equal(value(`periodValue(${entity}, 'daily')`), 3);
  assert.equal(value(`periodValue(${entity}, 'weekly')`), 7);
  assert.equal(value(`periodValue(${entity}, 'monthly')`), 31);
  assert.equal(value(`periodValue(${entity}, 'yearly')`), 900);
});

test('the General lens gives every repository full relevance', () => {
  const result = value("matchEntityToLens({topics:[]}, {id:'general'}, [])");
  assert.deepEqual(result, { relevance: 100, reasons: ['General momentum'] });
});

test('example repositories boost entities with shared topics', () => {
  const result = value(`matchEntityToLens(
    {id:'candidate',owner:'a',name:'b',description:'',topics:['Robotics'],briefing:{whatItDoes:'',whyTrending:''}},
    {id:'custom',themes:[],exampleEntityIds:['example'],exclusions:[]},
    [{id:'example',topics:['Robotics']}]
  )`);
  assert.equal(result.relevance, 8);
  assert.deepEqual(result.reasons, ['Similar to your examples']);
});

test('Physical AI inference expands into seven inspectable themes', () => {
  const themes = value("inferThemes('Physical AI for manufacturing robots')");
  assert.equal(themes.length, 7);
  assert.ok(themes.some(theme => theme.id === 'robotics'));
  assert.ok(themes.some(theme => theme.id === 'simulation'));
});

test('direct aliases infer the matching taxonomy theme', () => {
  const themes = value("inferThemes('I care about local-first self-hosted tools')");
  assert.deepEqual(themes.map(theme => theme.id), ['self-hosted']);
});

test('unknown descriptions get a useful starter taxonomy', () => {
  const themes = value("inferThemes('something entirely new')");
  assert.equal(themes.length, 5);
});

test('built-in and custom lenses are merged without losing order', () => {
  const ids = value("allLenses({customLenses:[{id:'custom'}]}).map(lens => lens.id)");
  assert.deepEqual(ids, ['general', 'physical-ai', 'custom']);
});

test('unknown lens ids fall back to General', () => {
  assert.equal(value("findLens('missing',{customLenses:[]}).id"), 'general');
});

test('preferences save and load through a storage boundary', () => {
  const result = value(`(() => {
    const values = new Map();
    const storage = {getItem:key => values.get(key) || null,setItem:(key,val) => values.set(key,val)};
    savePreferences({version:1,activeLensId:'physical-ai',customLenses:[],theme:'dark'}, storage);
    return loadPreferences(storage);
  })()`);
  assert.deepEqual(result, { version: 1, activeLensId: 'physical-ai', customLenses: [], theme: 'dark' });
});

test('score labels communicate confidence bands', () => {
  assert.equal(value('scoreHealthLabel(80)'), 'Strong signal');
  assert.equal(value('scoreHealthLabel(60)'), 'Credible signal');
  assert.equal(value('scoreHealthLabel(45)'), 'Early signal');
  assert.equal(value('scoreHealthLabel(20)'), 'Low confidence');
});
