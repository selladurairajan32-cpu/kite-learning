/* =====================================================================
   Shared maths tools: the number line from 0 to 1, and Pip the frog.
   Lessons draw their own stories with these pieces, so every number
   line in the product looks and behaves the same.

   Colour code (same as the fraction pictures): jumps made from 0 are
   orange, like the top number; all the equal jumps are blue, like the
   bottom number.
   ===================================================================== */
const frogSVG = () => `<ellipse cx="-12" cy="-2.5" rx="6.5" ry="3.4" style="fill:var(--frog-2)"/><ellipse cx="12" cy="-2.5" rx="6.5" ry="3.4" style="fill:var(--frog-2)"/>
  <ellipse cx="0" cy="-11" rx="15" ry="11" style="fill:var(--frog);stroke:var(--frog-2);stroke-width:1.5"/>
  <circle cx="-8" cy="-21" r="6.4" style="fill:var(--frog);stroke:var(--frog-2);stroke-width:1.5"/><circle cx="8" cy="-21" r="6.4" style="fill:var(--frog);stroke:var(--frog-2);stroke-width:1.5"/>
  <circle cx="-8" cy="-21.5" r="3.5" style="fill:var(--surface)"/><circle cx="8" cy="-21.5" r="3.5" style="fill:var(--surface)"/>
  <circle cx="-7.2" cy="-21.2" r="1.8" style="fill:var(--ink)"/><circle cx="8.8" cy="-21.2" r="1.8" style="fill:var(--ink)"/>
  <path d="M-6,-8.5Q0,-3.5 6,-8.5" style="fill:none;stroke:var(--frog-2);stroke-width:1.8;stroke-linecap:round"/>`;

/* where each mark sits, as a share of the way from 0 to 1 */
function linePos(spec) {
  if (spec.w) { let a = 0; return [0, ...spec.w.map(f => (a += f))].map(v => Math.min(1, +v.toFixed(6))); }
  return Array.from({ length: spec.n + 1 }, (_, i) => i / spec.n);
}
/* the pieces of a number line, drawn at any place and size
   spec: n jumps · w unequal jump sizes · at marker · mark 'dot'|'pin'|'frog'|'none'
         arcs 'all' shows every jump · hops how many jumps are made from 0
         labels 'ends'|'all'|'none' · counts adds hidden numbers for counting animations */
function lineParts(spec, g) {
  const pos = linePos(spec), n = spec.n, xs = pos.map(p => g.x0 + p * g.W), y = g.y, k = g.k || 1;
  const hops = spec.hops || 0, P = { axis: '', ticks: '', arcs: '', counts: '', marks: '', labels: '', marker: '', hits: '', xs, y };
  P.axis = `<line class="ax" x1="${f1(g.x0)}" y1="${y}" x2="${f1(g.x0 + g.W)}" y2="${y}"/>`;
  xs.forEach((x, i) => {
    const end = i === 0 || i === n, h = (end ? 13 : 9) * k;
    P.ticks += `<line class="tk${end ? ' end' : ''}" data-k="${i}" x1="${f1(x)}" y1="${f1(y - h)}" x2="${f1(x)}" y2="${f1(y + h)}"/>`;
    P.marks += `<text class="mn" data-k="${i}" x="${f1(x)}" y="${f1(y - 22 * k)}">${i + 1}</text>`;
  });
  for (let i = 0; i < n; i++) {
    const a = xs[i], b = xs[i + 1], w = b - a, h = Math.min(30 * k, w * 0.6), top = y - 7 * k;
    const cls = i < hops ? 'hop on' : spec.arcs === 'all' ? 'hop' : 'hop off';
    P.arcs += `<path class="${cls}" data-j="${i}" pathLength="1" d="M${f1(a)},${f1(top)}Q${f1((a + b) / 2)},${f1(top - 2 * h)} ${f1(b)},${f1(top)}"/>`;
    P.counts += `<text class="jc${spec.counts === 'show' ? ' show' : ''}" data-j="${i}" x="${f1((a + b) / 2)}" y="${f1(top - h * 0.42)}" style="font-size:${f1(Math.min(17 * k, w * 0.5))}px">${i + 1}</text>`;
  }
  if (spec.labels !== 'none') {
    const ends = spec.ends || ['0', '1'], word = spec.ends ? ' word' : '';
    P.labels = `<text class="tn${word}" x="${f1(xs[0])}" y="${f1(y + 39 * k)}">${ends[0]}</text><text class="tn${word}" x="${f1(xs[n])}" y="${f1(y + 39 * k)}">${ends[1]}</text>`;
    const fs = Math.min(16 * k, (g.W / n) * 0.42);
    for (let i = 1; i < n; i++) P.labels += `<g class="tl${spec.labels === 'all' ? ' show' : ''}" data-k="${i}">${svgFrac(f1(xs[i]), f1(y + 20 * k + fs), i, n, f1(fs))}</g>`;
  }
  if (spec.at != null && spec.mark !== 'none') {
    const x = xs[spec.at];
    if (spec.mark === 'pin') P.marker = `<path class="pin" d="M${f1(x)},${f1(y - 12 * k)}l${f1(-9 * k)},${f1(-17 * k)}h${f1(18 * k)}z"/>`;
    else if (spec.mark === 'frog') P.marker = `<g class="frog" transform="translate(${f1(x)},${f1(y - 2)})">${frogSVG()}</g>`;
    else P.marker = `<circle class="mk" cx="${f1(x)}" cy="${y}" r="${f1(8.5 * k)}"/>`;
  }
  xs.forEach((x, i) => {
    const near = Math.min(i ? x - xs[i - 1] : 99, i < n ? xs[i + 1] - x : 99), hw = Math.min(22 * k, near / 2);
    P.hits += `<rect class="hit" data-k="${i}" x="${f1(x - hw)}" y="${f1(y - 30 * k)}" width="${f1(hw * 2)}" height="${f1(60 * k)}" rx="8" tabindex="0" role="button" aria-pressed="false" aria-label="${i === 0 ? 'The start, 0' : i === n ? 'The end, 1' : `Mark ${i} of ${n - 1} between 0 and 1`}"/>`;
  });
  return P;
}
function lineLabel(spec) {
  const equal = !spec.w, at = spec.at != null ? `, with a marker ${spec.at === 0 ? 'at 0' : spec.at === spec.n ? 'at 1' : `${spec.at} jump${spec.at === 1 ? '' : 's'} from 0`}` : '';
  return `Number line from 0 to 1 with ${spec.n} ${equal ? 'equal' : 'unequal'} jump${spec.n === 1 ? '' : 's'}${at}`;
}
/* a ready-made number line picture */
function nline(spec, o = {}) {
  const arcs = spec.arcs === 'all' || spec.hops || spec.counts, head = spec.mark === 'pin' || spec.mark === 'frog' ? 36 : 12;
  const y = 6 + (arcs ? 40 : 0) + (spec.marks ? 20 : 0) + head, H = y + (spec.labels === 'none' ? 20 : spec.labels === 'all' ? 62 : 48);
  const P = lineParts(spec, { x0: 26, W: 308, y });
  const aria = o.tap ? `role="group" aria-label="${esc(o.label || 'Tap a mark on the number line')}"` : `role="img" aria-label="${esc(o.label || lineLabel(spec))}"`;
  return `<svg class="nl${o.tap ? ' tap' : ''} ${o.cls || ''}" viewBox="0 0 360 ${H}" ${aria}>${P.arcs}${spec.counts ? P.counts : ''}${spec.marks ? P.marks : ''}${P.axis}${P.ticks}${P.labels}${P.marker}${o.tap ? P.hits : ''}</svg>`;
}
/* make a number line answerable: tapping a mark puts the dot there */
function putDot(svg, k) {
  const tk = $(`.tk[data-k="${k}"]`, svg);
  if (!tk) return null;
  let mk = $('.mk', svg);
  if (!mk) { mk = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); mk.setAttribute('class', 'mk'); mk.setAttribute('r', '8.5'); svg.insertBefore(mk, $('.hit', svg)); }
  mk.setAttribute('cx', tk.getAttribute('x1')); mk.setAttribute('cy', $('.ax', svg).getAttribute('y1'));
  mk.classList.remove('land'); void mk.getBoundingClientRect(); mk.classList.add('land');
  return mk;
}
function setLineMark(svg, k) {
  putDot(svg, k);
  $$('.hit', svg).forEach(h => h.setAttribute('aria-pressed', +h.dataset.k === k));
}
function tapLine(svg, onPick) {
  const pick = hit => { setLineMark(svg, +hit.dataset.k); onPick(+hit.dataset.k); };
  svg.addEventListener('click', e => { const h = e.target.closest('.hit'); if (h) pick(h); });
  svg.addEventListener('keydown', e => { const h = e.target.closest('.hit'); if (h && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(h); } });
}
/* one hop: moves a drawing along a curve from one place on the line to another */
function hopAlong(el, from, to, y, ms = 520) {
  return new Promise(done => {
    const H = Math.min(46, Math.abs(to - from) * 0.55);
    if (REDUCED || ms <= 0 || !el.isConnected) { el.setAttribute('transform', `translate(${f1(to)},${f1(y)})`); return done(); }
    const t0 = performance.now();
    const step = now => {
      const u = clamp((now - t0) / ms, 0, 1), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      el.setAttribute('transform', `translate(${f1(from + (to - from) * e)},${f1(y - 4 * H * u * (1 - u))})`);
      if (u < 1 && el.isConnected) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });
}
/* a short timed change, used for zooms and slides */
function tween(ms, draw) {
  return new Promise(done => {
    if (REDUCED || ms <= 0) { draw(1); return done(); }
    const t0 = performance.now();
    const step = now => { const u = clamp((now - t0) / ms, 0, 1); draw(u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2); if (u < 1) requestAnimationFrame(step); else done(); };
    requestAnimationFrame(step);
  });
}

/* ---------- the children who appear in the stories ---------- */
function friend(x, y, name, c, mood = 'happy') {
  const mouth = mood === 'sad' ? 'M-9,12Q0,4 9,12' : 'M-9,6Q0,15 9,6';
  return `<g transform="translate(${x},${y})"><circle class="face" r="27" style="fill:var(--${c}-soft);stroke:var(--${c})"/><circle class="eye" cx="-9" cy="-5" r="2.8"/><circle class="eye" cx="9" cy="-5" r="2.8"/><path class="mouth" d="${mouth}"/><text class="nm" y="48">${name}</text></g>`;
}

/* ---------- the fraction lab: colour equal parts of a circle or bar (lesson 1, and the homepage) ---------- */
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
