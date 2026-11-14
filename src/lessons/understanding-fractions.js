/* =====================================================================
   Fractions · Lesson 1 · Understanding Fractions
   Story: sharing a pizza fairly. Tool: the fraction lab.
   ===================================================================== */
{
  /* ---------- drawings for the Learn story ---------- */
  const PEPS = [22, 68, 112, 158, 202, 248, 292, 338].map((deg, i) => ({ a: deg * Math.PI / 180, r: i % 2 ? 0.66 : 0.42 }));
  const pizzaBase = (cx, cy, r) => {
    const peps = PEPS.map(p => { const [px, py] = polar(cx, cy, r * p.r, p.a); return `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r * 0.095)}" style="fill:var(--pep);stroke:var(--pep-2);stroke-width:1.5"/>`; }).join('');
    return `<g class="pz-base"><circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--cheese)"/><circle cx="${cx}" cy="${cy}" r="${r - 5.5}" style="fill:none;stroke:var(--crust);stroke-width:11"/>${peps}</g>`;
  };
  const pizza = (cx, cy, r, parts, push) => {
    let out = '';
    for (let i = 0; i < parts; i++) {
      const a0 = -Math.PI / 2 + i * TAU / parts, a1 = a0 + TAU / parts, m = (a0 + a1) / 2, rr = r - 5.5;
      const [x0, y0] = polar(cx, cy, rr, a0), [x1, y1] = polar(cx, cy, rr, a1);
      const peps = PEPS.filter(p => (((p.a - a0) % TAU) + TAU) % TAU < TAU / parts)
        .map(p => { const [px, py] = polar(cx, cy, r * p.r, p.a); return `<circle class="pep" cx="${f1(px)}" cy="${f1(py)}" r="${f1(r * 0.095)}"/>`; }).join('');
      out += `<g class="slice" style="--dx:${f1(Math.cos(m) * push)}px;--dy:${f1(Math.sin(m) * push)}px"><path class="cheese" d="${sector(cx, cy, r, a0, a1)}"/><path class="crust" d="M${f1(x0)},${f1(y0)}A${rr},${rr} 0 0 1 ${f1(x1)},${f1(y1)}"/>${peps}</g>`;
    }
    return out;
  };
  const scenePizza = parts => {
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
  };
  const cutPizza = async (viz, instant, alive, ms) => {
    viz.classList.add('is-cutting');
    if (!instant) { await sleep(REDUCED ? 80 : ms); if (!alive()) return; }
    viz.classList.add('is-cut');
    if (!instant) await sleep(REDUCED ? 80 : 800);
  };
  const sceneBars = () => {
    let out = '';
    [1, 2, 4, 8].forEach((n, r) => {
      const y = 26 + r * 84, w = 356 / n;
      let parts = '';
      for (let i = 0; i < n; i++) parts += `<rect x="${f1(104 + i * w + 2)}" y="${y}" width="${f1(w - 4)}" height="56" rx="8" style="fill:${i === 0 ? 'var(--orange)' : 'var(--surface)'};stroke:var(--ink);stroke-width:2.5"/>`;
      const lab = n === 1 ? `<text x="52" y="${y + 39}" style="font:800 30px var(--font-display);fill:var(--ink);text-anchor:middle">1</text>` : svgFrac(52, y + 24, 1, n, 26);
      out += `<g class="${r ? 'rise' : ''}">${lab}${parts}</g>`;
    });
    return `<svg class="scene" viewBox="0 0 480 360" role="img" aria-label="The same bar cut into 1, 2, 4 and 8 equal parts. One part is coloured each time and it gets smaller.">${out}</svg>`;
  };
  const sceneUnfair = () => {
    const cx = 240, cy = 170, r = 104, cutX = cx + 42, half = Math.sqrt(r * r - 42 * 42);
    const whole = `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--cheese)"/><circle cx="${cx}" cy="${cy}" r="${r - 5.5}" style="fill:none;stroke:var(--crust);stroke-width:11"/>`
      + PEPS.map(p => { const [px, py] = polar(cx, cy, r * p.r, p.a); return `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r * 0.095)}" style="fill:var(--pep);stroke:var(--pep-2);stroke-width:1.5"/>`; }).join('');
    const edge = `<path d="M${cutX} ${f1(cy - half)}V${f1(cy + half)}" style="stroke:var(--crust-2);stroke-width:2"/>`;
    return `<svg class="scene" viewBox="0 0 480 360" role="img" aria-label="A pizza cut into one big piece and one small piece">
      <defs><clipPath id="uf-l"><rect x="0" y="0" width="${cutX}" height="360"/></clipPath><clipPath id="uf-r"><rect x="${cutX}" y="0" width="${480 - cutX}" height="360"/></clipPath></defs>
      ${friend(50, cy, 'Maya', 'blue')}${friend(432, cy, 'Leo', 'teal', 'sad')}
      <g transform="translate(-14,0)"><g clip-path="url(#uf-l)">${whole}</g>${edge}</g>
      <g transform="translate(14,0)"><g clip-path="url(#uf-r)">${whole}</g>${edge}</g>
    </svg>`;
  };
  const sceneNumbers = () => {
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
  };
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

  /* ---------- Learn ---------- */
  const learn = [
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
      { say: 'Leo cuts the next pizza like this. Is it a <b>fair share</b>?', gate: l => l.flags.fair != null,
        extra: l => l.flags.fair == null
          ? `<div class="choice-row"><button type="button" class="btn btn-lg" data-action="fair" data-v="yes">Fair</button><button type="button" class="btn btn-lg" data-action="fair" data-v="no">Not fair</button></div>`
          : l.flags.fair === 'no' ? `<div class="verdict good">${icon('check', 20)}<span>You spotted it! One piece is much bigger than the other.</span></div>`
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

  /* ---------- Explore ---------- */
  const missions = [
    { t: 'Colour <b>one half</b> of the shape', ok: s => s.n > 1 && s.k * 2 === s.n, win: s => s.n === 2 ? '1 of 2 equal parts is one half.' : `${s.k} of ${s.n} parts is the same amount as one half.` },
    { t: 'Make <b>three quarters</b>', ok: s => s.k * 4 === s.n * 3 && s.n > 1, win: s => s.n === 4 ? '3 of 4 equal parts. Three quarters!' : `${s.k} of ${s.n} is the same amount as three quarters.` },
    { t: 'Colour <b>every</b> part', ok: s => s.k === s.n && s.n > 1, win: s => `${s.n} of ${s.n} parts is the whole shape. That is one whole.` },
    { t: 'Make one half using <b>more than 2</b> parts', ok: s => s.n > 2 && s.k * 2 === s.n, win: s => `${s.k} of ${s.n} is the same amount as 1 of 2. Clever!` },
  ];

  /* ---------- Guided examples ---------- */
  const pulseAll = async (c, instant) => { if (instant) return; for (const p of $$('.part', c.svg())) { p.classList.remove('pulse'); void p.getBoundingClientRect(); p.classList.add('pulse'); await sleep(REDUCED ? 20 : 130); } };
  const colourN = n => async (c, instant, alive) => { for (let i = 0; i < n; i++) { const p = $(`.part[data-i="${i}"]`, c.svg()); if (p) p.classList.add('on'); if (!instant) { await sleep(REDUCED ? 30 : 330); if (!alive()) return; } } };
  const examples = [
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

  /* ---------- Questions ---------- */
  const skills = { read: 'reading a fraction from a picture', make: 'colouring a fraction', equal: 'checking for equal parts', write: 'writing a fraction', word: 'fractions in word problems', meaning: 'what the two numbers mean' };
  const practice = [
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
  const mastery = [
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

  /* ---------- what the teacher says and writes (board is 900 x 600) ---------- */
  const { w, line, circ, box, shadeR, shadeS, und, arrow, tick, cross, loop, star, think, num } = Teacher.ops;
  const script = [
    { title: 'What is a fraction?', steps: [
      { say: 'Hello! Today we are going to learn about fractions.', ops: [w('Fractions', 56, 96, { size: 68, b: 1, c: 'blue', id: 't1' }), und('t1', { c: 'orange' })] },
      { say: "Let's start with one whole pizza.", ops: [circ(210, 350, 138), w('one whole', 210, 548, { size: 40, anchor: 'mid' })] },
      { say: 'Two friends want to share it fairly. So I cut it into two equal parts.', ops: [line(210, 196, 210, 504, { wait: 1500 }), w('2 equal parts', 400, 250, { size: 44 })] },
      { say: 'I will colour one of the parts.', ops: [shadeS(210, 350, 138, 0, 180, { dur: 1700 })] },
      { say: 'That is one out of two equal parts. We write a one, a line, and a two.', ops: [w('1', 490, 392, { size: 100, c: 'orange', anchor: 'mid', wait: 2300 }), line(445, 412, 535, 412, { wd: 6 }), w('2', 490, 506, { size: 100, c: 'blue', anchor: 'mid' })] },
      { say: 'We call this one half.', ops: [w('= one half', 575, 436, { size: 54 })], hold: 1000 },
    ] },
    { title: 'Top and bottom numbers', steps: [
      { say: 'Here is a chocolate bar. I split it into four equal parts.', ops: [box(60, 66, 480, 104), line(180, 68, 180, 168, { wait: 500 }), line(300, 68, 300, 168), line(420, 68, 420, 168)] },
      { say: "Let's count them. One, two, three, four.", ops: [num(1, 120, 216, { wait: 1100 }), num(2, 240, 216), num(3, 360, 216), num(4, 480, 216)] },
      { say: 'Four equal parts altogether. That number goes on the bottom.', ops: [line(100, 398, 200, 398, { wd: 6, wait: 1700 }), w('4', 150, 494, { size: 104, c: 'blue', anchor: 'mid' })] },
      { say: 'Now I colour three of the parts.', ops: [shadeR(60, 66, 120, 104), shadeR(180, 66, 120, 104), shadeR(300, 66, 120, 104)] },
      { say: 'Three parts are coloured. That number goes on the top.', ops: [w('3', 150, 378, { size: 104, c: 'orange', anchor: 'mid', wait: 1700 })] },
      { say: 'The top number tells us how many parts we are counting. Its special name is the numerator.',
        ops: [arrow(292, 338, 218, 338, { c: 'orange' }), w('top number', 306, 350, { size: 42, c: 'orange', id: 'top' }), w('how many parts we count', 306, 392, { size: 30 }), w('= numerator', '+top', 350, { size: 36, c: 'grey', wait: 900 })] },
      { say: 'The bottom number tells us how many equal parts are in the whole. It is called the denominator. D for down!',
        ops: [arrow(292, 462, 218, 462, { c: 'blue' }), w('bottom number', 306, 474, { size: 42, c: 'blue', id: 'bot' }), w('how many equal parts in the whole', 306, 516, { size: 30, maxW: 540 }), w('= denominator', '+bot', 474, { size: 36, c: 'grey', wait: 600 })] },
      { say: 'So this fraction is three quarters.', ops: [w('three quarters', 588, 132, { size: 42, c: 'green', maxW: 276, id: 'tq' }), loop(726, 118, 162, 46, { c: 'green' })], hold: 1000 },
    ] },
    { title: 'Equal parts', steps: [
      { say: 'Here is something really important. The parts must be equal.', ops: [w('Equal parts!', 56, 92, { size: 62, b: 1, id: 't3' }), und('t3', { c: 'orange' })] },
      { say: 'This bar has three equal parts, and one is coloured.', ops: [box(70, 150, 360, 104), line(190, 152, 190, 252), line(310, 152, 310, 252), shadeR(70, 150, 120, 104)] },
      { say: 'So the coloured part is one third.', ops: [w('1', 520, 196, { size: 66, c: 'orange', anchor: 'mid' }), line(490, 208, 550, 208, { wd: 5 }), w('3', 520, 268, { size: 66, c: 'blue', anchor: 'mid' }), tick(590, 205, { c: 'green' })] },
      { say: 'Now look at this bar. It has three parts too, but they are different sizes.', ops: [box(70, 350, 360, 104), line(270, 352, 270, 452, { wait: 900 }), line(350, 352, 350, 452), shadeR(70, 350, 200, 104, { dur: 1100 })] },
      { say: 'Is the coloured part one third? Have a think.', ops: [w('one third?', 470, 410, { size: 46 }), think(3400)] },
      { say: 'No! The parts are not equal, so it is not one third.', ops: [cross(730, 372, { c: 'rose' }), w('not equal', 470, 474, { size: 46, c: 'rose', wait: 500 })] },
      { say: 'Fractions are fair shares. Every part must be the same size.', ops: [w('Fractions need equal parts.', 70, 552, { size: 40, c: 'blue' })], hold: 1000 },
    ] },
    { title: "Let's solve one together", steps: [
      { say: "Let's solve one together. What fraction of this pizza is coloured?", ops: [w('What fraction is coloured?', 56, 84, { size: 46, b: 1 }), circ(215, 350, 146), line(215, 204, 215, 496), line(69, 350, 361, 350), line(112, 247, 318, 453), line(318, 247, 112, 453)] },
      { say: 'Some of the slices are coloured in.', ops: [0, 1, 2, 3, 4].map(i => shadeS(215, 350, 146, i * 45, i * 45 + 45, { dur: 430, gap: 60 })) },
      { say: 'Step one. Count all the equal parts.', ops: [w('1. Count all the parts', 430, 176, { size: 36, c: 'blue', maxW: 440 })] },
      { say: 'One, two, three, four, five, six, seven, eight.', ops: Array.from({ length: 8 }, (_, i) => { const a = (i + 0.5) * Math.PI / 4; return num(i + 1, 215 + 176 * Math.sin(a), 350 - 176 * Math.cos(a) + 12, { size: 32, gap: 60 }); }) },
      { say: 'Eight equal parts. So eight goes on the bottom.', ops: [line(470, 420, 570, 420, { wd: 6, wait: 1200 }), w('8', 520, 516, { size: 104, c: 'blue', anchor: 'mid' })] },
      { say: 'Step two. Count the coloured parts. How many can you see?', ops: [w('2. Count the coloured parts', 430, 240, { size: 36, c: 'orange', maxW: 440 }), think(3600)] },
      { say: 'Five parts are coloured. So five goes on the top.', ops: [w('5', 520, 400, { size: 104, c: 'orange', anchor: 'mid', wait: 1500 })] },
      { say: 'The answer is five eighths. Well done if you got it!', ops: [loop(520, 428, 84, 128, { c: 'green' }), w('five eighths', 622, 446, { size: 44, c: 'green', maxW: 250 })], hold: 1100 },
    ] },
    { title: 'Remember', steps: [
      { say: "Let's remember three things.", ops: [w('Remember', 56, 96, { size: 66, b: 1, c: 'blue', id: 't5' }), und('t5', { c: 'orange' })] },
      { say: 'One. A fraction is part of a whole.', ops: [w('1.', 60, 204, { size: 44, c: 'blue' }), w('A fraction is part of a whole', 124, 204, { size: 42, maxW: 720 })] },
      { say: 'Two. The parts must be equal.', ops: [w('2.', 60, 292, { size: 44, c: 'blue' }), w('The parts must be equal', 124, 292, { size: 42 })] },
      { say: 'Three. The bottom number counts all the equal parts. The top number counts the parts we want.',
        ops: [w('3.', 60, 380, { size: 44, c: 'blue' }), w('Bottom number:', 124, 380, { size: 42, c: 'blue', id: 'b5' }), w('all the equal parts', '+b5', 380, { size: 42 }),
          w('Top number:', 124, 448, { size: 42, c: 'orange', id: 'p5', wait: 500 }), w('the parts we count', '+p5', 448, { size: 42 })] },
      { say: 'Now it is your turn. Try the practice questions. You can do it!', ops: [star(520, 536, 30, { c: 'orange', wait: 800 }), w('Your turn!', 570, 556, { size: 60, b: 1, c: 'green' })], hold: 1400 },
    ] },
  ];

  addLesson({
    id: 'understanding-fractions', topic: 'fractions', n: 1, title: 'Understanding Fractions', level: 0, minutes: 15,
    blurb: 'What a fraction is, and what the top and bottom numbers mean.',
    thumb: () => fig({ t: 'pie', n: 4, on: [0, 1, 2] }),
    homeTip: 'Cut toast or fruit into equal pieces and talk about each part.',
    intro: {
      say: 'A fraction is a way to talk about <b>part of something</b>. By the end of this lesson you will be able to:',
      speak: 'A fraction is a way to talk about part of something. Press the blue button to start.',
      goals: [['cut', 'Split a whole into equal parts'], ['pencil', 'Read and write a fraction'], ['bulb', 'Say what the top and bottom numbers mean']],
      why: 'You use fractions whenever you share, tell the time or measure.',
      cards: () => [[ART.pizza(), 'Sharing food'], [ART.clock(), 'Telling the time'], [ART.glass(), 'Measuring']],
    },
    learn,
    learnActs: {
      fair: (b, c) => { c.l.flags.fair = b.dataset.v; save(); c.setTalk(false); c.setCta(false); },
      'say-name': b => { const [n, d] = NAMES[+b.dataset.i]; b.classList.add('heard'); Voice.say(fracWords(n, d), { rate: 0.85 }); },
    },
    explore: { title: 'Make your own fractions', missions, mount: (root, saved, onChange) => mountLab(root, { ...(saved || { shape: 'pie', n: 4, on: [] }), onChange }) },
    examples, practice, mastery, skills,
    teacher: { script, poster: 1 },
    passSay: 'You showed that you really understand fractions, all on your own.',
    canDo: ['I can split a whole into equal parts', 'I can read and write a fraction', 'I know what the top and bottom numbers mean'],
  });
}
