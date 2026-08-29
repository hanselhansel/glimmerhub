let state = {
  view: 'feed',
  period: 'weekly',
  search: '',
  topic: '',
  compareIds: [],
  selected: null
};

function switchView(view) {
  state.view = view;
  document.querySelectorAll('.nav-tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === view));
  if (view === 'topics') renderTopics();
  if (view === 'mentions') renderMentions();
  if (view === 'insights') renderInsights();
  if (view === 'radar') renderRadar();
  if (view === 'feed') renderFeed();
}

function init() {
  const savedTheme = localStorage.getItem('glimmerhub-theme');
  if (savedTheme === 'light') document.body.classList.add('light');
  else if (savedTheme === 'dark') document.body.classList.remove('light');

  document.querySelectorAll('.nav-tabs button').forEach(btn => btn.onclick = () => switchView(btn.dataset.view));
  document.querySelectorAll('.period-tabs button').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('.period-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.period = btn.dataset.period;
    renderFeed();
  });
  document.getElementById('search').addEventListener('input', debounce(e => { state.search = e.target.value; renderFeed(); }, 120));
  document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light');
    localStorage.setItem('glimmerhub-theme', document.body.classList.contains('light') ? 'light' : 'dark');
  };
  document.getElementById('compare-action').onclick = openCompare;
  document.getElementById('clear-compare').onclick = () => { state.compareIds = []; renderComparePool(); renderFeed(); };
  document.querySelectorAll('.modal-backdrop').forEach(b => b.onclick = () => {
    closeDetail(); closeCompare();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDetail(); closeCompare(); }
  });
  renderFeed();
  renderComparePool();
}

document.addEventListener('DOMContentLoaded', init);
