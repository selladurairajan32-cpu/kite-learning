/* =====================================================================
   Watch Teacher Explain
   A whiteboard-style explanation drawn stroke by stroke on squared paper.
   The whole lesson is one timeline: the board is a pure function of time,
   so play, pause, replay, seek, speed and captions all come from one clock.
   ===================================================================== */
const Teacher = (() => {
  const W = 900, H = 600, NS = 'http://www.w3.org/2000/svg', REST = [W - 120, H - 90];
  const INK = { ink: 'var(--b-ink)', blue: 'var(--b-blue)', orange: 'var(--b-orange)', green: 'var(--b-green)', rose: 'var(--b-rose)', grey: 'var(--b-grey)' };
  const mk = (tag, attrs, parent) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); if (parent) parent.appendChild(el); return el; };
  const rng = seed => { let s = (Math.imul(seed + 11, 2654435761)) >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
  const ease = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  const fmt = ms => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const speakMs = text => text.trim().split(/\s+/).length * 360 + (text.match(/[.!?]/g) || []).length * 280 + 300;

  /* ---- what the teacher writes: shorthand for each kind of mark ---- */
  const w = (text, x, y, o = {}) => ({ k: 'w', text, x, y, ...o });
  const line = (x1, y1, x2, y2, o = {}) => ({ k: 'l', x1, y1, x2, y2, ...o });
  const circ = (cx, cy, r, o = {}) => ({ k: 'c', cx, cy, r, ...o });
  const box = (x, y, bw, bh, o = {}) => ({ k: 'r', x, y, w: bw, h: bh, ...o });
  const shadeR = (x, y, bw, bh, o = {}) => ({ k: 'f', s: 'rect', x, y, w: bw, h: bh, ...o });
  const shadeS = (cx, cy, r, a0, a1, o = {}) => ({ k: 'f', s: 'sec', cx, cy, r, a0, a1, ...o });   // degrees, clockwise from 12 o'clock
  const und = (ref, o = {}) => ({ k: 'u', ref, ...o });
  const arrow = (x1, y1, x2, y2, o = {}) => ({ k: 'a', x1, y1, x2, y2, ...o });
  const tick = (x, y, o = {}) => ({ k: 't', x, y, ...o });
  const cross = (x, y, o = {}) => ({ k: 'x', x, y, ...o });
  const loop = (cx, cy, rx, ry, o = {}) => ({ k: 'e', cx, cy, rx, ry, ...o });
  const star = (cx, cy, r, o = {}) => ({ k: 's', cx, cy, r, ...o });
  const think = ms => ({ k: 'think', dur: ms, after: 'say' });
  const num = (t, x, y, o = {}) => w(String(t), x, y, { size: 36, c: 'grey', anchor: 'mid', gap: 170, ...o });

  /* a hop along a number line, and a solid dot */
  const hop = (x1, x2, y, o = {}) => ({ k: 'h', x1, x2, y, ...o });
  const dot = (cx, cy, o = {}) => ({ k: 'd', cx, cy, ...o });
  /* a stacked fraction: top number, bar, bottom number (y is the height of the bar) */
  const fr = (cx, y, n, d, o = {}) => {
    const size = o.size || 60, top = w(String(n), cx, y - size * 0.2, { size, c: 'orange', anchor: 'mid', wait: o.wait }),
      bar = line(cx - size * 0.45, y, cx + size * 0.45, y, { wd: size > 80 ? 6 : 5 }), bot = w(String(d), cx, y + size * 0.94, { size, c: 'blue', anchor: 'mid' });
    return o.bottomFirst ? [bar, bot, top] : [top, bar, bot];
  };
  const ops = { w, line, circ, box, shadeR, shadeS, und, arrow, tick, cross, loop, star, think, num, hop, dot, fr };

  /* ---- hand-drawn geometry ---- */
  function spline(pts) {
    let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`;
    }
    return d;
  }
  function roughOval(cx, cy, rx, ry, seed) {
    const R = rng(seed), n = 30, start = -Math.PI * 0.62, pts = [];
    for (let i = 0; i <= n; i++) {
      const a = start + (TAU + 0.24) * i / n, k = 1 + (R() - 0.5) * 0.018 + 0.012 * Math.sin(a * 2 + 1) - 0.018 * (i / n);
      pts.push([cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)]);
    }
    return spline(pts);
  }
  function roughLine(x1, y1, x2, y2, seed) {
    const R = rng(seed), len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len, bow = (R() - 0.5) * len * 0.028;
    return `M${f1(x1)},${f1(y1)}Q${f1((x1 + x2) / 2 + nx * bow)},${f1((y1 + y2) / 2 + ny * bow)} ${f1(x2)},${f1(y2)}`;
  }
  function roughBox(x, y, bw, bh, seed) {
    const R = rng(seed), j = () => (R() - 0.5) * 5;
    const P = [[x + j(), y + j()], [x + bw + j(), y + j()], [x + bw + j(), y + bh + j()], [x + j(), y + bh + j()]];
    return `M${f1(P[0][0])},${f1(P[0][1])}L${f1(P[1][0])},${f1(P[1][1])}L${f1(P[2][0])},${f1(P[2][1])}L${f1(P[3][0])},${f1(P[3][1])}L${f1(P[0][0] + 1)},${f1(P[0][1] - 4)}`;
  }
  function hatch(bx, by, bw, bh, step, seed) {
    const R = rng(seed);
    let d = '', flip = false;
    for (let c = step * 0.6; c < bw + bh; c += step) {
      const xa = Math.max(0, c - bh), xb = Math.min(bw, c), j = (R() - 0.5) * 4;
      const A = [bx + xa + j, by + (c - xa)], B = [bx + xb, by + (c - xb) + j];
      const [s, e] = flip ? [B, A] : [A, B];
      d += `${d ? 'L' : 'M'}${f1(s[0])},${f1(s[1])}L${f1(e[0])},${f1(e[1])}`;
      flip = !flip;
    }
    return d;
  }

  /* ---- build the board: every mark becomes an op with set(progress) and pen(progress) ---- */
  let boardSeq = 0;
  function build(svg, script) {
    const uid = 'b' + (++boardSeq);
    svg.innerHTML = '';
    const defs = mk('defs', {}, svg);
    const pat = mk('pattern', { id: uid + 'grid', width: 30, height: 30, patternUnits: 'userSpaceOnUse' }, defs);
    mk('path', { d: 'M30 0H0V30', style: 'fill:none;stroke:var(--b-grid);stroke-width:1.2' }, pat);
    mk('rect', { width: W, height: H, fill: `url(#${uid}grid)` }, svg);
    let n = 0, t = 0;
    const model = { scenes: [], steps: [], total: 0 };

    function stroke(g, d, o, dur, extra = {}) {
      const path = mk('path', { d, pathLength: 1, class: 'bstroke' }, g);
      const color = INK[o.c || 'ink'];
      path.style.stroke = color; path.style.strokeWidth = extra.wd || o.wd || 4.5;
      if (extra.opacity) path.style.opacity = extra.opacity;
      if (extra.clip) path.setAttribute('clip-path', `url(#${extra.clip})`);
      let total = 0;
      try { total = path.getTotalLength(); } catch (e) { }
      return {
        dur: o.dur || dur(total), color,
        set: p => { path.style.strokeDashoffset = 1 - p; path.style.visibility = p > 0 ? 'visible' : 'hidden'; },
        pen: p => { try { const q = path.getPointAtLength(total * p); return [q.x, q.y]; } catch (e) { return REST; } },
      };
    }
    function makeOp(op, g, ids) {
      const seed = ++n;
      switch (op.k) {
        case 'w': {
          const size = op.size || 40, color = INK[op.c || 'ink'];
          const el = mk('text', { class: 'hw', x: 0, y: op.y, 'font-size': size, 'font-weight': op.b ? 700 : 400 }, g);
          el.style.fill = color; el.textContent = op.text;
          let len = el.getComputedTextLength(), s = size;
          if (op.maxW && len > op.maxW) { s = size * op.maxW / len; el.setAttribute('font-size', f1(s)); len = el.getComputedTextLength(); }
          let x = typeof op.x === 'string' ? (ids[op.x.slice(1)] ? ids[op.x.slice(1)].x1 + s * 0.32 : 60) : op.x;
          if (op.anchor === 'mid') x -= len / 2;
          el.setAttribute('x', f1(x));
          const R = rng(seed);
          el.setAttribute('rotate', Array.from(op.text, () => ((R() - 0.5) * 4.4).toFixed(1)).join(' '));
          const cp = mk('clipPath', { id: uid + 'c' + seed }, defs), rect = mk('rect', { x: f1(x - 12), y: f1(op.y - s * 1.15), width: 0, height: f1(s * 1.8) }, cp);
          el.setAttribute('clip-path', `url(#${uid}c${seed})`);
          const chars = op.text.replace(/\s/g, '').length;
          return {
            x0: x, x1: x + len, y: op.y, size: s, color, dur: op.dur || Math.max(360, chars * 98),
            set: p => rect.setAttribute('width', p <= 0 ? 0 : f1((len + 26) * p)),
            pen: p => [x + len * p, op.y - s * 0.3 - Math.sin(p * chars * 5.4) * s * 0.19],
          };
        }
        case 'l': return stroke(g, roughLine(op.x1, op.y1, op.x2, op.y2, seed), op, L2 => clamp(L2 * 2.1, 260, 800));
        case 'c': return stroke(g, roughOval(op.cx, op.cy, op.r, op.r, seed), op, () => 1300);
        case 'e': return stroke(g, roughOval(op.cx, op.cy, op.rx, op.ry, seed), op, () => 1000, { wd: 4 });
        case 'r': return stroke(g, roughBox(op.x, op.y, op.w, op.h, seed), op, () => 1500);
        case 'u': {
          const r = ids[op.ref] || { x0: 60, x1: 300, y: 100, size: 60 }, y = r.y + r.size * 0.26, R = rng(seed), pts = [];
          for (let x = r.x0; x <= r.x1 + 1; x += (r.x1 - r.x0) / 6) pts.push([x, y + (R() - 0.5) * 6]);
          return stroke(g, spline(pts), op, () => 520, { wd: 5 });
        }
        case 'a': {
          const a = Math.atan2(op.y2 - op.y1, op.x2 - op.x1), h = 15;
          const d = roughLine(op.x1, op.y1, op.x2, op.y2, seed)
            + `M${f1(op.x2 - h * Math.cos(a - 0.5))},${f1(op.y2 - h * Math.sin(a - 0.5))}L${op.x2},${op.y2}L${f1(op.x2 - h * Math.cos(a + 0.5))},${f1(op.y2 - h * Math.sin(a + 0.5))}`;
          return stroke(g, d, op, () => 520, { wd: 4 });
        }
        case 't': return stroke(g, `M${op.x},${op.y}l15,19l31,-46`, op, () => 420, { wd: 7 });
        case 'x': return stroke(g, `M${op.x},${op.y}l38,40M${op.x + 38},${op.y}l-38,40`, op, () => 520, { wd: 7 });
        case 's': {
          const pts = Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI * 4 / 5; return [op.cx + op.r * Math.cos(a), op.cy + op.r * Math.sin(a)]; }).slice(0, 6);
          return stroke(g, 'M' + pts.map(p => `${f1(p[0])},${f1(p[1])}`).join('L'), op, () => 900, { wd: 4 });
        }
        case 'f': {
          const id = uid + 'f' + seed, cp = mk('clipPath', { id }, defs);
          let bx, by, bw, bh;
          if (op.s === 'rect') { mk('rect', { x: op.x + 4, y: op.y + 4, width: op.w - 8, height: op.h - 8 }, cp); [bx, by, bw, bh] = [op.x, op.y, op.w, op.h]; }
          else {
            const a0 = (op.a0 - 90) * Math.PI / 180, a1 = (op.a1 - 90) * Math.PI / 180, xs = [op.cx], ys = [op.cy];
            mk('path', { d: sector(op.cx, op.cy, op.r - 4, a0, a1) }, cp);
            for (let i = 0; i <= 16; i++) { const p = polar(op.cx, op.cy, op.r, a0 + (a1 - a0) * i / 16); xs.push(p[0]); ys.push(p[1]); }
            bx = Math.min(...xs); by = Math.min(...ys); bw = Math.max(...xs) - bx; bh = Math.max(...ys) - by;
          }
          return stroke(g, hatch(bx, by, bw, bh, 16, seed), { c: op.c || 'orange', dur: op.dur }, () => 900, { wd: 11, opacity: 0.66, clip: id });
        }
        case 'h': {
          const dx = op.x2 - op.x1, h = op.h || Math.min(70, Math.abs(dx) * 0.42), cy = op.y + (op.down ? 2 : -2) * h;
          const a = Math.atan2(op.y - cy, dx / 2), hd = 13;      // the way the hop is travelling as it lands
          const d = `M${op.x1},${op.y}Q${f1(op.x1 + dx / 2)},${f1(cy)} ${op.x2},${op.y}`
            + `M${f1(op.x2 - hd * Math.cos(a - 0.5))},${f1(op.y - hd * Math.sin(a - 0.5))}L${op.x2},${op.y}L${f1(op.x2 - hd * Math.cos(a + 0.5))},${f1(op.y - hd * Math.sin(a + 0.5))}`;
          return stroke(g, d, op, () => 520, { wd: 4 });
        }
        case 'd': {
          const c = mk('circle', { cx: op.cx, cy: op.cy, r: 0 }, g), color = INK[op.c || 'orange'], R = op.r || 11;
          c.style.fill = color;
          return { dur: op.dur || 260, color, set: q => c.setAttribute('r', f1(R * q)), pen: () => [op.cx, op.cy] };
        }
        default: return { dur: op.dur || 1000, think: true, set() { }, pen: null };
      }
    }

    script.forEach((sc, si) => {
      const g = mk('g', {}, svg), scene = { title: sc.title, t0: t, ops: [], g }, ids = {};
      sc.steps.forEach(st => {
        const sayMs = speakMs(st.say), step = { say: st.say, t0: t, scene: si, sayMs };
        const bits = st.say.match(/[^.!?]+[.!?]+/g) || [st.say], words = bits.map(b => b.trim().split(/\s+/).length), all = words.reduce((a, b) => a + b, 0);
        step.parts = bits.map((b, i) => ({ text: b.trim(), share: words[i] / all }));
        let a = t + 260;
        st.ops.flat().forEach(op => {
          const o = makeOp(op, g, ids);
          if (op.id) ids[op.id] = o;
          if (op.after === 'say') a = Math.max(a, t + sayMs + 150);
          a += op.wait || 0;
          o.lead = o.think ? 0 : 250;
          o.t0 = a; o.d0 = a + o.lead; o.t1 = o.d0 + o.dur; o.p = -1;
          a = o.t1 + (op.gap === undefined ? 150 : op.gap);
          scene.ops.push(o);
        });
        step.t1 = Math.max(a, t + sayMs) + (st.hold === undefined ? 550 : st.hold);
        t = step.t1;
        model.steps.push(step);
      });
      scene.t1 = t + (si < script.length - 1 ? 700 : 0);   // a moment to look, then the page turns
      t = scene.t1;
      model.scenes.push(scene);
    });
    model.total = t;
    model.pen = mk('g', { class: 'bpen' }, svg);
    model.pen.innerHTML = `<g transform="rotate(32)"><path class="tip" d="M0 0l-7-16h14z"/><path d="M-7-16h14v-66a7 7 0 00-14 0z" style="fill:var(--ink)"/><path d="M-7-34h14v-10H-7z" style="fill:var(--surface);opacity:.3"/></g>`;
    model.tip = model.pen.querySelector('.tip');
    return model;
  }

  /* ---- draw the board as it looks at time t ---- */
  function renderAt(m, t) {
    let si = m.scenes.findIndex(s => t < s.t1);
    if (si < 0) si = m.scenes.length - 1;
    const sc = m.scenes[si];
    m.scenes.forEach((s, i) => { const show = i === si ? '' : 'none'; if (s.g.style.display !== show) s.g.style.display = show; });
    sc.g.style.opacity = si < m.scenes.length - 1 ? clamp((sc.t1 - t) / 420, 0, 1) : 1;
    let active = null, last = null;
    for (const o of sc.ops) {
      const p = clamp((t - o.d0) / o.dur, 0, 1);
      if (o.p !== p) { o.set(p); o.p = p; }
      if (t >= o.t0 && t < o.t1) active = o;
      else if (t >= o.t1 && o.pen) last = o;
    }
    const from = last ? last.pen(1) : REST;
    let pos = from, down = false;
    if (active && active.pen) {
      if (t < active.d0) { const u = ease((t - active.t0) / active.lead), to = active.pen(0); pos = [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u]; }
      else { pos = active.pen(active.p); down = true; }
      m.tip.style.fill = active.color;
    }
    m.pen.setAttribute('transform', `translate(${f1(pos[0] + (down ? 0 : 7))},${f1(pos[1] - (down ? 0 : 10))})`);
    return { scene: si, thinking: active && active.think ? clamp((t - active.d0) / active.dur, 0, 1) : -1 };
  }
  const stepAt = (m, t) => { let i = 0; for (let k = 0; k < m.steps.length; k++) if (t >= m.steps[k].t0) i = k; return i; };
  function caption(step, t) {
    const u = clamp((t - step.t0) / step.sayMs, 0, 0.999);
    let acc = 0;
    for (const p of step.parts) { acc += p.share; if (u < acc) return p.text; }
    return step.parts[step.parts.length - 1].text;
  }
  const fontsIn = () => (document.fonts && document.fonts.load)
    ? Promise.race([Promise.all([document.fonts.load('400 40px Kalam'), document.fonts.load('700 40px Kalam')]), sleep(2600)]).catch(() => { })
    : Promise.resolve();

  const fontHere = () => { try { return document.fonts.check('400 40px Kalam'); } catch (e) { return true; } };

  /* ---- the player ---- */
  let P = null, mountSeq = 0;
  const SPEEDS = [0.75, 1, 1.25, 1.5];
  function unmount() {
    mountSeq++;
    if (P) { cancelAnimationFrame(P.raf); P.playing = false; if (P.M && P.l) { try { P.l.tv = P.t >= P.M.total ? 0 : stepAt(P.M, P.t); save(); } catch (e) { } } document.removeEventListener('visibilitychange', P.onVis); }
    P = null; Voice.stop();
  }
  async function mount(root, tdef, l) {
    unmount();
    const my = mountSeq;
    root.innerHTML = `<div class="player">
      <div class="player-main">
        <div class="board"><svg class="bsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="The teacher's squared paper, with the working written out by hand"></svg>
          <div class="think" hidden><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" style="fill:none;stroke:rgba(255,255,255,.3);stroke-width:4"/><circle class="think-ring" cx="14" cy="14" r="11" style="fill:none;stroke:var(--sun);stroke-width:4;stroke-linecap:round"/></svg><span>Your thinking time</span></div>
          <button type="button" class="board-cover" data-t="play"><span class="big">${icon('play', 44)}</span><b class="cover-label">Play the explanation</b></button>
          <div class="board-end" hidden><div><strong>That is the whole explanation.</strong><div class="cta-row" style="margin:0;justify-content:center"><button type="button" class="btn" data-t="restart">${icon('replay', 18)} Watch again</button><button type="button" class="btn btn-primary" data-action="stage" data-i="3">Go to practice ${icon('right', 18)}</button></div></div></div>
        </div>
        <div class="captions" aria-live="off"></div>
        <div class="scrub" role="slider" tabindex="0" aria-label="Move through the explanation" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
        <div class="controls">
          <button type="button" class="pp" data-t="toggle" aria-label="Play">${icon('play', 26)}</button>
          <button type="button" class="ctl" data-t="restart" aria-label="Start again">${icon('replay', 18)}</button>
          <span class="time">0:00</span>
          <button type="button" class="ctl" data-t="speed" aria-label="Playback speed">1×</button>
          <button type="button" class="ctl" data-t="cc" aria-pressed="true">${icon('cc', 18)} Captions</button>
          <button type="button" class="ctl" data-t="voice" aria-pressed="false">${icon('sound', 18)} Voice</button>
        </div>
      </div>
      <nav class="chapters" aria-label="Chapters"><p class="ch-title">Chapters</p><div class="ch-list" style="display:contents"></div><p class="voice-note"></p></nav>
    </div>`;
    await fontsIn();
    if (my !== mountSeq || !root.isConnected) return;
    const hadFont = fontHere(), M = build($('.bsvg', root), tdef.script), still = M.scenes[Math.min(tdef.poster == null ? 1 : tdef.poster, M.scenes.length - 1)].t1 - 720;
    const el = { cover: $('.board-cover', root), end: $('.board-end', root), think: $('.think', root), ring: $('.think-ring', root), cap: $('.captions', root), scrub: $('.scrub', root),
      pp: $('.pp', root), time: $('.time', root), speed: $('[data-t=speed]', root), cc: $('[data-t=cc]', root), voice: $('[data-t=voice]', root), note: $('.voice-note', root) };
    const resume = l.tv > 0 && l.tv < M.steps.length - 1 ? M.steps[l.tv].t0 : 0;
    P = { M, l, t: resume, playing: false, started: false, step: -1, speed: SPEEDS.includes(S.speed) ? S.speed : 1, live: false, held: 0, utter: 0, fails: 0, dead: !Voice.ok, raf: 0, last: 0, capText: null };
    const me = P;
    el.scrub.innerHTML = M.scenes.map(s => `<span class="seg-t" style="flex:${Math.round(s.t1 - s.t0)}"><i></i></span>`).join('');
    $('.ch-list', root).innerHTML = M.scenes.map((s, i) => `<button type="button" class="chapter" data-ch="${i}"><span class="n">${i + 1}</span><span>${s.title}</span><small>${fmt(s.t0)}</small></button>`).join('');
    $('.cover-label', root).textContent = resume ? `Carry on from ${fmt(resume)}` : `Play the explanation · ${Math.round(M.total / 60000)} minutes`;
    el.note.textContent = Voice.ok ? 'The voice is your device reading the captions aloud.' : 'Reading voice is not available in this browser. Captions show every word.';
    const fills = $$('.seg-t i', root), chapters = $$('.chapter', root);
    const ringLen = 2 * Math.PI * 11;
    el.ring.style.strokeDasharray = `${ringLen} ${ringLen}`;

    function draw() {
      const shown = me.started ? me.t : (resume || still);   // before play: show a finished page as the poster
      const r = renderAt(M, shown);
      M.pen.style.opacity = me.started ? 1 : 0.9;
      const tt = me.started ? me.t : resume;
      fills.forEach((f, i) => { const s = M.scenes[i]; f.style.width = clamp((tt - s.t0) / (s.t1 - s.t0), 0, 1) * 100 + '%'; });
      el.time.textContent = `${fmt(tt)} / ${fmt(M.total)}`;
      el.scrub.setAttribute('aria-valuenow', Math.round(tt / M.total * 100));
      const cur = me.started ? r.scene : (resume ? r.scene : -1);
      chapters.forEach((c, i) => { c.classList.toggle('is-on', i === cur); c.classList.toggle('is-past', cur > i); });
      el.think.hidden = r.thinking < 0;
      if (r.thinking >= 0) el.ring.style.strokeDashoffset = ringLen * r.thinking;
      const text = !S.cc ? 'Captions are off' : me.started ? caption(M.steps[stepAt(M, me.t)], me.t) : 'Press play and your teacher will start writing.';
      if (text !== me.capText) { me.capText = text; el.cap.textContent = text; el.cap.classList.toggle('off', !S.cc); }
    }
    function ui() {
      el.pp.innerHTML = icon(me.playing ? 'pause' : 'play', 26);
      el.pp.setAttribute('aria-label', me.playing ? 'Pause' : 'Play');
      el.cover.hidden = me.started;
      el.end.hidden = !(me.started && !me.playing && me.t >= M.total);
      el.speed.textContent = me.speed + '×';
      el.cc.setAttribute('aria-pressed', !!S.cc);
      const vOn = S.voice && !me.dead;
      el.voice.setAttribute('aria-pressed', vOn);
      el.voice.innerHTML = `${icon(vOn ? 'sound' : 'mute', 18)} Voice`;
      el.voice.disabled = me.dead && !Voice.ok;
    }
    function speak(i) {
      if (!S.voice || me.dead) return;
      me.live = true; me.held = 0;
      const mine = ++me.utter;
      let begun = false;
      Voice.say(M.steps[i].say, { rate: clamp(0.92 * me.speed, 0.5, 2), onstart: () => { begun = true; }, onend: () => { if (mine === me.utter) me.live = false; } });
      setTimeout(() => {   // some browsers never start speaking inside an embedded page: fall back to captions
        let talking = begun;
        try { talking = talking || speechSynthesis.speaking; } catch (e) { }
        if (mine === me.utter && !talking) { me.live = false; if (++me.fails >= 2) { me.dead = true; el.note.textContent = 'The reading voice did not start here, so captions show every word.'; ui(); } }
      }, 1900);
    }
    function tick(now) {
      if (P !== me || !me.playing) return;
      const dt = Math.min(120, now - me.last); me.last = now;
      const si = stepAt(M, me.t);
      if (si !== me.step) { me.step = si; speak(si); }
      let nt = me.t + dt * me.speed;
      const st = M.steps[si];
      if (me.live && nt >= st.t1 - 40) {      // the teacher is still talking: wait for the sentence to finish
        nt = Math.max(me.t, st.t1 - 40); me.held += dt;
        if (me.held > 7000) me.live = false;
      } else me.held = 0;
      me.t = nt;
      if (me.t >= M.total) { me.t = M.total; me.playing = false; l.tv = 0; save(); Voice.stop(); ui(); }
      draw();
      if (me.playing) me.raf = requestAnimationFrame(tick);
    }
    function play() {
      if (me.t >= M.total) me.t = 0;
      if (S.voice && !me.dead) me.t = M.steps[stepAt(M, me.t)].t0;    // with voice on, restart the sentence being spoken
      me.started = true; me.playing = true; me.last = performance.now();
      me.step = stepAt(M, me.t); speak(me.step);      // start talking inside the tap itself
      ui(); cancelAnimationFrame(me.raf); me.raf = requestAnimationFrame(tick);
    }
    function pause() {
      me.playing = false; me.live = false; me.utter++; cancelAnimationFrame(me.raf); Voice.stop();
      l.tv = stepAt(M, me.t); save(); ui(); draw();
    }
    function seek(ms, snap = true) {
      me.started = true;
      me.t = snap ? M.steps[stepAt(M, clamp(ms, 0, M.total - 1))].t0 : clamp(ms, 0, M.total);
      me.step = -1; me.live = false; me.utter++; Voice.stop();
      ui(); draw();
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-t]'), ch = e.target.closest('[data-ch]');
      if (ch) { seek(M.scenes[+ch.dataset.ch].t0); if (!me.playing) play(); return; }
      if (!b) return;
      const t = b.dataset.t;
      if (t === 'play') play();
      else if (t === 'toggle') me.playing ? pause() : play();
      else if (t === 'restart') { seek(0); play(); }
      else if (t === 'speed') { me.speed = SPEEDS[(SPEEDS.indexOf(me.speed) + 1) % SPEEDS.length]; S.speed = me.speed; save(); ui(); }
      else if (t === 'cc') { S.cc = !S.cc; save(); ui(); draw(); }
      else if (t === 'voice') { S.voice = !(S.voice && !me.dead); if (S.voice) { me.dead = !Voice.ok; me.fails = 0; } else { me.live = false; me.utter++; Voice.stop(); } save(); ui(); if (me.playing && S.voice) { me.step = -1; } }
    });
    const at = e => { const r = el.scrub.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1) * M.total; };
    let drag = false;
    el.scrub.addEventListener('pointerdown', e => { drag = true; try { el.scrub.setPointerCapture(e.pointerId); } catch (x) { } seek(at(e)); });
    el.scrub.addEventListener('pointermove', e => { if (drag) seek(at(e)); });
    el.scrub.addEventListener('pointerup', () => { drag = false; });
    el.scrub.addEventListener('pointercancel', () => { drag = false; });
    el.scrub.addEventListener('keydown', e => {
      const i = stepAt(M, me.t);
      if (e.key === 'ArrowRight') { e.preventDefault(); seek(M.steps[Math.min(i + 1, M.steps.length - 1)].t0); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); seek(M.steps[Math.max(i - 1, 0)].t0); }
    });
    me.onVis = () => { if (document.hidden && me.playing) pause(); };
    document.addEventListener('visibilitychange', me.onVis);
    ui(); draw();
    if (!hadFont && document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (P === me && !me.started && fontHere()) { Object.assign(M, build($('.bsvg', root), tdef.script)); draw(); } });
  }
  /* a still frame for the homepage */
  async function poster(root, tdef) {
    const my = mountSeq;
    root.innerHTML = `<div class="board" style="border-radius:0;box-shadow:none"><svg class="bsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="A page of the teacher's handwritten working"></svg></div>`;
    await fontsIn();
    if (!root.isConnected || my !== mountSeq) return;
    const M = build($('.bsvg', root), tdef.script);
    renderAt(M, M.scenes[Math.min(tdef.poster == null ? 1 : tdef.poster, M.scenes.length - 1)].t1 - 720);
  }
  return { mount, unmount, poster, ops };
})();
