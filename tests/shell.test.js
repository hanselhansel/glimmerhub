const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const web = path.join(__dirname, '..', 'apps', 'web');
const read = name => fs.readFileSync(path.join(web, name), 'utf8');

test('page shell uses route root and replaceable SVG brand assets', () => {
  const html = read('index.html');
  assert.match(html, /id="app-root"/);
  assert.match(html, /assets\/brand\/mark\.svg/);
  assert.match(html, /assets\/brand\/favicon\.svg/);
  assert.match(html, /id="route-status"/);
});

test('radar and centered detail modals are removed', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /data-view="radar"|radar\.js|id="detail"|class="modal"/);
  assert.equal(fs.existsSync(path.join(web, 'radar.js')), false);
});

test('editorial stylesheets and renderers load in dependency order', () => {
  const html = read('index.html');
  ['briefing.css', 'dossier.css', 'lens-builder.css', 'data-physical-ai.js', 'lenses.js', 'lens.js', 'router.js', 'render-home.js', 'render-dossier.js', 'render-lenses.js', 'render-secondary.js'].forEach(name => assert.match(html, new RegExp(name.replace('.', '\\.'))));
  assert.ok(html.indexOf('data.js') < html.indexOf('data-physical-ai.js'));
  assert.ok(html.indexOf('lenses.js') < html.indexOf('lens.js'));
  assert.ok(html.indexOf('router.js') < html.indexOf('app.js'));
});

test('visual system removes score rings and permanent card shadows', () => {
  const css = [read('theme.css'), read('layout.css'), read('components.css')].join('\n');
  assert.doesNotMatch(css, /score-ring/);
  assert.doesNotMatch(css, /\.card\s*\{/);
  assert.match(css, /--canvas:\s*#F7F7F4/i);
  assert.match(css, /prefers-reduced-motion/);
});

test('mobile menu includes an outside-dismiss backdrop', () => {
  const html = read('index.html');
  const app = read('app.js');
  assert.match(html, /id="mobile-menu-backdrop"/);
  assert.match(app, /mobile-menu-backdrop/);
});

test('custom lens deletion requires explicit confirmation', () => {
  const renderer = read('render-lenses.js');
  assert.match(renderer, /data-confirm-delete/);
  assert.match(renderer, /Confirm deletion/);
});
