/* =====================================================================
   The lesson frame. Every lesson runs through the same five steps:
   Learn -> Explore -> Examples -> Practise -> Mastery check -> Done
   A lesson file supplies the content (story, tool, examples, questions,
   teacher script) and registers it with addLesson(); this file runs it.

   A lesson definition holds:
     id, topic, n (place in the topic), title, level, minutes
     intro    { say, speak, goals [[icon, text]], why, cards() }
     learn    [ { title, viz(), beats [ { say, speak, cta, ico, extra(l), gate(l), enter(viz, instant, alive, l) } ] } ]
     learnActs { name: (button, ctx) } clicks that belong to one story slide
     explore  { title, mount(root, saved, onChange), missions [ { t, ok(state), win(state) } ] }
     examples [ { q, fig | view(), stack, ans, given, steps [ { t, show, run(c, instant, alive), pick, right, why, miss, answer } ] } ]
     practice, mastery [ questions ], skills { key: words }
     teacher  { script, poster }
     canDo    [ sentences ], passSay
   ===================================================================== */
let stageToken = 0;      // bumps on every stage render so running animations can stop
let stageActs = {};      // click handlers that belong to the stage on screen
let learnBusy = false;
let LID = null;          // the lesson on screen
const D = () => LESSON_DEFS[LID];
const L = () => prog(LID);
const F = (n, d) => ({ f: [n, d] });
const listenBtn = () => Voice.ok ? `<button type="button" class="listen ${S.read ? 'is-on' : ''}" data-action="listen" aria-pressed="${!!S.read}">${icon(S.read ? 'sound' : 'mute', 18)} Read to me</button>` : '';
const toggleListen = () => { S.read = !S.read; save(); if (!S.read) Voice.stop(); renderStage(false); };

/* ---------- Learn: one small idea per press of the big button ---------- */
function introHTML(def) {
  const it = def.intro;
  return `<div class="intro">
    <div class="intro-main">
      <p class="say">${it.say}</p>
      <ul class="goals">${it.goals.map(g => `<li><span class="g-ico">${icon(g[0], 18)}</span>${g[1]}</li>`).join('')}</ul>
      <div class="meta-row"><span class="chip">${icon('clock', 14)} About ${def.minutes} minutes</span><span class="chip">${LEVELS[def.level]}</span><span class="chip">${icon('play', 14)} Teacher video below</span></div>
    </div>
    <div class="intro-side">
      <p class="eyebrow">Why it matters</p>
      <p class="note" style="max-width:none;font-size:1.0625rem;color:var(--ink)">${it.why}</p>
      <div class="why">${it.cards().map(c => `<div class="why-card">${c[0]}${c[1]}</div>`).join('')}</div>
    </div></div>`;
}
function renderLearn(el, l) {
  const def = D(), LEARN = def.learn;
  l.slide = clamp(l.slide, 0, LEARN.length - 1);
  const sl = LEARN[l.slide];
  l.beat = clamp(l.beat, 0, sl.beats.length - 1);
  const b0 = sl.beats[0];
  const body = sl.intro ? introHTML(def)
    : `<div class="stage-body two"><div class="viz" id="viz">${sl.viz ? sl.viz() : b0.viz()}</div><div class="talk" id="talk"></div></div>`;
  el.innerHTML = `<div class="stage-head"><div><p class="eyebrow">Step 1 of 5 · Learn · Part ${l.slide + 1} of ${LEARN.length}</p><h1 class="stage-title">${sl.title}</h1></div>${listenBtn()}</div>
    ${body}
    <div class="stage-foot"><button type="button" class="btn btn-quiet" data-action="learn-back" ${l.slide === 0 && l.beat === 0 ? 'disabled' : ''}>${icon('left', 18)} Back</button>
      <div class="dots" aria-hidden="true">${LEARN.map((_, i) => `<i class="${i === l.slide ? 'on' : i < l.slide ? 'done' : ''}"></i>`).join('')}</div>
      <button type="button" class="btn btn-primary btn-lg" id="learn-cta" data-action="learn-next"></button></div>`;
  const viz = $('#viz', el), tok = stageToken, alive = () => tok === stageToken;
  const setTalk = swap => {
    const b = sl.beats[l.beat], talk = $('#talk', el);
    if (talk) talk.innerHTML = `<p class="say ${swap ? 'swap' : ''}">${b.say}</p>${b.extra ? b.extra(l) : ''}`;
    if (S.read) Voice.say(sl.intro ? def.intro.speak : (b.speak || strip(b.say)));
  };
  const setCta = busy => {
    const b = sl.beats[l.beat], cta = $('#learn-cta', el);
    if (!cta) return;
    const last = l.beat === sl.beats.length - 1;
    cta.innerHTML = `${b.ico ? icon(b.ico, 20) : ''}${b.cta || (last && l.slide === LEARN.length - 1 ? 'Go to Explore' : 'Next')}${b.ico ? '' : icon('right')}`;
    cta.disabled = !!busy || !!(b.gate && !b.gate(l));
    cta.classList.toggle('nudge', !!b.ico && !busy);
  };
  if (viz && l.beat > 0) {     // coming back part-way through a slide: rebuild what has already happened, without the motion
    viz.classList.add('no-anim');
    (async () => {
      for (let i = 1; i <= l.beat; i++) if (sl.beats[i].enter) await sl.beats[i].enter(viz, true, alive, l);
      requestAnimationFrame(() => requestAnimationFrame(() => viz.classList.remove('no-anim')));
    })();
  }
  setTalk(false); setCta(false);
  learnBusy = false;
  stageActs['learn-next'] = async () => {
    if (learnBusy) return;
    if (l.beat < sl.beats.length - 1) {
      l.beat++; save();
      const b = sl.beats[l.beat];
      setTalk(true); setCta(true);
      learnBusy = true;
      try { if (b.enter) await b.enter(viz, false, alive, l); } finally { if (alive()) { learnBusy = false; setCta(false); } }
    } else if (l.slide < LEARN.length - 1) { l.slide++; l.beat = 0; save(); renderStage(true); }
    else setStage(1);
  };
  stageActs['learn-back'] = () => {
    if (l.beat > 0) l.beat--;
    else if (l.slide > 0) { l.slide--; l.beat = LEARN[l.slide].beats.length - 1; }
    save(); renderStage(true);
  };
  stageActs.listen = toggleListen;
  const ctx = { l, el, viz, setTalk, setCta };
  for (const [name, fn] of Object.entries(def.learnActs || {})) stageActs[name] = b => fn(b, ctx);
}

/* ---------- Explore: the lesson's hands-on tool, with small challenges ---------- */
function renderExplore(el, l) {
  const X = D().explore;
  el.innerHTML = `<div class="stage-head"><div><p class="eyebrow">Step 2 of 5 · Explore</p><h1 class="stage-title">${X.title}</h1></div></div>
    <div class="explore-grid">
      <div id="lab"></div>
      <div><p class="panel-title">${icon('target', 18)} Can you do these?</p><ol class="missions" id="missions"></ol></div>
    </div>
    <div class="stage-foot"><button type="button" class="btn btn-quiet" data-action="stage" data-i="0">${icon('left', 18)} Back</button><span></span>
      <button type="button" class="btn btn-primary btn-lg" data-action="stage" data-i="2" id="explore-next">Next: Examples ${icon('right')}</button></div>`;
  const drawMissions = () => {
    $('#missions', el).innerHTML = X.missions.map((m, i) => `<li class="mission ${i < l.missions ? 'is-done' : i === l.missions ? 'is-current' : ''}">
      <span class="m-dot">${i < l.missions ? icon('check', 16) : i + 1}</span><span>${m.t}${i < l.missions && l.wins[i] ? `<small>${l.wins[i]}</small>` : ''}</span></li>`).join('');
    $('#explore-next', el).classList.toggle('nudge', l.missions >= X.missions.length);
  };
  X.mount($('#lab', el), l.tool, s => {
    l.tool = s;
    const m = X.missions[l.missions];
    if (m && m.ok(s)) { l.wins[l.missions] = m.win(s); l.missions++; drawMissions(); }
    save();
  });
  drawMissions();
}

/* ---------- Guided examples: one step at a time ---------- */
function renderExamples(el, l) {
  const EX = D().examples;
  l.ex = clamp(l.ex, 0, EX.length - 1);
  const ex = EX[l.ex], tok = stageToken, alive = () => tok === stageToken;
  if (l.exDone.includes(l.ex)) l.exStep = ex.steps.length;
  let picked = l.exStep > ex.steps.findIndex(s => s.pick), busy = false;
  el.innerHTML = `<div class="stage-head"><div><p class="eyebrow">Step 3 of 5 · Examples</p><h1 class="stage-title">Watch how it is done</h1></div>
      <div class="ex-tabs" role="tablist" aria-label="Examples">${EX.map((_, i) => `<button type="button" role="tab" class="ex-tab" aria-selected="${i === l.ex}" data-action="ex-tab" data-i="${i}">${l.exDone.includes(i) ? icon('check', 16) : ''}Example ${i + 1}</button>`).join('')}</div></div>
    <div class="stage-body two">
      <div class="viz"><div class="build ${ex.stack ? 'is-stack' : ''}"><span id="ex-fig">${ex.view ? ex.view() : fig(ex.fig, { counts: true })}</span>
        ${Array.isArray(ex.ans)
          ? `<span class="frac" role="img" aria-label="The fraction being built"><span class="fn ${ex.given ? '' : 'hide'}" id="ex-n">${ex.ans[0]}</span><span class="fbar"></span><span class="fd ${ex.given ? '' : 'hide'}" id="ex-d">${ex.ans[1]}</span></span>`
          : `<span class="ans-box" role="img" aria-label="The answer"><span class="fn ${ex.given ? '' : 'hide'}" id="ex-n">${ex.ans.v}<small>${ex.ans.unit || ''}</small></span><span id="ex-d" hidden></span></span>`}</div></div>
      <div class="talk"><p class="ex-q">${ex.q}</p><ol class="ex-steps" id="ex-steps" aria-live="polite"></ol></div>
    </div>
    <div class="stage-foot"><button type="button" class="btn btn-quiet" data-action="stage" data-i="1">${icon('left', 18)} Back</button><span></span>
      <button type="button" class="btn btn-primary btn-lg" id="ex-cta" data-action="ex-next"></button></div>`;
  const figEl = $('#ex-fig', el);
  const ctx = { el: figEl, svg: () => $('svg', figEl), setFig: spec => { figEl.innerHTML = fig(spec, { counts: true }); }, setHTML: html => { figEl.innerHTML = html; } };
  const reveal = s => { if (s.show) $(s.show === 'n' ? '#ex-n' : '#ex-d', el).classList.remove('hide'); };
  const drawSteps = () => {
    $('#ex-steps', el).innerHTML = ex.steps.slice(0, l.exStep).map((s, i) => {
      const now = i === l.exStep - 1, pickUI = s.pick && now && !picked
        ? `<div class="ex-pick">${s.pick.map(v => `<button type="button" class="btn" data-action="ex-pick" data-v="${v}">${v}</button>`).join('')}</div><p class="note" id="ex-miss" style="margin-top:10px"></p>`
        : s.pick ? `<p style="margin-top:6px;font-weight:600">${s.why}</p>` : '';
      return `<li class="ex-step ${s.answer ? 'is-answer' : now ? 'is-now' : ''}"><span class="n">${s.answer ? icon('check', 16) : i + 1}</span><div>${s.t}${pickUI}</div></li>`;
    }).join('');
    const cta = $('#ex-cta', el), all = l.exStep >= ex.steps.length, cur = ex.steps[l.exStep - 1];
    cta.innerHTML = all ? (l.ex < EX.length - 1 ? `Next example ${icon('right')}` : `Start practising ${icon('right')}`) : l.exStep === 0 ? `Show the first step ${icon('right')}` : `Next step ${icon('right')}`;
    cta.disabled = busy || !!(cur && cur.pick && !picked);
  };
  (async () => {   // rebuild the picture for the steps already seen
    const v = $('.viz', el); v.classList.add('no-anim');
    for (let i = 0; i < l.exStep; i++) { const s = ex.steps[i]; if (s.run) await s.run(ctx, true, alive); if (!s.pick || picked) reveal(s); }
    requestAnimationFrame(() => requestAnimationFrame(() => v.classList.remove('no-anim')));
  })();
  drawSteps();
  stageActs['ex-next'] = async () => {
    if (busy) return;
    if (l.exStep >= ex.steps.length) {
      if (l.ex < EX.length - 1) { l.ex++; l.exStep = 0; save(); renderStage(true); } else setStage(3);
      return;
    }
    const s = ex.steps[l.exStep];
    l.exStep++;
    if (l.exStep >= ex.steps.length && !l.exDone.includes(l.ex)) l.exDone.push(l.ex);
    save(); busy = true; drawSteps();
    try { if (!s.pick) reveal(s); if (s.run) await s.run(ctx, false, alive); } finally { if (alive()) { busy = false; drawSteps(); } }
  };
  stageActs['ex-pick'] = b => {
    const s = ex.steps[l.exStep - 1];
    if (!s || !s.pick) return;
    if (+b.dataset.v === s.right) { picked = true; reveal(s); drawSteps(); }
    else { b.disabled = true; const m = $('#ex-miss', el); if (m) m.textContent = s.miss; }
  };
  stageActs['ex-tab'] = b => { l.ex = +b.dataset.i; l.exStep = 0; save(); renderStage(false); };
}

/* ---------- Questions: practice and the mastery check share one engine ----------
   Question types
     pick   choose one answer: opts are { f:[n,d] } | { t:'words' } | { n: number } | { fig } | { html, label }
            col lists the answers in one column; wide gives picture answers a full row each on a phone
     shade  colour parts of a fraction picture: fig, need
     place  tap a mark on a number line: n jumps (w for unequal), at = the right mark
     build  write a fraction with the number pad: ans [n, d]
     num    type a whole number with the number pad: ans, unit ('cm', 'm', ...)
   Any type can show a picture beside it: fig (a fraction picture) or view() (any drawing). */
const optHTML = o => o.f ? frac(o.f[0], o.f[1]) : o.fig ? fig(o.fig) : o.html ? o.html() : o.n != null ? `<span class="opt-n">${o.n}</span>` : esc(o.t);
const optLabel = o => o.f ? `${o.f[0]} over ${o.f[1]}` : o.fig ? figLabel(o.fig) : o.html ? o.label : o.n != null ? String(o.n) : o.t;
const ring = (v, max, col = 'var(--good)') => { const c = 2 * Math.PI * 62; return `<svg viewBox="0 0 148 148" width="148" height="148" aria-hidden="true"><circle cx="74" cy="74" r="62" style="fill:none;stroke:var(--surface-2);stroke-width:13"/><circle cx="74" cy="74" r="62" style="fill:none;stroke:${col};stroke-width:13;stroke-linecap:round;stroke-dasharray:${f1(c * v / max)} ${f1(c)}"/></svg>`; };

function renderQ(el, l, mode) {
  const def = D(), pr = mode === 'pr', set = pr ? def.practice : def.mastery, st = l[mode];
  if (st.i >= set.length) return pr ? practiceSummary(el, l) : masteryResult(el, l);
  if (!pr && !st.begun) return masteryIntro(el, l);
  const q = set[st.i], A = { sel: null, on: [], at: null, top: '', bot: '', slot: 'top', val: '', tries: 0, hints: 0, done: false };
  const pips = set.map((_, i) => { const r = pr ? st.log[i] : st.ans[i]; return `<i class="${i === st.i ? 'cur' : r ? ((pr ? r.first : r.ok) ? 'ok' : 'miss') : ''}"></i>`; }).join('');
  const figHTML = q.type === 'shade' ? fig(q.fig, { tap: true }) : q.type === 'place' ? nline({ n: q.n, w: q.w }, { tap: true }) : q.view ? q.view() : q.fig ? fig(q.fig) : '';
  let answer = '';
  if (q.type === 'pick') answer = `<div class="opts ${q.col ? 'col' : ''} ${q.wide ? 'wide' : ''}" role="group" aria-label="Answers">${q.opts.map((o, i) => `<button type="button" class="opt" data-action="q-opt" data-i="${i}" aria-pressed="false" aria-label="${esc(optLabel(o))}">${optHTML(o)}</button>`).join('')}</div>`;
  if (q.type === 'shade') answer = `<p class="q-help">${icon('tap', 18)} Tap the parts to colour them. Tap again to undo.</p>`;
  if (q.type === 'place') answer = `<p class="q-help">${icon('tap', 18)} Tap a mark on the line to put the dot there.</p>`;
  if (q.type === 'build') answer = `<div class="buildq"><div class="slots"><button type="button" class="slot-btn top" data-action="q-slot" data-s="top" aria-pressed="true" aria-label="Top number"></button><span class="line"></span><button type="button" class="slot-btn bot" data-action="q-slot" data-s="bot" aria-pressed="false" aria-label="Bottom number"></button></div>
    <div class="pad" role="group" aria-label="Number pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `<button type="button" data-action="q-pad" data-n="${n}">${n}</button>`).join('')}</div></div>`;
  if (q.type === 'num') answer = `<div class="numq"><div class="num-show"><span class="num-box" id="num-box" aria-live="polite"></span>${q.unit ? `<span class="num-unit">${q.unit}</span>` : ''}</div>
    <div class="pad pad-num" role="group" aria-label="Number pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-action="q-digit" data-n="${n}">${n}</button>`).join('')}<button type="button" data-action="q-digit" data-n="del" aria-label="Delete">${icon('left', 20)}</button><button type="button" data-action="q-digit" data-n="0">0</button><button type="button" data-action="q-digit" data-n="clr" aria-label="Clear">${icon('x', 20)}</button></div></div>`;
  const askFast = pr && st.i === 3 && !st.fastAsked && st.log.slice(0, 3).every(r => r && r.first && !r.hints);
  el.innerHTML = `<div class="q">
    <div class="q-top"><span class="q-count">${pr ? 'Step 4 of 5 · Practise' : 'Step 5 of 5 · Mastery check'} · Question ${st.i + 1} of ${set.length}</span><div class="pips" aria-hidden="true">${pips}</div>${listenBtn()}</div>
    ${askFast ? `<div class="fast">${icon('spark', 20)}<span><b>Three in a row!</b> Want to jump ahead to the trickier questions?</span><button type="button" class="btn btn-sm" data-action="q-fast">${icon('skip', 18)} Jump ahead</button></div>` : ''}
    <div class="q-body ${figHTML ? '' : 'solo'}">
      ${figHTML ? `<div class="q-fig" id="q-fig">${figHTML}</div>` : ''}
      <div class="q-side"><h1 class="q-prompt">${q.prompt}</h1>${answer}<div id="q-fb" aria-live="polite"></div></div>
    </div>
    <div class="q-foot">${pr ? `<button type="button" class="btn btn-quiet" data-action="q-hint">${icon('bulb', 18)} Hint</button>` : `<span class="q-help">${icon('info', 18)} No hints in the check. Take your time.</span>`}
      <button type="button" class="btn btn-primary btn-lg" data-action="q-check" id="q-check" disabled>Check</button></div></div>`;
  const check = $('#q-check', el), fbEl = $('#q-fb', el), figSvg = $('#q-fig svg', el);
  const ready = () => q.type === 'pick' ? A.sel !== null : q.type === 'shade' ? true : q.type === 'place' ? A.at !== null : q.type === 'num' ? A.val !== '' : (A.top !== '' && A.bot !== '');
  const sync = () => { if (!A.done) check.disabled = !ready(); };
  const fb = (kind, title, text, extra = '') => {
    fbEl.innerHTML = `<div class="fb fb-${kind}"><span class="fb-ico">${icon({ good: 'check', oops: 'x', hint: 'bulb', info: 'eye' }[kind], 20)}</span><div><strong>${title}</strong><p>${text}</p>${extra}</div></div>`;
    fbEl.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
  };
  const isRight = () => q.type === 'pick' ? A.sel === q.ans : q.type === 'shade' ? A.on.length === q.need : q.type === 'place' ? A.at === q.at : q.type === 'num' ? +A.val === q.ans : (+A.top === q.ans[0] && +A.bot === q.ans[1]);
  const wrongMsg = () => q.type === 'pick' ? (q.wrong && q.wrong[A.sel]) : q.type === 'shade' ? (q.wrongFn && q.wrongFn(A.on.length)) : q.type === 'place' ? (q.wrongFn && q.wrongFn(A.at)) : q.type === 'num' ? (q.wrongFn && q.wrongFn(+A.val)) : (q.wrongFn && q.wrongFn(+A.top, +A.bot));
  const slotDraw = () => $$('.slot-btn', el).forEach(b => { const s = b.dataset.s; b.textContent = A[s]; b.classList.toggle('filled', A[s] !== ''); b.setAttribute('aria-pressed', !A.done && A.slot === s); });
  const numDraw = () => { const b = $('#num-box', el); if (b) { b.textContent = A.val; b.classList.toggle('filled', A.val !== ''); } };
  const showAnswer = () => {
    if (q.type === 'pick') $$('.opt', el).forEach((o, i) => { if (i === q.ans) { o.classList.add('is-right'); o.insertAdjacentHTML('beforeend', `<span class="tag">${icon('check', 16)}</span>`); } });
    if (q.type === 'shade') $$('#q-fig .part', el).forEach((p, i) => p.classList.toggle('on', i < q.need));
    if (q.type === 'place') setLineMark(figSvg, q.at);
    if (q.type === 'build') { A.top = q.ans[0]; A.bot = q.ans[1]; slotDraw(); }
    if (q.type === 'num') { A.val = String(q.ans); numDraw(); }
  };
  const finish = ok => {
    A.done = true;
    $('.q', el).classList.add('locked');
    if (figSvg) figSvg.style.pointerEvents = 'none';
    if (pr) st.log[st.i] = { ok, first: ok && A.tries === 0, tries: A.tries, hints: A.hints, skill: q.skill };
    else st.ans[st.i] = { ok, skill: q.skill };
    save();
    check.disabled = false;
    check.innerHTML = `${st.i === set.length - 1 ? 'See how I did' : 'Next question'} ${icon('right')}`;
    const pip = $$('.pips i', el)[st.i]; if (pip) pip.className = (pr ? ok && A.tries === 0 : ok) ? 'ok' : 'miss';
    $$('.slot-btn', el).forEach(b => b.setAttribute('aria-pressed', 'false'));
    const hb = $('[data-action=q-hint]', el); if (hb) hb.style.visibility = 'hidden';
    check.focus({ preventScroll: true });
  };
  if (q.type === 'shade') tapFig(figSvg, on => { A.on = on; sync(); });
  if (q.type === 'place') tapLine(figSvg, k => { A.at = k; sync(); });
  if (q.type === 'build') slotDraw();
  sync();
  if (S.read) Voice.say(q.say || strip(q.prompt));

  stageActs['q-opt'] = b => { if (A.done) return; A.sel = +b.dataset.i; $$('.opt', el).forEach(o => o.setAttribute('aria-pressed', o === b)); sync(); };
  stageActs['q-slot'] = b => { if (A.done) return; A.slot = b.dataset.s; slotDraw(); };
  stageActs['q-pad'] = b => { if (A.done) return; A[A.slot] = +b.dataset.n; if (A.slot === 'top' && A.bot === '') A.slot = 'bot'; slotDraw(); sync(); };
  stageActs['q-digit'] = b => {
    if (A.done) return;
    const n = b.dataset.n;
    if (n === 'del') A.val = A.val.slice(0, -1); else if (n === 'clr') A.val = ''; else if (A.val.length < 3) A.val = (A.val === '0' ? '' : A.val) + n;
    numDraw(); sync();
  };
  stageActs['q-hint'] = () => { if (A.done || !q.hints) return; const h = q.hints[Math.min(A.hints, q.hints.length - 1)]; A.hints++; fb('hint', A.hints === 1 ? 'Hint' : 'Another hint', h); };
  stageActs['q-check'] = () => {
    if (A.done) { st.i++; save(); return renderStage(true); }
    const ok = isRight();
    if (!pr) { finish(ok); return fb(ok ? 'good' : 'oops', ok ? 'Correct' : 'Not this time', ok ? 'Answer saved.' : 'Answer saved. You can see how to do it at the end.'); }
    if (ok) {
      const sel = $(`.opt[data-i="${A.sel}"]`, el); if (sel) { sel.classList.add('is-right'); sel.insertAdjacentHTML('beforeend', `<span class="tag">${icon('check', 16)}</span>`); }
      finish(true);
      return fb('good', ['Correct!', 'Yes, that is right!', 'Well done!', 'Spot on!'][st.i % 4], q.why);
    }
    A.tries++;
    if (A.tries >= 2) {
      const miss = q.type === 'pick' ? $(`.opt[data-i="${A.sel}"]`, el) : null;
      if (miss) { miss.classList.add('is-wrong', 'is-out'); miss.setAttribute('aria-pressed', 'false'); miss.insertAdjacentHTML('beforeend', `<span class="tag">${icon('x', 16)}</span>`); }
      showAnswer(); finish(false);
      return fb('info', 'Let us look at it together', q.why, q.whyView ? q.whyView() : q.whyFig ? fig(q.whyFig) : '');
    }
    const msg = wrongMsg() || (q.hints && q.hints[0]) || 'Have another look.';
    if (q.type === 'pick') { const sel = $(`.opt[data-i="${A.sel}"]`, el); if (sel) { sel.classList.add('is-wrong', 'is-out'); sel.setAttribute('aria-pressed', 'false'); sel.insertAdjacentHTML('beforeend', `<span class="tag">${icon('x', 16)}</span>`); } A.sel = null; }
    if (q.type === 'num') { A.val = ''; numDraw(); }
    fb('oops', 'Not quite. Try again', msg);
    sync();
  };
  stageActs['q-fast'] = () => { st.fastAsked = true; st.i = 5; save(); renderStage(true); };
  stageActs.listen = toggleListen;
}
function practiceSummary(el, l) {
  const SK = D().skills, done = l.pr.log.filter(Boolean), first = done.filter(r => r.first).length;
  const weak = [...new Set(done.filter(r => !r.first).map(r => SK[r.skill]))];
  const title = first === done.length ? 'Every one right first time!' : first >= done.length * 0.6 ? 'Good work!' : 'You kept going. Well done!';
  el.innerHTML = `<div class="summary"><div class="summary-in">
    <p class="eyebrow">Step 4 of 5 · Practise</p>
    <div class="score-ring">${ring(first, done.length || 1, 'var(--blue)')}<span class="v"><span>${first}<small>/${done.length}</small></span></span></div>
    <h1>${title}</h1>
    <p class="say">${first} of ${done.length} right at the first try.${weak.length ? ` Have one more look at ${weak.join(' and ')}.` : ' You are ready for the mastery check.'}</p>
    <div class="cta-row" style="justify-content:center;margin-top:6px"><button type="button" class="btn btn-quiet" data-action="pr-again">${icon('replay', 18)} Practise again</button>
      <button type="button" class="btn btn-primary btn-lg" data-action="stage" data-i="4">Take the mastery check ${icon('right')}</button></div>
  </div></div>`;
  stageActs['pr-again'] = () => { l.pr = { i: 0, log: [], fastAsked: true }; save(); renderStage(true); };
}
function masteryIntro(el, l) {
  const n = D().mastery.length;
  el.innerHTML = `<div class="summary"><div class="summary-in">
    <div class="badge" style="background:var(--blue-soft);color:var(--blue-deep)">${icon('medal', 64)}</div>
    <p class="eyebrow">Step 5 of 5 · Mastery check</p>
    <h1>Show what you know</h1>
    <p class="say">${n} questions on your own, with no hints. Get <b>${n - 1} or more</b> right to master this lesson.</p>
    <div class="cta-row" style="justify-content:center;margin-top:6px"><button type="button" class="btn btn-quiet" data-action="stage" data-i="3">${icon('left', 18)} More practice first</button>
      <button type="button" class="btn btn-primary btn-lg" data-action="ma-begin">Start the check ${icon('right')}</button></div>
  </div></div>`;
  stageActs['ma-begin'] = () => { l.ma.begun = true; save(); renderStage(true); };
}
function masteryResult(el, l) {
  const def = D(), MA = def.mastery, ans = l.ma.ans, score = ans.filter(a => a && a.ok).length, pass = score >= MA.length - 1;
  if (!l.ma.done) { l.ma.done = true; l.ma.score = score; if (pass) l.complete = true; save(); renderStepper(); }
  el.innerHTML = `<div class="summary"><div class="summary-in">
    <p class="eyebrow">Mastery check · Result</p>
    <div class="score-ring">${ring(score, MA.length, pass ? 'var(--good)' : 'var(--amber)')}<span class="v"><span>${score}<small>/${MA.length}</small></span></span></div>
    <h1>${pass ? 'You have mastered it!' : 'Nearly there'}</h1>
    <p class="say">${pass ? def.passSay : `You need ${MA.length - 1} out of ${MA.length}. Look at the notes below, then have another go.`}</p>
    <ul class="review">${MA.map((q, i) => { const a = ans[i] || {}; return `<li class="${a.ok ? 'ok' : 'no'}"><span class="r-ico">${icon(a.ok ? 'check' : 'x', 14)}</span><div><b>${cap(def.skills[q.skill])}</b><span>${q.why}</span></div></li>`; }).join('')}</ul>
    <div class="cta-row" style="justify-content:center;margin-top:6px">${pass
      ? `<button type="button" class="btn btn-good btn-lg" data-action="stage" data-i="5">Finish the lesson ${icon('right')}</button>`
      : `<button type="button" class="btn btn-quiet" data-action="to-teacher">${icon('play', 18)} Watch teacher</button><button type="button" class="btn" data-action="stage" data-i="3">Back to practice</button><button type="button" class="btn btn-primary btn-lg" data-action="ma-again">Try the check again ${icon('replay', 18)}</button>`}</div>
  </div></div>`;
  stageActs['ma-again'] = () => { l.ma = { i: 0, ans: [], done: false, score: 0, begun: true }; save(); renderStage(true); };
}
function renderDone(el, l) {
  const def = D(), topic = topicById(def.topic), nextId = nextLessonId(def.id), next = nextId && LESSON_DEFS[nextId];
  const upcoming = LESSONS[def.topic].flat()[def.n];      // the next lesson's name, built or not
  const cols = ['var(--blue)', 'var(--rose)', '#F4A720', 'var(--teal)'];
  const kites = REDUCED ? '' : Array.from({ length: 22 }, (_, i) => `<i style="left:${(i * 37 + 11) % 97}%;background:${cols[i % 4]};animation-delay:${(i % 7) * 0.13}s;--rot:${(i % 2 ? 1 : -1) * (30 + (i * 13) % 50)}deg"></i>`).join('');
  el.innerHTML = `<div class="summary" style="position:relative"><div class="done-kites" aria-hidden="true">${kites}</div><div class="summary-in" style="position:relative">
    <div class="badge">${kite()}</div>
    <p class="eyebrow">Lesson complete · ${def.title}</p>
    <h1>Mastered!</h1>
    <p class="say">You scored ${l.ma.score} out of ${def.mastery.length} and earned 30 stars.</p>
    <ul class="can-do">${def.canDo.map(c => `<li>${icon('check', 20)} ${c}</li>`).join('')}</ul>
    <div class="cta-row" style="justify-content:center;margin-top:6px">${next
      ? `<a class="btn btn-quiet" href="#topic-${def.topic}">Back to ${topic.name}</a><a class="btn btn-primary btn-lg" href="#lesson-${next.id}">Next: ${next.title} ${icon('right')}</a>`
      : `<a class="btn btn-quiet" href="#subjects">${icon('home', 18)} Home</a><a class="btn btn-primary btn-lg" href="#topic-${def.topic}">Back to ${topic.name} ${icon('right')}</a>`}</div>
    ${next || !upcoming ? '' : `<p class="note" style="max-width:none">Next lesson: ${upcoming} (coming in the next phase)</p>`}
  </div></div>`;
}

/* ---------- lesson shell ---------- */
function renderStepper() {
  const l = L(), el = $('#stepper');
  if (!el) return;
  el.innerHTML = STAGES.map((s, i) => {
    const done = l.complete || i < l.stage, cur = i === l.stage;
    return `<li><button type="button" class="step ${done && !cur ? 'is-done' : ''} ${cur ? 'is-current' : ''}" data-action="stage" data-i="${i}" ${cur ? 'aria-current="step"' : ''} aria-label="Step ${i + 1}: ${s.label}${done ? ', done' : ''}">
      <span class="step-dot">${done && !cur ? icon('check', 16) : i + 1}</span><span class="step-label">${s.label}</span></button></li>`;
  }).join('');
}
function renderStage(scroll) {
  stageToken++; stageActs = {}; learnBusy = false; Voice.stop();
  const l = L(), el = $('#stage');
  if (!el) return;
  if (l.stage === 5 && !l.complete) l.stage = 4;
  renderStepper();
  if (l.stage === 0) renderLearn(el, l);
  else if (l.stage === 1) renderExplore(el, l);
  else if (l.stage === 2) renderExamples(el, l);
  else if (l.stage === 3) renderQ(el, l, 'pr');
  else if (l.stage === 4) renderQ(el, l, 'ma');
  else renderDone(el, l);
  if (scroll) {
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.5) el.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' });
  }
}
function setStage(i) {
  const l = L();
  l.stage = clamp(i, 0, 5);
  save(); renderStage(true);
}
function Lesson(id) {
  const def = LESSON_DEFS[id] || LESSON_DEFS[currentLessonId()];
  LID = def.id;
  const l = L(), topic = topicById(def.topic);
  if (!l.started) { l.started = true; save(); }
  const html = `<div class="view lesson">
    <header class="lesson-bar"><div class="wrap lesson-bar-in">
      <a class="icon-btn" href="#topic-${def.topic}" aria-label="Back to the ${topic.name} topic">${icon('left')}</a>
      <div class="lesson-name"><span>${topic.name} · Lesson ${def.n}</span><strong>${def.title}</strong></div>
      <ol class="stepper" id="stepper" aria-label="Lesson steps"></ol>
      <button type="button" class="btn btn-soft btn-sm to-teacher" data-action="to-teacher" aria-label="Watch teacher explain">${icon('play', 18)}<span>Watch teacher</span></button>
    </div></header>
    <main class="wrap lesson-main">
      <section class="stage-card" id="stage"></section>
      <section class="teacher" id="teacher" aria-labelledby="teacher-h">
        <div class="teacher-head"><div><p class="eyebrow">Watch teacher explain</p><h2 id="teacher-h">See it written out, step by step</h2>
          <p class="sub">Your teacher draws and writes every step on squared paper. Pause, replay or slow it down whenever you like.</p></div></div>
        <div id="teacher-player"></div>
      </section>
    </main></div>`;
  return {
    html,
    mount(root) { renderStage(false); Teacher.mount($('#teacher-player', root), def.teacher, l); },
    unmount() { stageToken++; stageActs = {}; Teacher.unmount(); Voice.stop(); },
  };
}
