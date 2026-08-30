let state = {
  route: { name: 'briefing' },
  period: 'weekly',
  search: '',
  compareIds: [],
  feedScrollY: 0,
  restoreFeedScroll: false,
  preferences: null,
  lensDraft: null,
  lensStep: 1,
  lensError: '',
  lensEditorKey: '',
  suppressRouteFocus: false
};

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
}

function setActiveLens(id) {
  const lens = findLens(id, state.preferences);
  state.preferences.activeLensId = lens.id;
  state.preferences = savePreferences(state.preferences);
  state.search = '';
  document.querySelectorAll('[data-global-search]').forEach(search => { search.value = ''; });
  if (state.route.name === 'briefing') renderRoute();
  else window.location.hash = '#briefings';
}

function updateCompareButtons(id, selected) {
  document.querySelectorAll(`[data-compare-id="${CSS.escape(id)}"]`).forEach(button => {
    button.setAttribute('aria-pressed', String(selected));
    if (button.closest('.dossier-aside')) {
      button.textContent = selected ? 'Remove from compare' : 'Add to compare';
      button.classList.toggle('button-primary', !selected);
    } else {
      button.textContent = selected ? 'Selected' : 'Compare';
    }
  });
}

function toggleCompareSelection(id) {
  const selected = state.compareIds.includes(id);
  state.compareIds = selected ? state.compareIds.filter(item => item !== id) : [...state.compareIds.filter(item => item !== id), id].slice(-2);
  updateCompareButtons(id, !selected);
  renderCompareTray();
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const button = document.getElementById('mobile-menu-toggle');
  const open = menu.classList.toggle('hidden') === false;
  button.setAttribute('aria-expanded', String(open));
}

function toggleMobileSearch() {
  const panel = document.getElementById('mobile-search-panel');
  const open = panel.classList.toggle('open');
  document.getElementById('mobile-search-toggle').setAttribute('aria-expanded', String(open));
  if (open) document.getElementById('mobile-search').focus();
}

function handleClick(event) {
  const lensButton = event.target.closest('[data-lens-id]');
  if (lensButton) {
    event.preventDefault();
    setActiveLens(lensButton.dataset.lensId);
    return;
  }
  const periodButton = event.target.closest('[data-period]');
  if (periodButton) {
    state.period = periodButton.dataset.period;
    state.suppressRouteFocus = true;
    renderHome(document.getElementById('app-root'));
    return;
  }
  const compareButton = event.target.closest('[data-compare-id]');
  if (compareButton) {
    event.preventDefault();
    event.stopPropagation();
    toggleCompareSelection(compareButton.dataset.compareId);
    return;
  }
  if (event.target.closest('[data-remember-scroll]')) state.feedScrollY = window.scrollY;
  if (event.target.closest('[data-back-to-feed]')) state.restoreFeedScroll = true;
  if (event.target.closest('[data-clear-compare]')) {
    state.compareIds = [];
    renderCompareTray();
    if (state.route.name === 'briefing') {
      state.suppressRouteFocus = true;
      renderHome(document.getElementById('app-root'));
    }
    return;
  }
  if (event.target.closest('[data-open-compare]') && state.compareIds.length >= 2) {
    window.location.hash = routeForCompare(state.compareIds);
    return;
  }
  if (event.target.closest('[data-clear-search]')) {
    state.search = '';
    document.querySelectorAll('[data-global-search]').forEach(search => { search.value = ''; });
    renderRoute();
    return;
  }
  const next = event.target.closest('[data-lens-next]');
  if (next) return changeLensStep(Number(next.dataset.lensNext));
  const back = event.target.closest('[data-lens-back]');
  if (back) return changeLensStep(Number(back.dataset.lensBack));
  if (event.target.closest('[data-save-lens]')) return saveLensDraft();
  const remove = event.target.closest('[data-delete-lens]');
  if (remove) return deleteLens(remove.dataset.deleteLens);
  if (event.target.closest('#theme-toggle') || event.target.closest('[data-mobile-theme]')) {
    state.preferences.theme = state.preferences.theme === 'dark' ? 'light' : 'dark';
    state.preferences = savePreferences(state.preferences);
    applyTheme(state.preferences.theme);
    renderHeaderState(state.route);
    return;
  }
  if (event.target.closest('#mobile-menu-toggle')) return toggleMobileMenu();
  if (event.target.closest('#mobile-search-toggle')) return toggleMobileSearch();
  if (event.target.closest('#mobile-menu a')) toggleMobileMenu();
}

function handleInput(event) {
  if (event.target.matches('[data-global-search]')) {
    state.search = event.target.value;
    document.querySelectorAll('[data-global-search]').forEach(search => {
      if (search !== event.target) search.value = state.search;
    });
    if (state.route.name !== 'briefing') window.location.hash = '#briefings';
    else {
      state.suppressRouteFocus = true;
      renderHome(document.getElementById('app-root'));
      requestAnimationFrame(() => document.getElementById(event.target.id)?.focus());
    }
  }
  if (event.target.id === 'lens-example-search') filterLensExamples(event.target.value);
}

function handleKeydown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    const target = window.innerWidth <= 720 ? document.getElementById('mobile-search') : document.getElementById('desktop-search');
    target?.focus();
  }
  if (event.key === 'Escape') {
    document.getElementById('mobile-menu')?.classList.add('hidden');
    document.getElementById('mobile-search-panel')?.classList.remove('open');
  }
}

function init() {
  state.preferences = loadPreferences();
  applyTheme(state.preferences.theme);
  document.addEventListener('click', handleClick);
  document.addEventListener('input', debounce(handleInput, 90));
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

document.addEventListener('DOMContentLoaded', init);
