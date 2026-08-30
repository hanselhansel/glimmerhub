function safeDecode(value) {
  try { return decodeURIComponent(value); } catch { return ''; }
}

function parseRoute(hash = window.location.hash) {
  const route = String(hash || '').replace(/^#\/?/, '');
  if (!route || route === 'briefings') return { name: 'briefing' };
  if (route === 'topics') return { name: 'topics' };
  if (route === 'sources') return { name: 'sources' };
  if (route === 'lens/new') return { name: 'lens-new' };
  const parts = route.split('/');
  if (parts[0] === 'project' && parts[1]) return { name: 'project', id: safeDecode(parts.slice(1).join('/')) };
  if (parts[0] === 'compare' && parts.length >= 3) return { name: 'compare', ids: parts.slice(1).map(safeDecode).filter(Boolean) };
  if (parts[0] === 'lens' && parts.at(-1) === 'edit') return { name: 'lens-edit', id: safeDecode(parts.slice(1, -1).join('/')) };
  return { name: 'not-found' };
}

function routeForProject(id) {
  return `#project/${encodeURIComponent(id)}`;
}

function routeForCompare(ids) {
  return `#compare/${ids.map(encodeURIComponent).join('/')}`;
}

function routeForLensEdit(id) {
  return `#lens/${encodeURIComponent(id)}/edit`;
}

function shouldRestoreFeedScroll(from, to) {
  return ['project', 'compare'].includes(from && from.name) && to && to.name === 'briefing';
}

function navigateTo(hash, options = {}) {
  if (options.rememberScroll) state.feedScrollY = window.scrollY;
  if (window.location.hash === hash) renderRoute();
  else window.location.hash = hash;
}

function announceRoute(title) {
  document.title = `${title} | GlimmerHub`;
  const live = document.getElementById('route-status');
  if (live) live.textContent = title;
  if (state.suppressRouteFocus) {
    state.suppressRouteFocus = false;
    return;
  }
  requestAnimationFrame(() => document.querySelector('main h1, main h2')?.focus({ preventScroll: true }));
}
