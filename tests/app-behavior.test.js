const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeClassList {
  constructor(...names) { this.names = new Set(names); }
  add(name) { this.names.add(name); }
  remove(name) { this.names.delete(name); }
  contains(name) { return this.names.has(name); }
  toggle(name, force) {
    const add = force === undefined ? !this.contains(name) : force;
    add ? this.add(name) : this.remove(name);
    return add;
  }
}

function element(options = {}) {
  return {
    value: options.value || '', dataset: options.dataset || {}, classList: new FakeClassList(...(options.classes || [])),
    attributes: {}, focused: false, textContent: '',
    setAttribute(name, value) { this.attributes[name] = String(value); },
    getAttribute(name) { return this.attributes[name] ?? null; },
    focus() { this.focused = true; },
    closest(selector) { return options.closest && options.closest[selector] || null; },
    matches(selector) { return Boolean(options.matches && options.matches.includes(selector)); }
  };
}

function createHarness() {
  const elements = {
    'mobile-menu': element({ classes: ['hidden'] }),
    'mobile-menu-backdrop': element({ classes: ['hidden'] }),
    'mobile-menu-toggle': element(),
    'mobile-search-panel': element(),
    'mobile-search-toggle': element(),
    'mobile-search': element(),
    'desktop-search': element(),
    'compare-tray-root': element()
  };
  const listeners = {};
  const calls = { renderRoute: 0, renderCompareTray: 0, renderHome: 0, railKeys: 0 };
  const document = {
    documentElement: { dataset: {} },
    getElementById: id => elements[id] || null,
    querySelectorAll: selector => selector === '[data-global-search]' ? [elements['desktop-search'], elements['mobile-search']] : [],
    addEventListener(name, fn) { listeners[name] = fn; }
  };
  const storage = new Map();
  const window = {
    innerWidth: 1000, scrollY: 0,
    location: { hash: '#briefings' },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    addEventListener(name, fn) { listeners[`window:${name}`] = fn; }
  };
  const context = vm.createContext({
    console, document, window, CSS: { escape: value => value }, requestAnimationFrame: fn => fn(),
    debounce: fn => fn,
    findLens: id => ({ id }), savePreferences: value => value,
    loadPreferences: () => ({ version: 1, activeLensId: 'general', customLenses: [], theme: 'light' }),
    renderRoute: () => calls.renderRoute++, renderCompareTray: () => calls.renderCompareTray++,
    renderHome: () => calls.renderHome++, handleLensRailKeydown: () => calls.railKeys++,
    parseRoute: () => ({ name: 'briefing' }), shouldRestoreFeedScroll: (from, to) => from.name === 'project' && to.name === 'briefing',
    filterLensExamples() {}, changeLensStep() {}, saveLensDraft() {}, deleteLens() {}, updateLensRailOverflow() {},
    routeForCompare: ids => `#compare/${ids.join('/')}`
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps', 'web', 'app.js'), 'utf8'), context, { filename: 'app.js' });
  return { context, elements, listeners, calls, window, document };
}

function value(harness, expression) {
  return JSON.parse(JSON.stringify(vm.runInContext(expression, harness.context)));
}

test('theme application normalizes unknown values to light', () => {
  const h = createHarness();
  vm.runInContext("applyTheme('dark')", h.context);
  assert.equal(h.document.documentElement.dataset.theme, 'dark');
  vm.runInContext("applyTheme('unknown')", h.context);
  assert.equal(h.document.documentElement.dataset.theme, 'light');
});

test('activating a lens persists it and clears both searches', () => {
  const h = createHarness();
  vm.runInContext("state.preferences={activeLensId:'general',customLenses:[],theme:'light'};state.search='robot';state.route={name:'briefing'};setActiveLens('physical-ai')", h.context);
  assert.equal(value(h, 'state.preferences.activeLensId'), 'physical-ai');
  assert.equal(value(h, 'state.search'), '');
  assert.equal(h.elements['desktop-search'].value, '');
  assert.equal(h.calls.renderRoute, 1);
});

test('mobile menu keeps its backdrop and aria state synchronized', () => {
  const h = createHarness();
  vm.runInContext('toggleMobileMenu(true)', h.context);
  assert.equal(h.elements['mobile-menu'].classList.contains('hidden'), false);
  assert.equal(h.elements['mobile-menu-backdrop'].classList.contains('hidden'), false);
  assert.equal(h.elements['mobile-menu-toggle'].getAttribute('aria-expanded'), 'true');
  vm.runInContext('toggleMobileMenu(false)', h.context);
  assert.equal(h.elements['mobile-menu'].classList.contains('hidden'), true);
});

test('mobile search opens, focuses, and closes predictably', () => {
  const h = createHarness();
  vm.runInContext('toggleMobileSearch()', h.context);
  assert.equal(h.elements['mobile-search-panel'].classList.contains('open'), true);
  assert.equal(h.elements['mobile-search'].focused, true);
  assert.equal(h.elements['mobile-search-toggle'].getAttribute('aria-expanded'), 'true');
});

test('compare selection toggles and retains at most two projects', () => {
  const h = createHarness();
  vm.runInContext("toggleCompareSelection('one');toggleCompareSelection('two');toggleCompareSelection('three')", h.context);
  assert.deepEqual(value(h, 'state.compareIds'), ['two', 'three']);
  vm.runInContext("toggleCompareSelection('two')", h.context);
  assert.deepEqual(value(h, 'state.compareIds'), ['three']);
});

test('global search shortcut targets desktop and mobile inputs', () => {
  const h = createHarness();
  vm.runInContext("handleKeydown({metaKey:true,ctrlKey:false,key:'k',preventDefault(){},target:{matches(){return false}}})", h.context);
  assert.equal(h.elements['desktop-search'].focused, true);
  h.window.innerWidth = 390;
  vm.runInContext("handleKeydown({metaKey:true,ctrlKey:false,key:'k',preventDefault(){},target:{matches(){return false}}})", h.context);
  assert.equal(h.elements['mobile-search'].focused, true);
});

test('Escape closes both mobile overlays', () => {
  const h = createHarness();
  vm.runInContext('toggleMobileMenu(true);toggleMobileSearch()', h.context);
  vm.runInContext("handleKeydown({metaKey:false,ctrlKey:false,key:'Escape',target:{matches(){return false}}})", h.context);
  assert.equal(h.elements['mobile-menu'].classList.contains('hidden'), true);
  assert.equal(h.elements['mobile-search-panel'].classList.contains('open'), false);
});

test('search input synchronizes fields and rerenders the briefing', () => {
  const h = createHarness();
  const target = element({ value: 'robot', matches: ['[data-global-search]'] });
  h.elements['desktop-search'] = target;
  h.document.querySelectorAll = selector => selector === '[data-global-search]' ? [target, h.elements['mobile-search']] : [];
  h.context.document = h.document;
  h.context.eventTarget = target;
  vm.runInContext("state.route={name:'briefing'};handleInput({target:eventTarget})", h.context);
  assert.equal(value(h, 'state.search'), 'robot');
  assert.equal(h.elements['mobile-search'].value, 'robot');
  assert.equal(h.calls.renderHome, 1);
});

test('route changes request scroll restoration only after project research', () => {
  const h = createHarness();
  vm.runInContext("state.route={name:'project'};handleRouteChange()", h.context);
  assert.equal(value(h, 'state.restoreFeedScroll'), true);
  assert.equal(h.calls.renderRoute, 1);
});

test('initialization loads preferences, theme, listeners, and first route', () => {
  const h = createHarness();
  vm.runInContext('init()', h.context);
  assert.equal(h.document.documentElement.dataset.theme, 'light');
  assert.equal(typeof h.listeners.click, 'function');
  assert.equal(typeof h.listeners.keydown, 'function');
  assert.equal(typeof h.listeners['window:hashchange'], 'function');
  assert.equal(h.calls.renderRoute, 1);
});
