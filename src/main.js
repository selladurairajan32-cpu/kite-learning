/* =====================================================================
   Routing and wiring. Each screen has a plain #name so links and the
   back button work: home, login, join, profiles, parent, subjects,
   maths, topic-<id>, lesson.
   ===================================================================== */
let current = null, pendingTeacher = false;
const ROUTES = { home: Home, login: () => Auth('login'), join: () => Auth('join'), profiles: Profiles, parent: Parent, subjects: Subjects, maths: Maths, lesson: Lesson };

function render() {
  const name = (location.hash || '#home').slice(1) || 'home';
  if (current && current.unmount) current.unmount();
  stageActs = {};
  const make = name.indexOf('topic-') === 0 ? () => Topic(name.slice(6)) : (ROUTES[name] || Home);
  current = make();
  const app = $('#app');
  app.innerHTML = current.html;
  window.scrollTo(0, 0);
  if (current.mount) current.mount(app);
  if (pendingTeacher && name === 'lesson') { pendingTeacher = false; setTimeout(() => ACTIONS['to-teacher'](), 450); }
}
function go(name) { if (location.hash === '#' + name) render(); else location.hash = name; }

const ACTIONS = {
  'pick-kid': el => { S.active = el.dataset.id; S.auth = true; save(); go('subjects'); },
  'open-parent': () => { parentKid = S.active; go('parent'); },
  'parent-kid': el => { parentKid = el.dataset.id; const y = window.scrollY; render(); window.scrollTo(0, y); },
  'logout': () => { S.auth = false; save(); go('home'); },
  'stage': el => setStage(+el.dataset.i),
  'to-teacher': () => { const t = $('#teacher'); if (t) t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }); },
  'sample-teacher': () => { S.auth = true; save(); pendingTeacher = true; go('lesson'); },
};

document.addEventListener('click', e => {
  const a = e.target.closest('[data-action]');
  if (a) {
    const fn = stageActs[a.dataset.action] || ACTIONS[a.dataset.action];
    if (fn && !a.disabled) { e.preventDefault(); fn(a, e); }
    return;
  }
  const g = e.target.closest('[data-go]');
  if (g) return go(g.dataset.go);
  const s = e.target.closest('[data-scroll]');
  if (s) { const t = document.getElementById(s.dataset.scroll); if (t) t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }); return; }
  const t = e.target.closest('[data-toast]');
  if (t) toast(t.dataset.toast);
});
window.addEventListener('hashchange', render);
window.addEventListener('pagehide', () => { if (current && current.unmount) current.unmount(); });
render();
