function createLensDraft(route) {
  if (route.name === 'lens-edit') {
    const lens = findLens(route.id, state.preferences);
    const builtIn = GLIMMER_LENSES.some(item => item.id === lens.id);
    return {
      id: builtIn ? null : lens.id,
      sourceId: lens.id,
      name: builtIn ? `${lens.name}, tuned` : lens.name,
      description: lens.description,
      themes: lens.themes.map(theme => ({ ...theme })),
      exampleEntityIds: [...(lens.exampleEntityIds || [])],
      exclusions: [...(lens.exclusions || [])],
      builtIn: false
    };
  }
  return { id: null, sourceId: null, name: '', description: '', themes: [], exampleEntityIds: [], exclusions: [], builtIn: false };
}

function ensureLensDraft(route) {
  const key = `${route.name}:${route.id || 'new'}`;
  if (state.lensEditorKey !== key) {
    state.lensEditorKey = key;
    state.lensStep = 1;
    state.lensError = '';
    state.lensDraft = createLensDraft(route);
  }
  return state.lensDraft;
}

function renderProgress(step) {
  return `<div class="builder-progress" aria-label="Step ${step} of 3">${[1, 2, 3].map(i => `<span class="${i < step ? 'complete' : i === step ? 'current' : ''}"></span>`).join('')}</div>`;
}

function renderBuilderAside(step) {
  const content = {
    1: ['Start with your language', 'Describe an interest as you would to a colleague. GlimmerHub maps it to an editable set of themes.'],
    2: ['You stay in control', 'Themes and example repositories make the lens inspectable. Nothing is learned silently in this prototype.'],
    3: ['Preview before saving', 'The preview explains why each result qualified. Relevance ranks before broad popularity.']
  }[step];
  return `<aside class="builder-aside"><div class="builder-aside-section"><p class="micro-label">How it works</p><h2>${content[0]}</h2><p>${content[1]}</p></div><p>Saved only in this browser. No account or backend is used.</p></aside>`;
}

function renderLensDescribe(draft) {
  return `
    <div class="builder-step">
      <p class="micro-label">Step 1 of 3 · Describe</p>
      <h1 class="route-heading" tabindex="-1">What do you want to follow?</h1>
      <p>Start broad. You will confirm the exact scope before anything is saved.</p>
      <div class="field"><label for="lens-name">Lens name</label><input class="text-input" id="lens-name" value="${esc(draft.name)}" placeholder="Physical AI" maxlength="48" autocomplete="off"></div>
      <div class="field"><label for="lens-description">Describe the interest</label><textarea class="text-area" id="lens-description" placeholder="Robotics, embodied AI, simulation, world models, sensors, and edge inference" autocomplete="off">${esc(draft.description)}</textarea><div class="field-help">Use topics, technologies, problems, companies, or people.</div>${state.lensError ? `<div class="field-error" role="alert">${esc(state.lensError)}</div>` : ''}</div>
      <div class="builder-actions"><a class="button" href="#briefings">Cancel</a><button class="button button-primary" data-lens-next="2">Refine scope</button></div>
    </div>
  `;
}

function renderLensRefine(draft) {
  const selectedThemes = new Set(draft.themes.map(theme => theme.id));
  const examples = new Set(draft.exampleEntityIds);
  return `
    <div class="builder-step">
      <p class="micro-label">Step 2 of 3 · Refine</p>
      <h1 class="route-heading" tabindex="-1">What belongs in ${esc(draft.name)}?</h1>
      <p>Remove themes that do not fit. Add repositories that represent the work you want to discover.</p>
      <div class="field"><span class="field-label">Included themes</span><div class="theme-options">${GLIMMER_TAXONOMY.map(theme => `
        <label class="choice-row"><input type="checkbox" name="lens-theme" value="${esc(theme.id)}" ${selectedThemes.has(theme.id) ? 'checked' : ''}><span class="choice-copy"><span class="choice-title">${esc(theme.label)}</span><span class="choice-description">${esc(theme.aliases.slice(0, 3).join(' · '))}</span></span></label>
      `).join('')}</div></div>
      <div class="field"><label for="lens-example-search">Example repositories</label><input class="text-input" id="lens-example-search" type="search" placeholder="Search the prototype catalog"><div class="example-options" id="lens-example-options">${GLIMMER_DATA.entities.map(entity => `
        <label class="choice-row lens-example-row" data-search="${esc(normalizedText(`${entity.owner} ${entity.name} ${entity.topics.join(' ')}`))}"><input type="checkbox" name="lens-example" value="${esc(entity.id)}" ${examples.has(entity.id) ? 'checked' : ''}><span class="choice-copy"><span class="choice-title">${esc(entity.owner)}/${esc(entity.name)}</span><span class="choice-description">${esc(entity.topics.slice(0, 3).join(' · '))}</span></span></label>
      `).join('')}</div></div>
      <div class="field"><label for="lens-exclusions">Downrank or exclude</label><input class="text-input" id="lens-exclusions" value="${esc(draft.exclusions.join(', '))}" placeholder="general computer vision, autonomous driving"><div class="field-help">Separate phrases with commas.</div>${state.lensError ? `<div class="field-error" role="alert">${esc(state.lensError)}</div>` : ''}</div>
      <div class="builder-actions"><button class="button" data-lens-back="1">Back</button><button class="button button-primary" data-lens-next="3">Preview briefing</button></div>
    </div>
  `;
}

function renderLensPreview(draft) {
  const lens = lensFromDraft(draft);
  const ranked = rankEntitiesForLens(GLIMMER_DATA.entities, lens, state.period).slice(0, 5);
  return `
    <div class="builder-step">
      <p class="micro-label">Step 3 of 3 · Preview</p>
      <h1 class="route-heading" tabindex="-1">Your ${esc(draft.name)} briefing</h1>
      <p>These projects rank by relevance to your lens first, then credible momentum.</p>
      ${ranked.length ? `<ol class="preview-list">${ranked.map(item => `<li class="preview-row"><div class="preview-title"><span>${esc(item.entity.owner)}/${esc(item.entity.name)}</span><span class="preview-score">${item.relevance} match</span></div><div class="preview-reasons">${esc(item.reasons.join(' · '))}</div></li>`).join('')}</ol>` : `<div class="empty-state"><h2>No projects qualify yet.</h2><p>Go back and broaden the themes or add a representative repository.</p></div>`}
      ${state.lensError ? `<div class="field-error" role="alert">${esc(state.lensError)}</div>` : ''}
      <div class="builder-actions"><button class="button" data-lens-back="2">Back</button><button class="button button-primary" data-save-lens ${ranked.length ? '' : 'disabled'}>Save lens</button></div>
    </div>
  `;
}

function lensFromDraft(draft) {
  return {
    id: draft.id || 'preview', name: draft.name, description: draft.description,
    themes: draft.themes, exampleEntityIds: draft.exampleEntityIds, exclusions: draft.exclusions,
    editorial: { leadEntityId: '', patternTitle: `What is moving inside ${draft.name}.`, patternSummary: 'Projects are ranked by visible topic matches and confirming activity signals.' },
    builtIn: false
  };
}

function renderLensEditor(root, route) {
  const draft = ensureLensDraft(route);
  const step = state.lensStep;
  const stepContent = step === 1 ? renderLensDescribe(draft) : step === 2 ? renderLensRefine(draft) : renderLensPreview(draft);
  const deleteControl = draft.id
    ? state.pendingLensDelete === draft.id
      ? `<div class="delete-confirm" role="alert"><span>Delete this lens from this browser?</span><button class="button button-small" data-cancel-delete>Cancel</button><button class="button button-small button-danger" data-confirm-delete="${esc(draft.id)}">Confirm deletion</button></div>`
      : `<button class="button button-quiet" data-delete-lens="${esc(draft.id)}">Delete this lens</button>`
    : '';
  root.innerHTML = `<section class="page-shell builder-shell">${renderProgress(step)}<div class="builder-grid">${stepContent}${renderBuilderAside(step)}</div>${deleteControl}</section>`;
  const pageTitle = route.name === 'lens-edit' ? `${draft.id ? 'Edit' : 'Tune'} ${findLens(route.id, state.preferences).name}` : 'Create a lens';
  announceRoute(pageTitle);
}

function collectDescribeStep() {
  const name = document.getElementById('lens-name')?.value.trim() || '';
  const description = document.getElementById('lens-description')?.value.trim() || '';
  if (!name || !description) {
    state.lensError = 'Add a name and a short description.';
    return false;
  }
  state.lensDraft.name = name;
  state.lensDraft.description = description;
  if (!state.lensDraft.themes.length) state.lensDraft.themes = inferThemes(`${name} ${description}`).map(theme => ({ ...theme, enabled: true }));
  state.lensError = '';
  return true;
}

function collectRefineStep() {
  const themeIds = [...document.querySelectorAll('[name="lens-theme"]:checked')].map(input => input.value);
  if (!themeIds.length) {
    state.lensError = 'Keep at least one theme so the lens can match projects.';
    return false;
  }
  state.lensDraft.themes = GLIMMER_TAXONOMY.filter(theme => themeIds.includes(theme.id)).map(theme => ({ ...theme, enabled: true }));
  state.lensDraft.exampleEntityIds = [...document.querySelectorAll('[name="lens-example"]:checked')].map(input => input.value);
  state.lensDraft.exclusions = (document.getElementById('lens-exclusions')?.value || '').split(',').map(item => item.trim()).filter(Boolean);
  state.lensError = '';
  return true;
}

function changeLensStep(next) {
  if (next === 2 && state.lensStep === 1 && !collectDescribeStep()) return renderRoute();
  if (next === 3 && state.lensStep === 2 && !collectRefineStep()) return renderRoute();
  state.lensStep = next;
  renderRoute();
}

function saveLensDraft() {
  const draft = state.lensDraft;
  const lens = lensFromDraft(draft);
  lens.id = draft.id || makeLensId(draft.name);
  const custom = state.preferences.customLenses.filter(item => item.id !== lens.id);
  state.preferences.customLenses = [...custom, lens];
  state.preferences.activeLensId = lens.id;
  state.preferences = savePreferences(state.preferences);
  state.lensEditorKey = '';
  window.location.hash = '#briefings';
}

function deleteLens(id) {
  state.pendingLensDelete = null;
  state.preferences.customLenses = state.preferences.customLenses.filter(lens => lens.id !== id);
  state.preferences.activeLensId = 'general';
  state.preferences = savePreferences(state.preferences);
  state.lensEditorKey = '';
  window.location.hash = '#briefings';
}

function filterLensExamples(query) {
  const normalized = normalizedText(query);
  document.querySelectorAll('.lens-example-row').forEach(row => row.classList.toggle('hidden', normalized && !row.dataset.search.includes(normalized)));
}
