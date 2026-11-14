/* =====================================================================
   Screens outside the lesson
   ===================================================================== */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY = (new Date().getDay() + 6) % 7;
const mins = m => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? (m % 60) + 'm' : ''}`.trim() : `${m}m`;
function stars(id = kid().id) {
  const d = DEMO[id] || DEMO.k1;
  return d.stars + Object.values(S.prog[id] || {}).reduce((a, l) => a + l.pr.log.filter(r => r && r.first).length * 5 + (l.complete ? 30 : 0), 0);
}
function stageLabel(l) {
  if (l.complete) return 'Mastered';
  if (!l.started) return 'Not started';
  const i = Math.min(l.stage, 4);
  return `Step ${i + 1} of 5: ${STAGES[i].label}`;
}
/* the lesson a child is on now, their place in it, and whether every built lesson is mastered */
function nowLesson(kidId = kid().id, topic = 'fractions') {
  const def = LESSON_DEFS[currentLessonId(kidId, topic)];
  return { def, l: prog(def.id, kidId), all: builtIds(topic).every(id => prog(id, kidId).complete) };
}
const masteredIds = kidId => builtIds('fractions').filter(id => prog(id, kidId).complete);

function appBar(mode = 'kid') {
  const k = kid(), d = demo();
  const left = mode === 'kid'
    ? `<span class="stat-chip">${icon('flame', 18)} ${d.streak} <small>day streak</small></span><span class="stat-chip">${icon('star', 18)} ${stars()} <small>stars</small></span>`
    : `<span class="chip chip-line">Parent view</span>`;
  const me = mode === 'kid'
    ? `<span class="avatar">${esc(k.name[0])}</span><span class="me-name">${esc(k.name)}</span>`
    : `<span class="avatar" style="background:var(--ink);color:var(--on-accent)">${icon('users', 20)}</span><span class="me-name">${esc(S.parent)}</span>`;
  return `<header class="app-bar"><div class="wrap app-bar-in">${logo(mode === 'kid' ? '#subjects' : '#parent')}
    <div class="app-bar-right">${left}<a class="me-btn c-${k.c}" href="#profiles" aria-label="Switch profile">${me}${icon('swap', 18)}</a></div>
  </div></header>`;
}

/* weekly minutes: one series, thin bars, hairline grid, value on the peak, tooltip + table for the rest */
function weekChart(week, today = TODAY) {
  const max = Math.max(10, Math.ceil(Math.max(...week) / 10) * 10);
  const peak = week.indexOf(Math.max(...week));
  const ticks = [];
  for (let v = 0; v <= max; v += 10) ticks.push(v);
  return `<div class="wk">
    <div class="wk-plot">
      <div class="wk-grid" aria-hidden="true">${ticks.map(v => `<span style="--y:${v / max * 100}"><b>${v}</b></span>`).join('')}</div>
      <div class="wk-bars">${week.map((v, i) => `<button type="button" class="wk-col" style="--v:${v / max * 100}" aria-label="${DAYS[i]}: ${i > today ? 'not yet' : v + ' minutes'}">
        ${v ? `<span class="wk-bar"></span>` : ''}${i === peak && v ? `<span class="val">${v} min</span>` : ''}<span class="tip">${i > today ? 'Not yet' : v + ' min'}</span></button>`).join('')}</div>
    </div>
    <div class="wk-x" aria-hidden="true">${DAYS.map((d, i) => `<span class="${i === today ? 'today' : ''}">${d}</span>`).join('')}</div>
    <details class="wk-table"><summary>View as a table</summary><table><tr><th>Day</th><th>Minutes</th></tr>${week.map((v, i) => `<tr><td>${DAYS[i]}</td><td>${i > today ? 'Not yet' : v}</td></tr>`).join('')}</table></details>
  </div>`;
}

/* ---------- public homepage ---------- */
function Home() {
  const d = DEMO.k1;
  const html = `<div class="view">
  <header class="pub-head"><div class="wrap pub-head-in">
    ${logo('#home')}
    <nav class="pub-nav" aria-label="On this page">
      <button type="button" data-scroll="subjects">Subjects</button>
      <button type="button" data-scroll="how">How it works</button>
      <button type="button" data-scroll="teacher-feature">Teacher videos</button>
      <button type="button" data-scroll="parents">For parents</button>
    </nav>
    <div class="pub-actions"><a class="btn btn-quiet btn-sm" href="#login">Log in</a><a class="btn btn-primary btn-sm" href="#join">Get started</a></div>
  </div></header>
  <main>
    <section class="hero"><div class="wrap hero-grid">
      <div>
        <p class="eyebrow">11+ learning for Years 3 to 6</p>
        <h1>Learning your child can <span>see, touch</span> and understand.</h1>
        <p class="lead">Kite Learning teaches 11+ Maths, English, Verbal and Non-Verbal Reasoning in small, clear steps. Every idea is shown with moving pictures, tried by hand, then practised until it sticks.</p>
        <div class="cta-row"><a class="btn btn-primary btn-lg" href="#join">Get started ${icon('right')}</a><a class="btn btn-lg" href="#login">Log in</a></div>
        <ul class="hero-points"><li>${icon('check', 18)} Pictures before symbols</li><li>${icon('check', 18)} A teacher writes out every step</li><li>${icon('check', 18)} Parents see real progress</li></ul>
      </div>
      <div class="hero-art">
        <div class="demo card">
          <svg class="hero-string" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M84 4C76 30 96 52 70 70S22 80 0 100"/></svg>
          ${kite('hero-kite', true)}
          <div class="demo-head"><span class="chip chip-blue">${icon('tap', 16)} Try it</span><span class="demo-hint">Tap a slice to colour it</span></div>
          <div id="hero-lab"></div>
        </div>
      </div>
    </div></section>

    <section class="section" id="subjects"><div class="wrap">
      <div class="section-head"><p class="eyebrow">Four subjects</p><h2>Everything the 11+ asks for, on one clear path.</h2>
        <p class="sub">Each subject is split into topics, and each topic into short lessons that build from Foundation to Advanced.</p></div>
      <div class="subj-grid">${SUBJECTS.map(s => `<article class="subj-card c-${s.c}">
        <span class="subj-ico">${icon(s.ico, 28)}</span>
        <div><h3>${s.name}</h3><p style="margin-top:6px">${s.line}</p></div>
        <span class="chip ${s.live ? 'chip-good' : 'chip-line'}" style="align-self:flex-start">${s.live ? icon('check', 14) + ' Ready to try' : 'Coming soon'}</span>
        <ul>${s.topics.map(t => `<li>${t}</li>`).join('')}</ul>
      </article>`).join('')}</div>
    </div></section>

    <section class="section" id="how" style="padding-top:0"><div class="wrap">
      <div class="section-head"><p class="eyebrow">How a lesson works</p><h2>Five small steps from first look to mastery.</h2>
        <p class="sub">Every lesson follows the same order, so children always know what comes next.</p></div>
      <ol class="how-grid">${[
        ['See it', 'A short animated story shows the idea with real objects.'],
        ['Play with it', 'Children move and colour shapes to find the pattern themselves.'],
        ['Follow an example', 'Worked examples show each step, one at a time.'],
        ['Practise', 'Questions get harder slowly, with hints and instant feedback.'],
        ['Show you know it', 'A short check confirms real understanding before moving on.'],
      ].map((s, i) => `<li class="how"><span class="how-top"><span class="how-n">${i + 1}</span>${icon(STAGES[i].ico, 24)}</span><h3>${s[0]}</h3><p>${s[1]}</p></li>`).join('')}</ol>
    </div></section>

    <section class="section" id="teacher-feature" style="padding-top:0"><div class="wrap split">
      <div>
        <p class="eyebrow">Watch teacher explain</p><h2>A teacher writes out every step, just like in class.</h2>
        <p class="sub">Each lesson ends with a handwritten explanation your child can pause, replay or slow down.</p>
        <ul class="ticks">
          <li><span class="t-ico">${icon('check', 16)}</span><div><b>Written by hand, one step at a time</b><span>Numbers, diagrams and labels appear as the teacher talks.</span></div></li>
          <li><span class="t-ico">${icon('check', 16)}</span><div><b>Thinking time built in</b><span>The teacher pauses so your child can answer first.</span></div></li>
          <li><span class="t-ico">${icon('check', 16)}</span><div><b>Captions and a calm reading voice</b><span>Helpful for children who find reading hard work.</span></div></li>
        </ul>
        <div class="cta-row"><button type="button" class="btn btn-dark" data-action="sample-teacher">${icon('play', 18)} Watch the sample</button></div>
      </div>
      <div class="board-preview" id="home-board"></div>
    </div></section>

    <section class="section" id="parents" style="padding-top:0"><div class="wrap split flip">
      <div class="mini-dash" aria-label="Example of the parent view">
        <div class="mini-dash-head c-blue"><span class="avatar">M</span><div><b>Maya's week</b><span>Year 4 · sample data</span></div><span class="chip chip-good" style="margin-left:auto">${icon('flame', 14)} ${d.streak} days</span></div>
        ${weekChart(d.week, 4)}
        <div class="insight help"><span class="i-ico">${icon('bulb', 18)}</span><div><b>Times tables: 7s and 8s</b><span>Try five quick questions at breakfast this week.</span></div></div>
      </div>
      <div>
        <p class="eyebrow">For parents</p><h2>Know exactly how your child is doing.</h2>
        <p class="sub">The parent view shows time spent, what has been mastered and where a little help is needed.</p>
        <ul class="ticks">
          <li><span class="t-ico">${icon('check', 16)}</span><div><b>The week at a glance</b><span>Minutes learned each day and lessons finished.</span></div></li>
          <li><span class="t-ico">${icon('check', 16)}</span><div><b>Strengths and sticking points</b><span>See the exact idea your child found hard, with a tip for helping at home.</span></div></li>
          <li><span class="t-ico">${icon('check', 16)}</span><div><b>Short sessions that fit family life</b><span>A lesson takes about 15 minutes and always saves its place.</span></div></li>
        </ul>
      </div>
    </div></section>

    <section class="section" style="padding-top:0"><div class="wrap">
      <div class="section-head"><p class="eyebrow">Every learner</p><h2>Starts where your child is. Climbs when they are ready.</h2></div>
      <div class="levels">${[
        ['Foundation', 'The big idea, shown with pictures and objects. Extra hints and worked examples for children who need more time.'],
        ['Intermediate', 'Methods and fluency. Mixed practice so each skill stays secure.'],
        ['Advanced', '11+ exam-style problems that need several steps. Children who are ready can skip ahead.'],
      ].map((l, i) => `<article class="level"><span class="level-bars" aria-hidden="true">${[14, 24, 34].map((h, j) => `<i class="${j <= i ? 'on' : ''}" style="height:${h}px"></i>`).join('')}</span><h3>${l[0]}</h3><p>${l[1]}</p></article>`).join('')}</div>
    </div></section>

    <section class="section" style="padding-top:0"><div class="wrap">
      <div class="cta-band on-dark">
        <div><h2>Ready for the first lesson?</h2><p>Create an account and start with Understanding Fractions. It takes about 15 minutes.</p>
          <div class="cta-row"><a class="btn btn-primary btn-lg" href="#join">Get started ${icon('right')}</a><a class="btn btn-lg" href="#login">Log in</a></div></div>
        ${kite('cta-kite')}
      </div>
    </div></section>
  </main>
  <footer class="pub-foot"><div class="wrap"><div class="pub-foot-in">${logo('#home')}<span>Phase 1 prototype. The Fractions lesson in Mathematics is ready to explore.</span></div></div></footer>
  </div>`;
  return {
    html,
    mount(root) {
      mountLab($('#hero-lab', root), { compact: true, n: 4, on: [0], shape: 'pie' });
      Teacher.poster($('#home-board', root), LESSON_DEFS['understanding-fractions'].teacher);
    },
  };
}

/* ---------- log in / create account ---------- */
function Auth(mode) {
  const join = mode === 'join', k = S.kids[0];
  const html = `<div class="view auth">
    <aside class="auth-side on-dark">
      ${logo('#home')}
      <div><h2>Small steps.<br>Big understanding.</h2><p>Short lessons with moving pictures, hands-on practice and a teacher who writes out every step.</p></div>
      <p style="font-size:.875rem;margin:0">Years 3 to 6 · 11+ preparation</p>
      ${kite('auth-kite', true)}
    </aside>
    <main class="auth-main wrap"><div class="auth-card">
      <a class="auth-back" href="#home">${icon('left', 18)} Back to home</a>
      <h1>${join ? 'Create your family account' : 'Welcome back'}</h1>
      <p class="sub">${join ? 'One account for the whole family. Add each child and follow their progress.' : 'Log in to carry on from where you stopped.'}</p>
      <div class="tabs" role="tablist" aria-label="Log in or create an account">
        <button type="button" role="tab" aria-selected="${!join}" data-go="login">Log in</button>
        <button type="button" role="tab" aria-selected="${join}" data-go="join">Create account</button>
      </div>
      <form class="form" id="auth-form" novalidate>
        ${join ? `<div class="field-row">
          <div class="field"><label for="f-parent">Your name</label><input id="f-parent" value="${esc(S.parent)}" autocomplete="name"></div>
          <div class="field"><label for="f-child">Child's first name</label><input id="f-child" value="${esc(k.name)}" autocomplete="off"></div>
        </div>
        <div class="field"><span class="lbl" id="f-year-l">Child's year group</span>
          <div class="seg" role="radiogroup" aria-labelledby="f-year-l">${[3, 4, 5, 6].map(y => `<label><input type="radio" name="year" id="f-year-${y}" value="${y}" ${y === k.year ? 'checked' : ''}><span>Year ${y}</span></label>`).join('')}</div>
        </div>` : ''}
        <div class="field"><label for="f-email">Email</label><input id="f-email" type="email" value="alex@example.com" autocomplete="email"></div>
        <div class="field"><label for="f-pass">Password</label><input id="f-pass" type="password" value="kite-demo-1" autocomplete="${join ? 'new-password' : 'current-password'}"></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">${join ? 'Create account' : 'Log in'} ${icon('right')}</button>
        <p class="demo-note">${icon('info', 18)}<span>This is a prototype. The demo details are filled in for you, so just press the button.</span></p>
      </form>
    </div></main>
  </div>`;
  return {
    html,
    mount(root) {
      $('#auth-form', root).addEventListener('submit', e => {
        e.preventDefault();
        if (join) {
          const p = $('#f-parent', root).value.trim(), c = $('#f-child', root).value.trim(), y = $('input[name=year]:checked', root);
          if (p) S.parent = p.slice(0, 24);
          if (c) S.kids[0].name = c.slice(0, 16);
          if (y) S.kids[0].year = +y.value;
        }
        S.auth = true; save(); go('profiles');
      });
    },
  };
}

/* ---------- parent or child ---------- */
function whereIs(kidId) {
  const { def, l, all } = nowLesson(kidId), done = masteredIds(kidId).length;
  return all ? `${done} lessons mastered` : l.started ? `Lesson ${def.n}: ${stageLabel(l).toLowerCase()}` : done ? `Lesson ${def.n} is next` : 'Ready to start';
}
function Profiles() {
  const html = `<div class="view who">
    <header class="who-top"><div class="wrap">${logo('#home')}</div></header>
    <main class="who-main wrap"><div class="who-in">
      <p class="eyebrow">Signed in as ${esc(S.parent)}</p>
      <h1 style="margin-top:12px">Who is learning today?</h1>
      <p class="sub">Choose a learner, or open the parent view.</p>
      <div class="who-grid">
        ${S.kids.map(k => `<button type="button" class="who-card c-${k.c}" data-action="pick-kid" data-id="${k.id}">
          <span class="who-face">${esc(k.name[0].toUpperCase())}</span>
          <span class="who-txt"><strong>${esc(k.name)}</strong><span class="meta">Year ${k.year} · ${whereIs(k.id)}</span></span>
        </button>`).join('')}
        <button type="button" class="who-card is-parent" data-action="open-parent">
          <span class="who-face">${icon('users', 44)}</span>
          <span class="who-txt"><strong>Parent view</strong><span class="meta">Progress and reports</span></span>
        </button>
      </div>
      <p class="who-foot"><button type="button" class="link" data-action="logout">Log out</button></p>
    </div></main>
  </div>`;
  return { html };
}

/* ---------- student home: choose a subject ---------- */
function Subjects() {
  const k = kid(), d = demo(), { def, l, all } = nowLesson();
  const doneTopics = ALL_TOPICS.filter(t => topicDone(t) >= lessonCount(t.id)).length;
  const where = `Mathematics · ${topicById(def.topic).name} · Lesson ${def.n}`;
  const cont = all ? { eb: 'Every lesson so far is mastered', where: `${where} · open it again any time`, btn: 'Review lesson' }
    : l.started ? { eb: 'Continue learning', where: `${where} · ${stageLabel(l)}`, btn: 'Continue' }
      : { eb: def.n > 1 ? 'Your next lesson' : 'Start here', where: `${where} · about ${def.minutes} minutes`, btn: 'Start lesson' };
  const html = `<div class="view">${appBar('kid')}
  <main class="wrap page">
    <header><p class="eyebrow">${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][TODAY]} · Year ${k.year}</p>
      <h1 class="page-title" style="margin-top:10px">Hello, ${esc(k.name)}.</h1>
      <p class="page-sub">${l.started && !l.complete ? 'Carry on from where you stopped, or choose a subject.' : 'Choose a subject and learn something new today.'}</p></header>
    <section class="continue on-blue" aria-label="${cont.eb}">
      <svg class="continue-art" viewBox="0 0 200 200" aria-hidden="true">${[0, 1, 2, 3].map(i => `<path d="${sector(100, 100, 94, -Math.PI / 2 + i * TAU / 4, -Math.PI / 2 + (i + 1) * TAU / 4)}" style="fill:${i === 3 ? 'var(--on-accent)' : 'none'};stroke:var(--on-accent);stroke-width:3;stroke-linejoin:round"/>`).join('')}</svg>
      <div>
        <p class="eyebrow">${cont.eb}</p><h2>${def.title}</h2><p class="where">${cont.where}</p>
        <div class="continue-steps" role="img" aria-label="${stageLabel(l)}">${STAGES.map((s, i) => `<i class="${l.complete || i < l.stage || (i === l.stage && l.started) ? 'on' : ''}"></i>`).join('')}</div>
      </div>
      <a class="btn btn-white btn-lg" href="#lesson-${def.id}">${cont.btn} ${icon('right')}</a>
    </section>
    <section>
      <div class="h-row" style="margin-bottom:16px"><h2>Your subjects</h2></div>
      <div class="tiles-2">${SUBJECTS.map(s => s.live
        ? `<a class="subject c-${s.c}" href="#maths" style="text-decoration:none"><span class="subj-ico">${icon(s.ico, 32)}</span>
            <span><h3>${s.name}</h3><span class="meta" style="display:block">${doneTopics} of ${ALL_TOPICS.length} topics complete</span><span class="meter" style="--v:${d.subj[s.id] + masteredIds(k.id).length};display:block"><i></i></span></span>
            <span class="go">${icon('right')}</span></a>`
        : `<div class="subject is-soon c-${s.c}"><span class="subj-ico">${icon(s.ico, 32)}</span>
            <span><h3>${s.name}</h3><span class="meta" style="display:block">${s.line}</span><span class="chip chip-line" style="margin-top:12px">Coming soon</span></span>
            <span class="go">${icon('lock', 18)}</span></div>`).join('')}</div>
    </section>
  </main></div>`;
  return { html };
}

/* ---------- mathematics home ---------- */
function topicCard(t) {
  const lv = LESSONS[t.id], done = topicDone(t), total = lessonCount(t.id), built = !!BUILT[t.id];
  let seen = 0;
  const bars = lv.map(list => { const a = clamp(done - seen, 0, list.length); seen += list.length; return a === list.length ? 'on' : a > 0 ? 'half' : ''; });
  const state = done >= total ? 'done' : done > 0 ? 'doing' : '';
  const next = built && done < total;
  const chip = state === 'done' ? `<span class="chip chip-good">${icon('check', 14)} Complete</span>`
    : next ? `<span class="chip chip-blue">${done > 0 || nowLesson(undefined, t.id).l.started ? 'In progress' : 'Start here'}</span>`
      : state === 'doing' ? `<span class="chip chip-blue">In progress</span>` : '';
  return `<a class="topic ${state === 'done' ? 'is-done' : ''} ${next ? 'is-next' : ''}" href="#topic-${t.id}" style="text-decoration:none">
    <span class="topic-top"><span class="glyph">${t.i ? icon(t.i, 24) : t.g}</span>${chip}</span>
    <span><h3>${t.name}</h3><span class="meta" style="display:block">${done ? `${done} of ${total} lessons` : `${total} lessons`}</span></span>
    <span class="lv" role="img" aria-label="${LEVELS.map((n, i) => `${n}: ${bars[i] === 'on' ? 'complete' : bars[i] === 'half' ? 'in progress' : 'not started'}`).join(', ')}">${bars.map(b => `<i class="${b}"></i>`).join('')}</span>
  </a>`;
}
function Maths() {
  const { def, l, all } = nowLesson();
  const doneTopics = ALL_TOPICS.filter(t => topicDone(t) >= lessonCount(t.id)).length;
  const lessonsDone = ALL_TOPICS.reduce((a, t) => a + topicDone(t), 0), lessonsAll = ALL_TOPICS.reduce((a, t) => a + lessonCount(t.id), 0);
  const html = `<div class="view">${appBar('kid')}
  <main class="wrap page">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#subjects">Home</a>${icon('chev', 14)}<span>Mathematics</span></nav>
    <header class="subject-head c-blue">
      <span class="subj-ico">${icon('maths', 38)}</span>
      <div><h1 class="page-title">Mathematics</h1><p class="page-sub">${ALL_TOPICS.length} topics in ${PATHWAYS.length} pathways. Every topic climbs from Foundation to Advanced.</p></div>
      <div class="overall"><b>${doneTopics} of ${ALL_TOPICS.length} topics complete</b><div class="meter" style="--v:${lessonsDone / lessonsAll * 100}"><i></i></div><span>${lessonsDone} of ${lessonsAll} lessons finished</span></div>
    </header>
    <section class="reco" aria-label="Recommended next lesson">
      <span class="reco-fig">${def.thumb()}</span>
      <div><p class="eyebrow" style="color:var(--blue-deep)">${all ? 'Mastered' : l.started ? 'Continue learning' : def.n > 1 ? 'Your next lesson' : 'Recommended next'}</p><h2>${def.title}</h2>
        <p>${topicById(def.topic).name} · Lesson ${def.n} · ${all ? 'review any time' : l.started ? stageLabel(l) : `about ${def.minutes} minutes`}</p></div>
      <a class="btn btn-primary btn-lg" href="#lesson-${def.id}">${all ? 'Review' : l.started ? 'Continue' : 'Start lesson'} ${icon('right')}</a>
    </section>
    <div class="levels-note"><span class="chip chip-blue">Foundation</span>${icon('right', 16)}<span class="chip chip-blue">Intermediate</span>${icon('right', 16)}<span class="chip chip-blue">Advanced</span><span>The three bars on each topic show how far you have climbed.</span></div>
    ${PATHWAYS.map(p => `<section class="pathway">
      <div class="pathway-head"><h2>${p.name}</h2><span>${p.note}</span></div>
      <div class="topic-grid">${p.topics.map(topicCard).join('')}</div>
    </section>`).join('')}
  </main></div>`;
  return { html };
}

/* ---------- a topic and its string of lessons ---------- */
const TOPIC_BLURB = {
  fractions: ['Fractions describe parts of a whole. This topic starts with sharing fairly and ends with 11+ exam problems.',
    ['See a fraction as equal parts of a whole', 'Place, compare and simplify fractions', 'Add, subtract, multiply and divide fractions', 'Solve 11+ fraction problems']],
};
function Topic(id) {
  const t = topicById(id);
  if (!t) return Maths();
  const lv = LESSONS[id], total = lessonCount(id), done = topicDone(t), built = BUILT[id] || [], live = !!BUILT[id];
  const curId = live ? currentLessonId(undefined, id) : null, allDone = live && built.every(b => prog(b).complete);
  const blurb = TOPIC_BLURB[id] || [`${total} short lessons that climb from Foundation to Advanced.`, lv.map(x => x[0])];
  let n = 0;
  const lesson = name => {
    const i = n++, bid = built[i];
    if (bid) {                                   // a lesson that is built
      const def = LESSON_DEFS[bid], l = prog(bid), state = lessonState(bid);
      if (state === 'locked') {
        return `<li class="path-item is-locked"><span class="node">${i + 1}</span>
          <div class="path-card"><span><span class="h">${def.title}</span><span class="p">Opens when you master ${LESSON_DEFS[built[i - 1]].title}.</span></span>
            <span class="path-actions"><span class="chip chip-line">${icon('lock', 14)} Locked</span><a class="link" href="#lesson-${bid}" title="Prototype shortcut: open this lesson without unlocking it">Preview</a></span></div></li>`;
      }
      const main = bid === curId && !allDone, isDone = state === 'done';
      return `<li class="path-item ${main ? 'is-current' : isDone ? 'is-done' : 'is-open'}"><span class="node">${isDone ? icon('check', 22) : i + 1}</span>
        <a class="path-card" href="#lesson-${bid}" style="text-decoration:none"><span><span class="h">${def.title}</span>
          <span class="p">${isDone ? 'Mastered. Open it again any time.' : def.blurb}</span>
          ${isDone ? '' : `<span class="mini-steps" role="img" aria-label="${stageLabel(l)}">${STAGES.map((s, j) => `<i class="${j < l.stage || (j === l.stage && l.started) ? 'on' : ''}"></i>`).join('')}</span>`}</span>
          <span class="btn ${main ? 'btn-primary' : 'btn-soft btn-sm'}">${isDone ? 'Review' : l.started ? 'Continue' : 'Start'} ${icon('right', 18)}</span></a></li>`;
    }
    const sample = !live && i < done, upNext = live && i === built.length;
    const msg = sample ? 'This finished lesson is sample progress in the prototype.' : upNext ? 'This lesson is the next one to be built.' : live ? 'Finish the lesson before this one to unlock it.' : 'Only the Fractions lessons are built in this prototype.';
    return `<li class="path-item ${sample ? 'is-done' : 'is-locked'}"><span class="node">${sample ? icon('check', 22) : i + 1}</span>
      <button type="button" class="path-card" data-toast="${esc(msg)}"><span><span class="h">${name}</span>
        <span class="p">${sample ? 'Mastered' : upNext ? 'Up next' : 'About 15 minutes'}</span></span>
        <span class="chip ${sample ? 'chip-good' : 'chip-line'}">${sample ? icon('check', 14) + ' Done' : icon('lock', 14) + (upNext ? ' Coming soon' : ' Locked')}</span></button></li>`;
  };
  const items = lv.map((list, li) => `
    <li class="path-level"><span class="lvl-dot"><i></i></span><div><h2>${LEVELS[li]}</h2><span>${LEVEL_NOTE[li]}</span></div></li>
    ${list.map(lesson).join('')}`).join('');
  const html = `<div class="view">${appBar('kid')}
  <main class="wrap page">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#subjects">Home</a>${icon('chev', 14)}<a href="#maths">Mathematics</a>${icon('chev', 14)}<span>${t.name}</span></nav>
    <header class="subject-head c-blue">
      <span class="subj-ico" style="font:800 1.75rem var(--font-display)">${t.i ? icon(t.i, 36) : t.g}</span>
      <div><h1 class="page-title">${t.name}</h1><p class="page-sub">${blurb[0]}</p></div>
      <div class="overall"><b>${done} of ${total} lessons finished</b><div class="meter" style="--v:${done / total * 100}"><i></i></div><span>${LEVELS.join(' · ')}</span></div>
    </header>
    <div class="topic-layout">
      <ol class="path">${items}</ol>
      <aside class="topic-aside">
        <div class="aside-card"><h3>In this topic you will</h3><ul>${blurb[1].map(b => `<li>${icon('check', 18)}<span>${b}</span></li>`).join('')}</ul></div>
        <div class="aside-card"><h3>How lessons open</h3><ul>
          <li>${icon('medal', 18)}<span>Pass a lesson's mastery check to open the next one.</span></li>
          <li>${icon('skip', 18)}<span>Already confident? Jump to the mastery check from any lesson.</span></li>
          <li>${icon('play', 18)}<span>Every lesson has a teacher explanation you can watch at any point.</span></li></ul></div>
      </aside>
    </div>
  </main></div>`;
  return { html };
}

/* ---------- parent view ---------- */
let parentKid = null;
function Parent() {
  const id = parentKid && S.kids.some(k => k.id === parentKid) ? parentKid : S.active;
  const k = S.kids.find(x => x.id === id), d = DEMO[id] || DEMO.k1, { def, l, all } = nowLesson(id);
  const done = masteredIds(id).map(x => LESSON_DEFS[x]), begun = builtIds('fractions').map(x => LESSON_DEFS[x]).filter(x => prog(x.id, id).started).reverse();
  const total = d.week.reduce((a, b) => a + b, 0), activeDays = d.week.filter(Boolean).length;
  const first = l.pr.log.filter(r => r && r.first).length, tried = l.pr.log.filter(Boolean).length;
  /* the most recent lesson with a first-try miss tells the parent what to help with */
  const stuck = begun.map(x => ({ x, miss: prog(x.id, id).pr.log.filter(r => r && !r.first).map(r => x.skills[r.skill]) })).find(e => e.miss.length);
  const now = all ? `Mastered${l.ma.score ? `, with ${l.ma.score} out of ${def.mastery.length} in the mastery check` : ''}. The next lesson is being built.`
    : l.started ? `${esc(k.name)} is on ${stageLabel(l).toLowerCase()}.` : `Not started yet. This is ${esc(k.name)}'s next lesson.`;
  const subj = SUBJECTS.map(s => ({ ...s, v: d.subj[s.id] + (s.id === 'maths' ? done.length : 0) }));
  const html = `<div class="view">${appBar('parent')}
  <main class="wrap page">
    <header class="parent-head">
      <div><p class="eyebrow">Parent view · sample data</p><h1 class="page-title" style="margin-top:10px">${esc(k.name)}'s week</h1>
        <p class="page-sub">Year ${k.year}. Figures on this page are examples, apart from the Fractions lessons, which show what has really been done in this prototype.</p></div>
      <div class="kid-switch" role="tablist" aria-label="Choose a child">${S.kids.map(x => `<button type="button" role="tab" aria-selected="${x.id === id}" class="c-${x.c}" data-action="parent-kid" data-id="${x.id}"><span class="avatar">${esc(x.name[0].toUpperCase())}</span>${esc(x.name)}</button>`).join('')}</div>
    </header>
    <section class="stat-tiles" aria-label="This week">
      <div class="stat"><span class="lbl">${icon('clock', 16)} Time this week</span><span class="val">${mins(total)}</span><span class="delta">across ${activeDays} days</span></div>
      <div class="stat"><span class="lbl">${icon('check', 16)} Lessons finished</span><span class="val">${d.lessons + done.length}</span><span class="delta">this week</span></div>
      <div class="stat"><span class="lbl">${icon('medal', 16)} Skills mastered</span><span class="val">${d.mastered + done.length}</span><span class="delta">${done.length ? `<b>+${done.length}</b> ${done.length === 1 ? done[0].title : 'Fractions lessons'}` : 'this term'}</span></div>
      <div class="stat"><span class="lbl">${icon('flame', 16)} Learning streak</span><span class="val">${d.streak} days</span><span class="delta">in a row</span></div>
    </section>
    <div class="p-grid">
      <div class="p-col">
        <section class="p-card"><div><h2>Learning now</h2><p class="p-sub">Mathematics · ${topicById(def.topic).name} · Lesson ${def.n}</p></div>
          <div><b style="font:800 1.375rem var(--font-display)">${def.title}</b><p style="color:var(--ink-2);margin-top:4px">${now}</p></div>
          <ol class="now-steps">${STAGES.map((s, i) => `<li class="${l.complete || i < l.stage ? 'on' : (i === l.stage && l.started) ? 'cur' : ''}"><i></i><span>${s.label}</span></li>`).join('')}</ol>
          ${tried ? `<div class="insight good"><span class="i-ico">${icon('target', 18)}</span><div><b>Practice so far</b><span>${first} of ${tried} questions right at the first try.</span></div></div>` : ''}
        </section>
        <section class="p-card"><div><h2>Minutes learned each day</h2><p class="p-sub">This week, Monday to Sunday</p></div>${weekChart(d.week)}</section>
        <section class="p-card"><div><h2>Recent activity</h2></div>
          <ul class="feed">
            ${begun.map(x => { const p = prog(x.id, id); return `<li><span class="f-ico">${icon(p.complete ? 'medal' : 'play', 18)}</span><div><b>${x.title}</b><span>${p.complete ? `Mastered, ${p.ma.score} out of ${x.mastery.length}` : stageLabel(p)}</span></div><time>Today</time></li>`; }).join('')}
            <li><span class="f-ico">${icon('medal', 18)}</span><div><b>Times Tables: 3, 4 &amp; 8</b><span>Mastery check passed, 5 out of 5</span></div><time>Thursday</time></li>
            <li><span class="f-ico">${icon('target', 18)}</span><div><b>Sharing &amp; Grouping</b><span>Practice, 7 of 8 right first time</span></div><time>Tuesday</time></li>
            <li><span class="f-ico">${icon('play', 18)}</span><div><b>Column Subtraction</b><span>Watched the teacher explanation twice</span></div><time>Monday</time></li>
          </ul></section>
      </div>
      <div class="p-col">
        <section class="p-card"><div><h2>Progress by subject</h2><p class="p-sub">Share of each 11+ course completed</p></div>
          <div class="s-rows">${subj.map(s => `<div class="s-row c-${s.c}"><span class="dot"></span><b>${s.name}</b><span class="pct">${s.v}%</span><div class="meter" style="--v:${s.v}" role="img" aria-label="${s.name}: ${s.v} percent"><i></i></div></div>`).join('')}</div></section>
        <section class="p-card"><div><h2>Doing well</h2></div>
          ${done.slice().reverse().map(x => `<div class="insight good"><span class="i-ico">${icon('medal', 18)}</span><div><b>${x.title}</b><span>Passed the mastery check with ${prog(x.id, id).ma.score} out of ${x.mastery.length}, working alone.</span></div></div>`).join('')}
          <div class="insight good"><span class="i-ico">${icon('check', 18)}</span><div><b>Place value</b><span>Reads, orders and rounds numbers to 10,000 with confidence.</span></div></div>
          ${done.length > 1 ? '' : `<div class="insight good"><span class="i-ico">${icon('check', 18)}</span><div><b>Addition and subtraction</b><span>Column methods are secure, including exchanging.</span></div></div>`}</section>
        <section class="p-card"><div><h2>Needs a little help</h2></div>
          ${stuck ? `<div class="insight help"><span class="i-ico">${icon('bulb', 18)}</span><div><b>Fractions: ${stuck.miss[0]}</b><span>Missed at the first try in ${stuck.x.title}. ${stuck.x.homeTip}</span></div></div>`
            : !done.length ? `<div class="insight help"><span class="i-ico">${icon('bulb', 18)}</span><div><b>Fractions are new this week</b><span>Cut toast or fruit into equal pieces and ask what fraction each piece is.</span></div></div>` : ''}
          <div class="insight help"><span class="i-ico">${icon('bulb', 18)}</span><div><b>Times tables: 7s and 8s</b><span>Slower than the other tables. Try five quick questions at breakfast.</span></div></div></section>
        <button type="button" class="btn btn-primary btn-lg" data-action="pick-kid" data-id="${id}">Open ${esc(k.name)}'s learning ${icon('right')}</button>
      </div>
    </div>
  </main></div>`;
  return { html };
}
