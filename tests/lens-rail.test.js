const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const web = path.join(__dirname, '..', 'apps', 'web');
const renderSource = fs.readFileSync(path.join(web, 'render.js'), 'utf8');
const layoutSource = fs.readFileSync(path.join(web, 'layout.css'), 'utf8');
const context = vm.createContext({});
vm.runInContext(renderSource, context, { filename: 'render.js' });

function value(expression) {
  return JSON.parse(JSON.stringify(vm.runInContext(expression, context)));
}

test('lens creation is rendered outside the scrollable tab viewport', () => {
  assert.match(renderSource, /lens-tabs-shell/);
  assert.match(renderSource, /lens-tabs-viewport/);
  assert.match(renderSource, /new-lens-action/);
  const viewportIndex = renderSource.indexOf('lens-tabs-viewport');
  const actionIndex = renderSource.indexOf('new-lens-action');
  assert.ok(viewportIndex < actionIndex);
});

test('new lens has distinct desktop and mobile labels', () => {
  assert.match(renderSource, /new-lens-label-full[^>]*>New lens</);
  assert.match(renderSource, /new-lens-label-short[^>]*>New</);
});

test('rail reserves a fixed far-edge column and centers every control', () => {
  assert.match(layoutSource, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/);
  assert.match(layoutSource, /\.new-lens-action[\s\S]*display:\s*inline-flex/);
  assert.match(layoutSource, /\.new-lens-action[\s\S]*align-items:\s*center/);
});

test('overflow state distinguishes the start, middle, end, and no-overflow cases', () => {
  assert.deepEqual(value('lensRailOverflowState(0, 300, 300)'), { left: false, right: false });
  assert.deepEqual(value('lensRailOverflowState(0, 300, 700)'), { left: false, right: true });
  assert.deepEqual(value('lensRailOverflowState(200, 300, 700)'), { left: true, right: true });
  assert.deepEqual(value('lensRailOverflowState(400, 300, 700)'), { left: true, right: false });
});

test('lens keyboard navigation wraps and supports Home and End', () => {
  assert.equal(value("nextLensTabIndex(0, 3, 'ArrowRight')"), 1);
  assert.equal(value("nextLensTabIndex(2, 3, 'ArrowRight')"), 0);
  assert.equal(value("nextLensTabIndex(0, 3, 'ArrowLeft')"), 2);
  assert.equal(value("nextLensTabIndex(1, 3, 'Home')"), 0);
  assert.equal(value("nextLensTabIndex(1, 3, 'End')"), 2);
  assert.equal(value("nextLensTabIndex(1, 3, 'Enter')"), 1);
});

test('arrow activation preserves focus in the newly rendered lens tab', () => {
  assert.match(renderSource, /state\.suppressRouteFocus\s*=\s*true/);
  assert.match(renderSource, /state\.lensFocusId/);
});
