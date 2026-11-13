/* =====================================================================
   The lesson: Understanding Fractions
   Learn -> Explore -> Examples -> Practise -> Mastery check -> Done
   ===================================================================== */
let stageToken = 0;      // bumps on every stage render so running animations can stop
let stageActs = {};      // click handlers that belong to the stage on screen
let learnBusy = false;

/* ---------- interactive fraction lab (also used on the homepage) ---------- */
function mountLab(root, o = {}) {
  const st = { shape: o.shape || 'pie', n: o.n || 4, on: new Set(o.on || []) };
  const compact = !!o.compact;
  root.innerHTML = `<div class="lab ${compact ? 'lab-compact' : ''}">
    <div class="lab-shape"></div>
    <div class="lab-side">
      <div class="lab-read" aria-live="polite"></div>
      <div class="lab-ctrl">
        <div class="stepper-ctl"><button type="button" data-d="-1" aria-label="Fewer parts">${icon('minus')}</button><output></output><button type="button" data-d="1" aria-label="More parts">${icon('plus')}</button></div>
        ${compact ? '' : `<div class="shape-toggle" role="group" aria-label="Shape"><button type="button" data-shape="pie">Circle</button><button type="button" data-shape="bar">Bar</button></div>`}
      </div>
      ${compact ? '' : `<p class="q-help">${icon('tap', 18)} Tap a part to colour it. Tap again to undo.</p>`}
    </div></div>`;
  const shapeEl = $('.lab-shape', root), readEl = $('.lab-read', root), out = $('output', root);
  const get = () => ({ shape: st.shape, n: st.n, on: [...st.on], k: st.on.size });
  const changed = () => { o.onChange && o.onChange(get()); };
  function read() {
    const k = st.on.size, whole = k === st.n && st.n > 1;
    readEl.innerHTML = `${frac(k, st.n)}<div class="lab-words"><b>${cap(fracWords(k, st.n))}${whole ? ' = 1 whole' : ''}</b><span>${k} of ${st.n} equal part${st.n === 1 ? '' : 's'} coloured</span></div>`;
    out.innerHTML = `<b>${st.n}</b>equal part${st.n === 1 ? '' : 's'}`;
    $$('.stepper-ctl button', root).forEach(b => { b.disabled = (b.dataset.d === '-1' && st.n <= 1) || (b.dataset.d === '1' && st.n >= 12); });
    $$('.shape-toggle button', root).forEach(b => b.setAttribute('aria-pressed', b.dataset.shape === st.shape));
  }
  function draw() {
    shapeEl.innerHTML = fig({ t: st.shape, n: st.n, on: [...st.on] }, { tap: true, label: 'Tap a part to colour it' });
    tapFig($('svg', shapeEl), on => { st.on = new Set(on); read(); changed(); });
    read();
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-d]'), s = e.target.closest('[data-shape]');
    if (b) { const k = st.on.size; st.n = clamp(st.n + +b.dataset.d, 1, 12); st.on = new Set(Array.from({ length: Math.min(k, st.n) }, (_, i) => i)); draw(); changed(); }
    if (s) { st.shape = s.dataset.shape; draw(); changed(); }
  });
  draw();
  return { get };
}

/* ---------- drawings for the Learn story ---------- */
function friend(x, y, name, c, mood = 'happy') {
  const mouth = mood === 'sad' ? 'M-9,12Q0,4 9,12' : 'M-9,6Q0,15 9,6';
  return `<g transform="translate(${x},${y})"><circle class="face" r="27" style="fill:var(--${c}-soft);stroke:var(--${c})"/><circle class="eye" cx="-9" cy="-5" r="2.8"/><circle class="eye" cx="9" cy="-5" r="2.8"/><path class="mouth" d="${mouth}"/><text class="nm" y="48">${name}</text></g>`;
}
const PEPS = [22, 68, 112, 158, 202, 248, 292, 338].map((deg, i) => ({ a: deg * Math.PI / 180, r: i % 2 ? 0.66 : 0.42 }));
function pizzaBase(cx, cy, r) {
  const peps = PEPS.map(p => { const [px, py] = polar(cx, cy, r * p.r, p.a); return `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r * 0.095)}" style="fill:var(--pep);stroke:var(--pep-2);stroke-width:1.5"/>`; }).join('');
  return `<g class="pz-base"><circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--cheese)"/><circle cx="${cx}" cy="${cy}" r="${r - 5.5}" style="fill:none;stroke:var(--crust);stroke-width:11"/>${peps}</g>`;
}
function pizza(cx, cy, r, parts, push) {
  let out = '';
  for (let i = 0; i < parts; i++) {
    const a0 = -Math.PI / 2 + i * TAU / parts, a1 = a0 + TAU / parts, m = (a0 + a1) / 2, rr = r - 5.5;
    const [x0, y0] = polar(cx, cy, rr, a0), [x1, y1] = polar(cx, cy, rr, a1);
    const peps = PEPS.filter(p => (((p.a - a0) % TAU) + TAU) % TAU < TAU / parts)
      .map(p => { const [px, py] = polar(cx, cy, r * p.r, p.a); return `<circle class="pep" cx="${f1(px)}" cy="${f1(py)}" r="${f1(r * 0.095)}"/>`; }).join('');
    out += `<g class="slice" style="--dx:${f1(Math.cos(m) * push)}px;--dy:${f1(Math.sin(m) * push)}px"><path class="cheese" d="${sector(cx, cy, r, a0, a1)}"/><path class="crust" d="M${f1(x0)},${f1(y0)}A${rr},${rr} 0 0 1 ${f1(x1)},${f1(y1)}"/>${peps}</g>`;
  }
  return out;
}
function scenePizza(parts) {
  const two = parts === 2, cx = 240, cy = two ? 172 : 180, r = two ? 102 : 94, push = two ? 32 : 26;
  const four = [['Zara', 'rose', 400, 62], ['Leo', 'teal', 400, 288], ['Sam', 'amber', 80, 288], ['Maya', 'blue', 80, 62]];
  const friends = two ? friend(50, cy, 'Maya', 'blue') + friend(430, cy, 'Leo', 'teal') : four.map(f => friend(f[2], f[3], f[0], f[1])).join('');
  const cuts = (two ? [[cx, cy - r - 20, cx, cy + r + 20]] : [[cx, cy - r - 18, cx, cy + r + 18], [cx - r - 18, cy, cx + r + 18, cy]])
    .map(c => `<line class="cut-line" pathLength="1" x1="${c[0]}" y1="${c[1]}" x2="${c[2]}" y2="${c[3]}"/>`).join('');
  let labels = '';
  for (let i = 0; i < parts; i++) {
    const m = -Math.PI / 2 + (i + 0.5) * TAU / parts, [lx, ly] = polar(cx, cy, r * (two ? 0.48 : 0.56) + push, m);
    labels += `<g class="pop"><circle cx="${f1(lx)}" cy="${f1(ly)}" r="${two ? 30 : 25}" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>${svgFrac(f1(lx), f1(ly - 2), 1, parts, two ? 24 : 20)}</g>`;
  }
  return `<svg class="scene" viewBox="0 0 480 360" role="img" aria-label="One pizza shared between ${parts} friends">${friends}${pizzaBase(cx, cy, r)}<g class="pz-slices">${pizza(cx, cy, r, parts, push)}</g>${cuts}<g>${labels}</g></svg>`;
}
async function cutPizza(viz, instant, alive, ms) {
  viz.classList.add('is-cutting');
  if (!instant) { await sleep(REDUCED ? 80 : ms); if (!alive()) return; }
  viz.classList.add('is-cut');
  if (!instant) await sleep(REDUCED ? 80 : 800);
}
function sceneBars() {
  let out = '';
  [1, 2, 4, 8].forEach((n, r) => {
    const y = 26 + r * 84, w = 356 / n;
    let parts = '';
    for (let i = 0; i < n; i++) parts += `<rect x="${f1(104 + i * w + 2)}" y="${y}" width="${f1(w - 4)}" height="56" rx="8" style="fill:${i === 0 ? 'var(--orange)' : 'var(--surface)'};stroke:var(--ink);stroke-width:2.5"/>`;
    const lab = n === 1 ? `<text x="52" y="${y + 39}" style="font:800 30px var(--font-display);fill:var(--ink);text-anchor:middle">1</text>` : svgFrac(52, y + 24, 1, n, 26);
    out += `<g class="${r ? 'rise' : ''}">${lab}${parts}</g>`;
  });
  return `<svg class="scene" viewBox="0 0 480 360" role="img" aria-label="The same bar cut into 1, 2, 4 and 8 equal parts. One part is coloured each time and it gets smaller.">${out}</svg>`;
}
function sceneUnfair() {
  const cx = 240, cy = 170, r = 104, cutX = cx + 42;
  const whole = `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--cheese)"/><circle cx="${cx}" cy="${cy}" r="${r - 5.5}" style="fill:none;stroke:var(--crust);stroke-width:11"/>`
    + PEPS.map(p => { const [px, py] = polar(cx, cy, r * p.r, p.a); return `<circle class="pep" cx="${f1(px)}" cy="${f1(py)}" r="${f1(r * 0.095)}" style="fill:var(--pep);stroke:var(--pep-2);stroke-width:1.5"/>`; }).join('');
  return `<svg class="scene" viewBox="0 0 480 360" role="img" aria-label="A pizza cut into one big piece and one small piece">
    <defs><clipPath id="uf-l"><rect x="0" y="0" width="${cutX}" height="360"/></clipPath><clipPath id="uf-r"><rect x="${cutX}" y="0" width="${480 - cutX}" height="360"/></clipPath></defs>
    ${friend(50, cy, 'Maya', 'blue')}${friend(432, cy, 'Leo', 'teal', 'sad')}
    <g transform="translate(-14,0)"><g clip-path="url(#uf-l)">${whole}</g><path d="M${cutX} ${f1(cy - Math.sqrt(r * r - 42 * 42))}V${f1(cy + Math.sqrt(r * r - 42 * 42))}" style="stroke:var(--crust-2);stroke-width:2"/></g>
    <g transform="translate(14,0)"><g clip-path="url(#uf-r)">${whole}</g><path d="M${cutX} ${f1(cy - Math.sqrt(r * r - 42 * 42))}V${f1(cy + Math.sqrt(r * r - 42 * 42))}" style="stroke:var(--crust-2);stroke-width:2"/></g>
  </svg>`;
}
function sceneNumbers() {
  const n = 5, x0 = 40, w = 80, y = 58, h = 74;
  let parts = '', cnts = '';
  for (let i = 0; i < n; i++) {
    parts += `<rect class="part${i < 2 ? ' on' : ''}" data-i="${i}" x="${x0 + i * w + 3}" y="${y}" width="${w - 6}" height="${h}" rx="10"/>`;
    cnts += `<text class="cnt" data-c="${i}" x="${x0 + i * w + w / 2}" y="${y - 22}">${i + 1}</text>`;
  }
  return `<svg class="scene fig" viewBox="0 0 480 360" role="img" aria-label="A bar split into 5 equal parts with 2 coloured. The fraction two fifths is built underneath.">
    ${parts}${cnts}
    <rect class="slot" x="112" y="166" width="76" height="66" rx="14"/><rect class="slot" x="112" y="256" width="76" height="66" rx="14"/>
    <rect x="104" y="240" width="92" height="7" rx="3.5" style="fill:var(--ink)"/>
    <text class="pop n-top" x="150" y="218" style="font:800 54px var(--font-display);fill:var(--orange-ink);text-anchor:middle">2</text>
    <text class="pop n-bot" x="150" y="308" style="font:800 54px var(--font-display);fill:var(--blue);text-anchor:middle">5</text>
    <g class="rise labels">
      <path d="M198 199h20M198 289h20" style="stroke:var(--line-2);stroke-width:2.5;stroke-linecap:round"/>
      <text x="228" y="196" style="font:700 21px var(--font-body);fill:var(--orange-ink)">top number</text>
      <text x="228" y="218" style="font:500 15px var(--font-body);fill:var(--ink-2)">the parts we are counting</text>
      <text x="228" y="286" style="font:700 21px var(--font-body);fill:var(--blue)">bottom number</text>
      <text x="228" y="308" style="font:500 15px var(--font-body);fill:var(--ink-2)">all the equal parts</text>
    </g></svg>`;
}
const ART = {
  clock() {
    const ticks = Array.from({ length: 12 }, (_, i) => { const a = i * TAU / 12, p = polar(60, 60, i % 3 ? 44 : 40, a), q = polar(60, 60, 47, a); return `M${f1(p[0])},${f1(p[1])}L${f1(q[0])},${f1(q[1])}`; }).join('');
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" style="fill:var(--surface);stroke:var(--ink);stroke-width:3"/><path d="${sector(60, 60, 47, -Math.PI / 2, 0)}" style="fill:var(--orange)"/><path d="${ticks}" style="stroke:var(--ink);stroke-width:2.5;stroke-linecap:round"/><path d="M60 60H97M60 60l19 15" style="stroke:var(--ink);stroke-width:4;stroke-linecap:round"/><circle cx="60" cy="60" r="4.5" style="fill:var(--ink)"/></svg>`;
  },
  glass() {
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M34 16h52l-8 88H42z" style="fill:var(--surface)"/><path d="M38 61h44l-4 43H42z" style="fill:var(--orange)"/><path d="M34 16h52l-8 88H42z" style="fill:none;stroke:var(--ink);stroke-width:3;stroke-linejoin:round"/><path d="M92 61h12" style="stroke:var(--ink);stroke-width:2.5;stroke-linecap:round"/></svg>`;
  },
  sandwich() {
    const tri = (pts, eaten) => `<path d="M${pts}Z" style="fill:${eaten ? 'none' : 'var(--cheese)'};stroke:${eaten ? 'var(--line-2)' : 'var(--crust-2)'};stroke-width:3;stroke-linejoin:round${eaten ? ';stroke-dasharray:5 6' : ''}"/>`;
    return `<svg viewBox="0 0 120 120" aria-hidden="true">${tri('18,12 102,12 60,54')}${tri('108,18 108,102 66,60')}${tri('102,108 18,108 60,66')}${tri('12,102 12,18 54,60', true)}</svg>`;
  },
  pizza() { return `<svg viewBox="0 0 120 120" aria-hidden="true" class="is-cut">${pizza(60, 60, 46, 4, 5)}</svg>`; },
};
const GLOSS = `<div class="gloss"><span class="g-top">Top number <small>is the numerator</small></span><span class="g-bot">Bottom number <small>is the denominator</small></span></div><p class="note">A way to remember: <b>d</b>enominator is <b>d</b>own at the bottom.</p>`;
const NAMES = [[1, 2], [1, 3], [1, 4], [3, 4], [2, 5], [5, 8]];

/* ---------- Learn: one small idea per press of the big button ---------- */
const LEARN = [
  { id: 'intro', title: 'Understanding Fractions', intro: true, beats: [{ cta: "Let's start" }] },
  { id: 'share', title: 'Sharing fairly', viz: () => scenePizza(2), beats: [
    { say: 'Maya and Leo want to share <b>one pizza</b>. Nobody wants the smaller piece!', cta: 'Cut the pizza', ico: 'cut' },
    { say: 'Now there are <b>2 equal parts</b>. Each friend gets the same amount. That is fair.', enter: (v, i, a) => cutPizza(v, i, a, 650) },
    { say: 'Each part is called <b>one half</b>. We write it like this:', speak: 'Each part is called one half. We write it like this: one, over two.', extra: () => `<div class="bigfrac">${frac(1, 2)}<span>one half</span></div>`, enter: v => { v.classList.add('is-named'); } },
  ] },
  { id: 'more', title: 'More friends, more parts', viz: () => scenePizza(4), beats: [
    { say: 'Now <b>4 friends</b> want to share one pizza fairly.', cta: 'Cut into 4', ico: 'cut' },
    { say: 'There are <b>4 equal parts</b>. Everyone gets the same amount.', enter: (v, i, a) => cutPizza(v, i, a, 1050) },
    { say: 'Each part is called <b>one quarter</b>. We write it like this:', speak: 'Each part is called one quarter. We write it like this: one, over four.', extra: () => `<div class="bigfrac">${frac(1, 4)}<span>one quarter</span></div>`, enter: v => { v.classList.add('is-named'); } },
  ] },
  { id: 'smaller', title: 'More parts, smaller parts', viz: sceneBars, beats: [
    { say: 'Here is one whole bar. What happens when we cut it into <b>more</b> equal parts?', cta: 'Show me', ico: 'eye' },
    { say: 'The more parts we cut, the <b>smaller</b> each part gets. One eighth is much smaller than one half.',
      enter: async (v, instant, alive) => { for (const g of $$('.rise', v)) { g.classList.add('show'); if (!instant) { await sleep(REDUCED ? 40 : 520); if (!alive()) return; } } } },
  ] },
  { id: 'fair', title: 'Is it fair?', viz: sceneUnfair, beats: [
    { say: 'Leo cuts the next pizza like this. Is it a <b>fair share</b>?', gate: l => l.fair !== null,
      extra: l => l.fair === null
        ? `<div class="choice-row"><button type="button" class="btn btn-lg" data-action="fair" data-v="yes">Fair</button><button type="button" class="btn btn-lg" data-action="fair" data-v="no">Not fair</button></div>`
        : l.fair === 'no' ? `<div class="verdict good">${icon('check', 20)}<span>You spotted it! One piece is much bigger than the other.</span></div>`
          : `<div class="verdict oops">${icon('eye', 20)}<span>Look again. Maya's piece is much bigger than Leo's.</span></div>` },
    { say: 'The parts are <b>not equal</b>, so they are not halves. Fractions only work with <b>equal parts</b>.',
      enter: v => { v.innerHTML = `<div class="pair"><div>${fig({ t: 'bar', n: 2, on: [0] })}<span class="mark good">${icon('check', 20)}</span>Equal parts</div><div>${fig({ t: 'bar', n: 2, on: [0], w: [0.72, 0.28] })}<span class="mark oops">${icon('x', 20)}</span>Not equal</div></div>`; } },
  ] },
  { id: 'numbers', title: 'The two numbers', viz: sceneNumbers, beats: [
    { say: 'This bar is split into <b>equal parts</b>. Some of them are coloured.', cta: 'Count all the parts', ico: 'count' },
    { say: `There are <span class="k-bot">5 equal parts</span> altogether. That is the <span class="k-bot">bottom number</span>.`, cta: 'Count the coloured parts', ico: 'count',
      enter: async (v, instant, alive) => { await countParts($('svg', v), [0, 1, 2, 3, 4], { instant, alive }); if (alive()) $('.n-bot', v).classList.add('show'); } },
    { say: `<span class="k-top">2 parts</span> are coloured. That is the <span class="k-top">top number</span>.`,
      enter: async (v, instant, alive) => { const s = $('svg', v); clearCounts(s); await countParts(s, [0, 1], { top: true, instant, alive }); if (alive()) $('.n-top', v).classList.add('show'); } },
    { say: 'We say <b>two fifths</b>: 2 out of 5 equal parts.', extra: () => GLOSS, enter: v => { clearCounts($('svg', v)); $('.labels', v).classList.add('show'); } },
  ] },
  { id: 'everywhere', title: 'Fractions are everywhere', beats: [
    { say: 'You already use fractions every day, at home and at school.',
      viz: () => `<div class="trio">
        <div class="trio-card">${ART.clock()}${frac(1, 4)}<b>Quarter past the hour</b></div>
        <div class="trio-card">${ART.glass()}${frac(1, 2)}<b>Half a glass of juice</b></div>
        <div class="trio-card">${ART.sandwich()}${frac(3, 4)}<b>Three quarters of a sandwich</b></div></div>` },
  ] },
  { id: 'names', title: 'Say it out loud', beats: [
    { say: Voice.ok ? 'Tap a card to hear how we say each fraction.' : 'Read each fraction out loud.', cta: 'Go to Explore',
      viz: () => `<div class="names">${NAMES.map(([n, d], i) => `<button type="button" class="name-card" data-action="say-name" data-i="${i}">${fig({ t: 'pie', n: d, on: Array.from({ length: n }, (_, k) => k) })}${frac(n, d)}<b>${fracWords(n, d)}</b></button>`).join('')}</div>` },
  ] },
];

function introHTML() {
  return `<div class="intro">
    <div class="intro-main">
      <p class="say">A fraction is a way to talk about <b>part of something</b>. By the end of this lesson you will be able to:</p>
      <ul class="goals">
        <li><span class="g-ico">${icon('cut', 18)}</span>Split a whole into equal parts</li>
        <li><span class="g-ico">${icon('pencil', 18)}</span>Read and write a fraction</li>
        <li><span class="g-ico">${icon('bulb', 18)}</span>Say what the top and bottom numbers mean</li>
      </ul>
      <div class="meta-row"><span class="chip">${icon('clock', 14)} About 15 minutes</span><span class="chip">Foundation</span><span class="chip">${icon('play', 14)} Teacher video below</span></div>
    </div>
    <div class="intro-side">
      <p class="eyebrow">Why it matters</p>
      <p class="note" style="max-width:none;font-size:1.0625rem;color:var(--ink)">You use fractions whenever you share, tell the time or measure.</p>
      <div class="why"><div class="why-card">${ART.pizza()}Sharing food</div><div class="why-card">${ART.clock()}Telling the time</div><div class="why-card">${ART.glass()}Measuring</div></div>
    </div></div>`;
}
const listenBtn = () => Voice.ok ? `<button type="button" class="listen ${S.read ? 'is-on' : ''}" data-action="listen" aria-pressed="${!!S.read}">${icon(S.read ? 'sound' : 'mute', 18)} Read to me</button>` : '';

function renderLearn(el, l) {
  l.slide = clamp(l.slide, 0, LEARN.length - 1);
  const sl = LEARN[l.slide];
  l.beat = clamp(l.beat, 0, sl.beats.length - 1);
  const b0 = sl.beats[0];
  const body = sl.intro ? introHTML()
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
    if (S.read) Voice.say(sl.intro ? 'A fraction is a way to talk about part of something. Press the blue button to start.' : (b.speak || strip(b.say)));
  };
  const setCta = busy => {
    const b = sl.beats[l.beat], cta = $('#learn-cta', el);
    if (!cta) return;
    const last = l.beat === sl.beats.length - 1;
    cta.innerHTML = `${b.ico ? icon(b.ico, 20) : ''}${b.cta || (last && l.slide === LEARN.length - 1 ? 'Go to Explore' : 'Next')}${b.ico ? '' : icon('right')}`;
    cta.disabled = !!busy || !!(b.gate && !b.gate(l));
    cta.classList.toggle('nudge', !!b.ico && !busy);
  };
  if (viz && l.beat > 0) {
    viz.classList.add('no-anim');
    (async () => {
      for (let i = 1; i <= l.beat; i++) if (sl.beats[i].enter) await sl.beats[i].enter(viz, true, alive);
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
      try { if (b.enter) await b.enter(viz, false, alive); } finally { if (alive()) { learnBusy = false; setCta(false); } }
    } else if (l.slide < LEARN.length - 1) { l.slide++; l.beat = 0; save(); renderStage(true); }
    else setStage(1);
  };
  stageActs['learn-back'] = () => {
    if (l.beat > 0) l.beat--;
    else if (l.slide > 0) { l.slide--; l.beat = LEARN[l.slide].beats.length - 1; }
    save(); renderStage(true);
  };
  stageActs.listen = () => { S.read = !S.read; save(); if (!S.read) Voice.stop(); renderStage(false); };
  stageActs.fair = b => { l.fair = b.dataset.v; save(); setTalk(false); setCta(false); };
  stageActs['say-name'] = b => { const [n, d] = NAMES[+b.dataset.i]; b.classList.add('heard'); Voice.say(fracWords(n, d), { rate: 0.85 }); };
}

/* ---------- Explore ---------- */
const MISSIONS = [
  { t: 'Colour <b>one half</b> of the shape', ok: s => s.n > 1 && s.k * 2 === s.n, win: s => s.n === 2 ? '1 of 2 equal parts is one half.' : `${s.k} of ${s.n} parts is the same amount as one half.` },
  { t: 'Make <b>three quarters</b>', ok: s => s.k * 4 === s.n * 3 && s.n > 1, win: s => s.n === 4 ? '3 of 4 equal parts. Three quarters!' : `${s.k} of ${s.n} is the same amount as three quarters.` },
  { t: 'Colour <b>every</b> part', ok: s => s.k === s.n && s.n > 1, win: s => `${s.n} of ${s.n} parts is the whole shape. That is one whole.` },
  { t: 'Make one half using <b>more than 2</b> parts', ok: s => s.n > 2 && s.k * 2 === s.n, win: s => `${s.k} of ${s.n} is the same amount as 1 of 2. Clever!` },
];
function renderExplore(el, l) {
  l.wins = l.wins || [];
  el.innerHTML = `<div class="stage-head"><div><p class="eyebrow">Step 2 of 5 · Explore</p><h1 class="stage-title">Make your own fractions</h1></div></div>
    <div class="explore-grid">
      <div id="lab"></div>
      <div><p class="panel-title">${icon('target', 18)} Can you do these?</p><ol class="missions" id="missions"></ol></div>
    </div>
    <div class="stage-foot"><button type="button" class="btn btn-quiet" data-action="stage" data-i="0">${icon('left', 18)} Back</button><span></span>
      <button type="button" class="btn btn-primary btn-lg" data-action="stage" data-i="2" id="explore-next">Next: Examples ${icon('right')}</button></div>`;
  const drawMissions = () => {
    $('#missions', el).innerHTML = MISSIONS.map((m, i) => `<li class="mission ${i < l.missions ? 'is-done' : i === l.missions ? 'is-current' : ''}">
      <span class="m-dot">${i < l.missions ? icon('check', 16) : i + 1}</span><span>${m.t}${i < l.missions && l.wins[i] ? `<small>${l.wins[i]}</small>` : ''}</span></li>`).join('');
    $('#explore-next', el).classList.toggle('nudge', l.missions >= MISSIONS.length);
  };
  mountLab($('#lab', el), {
    shape: l.lab.shape, n: l.lab.n, on: l.lab.on,
    onChange: s => {
      l.lab = { shape: s.shape, n: s.n, on: s.on };
      const m = MISSIONS[l.missions];
      if (m && m.ok(s)) { l.wins[l.missions] = m.win(s); l.missions++; drawMissions(); }
      save();
    },
  });
  drawMissions();
}

/* ---------- Guided examples ---------- */
const pulseAll = async (c, instant) => { if (instant) return; for (const p of $$('.part', c.svg())) { p.classList.remove('pulse'); void p.getBoundingClientRect(); p.classList.add('pulse'); await sleep(REDUCED ? 20 : 130); } };
const colourN = n => async (c, instant, alive) => { for (let i = 0; i < n; i++) { const p = $(`.part[data-i="${i}"]`, c.svg()); if (p) p.classList.add('on'); if (!instant) { await sleep(REDUCED ? 30 : 330); if (!alive()) return; } } };
const EXAMPLES = [
  { q: 'What fraction of the bar is coloured?', fig: { t: 'bar', n: 5, on: [0, 1] }, ans: [2, 5], given: false, steps: [
    { t: '<b>Check the parts.</b> Are they all the same size? Yes: 5 equal parts.', run: pulseAll },
    { t: `<b>Count all the parts:</b> 5. That goes on the <span class="k-bot">bottom</span>.`, show: 'd', run: (c, i, a) => countParts(c.svg(), [0, 1, 2, 3, 4], { instant: i, alive: a }) },
    { t: `<b>Count the coloured parts:</b> 2. That goes on the <span class="k-top">top</span>.`, show: 'n', run: async (c, i, a) => { clearCounts(c.svg()); await countParts(c.svg(), [0, 1], { top: true, instant: i, alive: a }); } },
    { t: `The answer is ${frac(2, 5)} We say <b>two fifths</b>.`, answer: true, run: c => clearCounts(c.svg()) },
  ] },
  { q: `Colour ${frac(3, 8)} of the circle.`, fig: { t: 'pie', n: 1, on: [] }, ans: [3, 8], given: true, steps: [
    { t: `<b>Start with the <span class="k-bot">bottom number</span>: 8.</b> Split the circle into 8 equal parts.`, run: c => c.setFig({ t: 'pie', n: 8, on: [] }) },
    { t: `<b>Now the <span class="k-top">top number</span>: 3.</b> Colour 3 of the parts.`, run: colourN(3) },
    { t: `3 parts coloured out of 8 equal parts. That is <b>three eighths</b>.`, answer: true },
  ] },
  { q: 'A chocolate bar has 6 equal pieces. Sam eats 4 pieces. What fraction of the bar did Sam eat?', fig: { t: 'bar', n: 6, on: [] }, ans: [4, 6], given: false, steps: [
    { t: '<b>Draw it.</b> The bar has 6 equal pieces.', run: pulseAll },
    { t: `<b>Sam eats 4 pieces.</b> Colour 4 of them. That is the <span class="k-top">top number</span>.`, show: 'n', run: colourN(4) },
    { t: `Your turn. Which number goes on the <span class="k-bot">bottom</span>?`, pick: [4, 6, 2], right: 6, show: 'd', why: 'Yes! The bottom number counts all 6 equal pieces.', miss: 'The bottom number is all the equal pieces in the bar. Count every piece.' },
    { t: `Sam ate ${frac(4, 6)} of the bar. We say <b>four sixths</b>.`, answer: true },
  ] },
];
function renderExamples(el, l) {
  l.ex = clamp(l.ex, 0, EXAMPLES.length - 1);
  const ex = EXAMPLES[l.ex], tok = stageToken, alive = () => tok === stageToken;
  if (l.exDone.includes(l.ex)) l.exStep = ex.steps.length;
  let picked = l.exStep > ex.steps.findIndex(s => s.pick), busy = false;
  el.innerHTML = `<div class="stage-head"><div><p class="eyebrow">Step 3 of 5 · Examples</p><h1 class="stage-title">Watch how it is done</h1></div>
      <div class="ex-tabs" role="tablist" aria-label="Examples">${EXAMPLES.map((_, i) => `<button type="button" role="tab" class="ex-tab" aria-selected="${i === l.ex}" data-action="ex-tab" data-i="${i}">${l.exDone.includes(i) ? icon('check', 16) : ''}Example ${i + 1}</button>`).join('')}</div></div>
    <div class="stage-body two">
      <div class="viz"><div class="build"><span id="ex-fig">${fig(ex.fig, { counts: true })}</span>
        <span class="frac" role="img" aria-label="The fraction being built"><span class="fn ${ex.given ? '' : 'hide'}" id="ex-n">${ex.ans[0]}</span><span class="fbar"></span><span class="fd ${ex.given ? '' : 'hide'}" id="ex-d">${ex.ans[1]}</span></span></div></div>
      <div class="talk"><p class="ex-q">${ex.q}</p><ol class="ex-steps" id="ex-steps" aria-live="polite"></ol></div>
    </div>
    <div class="stage-foot"><button type="button" class="btn btn-quiet" data-action="stage" data-i="1">${icon('left', 18)} Back</button><span></span>
      <button type="button" class="btn btn-primary btn-lg" id="ex-cta" data-action="ex-next"></button></div>`;
  const ctx = { svg: () => $('#ex-fig svg', el), setFig: spec => { $('#ex-fig', el).innerHTML = fig(spec, { counts: true }); } };
  const reveal = s => { if (s.show) $(s.show === 'n' ? '#ex-n' : '#ex-d', el).classList.remove('hide'); };
  const drawSteps = () => {
    $('#ex-steps', el).innerHTML = ex.steps.slice(0, l.exStep).map((s, i) => {
      const now = i === l.exStep - 1, pickUI = s.pick && now && !picked
        ? `<div class="ex-pick">${s.pick.map(v => `<button type="button" class="btn" data-action="ex-pick" data-v="${v}">${v}</button>`).join('')}</div><p class="note" id="ex-miss" style="margin-top:10px"></p>`
        : s.pick ? `<p style="margin-top:6px;font-weight:600">${s.why}</p>` : '';
      return `<li class="ex-step ${s.answer ? 'is-answer' : now ? 'is-now' : ''}"><span class="n">${s.answer ? icon('check', 16) : i + 1}</span><div>${s.t}${pickUI}</div></li>`;
    }).join('');
    const cta = $('#ex-cta', el), all = l.exStep >= ex.steps.length, cur = ex.steps[l.exStep - 1];
    cta.innerHTML = all ? (l.ex < EXAMPLES.length - 1 ? `Next example ${icon('right')}` : `Start practising ${icon('right')}`) : l.exStep === 0 ? `Show the first step ${icon('right')}` : `Next step ${icon('right')}`;
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
      if (l.ex < EXAMPLES.length - 1) { l.ex++; l.exStep = 0; save(); renderStage(true); } else setStage(3);
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

/* ---------- Questions (practice and mastery check share one engine) ---------- */
const F = (n, d) => ({ f: [n, d] });
const SKILL = { read: 'reading a fraction from a picture', make: 'colouring a fraction', equal: 'checking for equal parts', write: 'writing a fraction', word: 'fractions in word problems', meaning: 'what the two numbers mean' };
const PRACTICE = [
  { skill: 'read', type: 'pick', prompt: 'What fraction of the circle is coloured?', fig: { t: 'pie', n: 4, on: [0] }, opts: [F(1, 4), F(1, 3), F(4, 1), F(3, 4)], ans: 0,
    hints: ['Count all the equal parts first. That number goes on the bottom.', 'There are 4 equal parts, and 1 of them is coloured.'],
    wrong: { 1: 'You counted only the white parts for the bottom. The bottom number counts all the parts: 4.', 2: 'So close! The numbers are upside down. The number of parts altogether goes on the bottom.', 3: 'That is the part that is not coloured. Count the coloured parts for the top.' },
    why: '4 equal parts and 1 is coloured. That is one quarter.' },
  { skill: 'read', type: 'pick', prompt: 'What fraction of the bar is coloured?', fig: { t: 'bar', n: 5, on: [0, 1, 2] }, opts: [F(5, 3), F(3, 5), F(3, 2), F(2, 5)], ans: 1,
    hints: ['The bottom number is how many equal parts there are altogether.', '5 equal parts altogether. 3 are coloured.'],
    wrong: { 0: 'The numbers are upside down. All 5 parts go on the bottom.', 2: 'The bottom number is all the equal parts, coloured or not. Count again: 5.', 3: 'That is the white part. The question asks about the coloured part.' },
    why: '5 equal parts and 3 are coloured. That is three fifths.' },
  { skill: 'make', type: 'shade', prompt: `Colour ${frac(2, 3)} of the bar.`, say: 'Colour two thirds of the bar.', fig: { t: 'bar', n: 3, on: [] }, need: 2,
    hints: ['Look at the top number. It tells you how many parts to colour.', 'Colour 2 of the 3 parts.'],
    wrongFn: k => k === 3 ? 'That is the whole bar. The top number says to colour only 2 parts.' : k === 1 ? 'That is one third. The top number is 2, so colour 2 parts.' : 'Tap the parts to colour them. The top number tells you how many.',
    why: 'The bar has 3 equal parts (bottom number) and 2 are coloured (top number).' },
  { skill: 'equal', type: 'pick', prompt: 'Which shape shows <b>one quarter</b> coloured?',
    opts: [{ fig: { t: 'strips', n: 4, w: [0.15, 0.35, 0.35, 0.15], on: [1] } }, { fig: { t: 'grid', r: 2, c: 2, on: [0] } }, { fig: { t: 'bar', n: 3, on: [0] } }, { fig: { t: 'pie', n: 4, on: [0, 1] } }], ans: 1,
    hints: ['A quarter means 1 out of 4 equal parts.', 'Look for 4 parts that are all the same size, with 1 coloured.'],
    wrong: { 0: 'It has 4 parts, but they are not the same size. A quarter needs 4 equal parts.', 2: 'This shape has only 3 parts, so each part is one third.', 3: 'This has 2 parts coloured. That is two quarters.' },
    why: 'The square has 4 equal parts and 1 is coloured.' },
  { skill: 'write', type: 'build', prompt: 'Write the fraction that is coloured.', fig: { t: 'pie', n: 8, on: [0, 1, 2, 3, 4] }, ans: [5, 8],
    hints: ['Bottom number first: count all the equal parts.', '8 equal parts. Now count the coloured ones for the top.'],
    wrongFn: (n, d) => n === 8 && d === 5 ? 'The numbers are upside down. The 8 equal parts go on the bottom.' : n === 3 && d === 8 ? 'That is the white part. Count the coloured parts for the top.' : d !== 8 ? 'Count every part of the circle for the bottom number.' : 'Count the coloured parts again for the top number.',
    why: '8 equal parts altogether and 5 are coloured. That is five eighths.' },
  { skill: 'equal', type: 'pick', col: true, prompt: 'Leo says, "One third of this bar is coloured." Is Leo right?', fig: { t: 'bar', n: 3, w: [0.5, 0.25, 0.25], on: [0] }, opts: [{ t: 'Yes, Leo is right' }, { t: 'No, Leo is not right' }], ans: 1,
    hints: ['Thirds are 3 equal parts. Check the sizes of these parts.', 'The coloured part is bigger than the other two.'],
    wrong: { 0: 'Look at the sizes of the parts. Are they all the same?' },
    why: 'The parts are not equal, so the coloured part is not one third. Fractions need equal parts.' },
  { skill: 'word', type: 'pick', prompt: 'A pizza is cut into 6 equal slices. Maya eats 1 slice. What fraction of the pizza does Maya eat?', opts: [F(1, 5), F(6, 1), F(1, 6), F(5, 6)], ans: 2,
    hints: ['Picture the pizza. How many equal slices are there altogether?', '6 slices altogether go on the bottom. Maya eats 1, so 1 goes on the top.'],
    wrong: { 0: 'The bottom number is all the slices the pizza was cut into, including the one Maya eats: 6.', 1: 'Upside down! The 6 slices altogether go on the bottom.', 3: 'That is the fraction left over. Maya eats 1 slice out of 6.' },
    why: '6 equal slices and Maya eats 1. That is one sixth.', whyFig: { t: 'pie', n: 6, on: [0] } },
  { skill: 'read', type: 'pick', prompt: 'What fraction of the bar is <b>not</b> coloured?', fig: { t: 'bar', n: 7, on: [0, 1, 2] }, opts: [F(3, 7), F(7, 4), F(4, 3), F(4, 7)], ans: 3,
    hints: ['This time count the white parts for the top number.', '7 parts altogether. 4 of them are white.'],
    wrong: { 0: 'That is the coloured part. Read the question again: it asks for the part that is not coloured.', 1: 'Upside down. All 7 parts go on the bottom.', 2: 'The bottom number is all the equal parts: 7.' },
    why: '7 equal parts and 4 are not coloured. That is four sevenths.' },
];
const MASTERY = [
  { skill: 'make', type: 'shade', prompt: `Colour ${frac(3, 5)} of the circle.`, say: 'Colour three fifths of the circle.', fig: { t: 'pie', n: 5, on: [] }, need: 3, why: 'Three fifths: 5 equal parts with 3 coloured.' },
  { skill: 'equal', type: 'pick', prompt: 'Which shape shows <b>one third</b> coloured?',
    opts: [{ fig: { t: 'bar', n: 3, w: [0.2, 0.3, 0.5], on: [2] } }, { fig: { t: 'strips', n: 3, w: [0.25, 0.5, 0.25], on: [1] } }, { fig: { t: 'pie', n: 3, on: [0] } }, { fig: { t: 'bar', n: 4, on: [0] } }], ans: 2,
    why: 'Only the circle has 3 equal parts with 1 coloured.' },
  { skill: 'word', type: 'build', prompt: 'A ribbon is cut into 8 equal pieces. 3 pieces are red. What fraction of the ribbon is red?', ans: [3, 8], why: '8 equal pieces altogether and 3 are red. That is three eighths.' },
  { skill: 'read', type: 'pick', prompt: 'What fraction of the bar is coloured?', fig: { t: 'bar', n: 7, on: [0, 1] }, opts: [F(7, 2), F(5, 7), F(2, 7), F(2, 5)], ans: 2, why: '7 equal parts and 2 are coloured. That is two sevenths.' },
  { skill: 'meaning', type: 'pick', col: true, prompt: `In the fraction ${frac(3, 4)} what does the 4 tell us?`, say: 'In the fraction three quarters, what does the four tell us?',
    opts: [{ t: '4 parts are coloured' }, { t: 'The whole is split into 4 equal parts' }, { t: 'There are 4 wholes' }, { t: 'The fraction is bigger than 3' }], ans: 1,
    why: 'The bottom number tells us how many equal parts the whole is split into.' },
];
const optHTML = o => o.f ? frac(o.f[0], o.f[1]) : o.fig ? fig(o.fig) : esc(o.t);
const optLabel = o => o.f ? `${o.f[0]} over ${o.f[1]}` : o.fig ? figLabel(o.fig) : o.t;
const ring = (v, max, col = 'var(--good)') => { const c = 2 * Math.PI * 62; return `<svg viewBox="0 0 148 148" width="148" height="148" aria-hidden="true"><circle cx="74" cy="74" r="62" style="fill:none;stroke:var(--surface-2);stroke-width:13"/><circle cx="74" cy="74" r="62" style="fill:none;stroke:${col};stroke-width:13;stroke-linecap:round;stroke-dasharray:${f1(c * v / max)} ${f1(c)}"/></svg>`; };

function renderQ(el, l, mode) {
  const pr = mode === 'pr', set = pr ? PRACTICE : MASTERY, st = l[mode];
  if (st.i >= set.length) return pr ? practiceSummary(el, l) : masteryResult(el, l);
  if (!pr && !st.begun) return masteryIntro(el, l);
  const q = set[st.i], A = { sel: null, on: [], top: '', bot: '', slot: 'top', tries: 0, hints: 0, done: false };
  const pips = set.map((_, i) => { const r = pr ? st.log[i] : st.ans[i]; return `<i class="${i === st.i ? 'cur' : r ? ((pr ? r.first : r.ok) ? 'ok' : 'miss') : ''}"></i>`; }).join('');
  const figHTML = q.type === 'shade' ? fig(q.fig, { tap: true }) : q.fig ? fig(q.fig) : '';
  let answer = '';
  if (q.type === 'pick') answer = `<div class="opts ${q.col ? 'col' : ''}" role="group" aria-label="Answers">${q.opts.map((o, i) => `<button type="button" class="opt" data-action="q-opt" data-i="${i}" aria-pressed="false" aria-label="${esc(optLabel(o))}">${optHTML(o)}</button>`).join('')}</div>`;
  if (q.type === 'shade') answer = `<p class="q-help">${icon('tap', 18)} Tap the parts to colour them. Tap again to undo.</p>`;
  if (q.type === 'build') answer = `<div class="buildq"><div class="slots"><button type="button" class="slot-btn top" data-action="q-slot" data-s="top" aria-pressed="true" aria-label="Top number"></button><span class="line"></span><button type="button" class="slot-btn bot" data-action="q-slot" data-s="bot" aria-pressed="false" aria-label="Bottom number"></button></div>
    <div class="pad" role="group" aria-label="Number pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `<button type="button" data-action="q-pad" data-n="${n}">${n}</button>`).join('')}</div></div>`;
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
  const check = $('#q-check', el), fbEl = $('#q-fb', el);
  const ready = () => q.type === 'pick' ? A.sel !== null : q.type === 'shade' ? true : (A.top !== '' && A.bot !== '');
  const sync = () => { if (!A.done) check.disabled = !ready(); };
  const fb = (kind, title, text, extra = '') => {
    fbEl.innerHTML = `<div class="fb fb-${kind}"><span class="fb-ico">${icon({ good: 'check', oops: 'x', hint: 'bulb', info: 'eye' }[kind], 20)}</span><div><strong>${title}</strong><p>${text}</p>${extra}</div></div>`;
    fbEl.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
  };
  const isRight = () => q.type === 'pick' ? A.sel === q.ans : q.type === 'shade' ? A.on.length === q.need : (+A.top === q.ans[0] && +A.bot === q.ans[1]);
  const wrongMsg = () => q.type === 'pick' ? (q.wrong && q.wrong[A.sel]) : q.type === 'shade' ? (q.wrongFn && q.wrongFn(A.on.length)) : (q.wrongFn && q.wrongFn(+A.top, +A.bot));
  const slotDraw = () => $$('.slot-btn', el).forEach(b => { const s = b.dataset.s; b.textContent = A[s]; b.classList.toggle('filled', A[s] !== ''); b.setAttribute('aria-pressed', !A.done && A.slot === s); });
  const showAnswer = () => {
    if (q.type === 'pick') $$('.opt', el).forEach((o, i) => { if (i === q.ans) { o.classList.add('is-right'); o.insertAdjacentHTML('beforeend', `<span class="tag">${icon('check', 16)}</span>`); } });
    if (q.type === 'shade') $$('#q-fig .part', el).forEach((p, i) => p.classList.toggle('on', i < q.need));
    if (q.type === 'build') { A.top = q.ans[0]; A.bot = q.ans[1]; slotDraw(); }
  };
  const finish = ok => {
    A.done = true;
    $('.q', el).classList.add('locked');
    const figSvg = $('#q-fig svg', el); if (figSvg) figSvg.style.pointerEvents = 'none';
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
  if (q.type === 'shade') tapFig($('#q-fig svg', el), on => { A.on = on; sync(); });
  if (q.type === 'build') slotDraw();
  sync();
  if (S.read) Voice.say(q.say || strip(q.prompt));

  stageActs['q-opt'] = b => { if (A.done) return; A.sel = +b.dataset.i; $$('.opt', el).forEach(o => o.setAttribute('aria-pressed', o === b)); sync(); };
  stageActs['q-slot'] = b => { if (A.done) return; A.slot = b.dataset.s; slotDraw(); };
  stageActs['q-pad'] = b => { if (A.done) return; A[A.slot] = +b.dataset.n; if (A.slot === 'top' && A.bot === '') A.slot = 'bot'; slotDraw(); sync(); };
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
      return fb('info', 'Let us look at it together', q.why, q.whyFig ? fig(q.whyFig) : '');
    }
    const msg = wrongMsg() || (q.hints && q.hints[0]) || 'Have another look.';
    if (q.type === 'pick') { const sel = $(`.opt[data-i="${A.sel}"]`, el); if (sel) { sel.classList.add('is-wrong', 'is-out'); sel.setAttribute('aria-pressed', 'false'); sel.insertAdjacentHTML('beforeend', `<span class="tag">${icon('x', 16)}</span>`); } A.sel = null; }
    fb('oops', 'Not quite. Try again', msg);
    sync();
  };
  stageActs['q-fast'] = () => { st.fastAsked = true; st.i = 5; save(); renderStage(true); };
  stageActs.listen = () => { S.read = !S.read; save(); if (!S.read) Voice.stop(); renderStage(false); };
}
function practiceSummary(el, l) {
  const done = l.pr.log.filter(Boolean), first = done.filter(r => r.first).length;
  const weak = [...new Set(done.filter(r => !r.first).map(r => SKILL[r.skill]))];
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
  el.innerHTML = `<div class="summary"><div class="summary-in">
    <div class="badge" style="background:var(--blue-soft);color:var(--blue-deep)">${icon('medal', 64)}</div>
    <p class="eyebrow">Step 5 of 5 · Mastery check</p>
    <h1>Show what you know</h1>
    <p class="say">5 questions on your own, with no hints. Get <b>4 or more</b> right to master this lesson.</p>
    <div class="cta-row" style="justify-content:center;margin-top:6px"><button type="button" class="btn btn-quiet" data-action="stage" data-i="3">${icon('left', 18)} More practice first</button>
      <button type="button" class="btn btn-primary btn-lg" data-action="ma-begin">Start the check ${icon('right')}</button></div>
  </div></div>`;
  stageActs['ma-begin'] = () => { l.ma.begun = true; save(); renderStage(true); };
}
function masteryResult(el, l) {
  const ans = l.ma.ans, score = ans.filter(a => a && a.ok).length, pass = score >= 4;
  if (!l.ma.done) { l.ma.done = true; l.ma.score = score; if (pass) l.complete = true; save(); renderStepper(); }
  el.innerHTML = `<div class="summary"><div class="summary-in">
    <p class="eyebrow">Mastery check · Result</p>
    <div class="score-ring">${ring(score, 5, pass ? 'var(--good)' : 'var(--amber)')}<span class="v"><span>${score}<small>/5</small></span></span></div>
    <h1>${pass ? 'You have mastered it!' : 'Nearly there'}</h1>
    <p class="say">${pass ? 'You showed that you really understand fractions, all on your own.' : 'You need 4 out of 5. Look at the notes below, then have another go.'}</p>
    <ul class="review">${MASTERY.map((q, i) => { const a = ans[i] || {}; return `<li class="${a.ok ? 'ok' : 'no'}"><span class="r-ico">${icon(a.ok ? 'check' : 'x', 14)}</span><div><b>${cap(SKILL[q.skill])}</b><span>${q.why}</span></div></li>`; }).join('')}</ul>
    <div class="cta-row" style="justify-content:center;margin-top:6px">${pass
      ? `<button type="button" class="btn btn-good btn-lg" data-action="stage" data-i="5">Finish the lesson ${icon('right')}</button>`
      : `<button type="button" class="btn btn-quiet" data-action="to-teacher">${icon('play', 18)} Watch teacher</button><button type="button" class="btn" data-action="stage" data-i="3">Back to practice</button><button type="button" class="btn btn-primary btn-lg" data-action="ma-again">Try the check again ${icon('replay', 18)}</button>`}</div>
  </div></div>`;
  stageActs['ma-again'] = () => { l.ma = { i: 0, ans: [], done: false, score: 0, begun: true }; save(); renderStage(true); };
}
function renderDone(el, l) {
  const cols = ['var(--blue)', 'var(--rose)', '#F4A720', 'var(--teal)'];
  const kites = REDUCED ? '' : Array.from({ length: 22 }, (_, i) => `<i style="left:${(i * 37 + 11) % 97}%;background:${cols[i % 4]};animation-delay:${(i % 7) * 0.13}s;--rot:${(i % 2 ? 1 : -1) * (30 + (i * 13) % 50)}deg"></i>`).join('');
  el.innerHTML = `<div class="summary" style="position:relative"><div class="done-kites" aria-hidden="true">${kites}</div><div class="summary-in" style="position:relative">
    <div class="badge">${kite()}</div>
    <p class="eyebrow">Lesson complete · Understanding Fractions</p>
    <h1>Mastered!</h1>
    <p class="say">You scored ${l.ma.score} out of 5 and earned 30 stars.</p>
    <ul class="can-do"><li>${icon('check', 20)} I can split a whole into equal parts</li><li>${icon('check', 20)} I can read and write a fraction</li><li>${icon('check', 20)} I know what the top and bottom numbers mean</li></ul>
    <div class="cta-row" style="justify-content:center;margin-top:6px"><a class="btn btn-quiet" href="#subjects">${icon('home', 18)} Home</a><a class="btn btn-primary btn-lg" href="#topic-fractions">Back to Fractions ${icon('right')}</a></div>
    <p class="note" style="max-width:none">Next lesson: Fractions on a Number Line (coming in the next phase)</p>
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
  if (l.stage === 4 && l.ma.done) { /* show the last result until they retry */ }
  save(); renderStage(true);
}
function Lesson() {
  const l = L();
  if (!l.started) { l.started = true; save(); }
  const html = `<div class="view lesson">
    <header class="lesson-bar"><div class="wrap lesson-bar-in">
      <a class="icon-btn" href="#topic-fractions" aria-label="Back to the Fractions topic">${icon('left')}</a>
      <div class="lesson-name"><span>Fractions · Lesson 1</span><strong>Understanding Fractions</strong></div>
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
    mount(root) { renderStage(false); Teacher.mount($('#teacher-player', root)); },
    unmount() { stageToken++; stageActs = {}; Teacher.unmount(); Voice.stop(); },
  };
}
