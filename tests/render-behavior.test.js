const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const web = path.join(__dirname, '..', 'apps', 'web');
const context = vm.createContext({
  console,
  CSS: { escape: value => value },
  requestAnimationFrame: callback => callback(),
  document: {
    title: '',
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  },
  window: { location: { hash: '' }, scrollY: 0, scrollTo() {} }
});

vm.runInContext(`var state={
  route:{name:'briefing'},period:'weekly',search:'',compareIds:[],feedScrollY:0,restoreFeedScroll:false,
  preferences:{version:1,activeLensId:'general',customLenses:[],theme:'light'},lensDraft:null,lensStep:1,
  lensError:'',lensEditorKey:'',pendingLensDelete:null,suppressRouteFocus:false,lensFocusId:null
}`, context);

for (const name of ['utils.js', 'rubric.js', 'data.js', 'data-physical-ai.js', 'lenses.js', 'score.js', 'lens.js', 'router.js', 'render.js', 'render-home.js', 'render-dossier.js', 'render-lenses.js', 'render-secondary.js']) {
  vm.runInContext(fs.readFileSync(path.join(web, name), 'utf8'), context, { filename: name });
}

function value(expression) {
  return JSON.parse(JSON.stringify(vm.runInContext(expression, context)));
}

function render(expression) {
  return vm.runInContext(`(() => { const root={innerHTML:''}; ${expression}; return root.innerHTML; })()`, context);
}

test('router parses every static application destination', () => {
  assert.deepEqual(value("parseRoute('#briefings')"), { name: 'briefing' });
  assert.deepEqual(value("parseRoute('#topics')"), { name: 'topics' });
  assert.deepEqual(value("parseRoute('#sources')"), { name: 'sources' });
  assert.deepEqual(value("parseRoute('#lens/new')"), { name: 'lens-new' });
  assert.deepEqual(value("parseRoute('#missing')"), { name: 'not-found' });
});

test('lens edit routes round-trip custom ids', () => {
  const hash = value("routeForLensEdit('robotics/team')");
  assert.equal(hash, '#lens/robotics%2Fteam/edit');
  assert.deepEqual(value(`parseRoute('${hash}')`), { name: 'lens-edit', id: 'robotics/team' });
});

test('malformed route encoding becomes an invalid project id safely', () => {
  assert.deepEqual(value("parseRoute('#project/%E0%A4%A')"), { name: 'project', id: '' });
});

test('period labels and metrics stay paired', () => {
  assert.equal(value("periodLabel('daily')"), 'today');
  assert.equal(value("periodLabel('monthly')"), 'this month');
  assert.equal(value("metricForPeriod({starsGainedMonth:42},'monthly')"), 42);
});

test('General home renders one lead and flat movement rows', () => {
  const html = render('renderHome(root)');
  assert.match(html, /lead-briefing/);
  assert.match(html, /Also moving/);
  assert.match(html, /signal-row/);
  assert.doesNotMatch(html, /class="card"/);
});

test('search with no results renders recovery actions', () => {
  vm.runInContext("state.search='does-not-exist-anywhere'", context);
  const html = render('renderHome(root)');
  assert.match(html, /No matching signals/);
  assert.match(html, /Clear search/);
  assert.match(html, /View General/);
  vm.runInContext("state.search=''", context);
});

test('project dossier contains evidence, risks, and compare action', () => {
  const html = render("renderDossier(root,'huggingface/lerobot')");
  assert.match(html, /Evidence thread/);
  assert.match(html, /Risks and unknowns/);
  assert.match(html, /Add to compare/);
  assert.match(html, /Momentum credibility/);
});

test('comparison requires two projects and renders both when available', () => {
  assert.match(render("renderComparison(root,['huggingface/lerobot'])"), /Choose two projects first/);
  const html = render("renderComparison(root,['huggingface/lerobot','NVIDIA/Isaac-GR00T'])");
  assert.match(html, /huggingface\/lerobot/);
  assert.match(html, /NVIDIA\/Isaac-GR00T/);
  assert.match(html, /Glimmer signal/);
});

test('lens creation starts with labeled description fields', () => {
  vm.runInContext("state.lensEditorKey='';state.lensDraft=null;state.lensStep=1", context);
  const html = render("renderLensEditor(root,{name:'lens-new'})");
  assert.match(html, /Lens name/);
  assert.match(html, /Describe the interest/);
  assert.match(html, /Refine scope/);
});

test('topics and sources use the shared editorial routes', () => {
  assert.match(render('renderTopicsPage(root)'), /Topics and lenses/);
  assert.match(render('renderSourcesPage(root)'), /Tracked sources/);
});
