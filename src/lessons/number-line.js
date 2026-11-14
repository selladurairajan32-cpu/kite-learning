/* =====================================================================
   Fractions · Lesson 2 · Fractions on a Number Line
   Story: Pip the frog crosses from 0 to 1 in equal jumps.
   Tool: the number-line lab.
   Big ideas, one at a time:
     fractions are numbers that live between 0 and 1
     the bottom number is how many equal jumps there are from 0 to 1
     the top number is how many jumps you make from 0
     count the jumps (the spaces), not the marks
   ===================================================================== */
{
  const X0 = 52, W = 376, K = 1.25;                       // the story's number line inside a 480 x 360 picture
  const xAt = (i, n) => X0 + (i / n) * W;
  const arc = (svg, j) => $(`.hop[data-j="${j}"]`, svg);
  const cnt = (svg, j) => $(`.jc[data-j="${j}"]`, svg);
  const pause = async (ms, instant, alive) => { if (!instant) await sleep(REDUCED ? 30 : ms); return alive(); };
  const frogAt = (x, y) => `<g class="frog" transform="translate(${f1(x)},${f1(y - 4)})"><g transform="scale(1.3)">${frogSVG()}</g></g>`;
  const drawOn = a => { a.classList.remove('off'); a.classList.add('on', 'wait'); void a.getBoundingClientRect(); a.classList.remove('wait'); };

  /* ---------- 1. the gap between 0 and 1 ---------- */
  const sceneBetween = () => {
    const y = 214;
    return `<svg class="scene nl" viewBox="0 0 480 360" role="img" aria-label="A number line showing 0, 1, 2 and 3. The gap between 0 and 1 is highlighted.">
      <rect class="gap" x="60" y="${y - 44}" width="120" height="68" rx="16"/>
      <text class="gap-q" x="120" y="${y - 58}">?</text>
      <line class="ax" x1="36" y1="${y}" x2="444" y2="${y}"/>
      ${[0, 1, 2, 3].map(i => `<g data-w="${i}" transform="translate(${60 + i * 120},0)"><line class="tk end" x1="0" y1="${y - 14}" x2="0" y2="${y + 14}"/><text class="tn" x="0" y="${y + 56}">${i}</text></g>`).join('')}
      ${[1, 2, 3].map(q => `<g data-q="${q}" transform="translate(${60 + q * 30},0)"><g class="pop"><line class="tk" x1="0" y1="${y - 10}" x2="0" y2="${y + 10}"/>${svgFrac(0, y + 52, q, 4, 22)}</g></g>`).join('')}
      <g class="pop zoom-note"><rect x="126" y="62" width="228" height="44" rx="22"/><text x="240" y="91">fractions live here</text></g>
    </svg>`;
  };
  const setZoom = (v, z) => {          // z = 0: a whole number is 120 wide.  z = 1: the gap from 0 to 1 fills the picture.
    const u = 120 + 240 * z;
    $$('[data-w]', v).forEach(g => g.setAttribute('transform', `translate(${f1(60 + g.dataset.w * u)},0)`));
    $$('[data-q]', v).forEach(g => g.setAttribute('transform', `translate(${f1(60 + g.dataset.q * u / 4)},0)`));
    $('.gap', v).setAttribute('width', f1(u));
    const q = $('.gap-q', v); q.setAttribute('x', f1(60 + u / 2)); q.style.opacity = f1(1 - z);
  };

  /* ---------- 2 and 3. Pip's crossing: four equal jumps ---------- */
  const sceneJumps = ({ y = 204, slots = false } = {}) => {
    const P = lineParts({ n: 4, counts: true }, { x0: X0, W, y, k: K });
    const pads = P.xs.map((x, i) => `<ellipse class="pad" cx="${f1(x)}" cy="${y + 1}" rx="${i === 0 || i === 4 ? 27 : 23}" ry="8.5"/>`).join('');
    const flower = `<g transform="translate(${f1(P.xs[4])},${y - 12})"><circle r="6" cy="-9" class="petal"/><circle r="6" cx="8.5" cy="-3" class="petal"/><circle r="6" cx="-8.5" cy="-3" class="petal"/><circle r="6" cx="5" cy="6" class="petal"/><circle r="6" cx="-5" cy="6" class="petal"/><circle r="4.5" class="pollen"/></g>`;
    const end = `<g class="tl" data-k="4"><rect x="${f1(P.xs[4] - 23)}" y="${y + 64}" width="46" height="52" rx="13" class="tl-pill"/>${svgFrac(f1(P.xs[4]), y + 87, 4, 4, 19)}</g>`;
    const build = !slots ? '' : `
      <rect class="slot" x="78" y="20" width="68" height="60" rx="13"/><rect class="slot" x="78" y="100" width="68" height="60" rx="13"/>
      <rect x="70" y="86.5" width="84" height="6.5" rx="3.2" style="fill:var(--ink)"/>
      <text class="pop n-top" x="112" y="68" style="font:800 48px var(--font-display);fill:var(--orange-ink);text-anchor:middle">3</text>
      <text class="pop n-bot" x="112" y="148" style="font:800 48px var(--font-display);fill:var(--blue);text-anchor:middle">4</text>
      <g class="rise labels">
        <path d="M156 50h18M156 130h18" style="stroke:var(--line-2);stroke-width:2.5;stroke-linecap:round"/>
        <text x="184" y="48" style="font:700 20px var(--font-body);fill:var(--orange-ink)">top number</text>
        <text x="184" y="69" style="font:500 15px var(--font-body);fill:var(--ink-2)">jumps made from 0</text>
        <text x="184" y="128" style="font:700 20px var(--font-body);fill:var(--blue)">bottom number</text>
        <text x="184" y="149" style="font:500 15px var(--font-body);fill:var(--ink-2)">equal jumps from 0 to 1</text>
      </g>`;
    return `<svg class="scene nl fig" data-y="${y}" viewBox="0 0 480 360" role="img" aria-label="Pip the frog on a number line from 0 to 1 with four equal jumps marked by lily pads">
      ${build}<rect class="pond" x="14" y="${y - (slots ? 90 : 104)}" width="452" height="${slots ? 166 : 232}" rx="38"/>
      ${pads}${P.arcs}${P.counts}${P.axis}${P.ticks}${P.labels}${slots ? '' : end}${slots ? '' : flower}${frogAt(P.xs[0], y)}
    </svg>`;
  };
  /* Pip makes jump number k: the trail is drawn, Pip lands, the place gets its name */
  const hopTo = k => async (v, instant, alive) => {
    const svg = $('svg', v), y = +svg.dataset.y, frog = $('.frog', svg), a = arc(svg, k - 1);
    if (instant) { a.classList.remove('off'); a.classList.add('on'); frog.setAttribute('transform', `translate(${f1(xAt(k, 4))},${y - 4})`); }
    else { drawOn(a); await hopAlong(frog, xAt(k - 1, 4), xAt(k, 4), y - 4, 640); if (!alive()) return; }
    const lab = $(`.tl[data-k="${k}"]`, svg); if (lab) lab.classList.add('show');
  };

  /* ---------- 4. count the jumps, not the marks ---------- */
  const sceneMarks = () => {
    const y = 232, P = lineParts({ n: 4 }, { x0: X0, W, y, k: K });
    return `<svg class="scene nl" viewBox="0 0 480 360" role="img" aria-label="A number line from 0 to 1 with 5 marks and 4 jumps. Leo has numbered the marks 1 to 5.">
      ${friend(60, 62, 'Leo', 'teal')}
      <g class="bubble"><path d="M124 34h236a14 14 0 0114 14v30a14 14 0 01-14 14H146l-22 12 6-14a14 14 0 01-6-12V48a14 14 0 010-14z"/><text x="249" y="69">5 marks, so it is cut into fifths!</text></g>
      ${P.arcs}${P.counts}${P.marks.replace(/class="mn"/g, 'class="mn show"')}${P.axis}${P.ticks}${P.labels}
      <g class="pop verdict-t"><rect x="112" y="296" width="256" height="44" rx="22"/><text x="240" y="325">4 equal jumps = quarters</text></g>
    </svg>`;
  };

  /* ---------- 5. the fraction bar fits the line ---------- */
  const sceneBarLine = () => {
    const y = 268, P = lineParts({ n: 4 }, { x0: X0, W, y, k: K });
    const parts = [0, 1, 2, 3].map(i => `<rect class="part" data-i="${i}" x="${f1(xAt(i, 4) + 3)}" y="36" width="88" height="62" rx="10"/>`).join('');
    return `<svg class="scene nl fig" viewBox="0 0 480 360" role="img" aria-label="A fraction bar with four equal parts above a number line with four equal jumps">
      ${P.axis}${P.ticks}${P.labels}<g class="barg">${parts}</g><circle class="mk" cx="${X0}" cy="${y}" r="10" style="opacity:0"/>
    </svg>`;
  };

  /* ---------- 6. more jumps, smaller jumps ---------- */
  const sceneSmaller = () => {
    const row = (n, y) => { const P = lineParts({ n, hops: 1 }, { x0: 100, W: 332, y, k: 1 }); return `${svgFrac(46, y - 6, 1, n, 24)}${P.arcs}${P.axis}${P.ticks}${P.labels}`; };
    const guide = [[2, 76, 1], [4, 186, 2], [8, 296, 4]].map(([n, y, k]) => `<circle class="mk" cx="266" cy="${y}" r="8"/>${svgFrac(292, y + 30, k, n, 17)}`).join('');
    return `<svg class="scene nl" viewBox="0 0 480 360" role="img" aria-label="Three number lines from 0 to 1, cut into 2, 4 and 8 equal jumps. The first jump gets smaller each time.">
      <g>${row(2, 76)}</g><g class="rise">${row(4, 186)}</g><g class="rise">${row(8, 296)}</g>
      <g class="rise guide"><line x1="266" y1="36" x2="266" y2="322"/>${guide}</g>
    </svg>`;
  };

  /* ---------- small pictures: number lines in real life ---------- */
  const ART = {
    jug() {
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><clipPath id="jug-in"><path d="M30 18h54v82a6 6 0 01-6 6H36a6 6 0 01-6-6z"/></clipPath></defs>
        <path d="M30 18h54v82a6 6 0 01-6 6H36a6 6 0 01-6-6z" style="fill:var(--surface)"/><rect x="30" y="46" width="54" height="62" clip-path="url(#jug-in)" style="fill:var(--orange)"/>
        <path d="M84 34h10a9 9 0 019 9v24a9 9 0 01-9 9H84" style="fill:none;stroke:var(--ink);stroke-width:3"/>
        <path d="M30 18h54v82a6 6 0 01-6 6H36a6 6 0 01-6-6zM30 18l-8 5 8 6" style="fill:none;stroke:var(--ink);stroke-width:3;stroke-linejoin:round"/>
        <path d="M31 28h16M31 46h11M31 64h16M31 82h11" style="stroke:var(--ink);stroke-width:2.5;stroke-linecap:round"/></svg>`;
    },
    walk() {
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M10 84h100" style="stroke:var(--ink);stroke-width:3.5;stroke-linecap:round"/>
        <path d="M14 76v16M37 79v10M60 79v10M83 79v10M106 76v16" style="stroke:var(--ink);stroke-width:2.5;stroke-linecap:round"/>
        <path d="M5 62l10-9 10 9v11H5z" style="fill:var(--surface);stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"/>
        <path d="M106 73V44h13l-4 5 4 5h-13" style="fill:var(--blue);stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"/>
        <path d="M60 70l-8-15a9 9 0 1116 0z" style="fill:var(--orange);stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"/><circle cx="60" cy="50" r="3" style="fill:var(--surface)"/></svg>`;
    },
    loading() {
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="10" y="20" width="100" height="62" rx="10" style="fill:var(--surface);stroke:var(--ink);stroke-width:3"/>
        <path d="M46 96h28M60 82v14" style="stroke:var(--ink);stroke-width:3;stroke-linecap:round"/>
        <rect x="22" y="44" width="76" height="16" rx="8" style="fill:var(--surface-2)"/><path d="M30 44h11v16H30a8 8 0 010-16z" style="fill:var(--orange)"/>
        <rect x="22" y="44" width="76" height="16" rx="8" style="fill:none;stroke:var(--ink);stroke-width:2.5"/><path d="M41 44v16M60 44v16M79 44v16" style="stroke:var(--ink);stroke-width:1.5"/></svg>`;
    },
  };
  const GLOSS = `<div class="gloss"><span class="g-top">Top number <small>jumps made from 0</small></span><span class="g-bot">Bottom number <small>equal jumps from 0 to 1</small></span></div>`;

  /* ---------- Learn ---------- */
  const learn = [
    { id: 'intro', title: 'Fractions on a Number Line', intro: true, beats: [{ cta: "Let's start" }] },
    { id: 'between', title: 'What lives between 0 and 1?', viz: sceneBetween, beats: [
      { say: 'Every whole number has its own place on the number line. But look at the <b>gap</b> between 0 and 1. Does anything live there?', cta: 'Zoom in', ico: 'eye' },
      { say: '<b>Fractions</b> live here! They are numbers too, and their home is <b>between 0 and 1</b>.',
        enter: async (v, instant, alive) => {
          if (instant) setZoom(v, 1); else { await tween(1100, z => setZoom(v, z)); if (!alive()) return; }
          $$('.pop', v).forEach(p => p.classList.add('show'));
        } },
    ] },
    { id: 'jumps', title: 'Equal jumps', viz: () => sceneJumps(), beats: [
      { say: 'This is Pip. Pip wants to cross from <b>0</b> to <b>1</b>, and always makes <b>equal jumps</b>. Today it takes 4 jumps.', cta: 'Jump', ico: 'hop' },
      { say: '<b>1 jump</b> out of 4. Pip is <b>one quarter</b> of the way.', speak: 'One jump out of four. Pip is one quarter of the way.', cta: 'Jump again', ico: 'hop', enter: hopTo(1) },
      { say: '<b>2 jumps</b> out of 4. That is <b>two quarters</b>.', cta: 'Jump again', ico: 'hop', enter: hopTo(2) },
      { say: '<b>3 jumps</b> out of 4: <b>three quarters</b>. Nearly there!', cta: 'Last jump', ico: 'hop', enter: hopTo(3) },
      { say: '<b>4 jumps</b> out of 4. Pip has reached <b>1</b>. Four quarters make <b>one whole</b>.', enter: hopTo(4),
        extra: () => `<div class="bigfrac">${frac(4, 4)}<span>= 1 whole</span></div>`, speak: 'Four jumps out of four. Pip has reached one. Four quarters make one whole.' },
    ] },
    { id: 'meaning', title: 'What the two numbers mean', viz: () => sceneJumps({ y: 276, slots: true }), beats: [
      { say: 'Where does <b>three quarters</b> live on the line? Let us build it, one number at a time.', cta: 'Count the jumps to 1', ico: 'count' },
      { say: `There are <span class="k-bot">4 equal jumps</span> from 0 to 1. That is the <span class="k-bot">bottom number</span>.`, cta: 'Make 3 jumps', ico: 'hop',
        enter: async (v, instant, alive) => {
          const svg = $('svg', v);
          for (let j = 0; j < 4; j++) { arc(svg, j).classList.remove('off'); cnt(svg, j).classList.add('show'); if (!await pause(400, instant, alive)) return; }
          $('.n-bot', v).classList.add('show');
        } },
      { say: `Pip makes <span class="k-top">3 jumps</span> from 0. That is the <span class="k-top">top number</span>.`,
        enter: async (v, instant, alive) => {
          const svg = $('svg', v), y = +svg.dataset.y, frog = $('.frog', svg);
          $$('.jc', svg).forEach(t => t.classList.remove('show'));
          for (let k = 1; k <= 3; k++) {
            const a = arc(svg, k - 1), t = cnt(svg, k - 1);
            if (instant) { a.classList.add('on'); frog.setAttribute('transform', `translate(${f1(xAt(k, 4))},${y - 4})`); }
            else { drawOn(a); await hopAlong(frog, xAt(k - 1, 4), xAt(k, 4), y - 4, 600); if (!alive()) return; }
            t.classList.add('show', 'top');
          }
          $('.n-top', v).classList.add('show');
        } },
      { say: 'Pip is sitting on <b>three quarters</b>: 3 jumps out of 4 equal jumps.', extra: () => GLOSS,
        enter: v => { const svg = $('svg', v); $$('.jc', svg).forEach(t => t.classList.remove('show')); $('.labels', v).classList.add('show'); $('.tl[data-k="3"]', svg).classList.add('show'); } },
    ] },
    { id: 'marks', title: 'Jumps, not marks', viz: sceneMarks, beats: [
      { say: 'Leo counts the <b>marks</b>: 1, 2, 3, 4, 5. He says the line is cut into <b>fifths</b>. Is Leo right?', gate: l => l.flags.marks != null,
        extra: l => l.flags.marks == null
          ? `<div class="choice-row"><button type="button" class="btn btn-lg" data-action="marks" data-v="yes">Leo is right</button><button type="button" class="btn btn-lg" data-action="marks" data-v="no">Not right</button></div>`
          : l.flags.marks === 'no' ? `<div class="verdict good">${icon('check', 20)}<span>Well spotted! There are 5 marks, but only 4 jumps between them.</span></div>`
            : `<div class="verdict oops">${icon('eye', 20)}<span>Look at the spaces between the marks. How many jumps would Pip need?</span></div>` },
      { say: 'Count the <b>jumps</b>, not the marks. There are <b>4 equal jumps</b>, so the line is cut into <b>quarters</b>.',
        enter: async (v, instant, alive) => {
          const svg = $('svg', v);
          $$('.mn', svg).forEach(t => t.classList.add('dim'));
          for (let j = 0; j < 4; j++) { arc(svg, j).classList.remove('off'); cnt(svg, j).classList.add('show'); if (!await pause(420, instant, alive)) return; }
          $('.verdict-t', svg).classList.add('show');
        } },
    ] },
    { id: 'bar', title: 'The bar and the line', viz: sceneBarLine, beats: [
      { say: 'Remember the <b>fraction bar</b> from the last lesson? It fits the number line exactly.', cta: 'Lay it on the line', ico: 'down' },
      { say: 'Each <b>part</b> of the bar is one <b>jump</b> on the line.', cta: 'Colour 3 parts', ico: 'tap',
        enter: async (v, instant, alive) => { v.classList.add('is-laid'); await pause(850, instant, alive); } },
      { say: 'The end of the third part lands on <b>three quarters</b>. One fraction, two pictures.', extra: () => `<div class="bigfrac">${frac(3, 4)}<span>three quarters</span></div>`,
        enter: async (v, instant, alive) => {
          const svg = $('svg', v), mk = $('.mk', svg);
          mk.style.opacity = 1;
          for (let i = 0; i < 3; i++) {
            $(`.part[data-i="${i}"]`, svg).classList.add('on');
            if (instant) mk.setAttribute('cx', f1(xAt(i + 1, 4)));
            else { await tween(380, u => mk.setAttribute('cx', f1(xAt(i, 4) + (xAt(i + 1, 4) - xAt(i, 4)) * u))); if (!alive()) return; }
            const lab = $(`.tl[data-k="${i + 1}"]`, svg); if (lab) lab.classList.add('show');
          }
        } },
    ] },
    { id: 'smaller', title: 'More jumps, smaller jumps', viz: sceneSmaller, beats: [
      { say: 'Here the line from 0 to 1 is cut into <b>2 equal jumps</b>. Each jump is one half.', cta: 'Cut it into more jumps', ico: 'cut' },
      { say: 'The more jumps there are from 0 to 1, the <b>smaller</b> each jump is. One eighth is a tiny jump!', cta: 'Look closer', ico: 'eye',
        enter: async (v, instant, alive) => { for (const g of $$('.rise:not(.guide)', v)) { g.classList.add('show'); if (!await pause(520, instant, alive)) return; } } },
      { say: 'Follow the dotted line. These three fractions all land on the <b>same spot</b>. You will explore that in the next lesson.',
        extra: () => `<div class="bigfrac fracrow">${frac(1, 2)}${frac(2, 4)}${frac(4, 8)}<span>same spot</span></div>`,
        speak: 'Follow the dotted line. One half, two quarters and four eighths all land on the same spot. You will explore that in the next lesson.',
        enter: v => { $('.guide', v).classList.add('show'); } },
    ] },
    { id: 'everywhere', title: 'Number lines are everywhere', beats: [
      { say: 'You read fractions on number lines all the time, even when they do not look like one.', cta: 'Go to Explore',
        viz: () => `<div class="trio">
          <div class="trio-card">${ART.jug()}${frac(3, 4)}<b>Three quarters of a litre</b></div>
          <div class="trio-card">${ART.walk()}${frac(1, 2)}<b>Half way to school</b></div>
          <div class="trio-card">${ART.loading()}${frac(1, 4)}<b>A quarter loaded</b></div></div>` },
    ] },
  ];

  /* ---------- Explore: the number-line lab ---------- */
  function mountLineLab(root, saved, onChange) {
    const st = Object.assign({ n: 4, k: 0, bar: false }, saved || {});
    root.innerHTML = `<div class="lab lab-line">
      <div class="lab-shape"><svg class="nl tap lab-svg" tabindex="0" role="slider" aria-label="Pip's place on the number line. Use the arrow keys to move." aria-valuemin="0"></svg></div>
      <div class="lab-side">
        <div class="lab-read" aria-live="polite"></div>
        <div class="lab-ctrl">
          <div class="stepper-ctl"><button type="button" data-d="-1" aria-label="Fewer jumps">${icon('minus')}</button><output></output><button type="button" data-d="1" aria-label="More jumps">${icon('plus')}</button></div>
          <div class="shape-toggle"><button type="button" data-bar aria-pressed="false">Show the bar</button></div>
        </div>
        <p class="q-help">${icon('tap', 18)} Tap a mark, or drag Pip along the line.</p>
      </div></div>`;
    const svg = $('.lab-svg', root), readEl = $('.lab-read', root), out = $('output', root), geo = { x0: 26, W: 308 };
    let busy = false, y = 0;
    const get = () => ({ n: st.n, k: st.k, bar: st.bar });
    function draw() {
      y = (st.bar ? 50 : 8) + 40 + 34;
      const P = lineParts({ n: st.n, at: st.k, mark: 'frog', hops: st.k, arcs: 'all' }, { ...geo, y });
      const bar = !st.bar ? '' : Array.from({ length: st.n }, (_, i) => `<rect class="part${i < st.k ? ' on' : ''}" x="${f1(P.xs[i] + 1.5)}" y="6" width="${f1(geo.W / st.n - 3)}" height="34" rx="6"/>`).join('');
      svg.setAttribute('viewBox', `0 0 360 ${y + 50}`);
      svg.innerHTML = bar + P.arcs + P.axis + P.ticks + P.labels.replace(`class="tl" data-k="${st.k}"`, `class="tl show" data-k="${st.k}"`) + P.marker
        + P.hits.replace(/ tabindex="0" role="button" aria-pressed="false" aria-label="[^"]*"/g, ' aria-hidden="true"');
      svg.classList.toggle('fig', st.bar);
      svg.setAttribute('aria-valuemax', st.n); svg.setAttribute('aria-valuenow', st.k); svg.setAttribute('aria-valuetext', `${fracWords(st.k, st.n)}, ${st.k} of ${st.n} jumps`);
      const whole = st.k === st.n;
      readEl.innerHTML = `${frac(st.k, st.n)}<div class="lab-words"><b>${cap(fracWords(st.k, st.n))}${whole ? ' = 1 whole' : ''}</b><span>${st.k} jump${st.k === 1 ? '' : 's'} out of ${st.n} equal jumps</span></div>`;
      out.innerHTML = `<b>${st.n}</b>equal jumps`;
      $$('.stepper-ctl button', root).forEach(b => { b.disabled = (b.dataset.d === '-1' && st.n <= 2) || (b.dataset.d === '1' && st.n >= 12); });
      $('[data-bar]', root).setAttribute('aria-pressed', st.bar);
    }
    async function moveTo(k, hop) {
      k = clamp(k, 0, st.n);
      if (k === st.k || busy) return;
      if (hop) {                                   // one hop to the new place before the picture is redrawn
        busy = true;
        const frog = $('.frog', svg), from = geo.x0 + st.k / st.n * geo.W, to = geo.x0 + k / st.n * geo.W;
        await hopAlong(frog, from, to, y - 2, 240 + 50 * Math.abs(k - st.k));
        busy = false;
      }
      st.k = k; draw(); onChange(get());
    }
    const nearest = e => { const r = svg.getBoundingClientRect(), u = (e.clientX - r.left) / r.width * 360; return Math.round(clamp((u - geo.x0) / geo.W, 0, 1) * st.n); };
    let drag = false, moved = false;
    svg.addEventListener('pointerdown', e => { drag = true; moved = false; try { svg.setPointerCapture(e.pointerId); } catch (x) { } });
    svg.addEventListener('pointermove', e => { if (!drag) return; const k = nearest(e); if (k !== st.k) { moved = true; moveTo(k, false); } });
    svg.addEventListener('pointerup', e => { if (drag && !moved) moveTo(nearest(e), true); drag = false; });
    svg.addEventListener('pointercancel', () => { drag = false; });
    svg.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (d) { e.preventDefault(); moveTo(st.k + d, true); }
      else if (e.key === 'Home') { e.preventDefault(); moveTo(0, true); } else if (e.key === 'End') { e.preventDefault(); moveTo(st.n, true); }
    });
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-d]');
      if (b) { st.n = clamp(st.n + +b.dataset.d, 2, 12); st.k = Math.min(st.k, st.n); draw(); onChange(get()); }
      if (e.target.closest('[data-bar]')) { st.bar = !st.bar; draw(); onChange(get()); }
    });
    draw();
    return { get };
  }
  const missions = [
    { t: 'Hop Pip to <b>one half</b>', ok: s => s.k * 2 === s.n, win: s => s.n === 2 ? '1 jump out of 2 is one half.' : `${s.k} jumps out of ${s.n} lands on one half.` },
    { t: 'Land on <b>three quarters</b>', ok: s => s.k * 4 === s.n * 3, win: s => s.n === 4 ? '3 jumps out of 4. Three quarters!' : `${s.k} jumps out of ${s.n} lands on three quarters.` },
    { t: 'Hop all the way to <b>1</b>', ok: s => s.k === s.n, win: s => `${s.n} jumps out of ${s.n} is the whole line. ${cap(fracWords(s.n, s.n))} is the same as 1.` },
    { t: 'Make the jumps as <b>small</b> as you can', ok: s => s.n === 12, win: () => '12 equal jumps from 0 to 1. Each tiny jump is one twelfth.' },
    { t: 'Find one half on a line with <b>more than 2</b> jumps', ok: s => s.n > 2 && s.k * 2 === s.n, win: s => `${s.k} out of ${s.n} lands in the same place as 1 out of 2. Clever!` },
  ];

  /* ---------- Guided examples ---------- */
  const exLine = spec => nline({ counts: true, ...spec });
  const countJumps = n => async (c, instant, alive) => {
    const s = c.svg();
    for (let j = 0; j < n; j++) { arc(s, j).classList.remove('off'); cnt(s, j).classList.add('show'); if (!await pause(Math.max(180, 420 - n * 20), instant, alive)) return; }
  };
  const makeHops = (k, dot) => async (c, instant, alive) => {
    const s = c.svg();
    $$('.jc', s).forEach(t => t.classList.remove('show', 'top'));
    for (let j = 0; j < k; j++) {
      const a = arc(s, j);
      if (instant) { a.classList.remove('off'); a.classList.add('on'); } else drawOn(a);
      cnt(s, j).classList.add('show', 'top');
      if (dot) putDot(s, j + 1);
      if (!await pause(430, instant, alive)) return;
    }
  };
  const clearJumps = c => $$('.jc', c.svg()).forEach(t => t.classList.remove('show'));
  const examples = [
    { q: 'Which fraction is the arrow pointing to?', stack: true, view: () => exLine({ n: 5, at: 2, mark: 'pin' }), ans: [2, 5], given: false, steps: [
      { t: '<b>Find 0 and 1.</b> The arrow is somewhere between them, so the answer is a fraction.' },
      { t: `<b>Count the equal jumps from 0 to 1:</b> 5. That goes on the <span class="k-bot">bottom</span>.`, show: 'd', run: countJumps(5) },
      { t: `<b>Count the jumps from 0 to the arrow:</b> 2. That goes on the <span class="k-top">top</span>.`, show: 'n', run: makeHops(2, false) },
      { t: `The arrow is pointing to ${frac(2, 5)} We say <b>two fifths</b>.`, answer: true, run: clearJumps },
    ] },
    { q: `Mark ${frac(5, 8)} on the number line.`, stack: true, view: () => exLine({ n: 1 }), ans: [5, 8], given: true, steps: [
      { t: `<b>Start with the <span class="k-bot">bottom number</span>: 8.</b> Cut the line from 0 to 1 into 8 equal jumps.`, run: c => { c.setHTML(exLine({ n: 8, arcs: 'all' })); c.svg().classList.add('fresh'); } },
      { t: `<b>Now the <span class="k-top">top number</span>: 5.</b> Make 5 jumps from 0.`, run: makeHops(5, true) },
      { t: '5 jumps out of 8 equal jumps. The dot is on <b>five eighths</b>.', answer: true, run: clearJumps },
    ] },
    { q: 'The path from home to the park is split into 6 equal parts by lamp posts. Maya has walked past 4 parts. What fraction of the way has she walked?', stack: true,
      view: () => exLine({ n: 6, ends: ['home', 'park'] }), ans: [4, 6], given: false, steps: [
        { t: '<b>Draw it.</b> The path is a number line with 6 equal jumps.', run: countJumps(6) },
        { t: `<b>Maya has walked 4 parts.</b> Make 4 jumps from home. That is the <span class="k-top">top number</span>.`, show: 'n', run: makeHops(4, true) },
        { t: `Your turn. Which number goes on the <span class="k-bot">bottom</span>?`, pick: [4, 6, 2], right: 6, show: 'd', why: 'Yes! There are 6 equal jumps from home to the park.', miss: 'The bottom number is all the equal jumps from start to finish. Count every jump.' },
        { t: `Maya has walked ${frac(4, 6)} of the way. We say <b>four sixths</b>.`, answer: true, run: clearJumps },
      ] },
  ];

  /* ---------- Questions ---------- */
  const pin = (n, at, more = {}) => () => nline({ n, at, mark: 'pin', ...more });
  const skills = { read: 'reading a fraction from a number line', place: 'marking a fraction on a number line', jumps: 'counting jumps, not marks', equal: 'checking for equal jumps',
    whole: 'knowing the end of the line is one whole', word: 'number line word problems', meaning: 'what the two numbers mean on a line' };
  const practice = [
    { skill: 'read', type: 'pick', prompt: 'Which fraction is the arrow pointing to?', view: pin(4, 1), opts: [F(1, 4), F(1, 5), F(1, 3), F(4, 1)], ans: 0,
      hints: ['Count the equal jumps from 0 to 1. That number goes on the bottom.', 'There are 4 equal jumps, and the arrow is 1 jump from 0.'],
      wrong: { 1: 'You counted the marks. Count the jumps between 0 and 1 instead: there are 4.', 2: 'You counted the jumps after the arrow. The bottom number is all the jumps from 0 to 1: 4.', 3: 'The numbers are upside down. The 4 equal jumps go on the bottom.' },
      why: '4 equal jumps from 0 to 1, and the arrow is 1 jump from 0. That is one quarter.' },
    { skill: 'read', type: 'pick', prompt: 'Which fraction is the arrow pointing to?', view: pin(5, 3), opts: [F(3, 6), F(2, 5), F(3, 5), F(5, 3)], ans: 2,
      hints: ['Count the jumps, not the marks, for the bottom number.', '5 equal jumps from 0 to 1. The arrow is 3 jumps from 0.'],
      wrong: { 0: 'There are 6 marks, but only 5 jumps. Count the jumps.', 1: 'You counted back from 1. Always count the jumps starting at 0.', 3: 'Upside down. The 5 equal jumps go on the bottom.' },
      why: '5 equal jumps from 0 to 1, and the arrow is 3 jumps from 0. That is three fifths.' },
    { skill: 'place', type: 'place', prompt: `Put the dot on ${frac(2, 3)}`, say: 'Put the dot on two thirds.', n: 3, at: 2,
      hints: ['The top number tells you how many jumps to make from 0.', 'Start at 0 and make 2 jumps.'],
      wrongFn: k => k === 1 ? 'That is one third: only 1 jump from 0. The top number says 2 jumps.' : k === 3 ? 'That is the end of the line, which is 1 whole. Make 2 jumps from 0.' : 'That is 0, the start. Make 2 jumps from there.',
      why: 'The line has 3 equal jumps. Two jumps from 0 lands on two thirds.' },
    { skill: 'jumps', type: 'pick', prompt: 'How many <b>equal jumps</b> are there from 0 to 1?', view: () => nline({ n: 8 }), opts: [{ n: 9 }, { n: 7 }, { n: 8 }, { n: 10 }], ans: 2,
      hints: ['Put your finger on 0 and hop along to 1. Count each hop.', 'Count the spaces between the marks, not the marks.'],
      wrong: { 0: 'That is the number of marks. Count the spaces between them.', 1: 'You counted only the marks in the middle. Count the jumps from 0 all the way to 1.', 3: 'Count again, one jump at a time, from 0 to 1.' },
      why: 'There are 9 marks, but 8 jumps between them. This line is cut into eighths.', whyView: () => nline({ n: 8, arcs: 'all', counts: 'show' }) },
    { skill: 'read', type: 'build', prompt: 'Write the fraction the arrow is pointing to.', view: pin(8, 5), ans: [5, 8],
      hints: ['Bottom number first: count the equal jumps from 0 to 1.', '8 equal jumps. Now count the jumps from 0 to the arrow.'],
      wrongFn: (n, d) => n === 8 && d === 5 ? 'Upside down. The 8 equal jumps go on the bottom.' : d === 9 ? 'You counted the marks. There are 8 jumps from 0 to 1.' : d !== 8 ? 'Count the equal jumps from 0 to 1 for the bottom number.' : n === 3 ? 'Count the jumps from 0, not back from 1.' : 'Count the jumps from 0 to the arrow for the top number.',
      why: '8 equal jumps from 0 to 1, and the arrow is 5 jumps from 0. That is five eighths.' },
    { skill: 'equal', type: 'pick', col: true, prompt: 'Zara says, "The arrow is pointing to one quarter." Is Zara right?', view: pin(4, 1, { w: [0.4, 0.3, 0.2, 0.1] }), opts: [{ t: 'Yes, Zara is right' }, { t: 'No, Zara is not right' }], ans: 1,
      hints: ['Quarters are 4 equal jumps. Check the jumps on this line.', 'The first jump is much longer than the last one.'],
      wrong: { 0: 'Look at the sizes of the jumps. Are they all the same?' },
      why: 'The jumps are not equal, so the marks do not show quarters. Fractions on a line need equal jumps.' },
    { skill: 'place', type: 'place', prompt: `Put the dot on ${frac(7, 10)}`, say: 'Put the dot on seven tenths.', n: 10, at: 7,
      hints: ['The line has 10 equal jumps, like the bottom number. Now use the top number.', 'Count 7 jumps from 0.'],
      wrongFn: k => k === 3 ? 'You counted 7 jumps back from 1. Start at 0.' : k === 8 ? 'One jump too far. Count 7 jumps from 0.' : k === 6 ? 'Not quite far enough. You need 7 jumps from 0.' : 'Start at 0 and count 7 jumps along.',
      why: 'The line has 10 equal jumps. Seven jumps from 0 lands on seven tenths.' },
    { skill: 'whole', type: 'pick', prompt: 'The arrow is at the very end of the line. Which fraction is this?', view: pin(4, 4), opts: [F(1, 4), F(4, 4), F(4, 1), F(5, 4)], ans: 1,
      hints: ['How many jumps is it from 0 to the arrow?', '4 jumps out of 4 equal jumps.'],
      wrong: { 0: 'One quarter is only 1 jump from 0. The arrow is 4 jumps from 0.', 2: 'Upside down. The 4 equal jumps go on the bottom.', 3: 'There are 5 marks, but the arrow is 4 jumps from 0.' },
      why: '4 jumps out of 4 takes you all the way to 1. Four quarters is the same as one whole.' },
  ];
  const mastery = [
    { skill: 'place', type: 'place', prompt: `Put the dot on ${frac(3, 5)}`, say: 'Put the dot on three fifths.', n: 5, at: 3, why: 'The line has 5 equal jumps. Three jumps from 0 lands on three fifths.' },
    { skill: 'read', type: 'build', prompt: 'Write the fraction the arrow is pointing to.', view: pin(6, 5), ans: [5, 6], why: '6 equal jumps from 0 to 1, and the arrow is 5 jumps from 0. That is five sixths.' },
    { skill: 'jumps', type: 'pick', wide: true, prompt: 'Which number line is cut into <b>quarters</b>?',
      opts: [{ html: () => nline({ n: 3 }), label: 'A line with 4 marks and 3 equal jumps' }, { html: () => nline({ n: 4, w: [0.1, 0.2, 0.3, 0.4] }), label: 'A line with 4 jumps of different sizes' },
        { html: () => nline({ n: 4 }), label: 'A line with 5 marks and 4 equal jumps' }, { html: () => nline({ n: 5 }), label: 'A line with 6 marks and 5 equal jumps' }], ans: 2,
      why: 'Quarters need 4 equal jumps from 0 to 1. Count the jumps, not the marks.' },
    { skill: 'word', type: 'build', prompt: 'A ribbon 1 metre long is marked into 10 equal parts. An ant walks from the start to the 3rd mark. What fraction of a metre has it walked?', ans: [3, 10],
      why: '10 equal parts in the whole metre, and the ant has walked 3 of them. That is three tenths.' },
    { skill: 'meaning', type: 'pick', col: true, prompt: 'On a number line from 0 to 1, what does the <b>bottom number</b> of a fraction tell you?',
      opts: [{ t: 'How many marks are on the line' }, { t: 'How many jumps you make from 0' }, { t: 'How many equal jumps there are from 0 to 1' }, { t: 'Where the line ends' }], ans: 2,
      why: 'The bottom number is the number of equal jumps from 0 to 1. The top number is how many of those jumps you make from 0.' },
  ];

  /* ---------- what the teacher says and writes (board is 900 x 600) ---------- */
  const { w, line, und, tick, cross, loop, star, think, num, hop, dot, fr } = Teacher.ops;
  const marks = (xs, y, o = {}) => xs.map((x, i) => line(x, y - 20, x, y + 20, i ? { gap: 60 } : o));      // short strokes across the line
  const script = [
    { title: 'Where do fractions live?', steps: [
      { say: 'Hello again! Today we find out where fractions live.', ops: [w('Number lines', 56, 96, { size: 68, b: 1, c: 'blue', id: 't1' }), und('t1', { c: 'orange' })] },
      { say: 'Here is a number line. Zero, one, two.', ops: [line(70, 330, 830, 330, { dur: 900 }), ...marks([150, 440, 730], 330), num(0, 150, 412, { size: 50, c: 'ink' }), num(1, 440, 412, { size: 50, c: 'ink' }), num(2, 730, 412, { size: 50, c: 'ink' })] },
      { say: 'But look at this gap between zero and one. Something lives in here.', ops: [loop(295, 330, 128, 46, { c: 'green', wait: 1200 })] },
      { say: 'Fractions! They are numbers too, and they live between zero and one.', ops: [w('fractions live here', 150, 236, { size: 44, c: 'green', wait: 600 })], hold: 1000 },
    ] },
    { title: 'Equal jumps', steps: [
      { say: 'Let me draw the line from zero to one, nice and big.', ops: [line(90, 320, 810, 320, { dur: 900 }), ...marks([90, 810], 320), num(0, 90, 398, { size: 50, c: 'ink' }), num(1, 810, 398, { size: 50, c: 'ink' })] },
      { say: 'I cut it into four equal jumps.', ops: marks([270, 450, 630], 320, { wait: 700 }) },
      { say: 'One, two, three, four.', ops: [0, 1, 2, 3].flatMap(i => [hop(90 + i * 180, 270 + i * 180, 306, { c: 'blue', gap: 40 }), num(i + 1, 180 + i * 180, 216, { c: 'blue', size: 38, gap: 120 })]) },
      { say: 'Four equal jumps, so each jump is one quarter.', ops: [fr(270, 378, 1, 4, { size: 46, wait: 900 })] },
      { say: 'Two jumps is two quarters. Three jumps is three quarters.', ops: [fr(450, 378, 2, 4, { size: 46 }), fr(630, 378, 3, 4, { size: 46, wait: 500 })] },
      { say: 'And four quarters brings us all the way to one.', ops: [loop(810, 384, 44, 42, { c: 'green', wait: 900 })], hold: 1000 },
    ] },
    { title: 'Find three fifths', steps: [
      { say: 'Now let us find three fifths on the number line.', ops: [w('Where is', 56, 104, { size: 58, b: 1 }), fr(336, 86, 3, 5, { size: 56 }), w('?', 384, 108, { size: 58, b: 1 })] },
      { say: 'First I draw the line from zero to one.', ops: [line(90, 400, 810, 400, { dur: 900 }), ...marks([90, 810], 400), num(0, 90, 478, { size: 50, c: 'ink' }), num(1, 810, 478, { size: 50, c: 'ink' })] },
      { say: 'The bottom number is five. So I cut the line into five equal jumps.', ops: [w('bottom: 5 equal jumps', 470, 100, { size: 36, c: 'blue', maxW: 390, wait: 600 }), ...marks([234, 378, 522, 666], 400, { wait: 300 })] },
      { say: 'The top number is three. How many jumps should I make from zero? Have a think.', ops: [w('top: 3 jumps from 0', 470, 160, { size: 36, c: 'orange', maxW: 390 }), think(3200)] },
      { say: 'Three jumps. One, two, three.', ops: [0, 1, 2].flatMap(i => [hop(90 + i * 144, 234 + i * 144, 386, { c: 'orange', gap: 40 }), num(i + 1, 162 + i * 144, 312, { c: 'orange', size: 36, gap: 140 })]) },
      { say: 'Here it is. Three fifths.', ops: [dot(522, 400), fr(522, 480, 3, 5, { size: 44, wait: 300 }), loop(522, 488, 48, 64, { c: 'green' })], hold: 1000 },
    ] },
    { title: 'Jumps, not marks', steps: [
      { say: 'Be careful with this next one.', ops: [w('Count the jumps!', 56, 96, { size: 62, b: 1, id: 't4' }), und('t4', { c: 'orange' })] },
      { say: 'How many equal parts is this line cut into? Have a think.', ops: [line(120, 310, 780, 310, { dur: 900 }), ...marks([120, 285, 450, 615, 780], 310), think(3400)] },
      { say: 'If I count the marks, I get five. But that is not right.', ops: [...[0, 1, 2, 3, 4].map(i => num(i + 1, 120 + i * 165, 262, { c: 'rose', size: 38, gap: 110 })), cross(812, 228, { c: 'rose' })] },
      { say: 'I count the jumps, the spaces between the marks. One, two, three, four.', ops: [...[0, 1, 2, 3].flatMap(i => [hop(120 + i * 165, 285 + i * 165, 326, { c: 'green', down: true, gap: 40 }), num(i + 1, 202 + i * 165, 424, { c: 'green', size: 38, gap: 120 })]), tick(806, 372, { c: 'green' })] },
      { say: 'Four jumps. So this line shows quarters.', ops: [w('4 jumps = quarters', 250, 520, { size: 50, c: 'green' })], hold: 1000 },
    ] },
    { title: 'Remember', steps: [
      { say: "Let's remember four things.", ops: [w('Remember', 56, 96, { size: 66, b: 1, c: 'blue', id: 't5' }), und('t5', { c: 'orange' })] },
      { say: 'One. Fractions are numbers that live between zero and one.', ops: [w('1.', 60, 196, { size: 42, c: 'blue' }), w('Fractions live between 0 and 1', 124, 196, { size: 40, maxW: 720 })] },
      { say: 'Two. The bottom number is how many equal jumps there are from zero to one.', ops: [w('2.', 60, 276, { size: 42, c: 'blue' }), w('Bottom:', 124, 276, { size: 40, c: 'blue', id: 'b5' }), w('equal jumps from 0 to 1', '+b5', 276, { size: 40, maxW: 560 })] },
      { say: 'Three. The top number is how many jumps you make from zero.', ops: [w('3.', 60, 356, { size: 42, c: 'blue' }), w('Top:', 124, 356, { size: 40, c: 'orange', id: 'p5' }), w('jumps made from 0', '+p5', 356, { size: 40 })] },
      { say: 'Four. Count the jumps, not the marks.', ops: [w('4.', 60, 436, { size: 42, c: 'blue' }), w('Count jumps, not marks', 124, 436, { size: 40 })] },
      { say: 'Now it is your turn. Help Pip find some fractions. You can do it!', ops: [star(520, 536, 30, { c: 'orange', wait: 800 }), w('Your turn!', 570, 556, { size: 60, b: 1, c: 'green' })], hold: 1400 },
    ] },
  ];

  addLesson({
    id: 'number-line', topic: 'fractions', n: 2, title: 'Fractions on a Number Line', level: 0, minutes: 15,
    blurb: 'Find and mark fractions between 0 and 1, by counting equal jumps.',
    thumb: () => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M12 56Q21.5 32 31 56Q40.5 32 50 56Q59.5 32 69 56" style="fill:none;stroke:var(--orange);stroke-width:5;stroke-linecap:round;stroke-linejoin:round"/><path d="M10 66h80M12 57v18M31 60v12M50 60v12M69 60v12M88 57v18" style="stroke:var(--ink);stroke-width:5;stroke-linecap:round"/><circle cx="69" cy="66" r="7.5" style="fill:var(--orange);stroke:var(--ink);stroke-width:3"/></svg>`,
    homeTip: 'Fold a strip of paper into equal parts, mark 0 and 1 at the ends, and ask where one half or three quarters would be.',
    intro: {
      say: 'You know a fraction is <b>equal parts of a whole</b>. Now find out where fractions live on a <b>number line</b>. By the end of this lesson you will be able to:',
      speak: 'You know a fraction is equal parts of a whole. Now find out where fractions live on a number line. Press the blue button to start.',
      goals: [['eye', 'Find a fraction on a number line'], ['tap', 'Mark a fraction on a number line'], ['bulb', 'Explain why we count jumps, not marks']],
      why: 'Measuring jugs, rulers and loading bars are all number lines.',
      cards: () => [[ART.jug(), 'Measuring'], [ART.walk(), 'How far to go'], [ART.loading(), 'Progress']],
    },
    learn,
    learnActs: { marks: (b, c) => { c.l.flags.marks = b.dataset.v; save(); c.setTalk(false); c.setCta(false); } },
    explore: { title: "Hop along Pip's number line", missions, mount: mountLineLab },
    examples, practice, mastery, skills,
    teacher: { script, poster: 2 },
    passSay: 'You showed that you can find and mark fractions on a number line, all on your own.',
    canDo: ['I can find a fraction on a number line', 'I can mark a fraction on a number line', 'I count the equal jumps, not the marks'],
  });
}
