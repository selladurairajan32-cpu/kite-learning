/* =====================================================================
   Perimeter, Area & Volume · Lesson 1 · Perimeter of Rectangles
   Story: Dot the ladybird walks all the way round the edge of a shape.
   Tool: the fence builder (stretch a rectangle on squared paper).
   Big ideas, one at a time:
     perimeter is the distance all the way round the outside of a shape
     on squared paper, count the edges on the outside, not the squares inside
     a rectangle's opposite sides are equal, so add length + width + length + width
     different rectangles can have the same perimeter
   Colour code: the long sides (length) are orange, the short sides (width) are blue.
   ===================================================================== */
{
  const pause = async (ms, instant, alive) => { if (!instant) await sleep(REDUCED ? 30 : ms); return alive(); };

  /* ---------- geometry: a rectangle of cw x ch units, u pixels per unit, centred on (cx, cy) ---------- */
  const box = (cw, ch, u, cx = 240, cy = 190) => ({ x: cx - cw * u / 2, y: cy - ch * u / 2, w: cw * u, h: ch * u, cw, ch, u });
  /* the unit edges round the outside, clockwise from the top-left corner */
  const edgesOf = r => {
    const { x, y, w, h, u, cw, ch } = r, E = [];
    for (let i = 0; i < cw; i++) E.push({ x1: x + i * u, y1: y, x2: x + (i + 1) * u, y2: y, side: 'top' });
    for (let i = 0; i < ch; i++) E.push({ x1: x + w, y1: y + i * u, x2: x + w, y2: y + (i + 1) * u, side: 'right' });
    for (let i = 0; i < cw; i++) E.push({ x1: x + w - i * u, y1: y + h, x2: x + w - (i + 1) * u, y2: y + h, side: 'bottom' });
    for (let i = 0; i < ch; i++) E.push({ x1: x, y1: y + h - i * u, x2: x, y2: y + h - (i + 1) * u, side: 'left' });
    return E;
  };
  const OUT = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] };
  const ANG = { top: 0, right: 90, bottom: 180, left: 270 };
  /* a point s pixels along the outline, clockwise from the top-left corner, and which side it is on */
  const along = (r, s) => {
    const { x, y, w, h } = r, P = 2 * (w + h);
    s = ((s % P) + P) % P;
    if (s <= w) return { x: x + s, y, side: 'top' };
    if (s <= w + h) return { x: x + w, y: y + s - w, side: 'right' };
    if (s <= 2 * w + h) return { x: x + w - (s - w - h), y: y + h, side: 'bottom' };
    return { x, y: y + h - (s - 2 * w - h), side: 'left' };
  };
  const outline = r => `M${f1(r.x)},${f1(r.y)}h${f1(r.w)}v${f1(r.h)}h${f1(-r.w)}z`;
  /* squared paper behind a shape: pad units of grid on every side */
  const paper = (r, pad = 1, cls = 'pm-grid') => {
    const { u } = r, x0 = r.x - pad * u, y0 = r.y - pad * u, x1 = r.x + r.w + pad * u, y1 = r.y + r.h + pad * u;
    let d = '';
    for (let x = x0; x <= x1 + 0.1; x += u) d += `M${f1(x)},${f1(y0)}V${f1(y1)}`;
    for (let y = y0; y <= y1 + 0.1; y += u) d += `M${f1(x0)},${f1(y)}H${f1(x1)}`;
    return `<path class="${cls}" d="${d}"/>`;
  };
  const edgeLines = r => edgesOf(r).map((e, j) => `<line class="pm-edge ${e.side}" data-j="${j}" x1="${f1(e.x1)}" y1="${f1(e.y1)}" x2="${f1(e.x2)}" y2="${f1(e.y2)}"/>`).join('');
  const edgeNums = (r, size = 17, off = 17) => edgesOf(r).map((e, j) => {
    const o = OUT[e.side];
    return `<text class="pm-en" data-j="${j}" x="${f1((e.x1 + e.x2) / 2 + o[0] * off)}" y="${f1((e.y1 + e.y2) / 2 + o[1] * off)}" style="font-size:${size}px">${j + 1}</text>`;
  }).join('');
  const squareNums = r => { let s = '', n = 0; for (let j = 0; j < r.ch; j++) for (let i = 0; i < r.cw; i++) s += `<text class="pm-sq" x="${f1(r.x + (i + 0.5) * r.u)}" y="${f1(r.y + (j + 0.5) * r.u)}">${++n}</text>`; return s; };
  /* side labels: top and bottom say the length, left and right say the width */
  const sideLabel = (r, side, text, cls = '') => {
    const p = { top: [r.x + r.w / 2, r.y - 16], bottom: [r.x + r.w / 2, r.y + r.h + 30], left: [r.x - 14, r.y + r.h / 2 + 7], right: [r.x + r.w + 14, r.y + r.h / 2 + 7] }[side];
    const anchor = side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle';
    return `<text class="pm-lab ${side === 'top' || side === 'bottom' ? 'len' : 'wid'} ${cls}" data-side="${side}" x="${f1(p[0])}" y="${f1(p[1])}" style="text-anchor:${anchor}">${text}</text>`;
  };

  /* ---------- Dot the ladybird, facing right; rotated to follow the edge ---------- */
  const bugSVG = (s = 1) => `<g transform="scale(${s})"><ellipse cx="-2" cy="0" rx="13" ry="11" class="bug-body"/><circle cx="12" cy="0" r="6.5" class="bug-head"/>
    <path d="M-15 0H10" class="bug-line"/><circle cx="-6" cy="-5" r="2.6" class="bug-spot"/><circle cx="-6" cy="5" r="2.6" class="bug-spot"/><circle cx="3" cy="-5.5" r="2.2" class="bug-spot"/><circle cx="3" cy="5.5" r="2.2" class="bug-spot"/>
    <circle cx="14" cy="-2.5" r="1.5" class="bug-eye"/><circle cx="14" cy="2.5" r="1.5" class="bug-eye"/></g>`;
  const bugAt = (r, s = 1) => `<g class="bug" transform="translate(${f1(r.x)},${f1(r.y)})"><g class="bug-r">${bugSVG(s)}</g></g>`;
  const putBug = (svg, p) => { const b = $('.bug', svg); if (!b) return; b.setAttribute('transform', `translate(${f1(p.x)},${f1(p.y)})`); $('.bug-r', b).setAttribute('transform', `rotate(${ANG[p.side]})`); };
  /* Dot walks from distance a to distance b along the outline; the trail draws behind */
  const walk = (svg, r, a, b, ms, instant) => {
    const P = 2 * (r.w + r.h), trail = $('.pm-trail', svg);
    const draw = u => { const s = a + (b - a) * u; putBug(svg, along(r, s >= P ? P - 0.01 : s)); if (trail) trail.style.strokeDashoffset = f1(1 - Math.min(1, s / P)); };
    if (instant) { draw(1); return Promise.resolve(); }
    return tween(ms, draw);
  };
  /* light one edge at a time, number it, and move Dot to its far end */
  const countEdges = async (svg, r, instant, alive, ms = 300) => {
    const E = edgesOf(r);
    for (let j = 0; j < E.length; j++) {
      $(`.pm-edge[data-j="${j}"]`, svg).classList.add('on');
      $(`.pm-en[data-j="${j}"]`, svg).classList.add('show');
      putBug(svg, { x: E[j].x2, y: E[j].y2, side: E[j].side });
      if (!await pause(ms, instant, alive)) return false;
    }
    return true;
  };

  /* ---------- 1. walking all the way round ---------- */
  const R1 = box(6, 3, 52, 240, 196);
  const sceneRound = () => {
    const r = R1, sprouts = [];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) {
      const cx = r.x + (i + 0.5) * r.u, cy = r.y + (j + 0.5) * r.u + 6;
      sprouts.push(`<g transform="translate(${f1(cx)},${f1(cy)})"><path d="M0 0V-12" class="sp-stem"/><path d="M0-8C-9-14-12-6-12-6S-5-3 0-8zM0-10C8-17 12-9 12-9S5-5 0-10z" class="sp-leaf"/></g>`);
    }
    return `<svg class="scene pm" viewBox="0 0 480 360" role="img" aria-label="Dot the ladybird at the corner of a vegetable patch, ready to walk round the edge.">
      <rect class="pm-soil" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6"/>
      <g class="pm-inside">${sprouts.join('')}</g>
      <path class="pm-fence" d="${outline(r)}"/>
      <path class="pm-trail" pathLength="1" d="${outline(r)}"/>
      <g class="pop pm-pill"><rect x="150" y="38" width="180" height="44" rx="22"/><text x="240" y="67">perimeter</text></g>
      <g class="pop pm-tag-in"><rect x="186" y="${f1(r.y + r.h / 2 - 20)}" width="108" height="40" rx="20"/><text x="240" y="${f1(r.y + r.h / 2 + 6)}">inside</text></g>
      ${bugAt(r, 1.25)}
    </svg>`;
  };

  /* ---------- 2. counting edges on squared paper ---------- */
  const R2 = box(4, 2, 56, 240, 186);
  const sceneCount = () => {
    const r = R2;
    return `<svg class="scene pm" viewBox="0 0 480 360" role="img" aria-label="A rectangle 4 squares long and 2 squares wide on squared paper. Each square has sides of 1 centimetre.">
      ${paper(r, 2)}<rect class="pm-fill" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/>
      ${edgeLines(r)}${edgeNums(r, 19, 20)}
      <g class="pop pm-key"><path d="M${f1(r.x - 2 * r.u)},${f1(r.y + r.h + 2 * r.u - 26)}h${r.u}" class="pm-key-l"/><text x="${f1(r.x - r.u)}" y="${f1(r.y + r.h + 2 * r.u - 36)}">1 cm</text></g>
      <g class="pop pm-total"><rect x="140" y="304" width="200" height="44" rx="22"/><text x="240" y="333">12 edges = 12 cm</text></g>
      ${bugAt(r, 1.1)}
    </svg>`;
  };

  /* ---------- 3. opposite sides are equal ---------- */
  const R3 = box(5, 3, 56, 240, 168);
  const sceneSides = () => {
    const r = R3;
    return `<svg class="scene pm" viewBox="0 0 480 360" role="img" aria-label="A rectangle 5 centimetres long and 3 centimetres wide.">
      <rect class="pm-fill solid" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="4"/>
      <line class="pm-side len" data-side="top" x1="${r.x}" y1="${r.y}" x2="${r.x + r.w}" y2="${r.y}"/>
      <line class="pm-side wid" data-side="right" x1="${r.x + r.w}" y1="${r.y}" x2="${r.x + r.w}" y2="${r.y + r.h}"/>
      <line class="pm-side len" data-side="bottom" x1="${r.x + r.w}" y1="${r.y + r.h}" x2="${r.x}" y2="${r.y + r.h}"/>
      <line class="pm-side wid" data-side="left" x1="${r.x}" y1="${r.y + r.h}" x2="${r.x}" y2="${r.y}"/>
      ${sideLabel(r, 'top', '5 cm')}${sideLabel(r, 'right', '3 cm')}${sideLabel(r, 'bottom', '5 cm', 'pop')}${sideLabel(r, 'left', '3 cm', 'pop')}
      <g class="rise pm-sum"><text x="240" y="330"><tspan class="len">5</tspan> + <tspan class="wid">3</tspan> + <tspan class="len">5</tspan> + <tspan class="wid">3</tspan> = 16 cm</text></g>
    </svg>`;
  };

  /* ---------- 4. edges, not squares ---------- */
  const R4 = box(3, 2, 62, 272, 228);
  const sceneInside = () => {
    const r = R4;
    return `<svg class="scene pm" viewBox="0 0 480 360" role="img" aria-label="A rectangle 3 squares long and 2 squares wide. Mia has numbered the 6 squares inside.">
      ${friend(60, 62, 'Mia', 'rose')}
      <g class="bubble"><path d="M124 34h300a14 14 0 0114 14v30a14 14 0 01-14 14H146l-22 12 6-14a14 14 0 01-6-12V48a14 14 0 010-14z"/><text x="281" y="69">6 squares, so the perimeter is 6 cm!</text></g>
      ${paper(r, 1)}<rect class="pm-fill" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/>
      ${squareNums(r)}${edgeLines(r)}${edgeNums(r, 18, 19)}
      <g class="pop pm-total"><rect x="152" y="318" width="240" height="38" rx="19"/><text x="272" y="343">10 edges = 10 cm</text></g>
      ${bugAt(r, 1)}
    </svg>`;
  };

  /* ---------- 5. same perimeter, different rectangles ---------- */
  const sceneSame = () => {
    const u = 26, base = 214, specs = [[5, 1, 74], [4, 2, 238], [3, 3, 390]];
    const one = ([cw, ch, cx], i) => {
      const r = { x: cx - cw * u / 2, y: base - ch * u, w: cw * u, h: ch * u, cw, ch, u };
      return `<g class="${i ? 'rise' : ''}" data-r="${i}">${paper(r, 1, 'pm-grid soft')}<rect class="pm-fill" x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}"/>
        <path class="pm-out" d="${outline(r)}"/>
        <text class="pm-dim" x="${cx}" y="${base + 56}">${cw} cm by ${ch} cm</text>
        <text class="pm-eq" x="${cx}" y="${base + 84}">${cw} + ${ch} + ${cw} + ${ch}</text>
        <g class="pm-badge"><rect x="${cx - 40}" y="${base + 98}" width="80" height="34" rx="17"/><text x="${cx}" y="${base + 121}">12 cm</text></g></g>`;
    };
    return `<svg class="scene pm" viewBox="0 0 480 360" role="img" aria-label="Three rectangles: 5 by 1, 4 by 2 and 3 by 3 centimetres. Each has a perimeter of 12 centimetres.">
      ${specs.map(one).join('')}
      <g class="pop pm-pill"><rect x="120" y="22" width="240" height="44" rx="22"/><text x="240" y="51">all 12 cm round</text></g>
    </svg>`;
  };

  /* ---------- small pictures: perimeter in real life ---------- */
  const ART = {
    fence() {
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="16" y="30" width="88" height="62" rx="4" style="fill:var(--pad)"/>
        <circle cx="44" cy="58" r="8" style="fill:var(--pep)"/><circle cx="72" cy="66" r="8" style="fill:var(--sun)"/><path d="M44 66v10M72 74v8" style="stroke:var(--frog-2);stroke-width:3"/>
        <rect x="16" y="30" width="88" height="62" rx="4" style="fill:none;stroke:var(--crust-2);stroke-width:5;stroke-dasharray:9 5"/>
        <path d="M16 22v16M38 22v16M60 22v16M82 22v16M104 22v16" style="stroke:var(--ink);stroke-width:3;stroke-linecap:round"/></svg>`;
    },
    frame() {
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="22" y="18" width="76" height="86" rx="6" style="fill:var(--surface);stroke:var(--ink);stroke-width:3"/>
        <rect x="32" y="28" width="56" height="66" rx="3" style="fill:var(--blue-soft)"/><path d="M36 84l16-20 10 12 8-8 14 16z" style="fill:var(--teal)"/><circle cx="72" cy="44" r="7" style="fill:var(--sun)"/>
        <rect x="22" y="18" width="76" height="86" rx="6" style="fill:none;stroke:var(--rose);stroke-width:5;stroke-dasharray:6 6"/>
        <path d="M60 104c-8 6-14 6-14 0s10-4 14 0c4-4 14-6 14 0s-6 6-14 0" style="fill:var(--rose-soft);stroke:var(--rose);stroke-width:3"/></svg>`;
    },
    track() {
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="10" y="26" width="100" height="68" rx="34" style="fill:var(--orange);stroke:var(--ink);stroke-width:3"/>
        <rect x="26" y="42" width="68" height="36" rx="18" style="fill:var(--pad);stroke:var(--ink);stroke-width:3"/>
        <rect x="18" y="34" width="84" height="52" rx="26" style="fill:none;stroke:var(--surface);stroke-width:2;stroke-dasharray:5 5"/>
        <path d="M60 26v16" style="stroke:var(--surface);stroke-width:4"/></svg>`;
    },
  };
  const val = (v, words) => `<div class="bigfrac pm-big"><span class="pm-v">${v}</span><span>${words}</span></div>`;

  /* ---------- Learn ---------- */
  const learn = [
    { id: 'intro', title: 'Perimeter of Rectangles', intro: true, beats: [{ cta: "Let's start" }] },
    { id: 'round', title: 'All the way round', viz: sceneRound, beats: [
      { say: 'This is Dot the ladybird. Dot is going to walk <b>all the way round</b> the edge of the vegetable patch.', cta: 'Walk round', ico: 'hop',
        enter: null },
      { say: 'Dot walked round the outside and ended up back at the start. The distance all the way round is called the <b>perimeter</b>.', cta: 'Edge or inside?', ico: 'eye',
        enter: async (v, instant, alive) => {
          const svg = $('svg', v);
          putBug(svg, along(R1, 0));
          await walk(svg, R1, 0, 2 * (R1.w + R1.h), 3200, instant); if (!alive()) return;
          $('.pm-pill', svg).classList.add('show');
        } },
      { say: 'Perimeter is only about the <b>edge</b>. The vegetables inside do not count. Think of a fence going round a garden.',
        enter: v => { const svg = $('svg', v); svg.classList.add('is-edge'); $('.pm-tag-in', svg).classList.add('show'); } },
    ] },
    { id: 'count', title: 'Counting on squared paper', viz: sceneCount, beats: [
      { say: 'Here is a rectangle on squared paper. The side of each small square is <b>1 centimetre</b> long.', cta: 'Count the edges', ico: 'count',
        enter: null },
      { say: 'Count with Dot. Every <b>edge</b> on the outside gets a number, all the way back to the start.', cta: 'How long is that?', ico: 'ruler',
        enter: async (v, instant, alive) => { const svg = $('svg', v); $('.pm-key', svg).classList.add('show'); await countEdges(svg, R2, instant, alive, 380); } },
      { say: '<b>12 edges</b>, and each one is 1 cm long. So the perimeter of this rectangle is <b>12 cm</b>.', extra: () => val('12 cm', 'perimeter'),
        enter: v => { $('.pm-total', v).classList.add('show'); } },
    ] },
    { id: 'sides', title: 'Opposite sides are equal', viz: sceneSides, beats: [
      { say: `This rectangle is <span class="k-top">5 cm long</span> and <span class="k-bot">3 cm wide</span>. But a rectangle has <b>four</b> sides, not two.`, cta: 'Find the other sides', ico: 'eye' },
      { say: `In a rectangle, <b>opposite sides are the same length</b>. The bottom is <span class="k-top">5 cm</span> too, and the left side is <span class="k-bot">3 cm</span>.`, cta: 'Add all four', ico: 'plus',
        enter: async (v, instant, alive) => {
          const svg = $('svg', v);
          for (const s of ['bottom', 'left']) {
            $(`.pm-side[data-side="${s}"]`, svg).classList.add('glow');
            $(`.pm-lab[data-side="${s}"]`, svg).classList.add('show');
            if (!await pause(650, instant, alive)) return;
          }
        } },
      { say: `Add all four sides: <span class="k-top">5</span> + <span class="k-bot">3</span> + <span class="k-top">5</span> + <span class="k-bot">3</span> = <b>16 cm</b>.`, extra: () => val('16 cm', 'perimeter'),
        speak: 'Add all four sides. Five plus three plus five plus three equals sixteen centimetres.',
        enter: async (v, instant, alive) => {
          const svg = $('svg', v);
          $$('.pm-side', svg).forEach(s => s.classList.remove('glow'));
          for (const s of ['top', 'right', 'bottom', 'left']) { $(`.pm-side[data-side="${s}"]`, svg).classList.add('on'); if (!await pause(420, instant, alive)) return; }
          $('.pm-sum', svg).classList.add('show');
        } },
    ] },
    { id: 'inside', title: 'Edges, not squares', viz: sceneInside, beats: [
      { say: 'Mia counts the <b>squares inside</b>: 1, 2, 3, 4, 5, 6. She says the perimeter is 6 cm. Is Mia right?', gate: l => l.flags.inside != null,
        extra: l => l.flags.inside == null
          ? `<div class="choice-row"><button type="button" class="btn btn-lg" data-action="pm-inside" data-v="yes">Mia is right</button><button type="button" class="btn btn-lg" data-action="pm-inside" data-v="no">Not right</button></div>`
          : l.flags.inside === 'no' ? `<div class="verdict good">${icon('check', 20)}<span>Well spotted! Perimeter is the edges round the outside, not the squares inside.</span></div>`
            : `<div class="verdict oops">${icon('eye', 20)}<span>Remember Dot. Perimeter is how far it is <b>round the edge</b>. Watch what happens next.</span></div>` },
      { say: 'Count the <b>edges round the outside</b>, not the squares inside. There are <b>10 edges</b>, so the perimeter is <b>10 cm</b>.',
        enter: async (v, instant, alive) => {
          const svg = $('svg', v);
          $$('.pm-sq', svg).forEach(t => t.classList.add('dim'));
          if (!await countEdges(svg, R4, instant, alive, 330)) return;
          $('.pm-total', svg).classList.add('show');
        } },
    ] },
    { id: 'same', title: 'Same perimeter, new shape', viz: sceneSame, beats: [
      { say: 'This rectangle is 5 cm long and 1 cm wide. Its perimeter is 5 + 1 + 5 + 1 = <b>12 cm</b>.', speak: 'This rectangle is five centimetres long and one centimetre wide. Its perimeter is five plus one plus five plus one, which is twelve centimetres.', cta: 'Change the shape', ico: 'swap' },
      { say: 'Now look at these two. They are a different shape, but add up their sides.', cta: 'Compare them', ico: 'eye',
        enter: async (v, instant, alive) => { for (const g of $$('.rise', v)) { g.classList.add('show'); if (!await pause(600, instant, alive)) return; } } },
      { say: 'Every one has a perimeter of <b>12 cm</b>. Rectangles can look very different and still be the <b>same distance round</b>.',
        enter: v => { $('.pm-pill', v).classList.add('show'); $$('.pm-badge', v).forEach(b => b.classList.add('on')); } },
    ] },
    { id: 'everywhere', title: 'Perimeter is everywhere', beats: [
      { say: 'Whenever something goes <b>round the edge</b>, you are thinking about perimeter.', cta: 'Go to Explore',
        viz: () => `<div class="trio">
          <div class="trio-card">${ART.fence()}<b>A fence round a garden</b></div>
          <div class="trio-card">${ART.frame()}<b>Ribbon round a frame</b></div>
          <div class="trio-card">${ART.track()}<b>One lap of a track</b></div></div>` },
    ] },
  ];

  /* ---------- Explore: the fence builder ---------- */
  function mountFence(root, saved, onChange) {
    const st = Object.assign({ l: 4, w: 2, count: false }, saved || {});
    const MAXL = 10, MAXW = 6, u = 30, ox = 30, oy = 22;
    root.innerHTML = `<div class="lab lab-pm">
      <div class="lab-shape"><svg class="pm pm-lab-svg" viewBox="0 0 ${ox * 2 + MAXL * u} ${oy * 2 + MAXW * u + 4}" role="img"></svg></div>
      <div class="lab-side">
        <div class="lab-read pm-read" aria-live="polite"></div>
        <div class="pm-ctrls">
          <div class="pm-ctl"><span class="pm-ctl-l len">Length</span><div class="stepper-ctl"><button type="button" data-k="l" data-d="-1" aria-label="Shorter">${icon('minus')}</button><output data-o="l"></output><button type="button" data-k="l" data-d="1" aria-label="Longer">${icon('plus')}</button></div></div>
          <div class="pm-ctl"><span class="pm-ctl-l wid">Width</span><div class="stepper-ctl"><button type="button" data-k="w" data-d="-1" aria-label="Narrower">${icon('minus')}</button><output data-o="w"></output><button type="button" data-k="w" data-d="1" aria-label="Wider">${icon('plus')}</button></div></div>
        </div>
        <div class="shape-toggle"><button type="button" data-count aria-pressed="false">${icon('count', 16)} Count the edges</button></div>
        <p class="q-help">${icon('tap', 18)} Drag the orange corner, or use the buttons.</p>
      </div></div>`;
    const svg = $('svg', root), readEl = $('.lab-read', root);
    const get = () => ({ l: st.l, w: st.w, count: st.count, p: 2 * (st.l + st.w) });
    function draw() {
      const r = { x: ox, y: oy, w: st.l * u, h: st.w * u, cw: st.l, ch: st.w, u };
      const full = { x: ox, y: oy, w: MAXL * u, h: MAXW * u, cw: MAXL, ch: MAXW, u };
      svg.innerHTML = `${paper(full, 0)}<rect class="pm-fill" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/>
        <line class="pm-side len on" x1="${r.x}" y1="${r.y}" x2="${r.x + r.w}" y2="${r.y}"/><line class="pm-side len on" x1="${r.x}" y1="${r.y + r.h}" x2="${r.x + r.w}" y2="${r.y + r.h}"/>
        <line class="pm-side wid on" x1="${r.x}" y1="${r.y}" x2="${r.x}" y2="${r.y + r.h}"/><line class="pm-side wid on" x1="${r.x + r.w}" y1="${r.y}" x2="${r.x + r.w}" y2="${r.y + r.h}"/>
        ${st.count ? edgesOf(r).map((e, j) => `<circle class="pm-tick" cx="${f1((e.x1 + e.x2) / 2)}" cy="${f1((e.y1 + e.y2) / 2)}" r="8.5"/><text class="pm-tn" x="${f1((e.x1 + e.x2) / 2)}" y="${f1((e.y1 + e.y2) / 2 + 3.5)}">${j + 1}</text>`).join('') : ''}
        <circle class="pm-handle" cx="${r.x + r.w}" cy="${r.y + r.h}" r="11"/>`;
      svg.setAttribute('aria-label', `A rectangle ${st.l} centimetres long and ${st.w} centimetres wide on squared paper. Perimeter ${2 * (st.l + st.w)} centimetres.`);
      const sq = st.l === st.w;
      readEl.innerHTML = `<span class="pm-v">${2 * (st.l + st.w)}<small> cm</small></span><div class="lab-words"><b>${sq ? 'A square!' : 'Perimeter'}</b>
        <span><span class="k-top">${st.l}</span> + <span class="k-bot">${st.w}</span> + <span class="k-top">${st.l}</span> + <span class="k-bot">${st.w}</span> = ${2 * (st.l + st.w)} cm</span></div>`;
      $('[data-o="l"]', root).innerHTML = `<b>${st.l} cm</b>long`;
      $('[data-o="w"]', root).innerHTML = `<b>${st.w} cm</b>wide`;
      $$('[data-k]', root).forEach(b => { const k = b.dataset.k, max = k === 'l' ? MAXL : MAXW; b.disabled = (+b.dataset.d < 0 && st[k] <= 1) || (+b.dataset.d > 0 && st[k] >= max); });
      $('[data-count]', root).setAttribute('aria-pressed', st.count);
    }
    const set = (l, w) => { l = clamp(l, 1, MAXL); w = clamp(w, 1, MAXW); if (l === st.l && w === st.w) return; st.l = l; st.w = w; draw(); onChange(get()); };
    let drag = false;
    const fromPointer = e => { const b = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, x = (e.clientX - b.left) / b.width * vb.width, y = (e.clientY - b.top) / b.height * vb.height; set(Math.round((x - ox) / u), Math.round((y - oy) / u)); };
    svg.addEventListener('pointerdown', e => { if (!e.target.closest('.pm-handle')) return; drag = true; try { svg.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); });
    svg.addEventListener('pointermove', e => { if (drag) fromPointer(e); });
    svg.addEventListener('pointerup', () => { drag = false; });
    svg.addEventListener('pointercancel', () => { drag = false; });
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-k]');
      if (b) { const k = b.dataset.k; k === 'l' ? set(st.l + +b.dataset.d, st.w) : set(st.l, st.w + +b.dataset.d); }
      if (e.target.closest('[data-count]')) { st.count = !st.count; draw(); onChange(get()); }
    });
    draw();
    return { get };
  }
  const missions = [
    { t: 'Make a rectangle with a perimeter of <b>10 cm</b>', ok: s => s.p === 10, win: s => `${s.l} + ${s.w} + ${s.l} + ${s.w} = 10 cm.` },
    { t: 'Make a <b>square</b>', ok: s => s.l === s.w, win: s => `All four sides are ${s.l} cm, so the perimeter is ${s.p} cm.` },
    { t: 'Make a square with a perimeter of <b>16 cm</b>', ok: s => s.l === s.w && s.p === 16, win: () => '4 + 4 + 4 + 4 = 16 cm.' },
    { t: 'Make a rectangle <b>1 cm wide</b> with a perimeter of <b>14 cm</b>', ok: s => s.w === 1 && s.p === 14, win: () => '6 + 1 + 6 + 1 = 14 cm.' },
    { t: 'Make the <b>biggest perimeter</b> you can', ok: s => s.p === 32, win: () => '10 + 6 + 10 + 6 = 32 cm. That is a lot of fence!' },
  ];

  /* ---------- Guided examples ---------- */
  const exGrid = (cw, ch) => {
    const u = Math.min(52, 300 / (cw + 2), 200 / (ch + 2)), r = box(cw, ch, u, 240, 120);
    return { r, html: `<svg class="pm ex-pm" viewBox="0 0 480 240" role="img" aria-label="A rectangle ${cw} squares long and ${ch} squares wide on squared paper">${paper(r, 1)}<rect class="pm-fill" x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}"/>${edgeLines(r)}${edgeNums(r, 16, 15)}${bugAt(r, 0.9)}</svg>` };
  };
  const exRect = (cw, ch, l, w, more = '') => {
    const u = Math.min(46, 300 / cw, 150 / ch), r = box(cw, ch, u, 240, 112);
    return `<svg class="pm ex-pm" viewBox="0 0 480 240" role="img" aria-label="A ${cw === ch ? 'square' : 'rectangle'} with sides ${l} and ${w}">
      <rect class="pm-fill solid" x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}" rx="3"/>
      <line class="pm-side len" data-side="top" x1="${f1(r.x)}" y1="${f1(r.y)}" x2="${f1(r.x + r.w)}" y2="${f1(r.y)}"/>
      <line class="pm-side wid" data-side="right" x1="${f1(r.x + r.w)}" y1="${f1(r.y)}" x2="${f1(r.x + r.w)}" y2="${f1(r.y + r.h)}"/>
      <line class="pm-side len" data-side="bottom" x1="${f1(r.x)}" y1="${f1(r.y + r.h)}" x2="${f1(r.x + r.w)}" y2="${f1(r.y + r.h)}"/>
      <line class="pm-side wid" data-side="left" x1="${f1(r.x)}" y1="${f1(r.y)}" x2="${f1(r.x)}" y2="${f1(r.y + r.h)}"/>
      ${sideLabel(r, 'top', l)}${sideLabel(r, 'right', w)}${sideLabel(r, 'bottom', l, 'pop')}${sideLabel(r, 'left', w, 'pop')}${more}
    </svg>`;
  };
  const lightSides = (sides, cls = 'on') => async (c, instant, alive) => {
    const s = c.svg();
    for (const side of sides) { $(`.pm-side[data-side="${side}"]`, s).classList.add(cls); const lab = $(`.pm-lab[data-side="${side}"]`, s); if (lab) lab.classList.add('show'); if (!await pause(450, instant, alive)) return; }
  };
  const countRange = (cw, ch, from, to) => async (c, instant, alive) => {
    const s = c.svg(), r = exGrid(cw, ch).r, E = edgesOf(r);
    for (let j = from; j < to; j++) {
      $(`.pm-edge[data-j="${j}"]`, s).classList.add('on'); $(`.pm-en[data-j="${j}"]`, s).classList.add('show');
      putBug(s, { x: E[j].x2, y: E[j].y2, side: E[j].side });
      if (!await pause(300, instant, alive)) return;
    }
  };
  const examples = [
    { q: 'Each square is 1 cm long. Find the perimeter of this rectangle.', stack: true, view: () => exGrid(5, 2).html, ans: { v: 14, unit: 'cm' }, steps: [
      { t: '<b>Start at a corner.</b> Count the edges along the top: <b>5</b>.', run: countRange(5, 2, 0, 5) },
      { t: 'Keep going down the side: <b>2</b> more. That makes 7.', run: countRange(5, 2, 5, 7) },
      { t: 'Along the bottom and back up to the start: 5 + 2 more. That makes <b>14</b>.', run: countRange(5, 2, 7, 14) },
      { t: '14 edges of 1 cm each. The perimeter is <b>14 cm</b>.', answer: true, show: 'n' },
    ] },
    { q: 'A rectangle is 7 cm long and 3 cm wide. Find its perimeter.', stack: true, view: () => exRect(7, 3, '7 cm', '3 cm'), ans: { v: 20, unit: 'cm' }, steps: [
      { t: `<b>Find the missing sides.</b> Opposite sides are equal, so the bottom is <span class="k-top">7 cm</span> and the left side is <span class="k-bot">3 cm</span>.`, run: lightSides(['bottom', 'left'], 'glow') },
      { t: `<b>Add all four sides</b>: <span class="k-top">7</span> + <span class="k-bot">3</span> + <span class="k-top">7</span> + <span class="k-bot">3</span>.`, run: c => { $$('.pm-side', c.svg()).forEach(s => { s.classList.remove('glow'); s.classList.add('on'); }); } },
      { t: 'Your turn. What is 7 + 3 + 7 + 3?', pick: [10, 17, 20], right: 20, why: 'Yes! 7 + 3 = 10, and two lots of 10 is 20.', miss: 'Add all four numbers, not just two. Try 7 + 3 first, then do it again.' },
      { t: 'The perimeter is <b>20 cm</b>.', answer: true, show: 'n' },
    ] },
    { q: 'A square field has sides of 9 m. How much fence is needed to go all the way round?', stack: true, view: () => exRect(3, 3, '9 m', '9 m'), ans: { v: 36, unit: 'm' }, steps: [
      { t: '<b>A square has four equal sides.</b> Every side is 9 m.', run: lightSides(['bottom', 'left'], 'glow') },
      { t: 'The fence goes round all four sides: 9 + 9 + 9 + 9.', run: lightSides(['top', 'right', 'bottom', 'left']) },
      { t: 'Your turn. How many metres of fence?', pick: [18, 27, 36], right: 36, why: 'Yes! Four lots of 9 is 36.', miss: 'Count every side of the square. There are four sides of 9 m.' },
      { t: 'The fence is <b>36 m</b> long. The units are metres, so the answer is in metres.', answer: true, show: 'n' },
    ] },
  ];

  /* ---------- Questions ---------- */
  const gridView = (cw, ch, u = 34) => () => { const r = box(cw, ch, u, 180, 110); return `<svg class="pm q-pm" viewBox="0 0 360 220" role="img" aria-label="A rectangle ${cw} squares long and ${ch} squares wide on squared paper. Each square is 1 centimetre.">${paper(r, 1)}<rect class="pm-fill" x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}"/><path class="pm-out" d="${outline(r)}"/></svg>`; };
  const rectView = (cw, ch, l, w, o = {}) => () => {
    const u = Math.min(40, 230 / cw, 120 / ch), r = box(cw, ch, u, 180, 106);
    return `<svg class="pm q-pm" viewBox="0 0 360 220" role="img" aria-label="${o.label || `A shape with sides ${l} and ${w}`}">
      <rect class="pm-fill solid" x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}" rx="3"/>
      <path class="pm-out" d="${outline(r)}"/>${o.mark ? `<line class="pm-side ${o.mark === 'bottom' ? 'len' : 'wid'} glow" x1="${f1(r.x)}" y1="${f1(r.y + r.h)}" x2="${f1(r.x + r.w)}" y2="${f1(r.y + r.h)}"/>` : ''}
      ${l ? sideLabel(r, 'top', l) : ''}${w ? sideLabel(r, o.wside || 'right', w) : ''}${o.q ? `<text class="pm-lab len" x="${f1(r.x + r.w / 2)}" y="${f1(r.y + r.h + 30)}" style="text-anchor:middle">?</text>` : ''}
    </svg>`;
  };
  const optGrid = (cw, ch) => ({ html: () => { const u = 22, r = box(cw, ch, u, 90, 52); return `<svg class="pm opt-pm" viewBox="0 0 180 104" aria-hidden="true">${paper(r, 1, 'pm-grid soft')}<rect class="pm-fill" x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}"/><path class="pm-out" d="${outline(r)}"/></svg>`; }, label: `A rectangle ${cw} squares by ${ch} squares` });
  const T = t => ({ t });
  const skills = { count: 'counting edges on squared paper', add: 'adding all four sides', opposite: 'using equal opposite sides', square: 'the perimeter of a square',
    inside: 'counting edges, not squares inside', word: 'perimeter word problems', meaning: 'what perimeter means', compare: 'comparing perimeters' };
  const practice = [
    { skill: 'count', type: 'num', unit: 'cm', prompt: 'Each square is 1 cm long. What is the perimeter of this rectangle?', view: gridView(3, 2), ans: 10,
      hints: ['Put your finger on a corner and count each edge as you go round the outside.', 'The top has 3 edges and the side has 2. Keep going all the way round.'],
      wrongFn: v => v === 6 ? 'You counted the squares inside. Perimeter is the edges round the outside.' : v === 5 ? 'You counted only two sides. Go all the way round: there are four sides.' : 'Count the edges round the outside, one at a time, back to where you started.',
      why: '3 + 2 + 3 + 2 = 10 edges of 1 cm. The perimeter is 10 cm.' },
    { skill: 'add', type: 'pick', prompt: 'What is the perimeter of this rectangle?', view: rectView(6, 2, '6 cm', '2 cm'), opts: [T('8 cm'), T('12 cm'), T('16 cm'), T('14 cm')], ans: 2,
      hints: ['A rectangle has four sides. Two are 6 cm and two are 2 cm.', 'Add 6 + 2 + 6 + 2.'],
      wrong: { 0: 'You added only two sides. The bottom and left side count too.', 1: 'You multiplied 6 by 2. For perimeter, add all four sides.', 3: 'Check your adding: 6 + 2 + 6 + 2.' },
      why: 'Opposite sides are equal, so add 6 + 2 + 6 + 2 = 16 cm.' },
    { skill: 'opposite', type: 'num', unit: 'cm', prompt: 'How long is the <b>bottom</b> side of this rectangle?', view: rectView(8, 3, '8 cm', '3 cm', { q: true, mark: 'bottom', wside: 'left' }), ans: 8,
      hints: ['Which side is opposite the bottom?', 'The top side is opposite the bottom, and opposite sides of a rectangle are equal.'],
      wrongFn: v => v === 3 ? 'That is the length of the short side. The bottom is opposite the top.' : v === 11 || v === 22 ? 'That is adding sides together. Just find the length of the bottom side.' : 'Opposite sides of a rectangle are the same length. Look at the top.',
      why: 'The bottom is opposite the top, so it is also 8 cm.' },
    { skill: 'square', type: 'num', unit: 'cm', prompt: 'A square has sides of 5 cm. What is its perimeter?', view: rectView(3, 3, '5 cm', null, { label: 'A square with sides of 5 centimetres' }), ans: 20,
      hints: ['A square has four sides, and they are all the same length.', 'Add 5 + 5 + 5 + 5.'],
      wrongFn: v => v === 25 ? 'You multiplied 5 by 5. For perimeter, add the four sides: 5 + 5 + 5 + 5.' : v === 10 ? 'That is only two sides. A square has four.' : v === 15 ? 'That is three sides. Do not forget the fourth!' : 'Add all four sides of the square.',
      why: 'All four sides are 5 cm: 5 + 5 + 5 + 5 = 20 cm.' },
    { skill: 'compare', type: 'pick', wide: true, prompt: 'Each square is 1 cm. Which rectangle has the <b>longer</b> perimeter?', opts: [optGrid(6, 1), optGrid(3, 3)], ans: 0,
      hints: ['Work out the perimeter of each one by counting the edges.', 'The first is 6 + 1 + 6 + 1. The second is 3 + 3 + 3 + 3.'],
      wrong: { 1: 'The square looks bigger, but count the edges. 3 + 3 + 3 + 3 = 12, and 6 + 1 + 6 + 1 = 14.' },
      why: 'The long thin rectangle is 14 cm round. The square is 12 cm round. Bigger-looking does not always mean a longer perimeter.' },
    { skill: 'inside', type: 'pick', col: true, prompt: 'Tom says, "This rectangle has 8 squares inside, so its perimeter is 8 cm." Is Tom right?', view: gridView(4, 2), opts: [T('Yes, Tom is right'), T('No, Tom is not right')], ans: 1,
      hints: ['Is perimeter the inside or the edge?', 'Count the edges round the outside.'],
      wrong: { 0: 'Tom counted the squares inside. Perimeter is how far it is round the edge.' },
      why: 'Perimeter is the edges round the outside: 4 + 2 + 4 + 2 = 12 cm, not 8 cm.' },
    { skill: 'word', type: 'num', unit: 'cm', prompt: 'A photo frame is 10 cm long and 4 cm wide. Lily puts ribbon all the way round the edge. How much ribbon does she need?', ans: 28,
      hints: ['Draw the frame. Write the length of every side.', 'Add 10 + 4 + 10 + 4.'],
      wrongFn: v => v === 14 ? 'That goes only half way round. Add all four sides.' : v === 40 ? 'You multiplied. Ribbon goes round the edge, so add the four sides.' : 'The ribbon goes round all four sides: 10 + 4 + 10 + 4.',
      why: 'The ribbon goes round all four sides: 10 + 4 + 10 + 4 = 28 cm.' },
    { skill: 'count', type: 'pick', wide: true, prompt: 'Each square is 1 cm. Which rectangle has a perimeter of <b>12 cm</b>?', opts: [optGrid(3, 2), optGrid(4, 2), optGrid(5, 2), optGrid(4, 4)], ans: 1,
      hints: ['Work out each perimeter: length + width + length + width.', 'For 12 cm, length + width must make 6.'],
      wrong: { 0: '3 + 2 + 3 + 2 = 10 cm. Try another.', 2: '5 + 2 + 5 + 2 = 14 cm. Try another.', 3: '4 + 4 + 4 + 4 = 16 cm. Try another.' },
      why: '4 + 2 + 4 + 2 = 12 cm.' },
  ];
  const mastery = [
    { skill: 'count', type: 'num', unit: 'cm', prompt: 'Each square is 1 cm long. What is the perimeter of this rectangle?', view: gridView(4, 3, 30), ans: 14, why: 'Count the edges round the outside: 4 + 3 + 4 + 3 = 14 cm.' },
    { skill: 'add', type: 'num', unit: 'cm', prompt: 'What is the perimeter of this rectangle?', view: rectView(9, 2, '9 cm', '2 cm'), ans: 22, why: 'Opposite sides are equal: 9 + 2 + 9 + 2 = 22 cm.' },
    { skill: 'square', type: 'pick', prompt: 'A square has sides of 7 cm. What is its perimeter?', opts: [T('14 cm'), T('21 cm'), T('28 cm'), T('49 cm')], ans: 2, why: 'A square has four equal sides: 7 + 7 + 7 + 7 = 28 cm.' },
    { skill: 'word', type: 'num', unit: 'm', prompt: 'A garden is a rectangle 12 m long and 5 m wide. How many metres of fence go all the way round it?', ans: 34, why: 'The fence goes round all four sides: 12 + 5 + 12 + 5 = 34 m.' },
    { skill: 'meaning', type: 'pick', col: true, prompt: 'What is the <b>perimeter</b> of a shape?',
      opts: [T('The number of squares inside it'), T('The distance all the way round the outside'), T('The length of its longest side'), T('The number of corners it has')], ans: 1,
      why: 'Perimeter is the distance all the way round the outside of a shape.' },
  ];

  /* ---------- what the teacher says and writes (board is 900 x 600, squares of 30) ---------- */
  const { w, line, box: bx, und, tick, cross, loop, star, think, num, arrow, shadeR } = Teacher.ops;
  const unitEdges = (x, y, cw, ch, u, c, gap = 60) => {      // short strokes along each unit edge, clockwise from the top-left
    const E = edgesOf({ x, y, w: cw * u, h: ch * u, cw, ch, u });
    return E.map(e => line(e.x1, e.y1, e.x2, e.y2, { c, wd: 6, gap, dur: 160 }));
  };
  const script = [
    { title: 'What is perimeter?', steps: [
      { say: 'Hello! Today we are learning about perimeter.', ops: [w('Perimeter', 56, 96, { size: 70, b: 1, c: 'blue', id: 't1' }), und('t1', { c: 'orange' })] },
      { say: 'Here is a garden. I will draw a fence all the way round the edge.', ops: [bx(240, 210, 420, 240, { dur: 1600 }), w('garden', 380, 345, { size: 42, c: 'grey' })] },
      { say: 'If I walk round the fence, starting here, and come back to the start...', ops: [loop(240, 210, 18, 18, { c: 'orange' }), arrow(280, 186, 420, 186, { c: 'orange' }), arrow(684, 240, 684, 400, { c: 'orange' }), arrow(620, 474, 460, 474, { c: 'orange' }), arrow(216, 420, 216, 270, { c: 'orange' })] },
      { say: 'the distance I walk is the perimeter. All the way round the outside.', ops: [w('= the distance all the way round', 120, 560, { size: 42, c: 'green', maxW: 680 })], hold: 1000 },
    ] },
    { title: 'Count the edges', steps: [
      { say: 'Let me draw a rectangle on the squared paper. Each square is one centimetre.', ops: [bx(210, 240, 360, 180, { dur: 1200 }), w('1 square = 1 cm', 600, 110, { size: 36, c: 'grey' })] },
      { say: 'To find the perimeter, I count the edges round the outside.', ops: unitEdges(210, 240, 4, 2, 90, 'orange', 40) },
      { say: 'Four along the top, two down, four along the bottom and two back up.', ops: [num(4, 390, 216, { c: 'orange', size: 44 }), num(2, 610, 340, { c: 'orange', size: 44 }), num(4, 390, 478, { c: 'orange', size: 44 }), num(2, 176, 340, { c: 'orange', size: 44 })] },
      { say: 'Four plus two plus four plus two makes twelve. The perimeter is twelve centimetres.', ops: [w('4 + 2 + 4 + 2 = 12 cm', 180, 560, { size: 46, c: 'green' })], hold: 1000 },
    ] },
    { title: 'Not the squares inside', steps: [
      { say: 'Be careful with this one.', ops: [w('Edges, not squares!', 56, 96, { size: 60, b: 1, id: 't3' }), und('t3', { c: 'orange' })] },
      { say: 'Some people count the squares inside. One, two, three, four, five, six.', ops: [bx(270, 210, 270, 180, { dur: 900 }), line(360, 210, 360, 390, { c: 'grey', wd: 2.5 }), line(450, 210, 450, 390, { c: 'grey', wd: 2.5 }), line(270, 300, 540, 300, { c: 'grey', wd: 2.5 }),
        ...[[315, 268], [405, 268], [495, 268], [315, 358], [405, 358], [495, 358]].map(([x, y], i) => num(i + 1, x, y, { c: 'rose', size: 40, gap: 120 }))] },
      { say: 'But that is not the perimeter. Have a think. What should we count?', ops: [cross(600, 280, { c: 'rose' }), think(3200)] },
      { say: 'The edges round the outside. Three, two, three, two. That makes ten.', ops: [...unitEdges(270, 210, 3, 2, 90, 'green', 30), w('3 + 2 + 3 + 2 = 10 cm', 200, 500, { size: 46, c: 'green' }), tick(700, 470, { c: 'green' })], hold: 1000 },
    ] },
    { title: 'Opposite sides', steps: [
      { say: 'Here is a rectangle with no squares. It is seven centimetres long and three centimetres wide.', ops: [bx(180, 180, 480, 210, { dur: 1100 }), w('7 cm', 380, 160, { size: 44, c: 'orange' }), w('3 cm', 690, 300, { size: 44, c: 'blue' })] },
      { say: 'Opposite sides of a rectangle are equal. So the bottom is seven, and this side is three.', ops: [w('7 cm', 380, 450, { size: 44, c: 'orange', wait: 400 }), w('3 cm', 70, 300, { size: 44, c: 'blue' })] },
      { say: 'What is the perimeter? Add all four sides. Have a go.', ops: [w('7 + 3 + 7 + 3 =', 150, 550, { size: 50, id: 's4' }), think(3600)] },
      { say: 'Twenty centimetres!', ops: [w('20 cm', '+s4', 550, { size: 50, c: 'green' }), loop(640, 536, 80, 40, { c: 'green' })], hold: 1000 },
    ] },
    { title: 'Remember', steps: [
      { say: "Let's remember three things.", ops: [w('Remember', 56, 96, { size: 66, b: 1, c: 'blue', id: 't5' }), und('t5', { c: 'orange' })] },
      { say: 'One. Perimeter is the distance all the way round the outside.', ops: [w('1.', 60, 206, { size: 42, c: 'blue' }), w('Perimeter = all the way round', 124, 206, { size: 40, maxW: 720 })] },
      { say: 'Two. On squared paper, count the edges, not the squares inside.', ops: [w('2.', 60, 296, { size: 42, c: 'blue' }), w('Count edges, not squares', 124, 296, { size: 40, maxW: 720 })] },
      { say: 'Three. A rectangle has two pairs of equal sides. Add all four.', ops: [w('3.', 60, 386, { size: 42, c: 'blue' }), w('Add all four sides', 124, 386, { size: 40, maxW: 720 }), shadeR(600, 356, 150, 70, { c: 'orange' }), bx(600, 356, 150, 70)] },
      { say: 'Now it is your turn. Help Dot measure some perimeters. You can do it!', ops: [star(520, 516, 30, { c: 'orange', wait: 800 }), w('Your turn!', 570, 536, { size: 60, b: 1, c: 'green' })], hold: 1400 },
    ] },
  ];

  addLesson({
    id: 'perimeter', topic: 'area', n: 1, title: 'Perimeter of Rectangles', level: 0, minutes: 15,
    blurb: 'Find the distance all the way round a rectangle, by counting edges and adding sides.',
    thumb: () => `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="16" y="28" width="68" height="44" rx="3" style="fill:var(--blue-soft)"/><path d="M16 28h68" style="stroke:var(--orange);stroke-width:7;stroke-linecap:round"/><path d="M84 28v44" style="stroke:var(--blue);stroke-width:7;stroke-linecap:round"/><path d="M84 72H16" style="stroke:var(--orange);stroke-width:7;stroke-linecap:round"/><path d="M16 72V28" style="stroke:var(--blue);stroke-width:7;stroke-linecap:round"/><circle cx="16" cy="28" r="8" style="fill:#E4572E;stroke:var(--ink);stroke-width:3"/></svg>`,
    homeTip: 'Pick a rectangle at home, like a book or a table mat. Measure two sides with a ruler, then work out the distance all the way round together.',
    intro: {
      say: 'Some measurements tell us how far it is <b>all the way round</b> a shape. That is called the <b>perimeter</b>. By the end of this lesson you will be able to:',
      speak: 'Some measurements tell us how far it is all the way round a shape. That is called the perimeter. Press the blue button to start.',
      goals: [['eye', 'Explain what perimeter means'], ['grid', 'Find a perimeter on squared paper'], ['plus', 'Add the sides of a rectangle to find its perimeter']],
      why: 'Fences, picture frames and running tracks are all about perimeter.',
      cards: () => [[ART.fence(), 'Fences'], [ART.frame(), 'Frames'], [ART.track(), 'Tracks']],
    },
    learn,
    learnActs: { 'pm-inside': (b, c) => { c.l.flags.inside = b.dataset.v; save(); c.setTalk(false); c.setCta(false); } },
    explore: { title: "Build Dot's fence", missions, mount: mountFence },
    examples, practice, mastery, skills,
    teacher: { script, poster: 1 },
    passSay: 'You showed that you can find the perimeter of a rectangle, all on your own.',
    canDo: ['I know perimeter is the distance all the way round', 'I count the edges, not the squares inside', 'I can add the four sides of a rectangle'],
  });
}
