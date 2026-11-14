/* =====================================================================
   Kite Learning prototype — core: helpers, icons, state, figures
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const TAU = Math.PI * 2;
const REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const f1 = n => (Math.round(n * 10) / 10).toString();

/* ---------- icons (24px stroke set) ---------- */
const ICONS = {
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  play: '<path d="M8 5.2v13.6a.6.6 0 00.9.5l11-6.8a.6.6 0 000-1L8.9 4.7a.6.6 0 00-.9.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/>',
  replay: '<path d="M4 12a8 8 0 102.6-5.9"/><path d="M4 4.5V9h4.5"/>',
  sound: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9.2a4 4 0 010 5.6M18 6.8a7.4 7.4 0 010 10.4"/>',
  mute: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  cc: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M10.5 10.6a2 2 0 100 2.8M16.5 10.6a2 2 0 100 2.8"/>',
  star: '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z" fill="currentColor"/>',
  flame: '<path d="M12 3c.5 3.3 5 4.9 5 9.7a5 5 0 01-10 0c0-1.8.8-3 1.8-3.9.3 1.3 1 2 1.9 2.3C10.5 8.5 10.5 5.5 12 3z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 00-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0012 3z"/>',
  tap: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21"/>',
  book: '<path d="M12 6.5C10 5 7 4.6 4 5v13c3-.4 6 0 8 1.5 2-1.5 5-1.9 8-1.5V5c-3-.4-6 0-8 1.5z"/><path d="M12 6.5v13"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0114 0"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5a6 6 0 0112 0"/><path d="M16 5.6a3.2 3.2 0 010 5.8M17.5 14.2a6 6 0 013.5 5.3"/>',
  chart: '<path d="M4 20v-9M10 20V5M16 20v-6M21.5 20h-19"/>',
  home: '<path d="M4 11.2L12 4l8 7.2V20h-5.5v-5.5h-5V20H4z"/>',
  pencil: '<path d="M4 20l1-4.2L16.3 4.5a2 2 0 012.9 2.9L7.9 18.7z"/><path d="M14.5 6.3l3 3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  spark: '<path d="M11 4.5l1.8 4.7 4.7 1.8-4.7 1.8L11 17.5l-1.8-4.7L4.5 11l4.7-1.8z"/><path d="M18.5 3.5v3M17 5h3"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  medal: '<circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 3l3.5 6 3.5-6"/>',
  shapes: '<path d="M12 3.5l4 6.5H8z"/><circle cx="7.5" cy="17" r="3.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  bubble: '<path d="M4.5 5.5h15a1 1 0 011 1v9a1 1 0 01-1 1H10l-4.5 3.7v-3.7h-1a1 1 0 01-1-1v-9a1 1 0 011-1z"/><path d="M8 9.5h8M8 12.5h5"/>',
  maths: '<path d="M4.5 7.5h5M7 5v5M14.5 7.5h5M5 14.5l4 4M9 14.5l-4 4M14.5 16.5h5"/><circle cx="17" cy="13.8" r=".7" fill="currentColor"/><circle cx="17" cy="19.2" r=".7" fill="currentColor"/>',
  steps: '<path d="M4 20h5v-5h5v-5h6"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".9" fill="currentColor"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  cut: '<circle cx="6.5" cy="7" r="2.5"/><circle cx="6.5" cy="17" r="2.5"/><path d="M8.6 8.4L20 17M8.6 15.6L20 7"/>',
  count: '<path d="M9 4L7 20M17 4l-2 16M4.5 9h16M3.5 15h16"/>',
  skip: '<path d="M5 6l7 6-7 6zM13 6l7 6-7 6z"/>',
  flip: '<path d="M12 3v18M8 7l-4 5 4 5zM16 7l4 5-4 5z"/>',
  hop: '<path d="M3.5 17c2-7.5 5.5-11 8.5-11s6.5 3.5 8.5 11"/><path d="M16.5 13.5l4 3.5 1.5-5"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  ruler: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3"/>',
  heart: '<path d="M12 20s-7-4.4-7-9.6A3.9 3.9 0 0112 8a3.9 3.9 0 017 2.4C19 15.6 12 20 12 20z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
};
function icon(name, size = 20, cls = '') {
  return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ---------- the kite ---------- */
function kite(cls = '', tail = false) {
  const t = tail
    ? `<path d="M28 64c-9 7 7 11-1 18s5 10 1 16" style="fill:none;stroke:var(--line-2);stroke-width:2;stroke-linecap:round"/>
       <path d="M20 74l10-3-4 9z" style="fill:var(--rose)"/><path d="M33 90l-10-2 6 8z" style="fill:var(--blue)"/>` : '';
  return `<svg class="${cls}" viewBox="-4 -2 64 ${tail ? 106 : 70}" aria-hidden="true">
    ${t}
    <path d="M28 2L4 23h24z" style="fill:var(--blue)"/><path d="M28 2l24 21H28z" style="fill:var(--rose)"/>
    <path d="M52 23L28 64V23z" style="fill:#F4A720"/><path d="M4 23l24 41V23z" style="fill:var(--teal)"/>
    <path d="M28 2v62M4 23h48" style="fill:none;stroke:var(--surface);stroke-width:1.8;stroke-linecap:round"/>
  </svg>`;
}
const logo = (href = '#home') => `<a class="logo" href="${href}" aria-label="Kite Learning">${kite()}<span>Kite <em>Learning</em></span></a>`;

/* ---------- words ---------- */
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const DEN = [null, 'whole', 'half', 'third', 'quarter', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
function fracWords(n, d) {
  if (d === 1) return n === 1 ? 'one whole' : `${NUM[n]} wholes`;
  const plural = d === 2 ? 'halves' : DEN[d] + 's';
  return `${NUM[n] ?? n} ${n === 1 ? DEN[d] : plural}`;
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function frac(n, d, cls = '') {
  const label = (Number.isInteger(n) && Number.isInteger(d) && d > 0 && d <= 12 && n <= 12) ? fracWords(n, d) : `${n} over ${d}`;
  return `<span class="frac ${cls}" role="img" aria-label="${label}"><span class="fn">${n}</span><span class="fbar"></span><span class="fd">${d}</span></span>`;
}
function svgFrac(x, y, n, d, s = 44, cls = '') {
  return `<g class="sfrac ${cls}" transform="translate(${x},${y})"><text class="sf-n" y="${f1(-s * 0.2)}" font-size="${s}">${n}</text><rect class="sf-bar" x="${f1(-s * 0.44)}" y="${f1(-s * 0.07)}" width="${f1(s * 0.88)}" height="${f1(s * 0.1)}" rx="${f1(s * 0.05)}"/><text class="sf-d" y="${f1(s * 0.9)}" font-size="${s}">${d}</text></g>`;
}

/* ---------- figures: every fraction picture comes from here ---------- */
const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
function sector(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  return `M${cx},${cy}L${f1(x0)},${f1(y0)}A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${f1(x1)},${f1(y1)}Z`;
}
let figSeq = 0;
/* spec: {t:'pie'|'bar'|'grid'|'strips'|'tri', n, on:[...], w:[fractions]} */
function figData(spec) {
  const parts = [], on = new Set(spec.on || []);
  let vb = '0 0 200 200', defs = '', over = '';
  if (spec.t === 'pie') {
    const n = spec.n, r = 90;
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + i * TAU / n, a1 = a0 + TAU / n, m = (a0 + a1) / 2;
      parts.push(n === 1
        ? { tag: 'circle', attr: `cx="100" cy="100" r="${r}"`, c: [100, 100], o: [100, 100] }
        : { tag: 'path', attr: `d="${sector(100, 100, r, a0, a1)}"`, c: polar(100, 100, r * 0.62, m), o: polar(100, 100, r + 16, m) });
    }
  } else if (spec.t === 'bar') {
    vb = '0 0 320 100';
    const n = spec.n, W = 312, ws = spec.w ? spec.w.map(f => f * W) : Array(n).fill(W / n);
    let x = 4;
    for (let i = 0; i < n; i++) {
      parts.push({ tag: 'rect', attr: `x="${f1(x + 2)}" y="12" width="${f1(ws[i] - 4)}" height="76" rx="9"`, c: [x + ws[i] / 2, 50], o: [x + ws[i] / 2, -6] });
      x += ws[i];
    }
  } else if (spec.t === 'grid') {
    const R = spec.r, C = spec.c, s = 176 / Math.max(R, C), ox = (200 - C * s) / 2, oy = (200 - R * s) / 2;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++)
      parts.push({ tag: 'rect', attr: `x="${f1(ox + c * s + 2)}" y="${f1(oy + r * s + 2)}" width="${f1(s - 4)}" height="${f1(s - 4)}" rx="9"`, c: [ox + c * s + s / 2, oy + r * s + s / 2] });
  } else if (spec.t === 'strips') {
    /* a circle cut by parallel lines: the parts are NOT equal */
    const id = 'fc' + (++figSeq), n = spec.n, cuts = spec.w || Array.from({ length: n }, () => 1 / n);
    defs = `<defs><clipPath id="${id}"><circle cx="100" cy="100" r="90"/></clipPath></defs>`;
    let x = 10;
    for (let i = 0; i < n; i++) {
      const w = cuts[i] * 180;
      parts.push({ tag: 'rect', attr: `x="${f1(x)}" y="8" width="${f1(w)}" height="184" clip-path="url(#${id})"`, c: [x + w / 2, 100] });
      x += w;
    }
    over = `<circle cx="100" cy="100" r="90" style="fill:none;stroke:var(--ink);stroke-width:2.5"/>`;
  } else if (spec.t === 'tri') {
    /* a square cut by its two diagonals into four equal triangles */
    const P = [[14, 14], [186, 14], [186, 186], [14, 186]], m = [100, 100];
    for (let i = 0; i < 4; i++) {
      const a = P[i], b = P[(i + 1) % 4];
      parts.push({ tag: 'path', attr: `d="M${m}L${a}L${b}Z"`, c: [(a[0] + b[0] + m[0]) / 3, (a[1] + b[1] + m[1]) / 3] });
    }
  }
  return { parts, on, vb, defs, over };
}
function figLabel(spec) {
  const n = (spec.on || []).length, d = spec.t === 'grid' ? spec.r * spec.c : spec.n;
  const equal = spec.t !== 'strips' && !spec.w;
  return `${spec.t === 'pie' || spec.t === 'strips' ? 'Circle' : spec.t === 'bar' ? 'Bar' : 'Square'} split into ${d} ${equal ? 'equal' : 'unequal'} parts, ${n} coloured`;
}
function fig(spec, o = {}) {
  const { parts, on, vb, defs, over } = figData(spec);
  const body = parts.map((p, i) => {
    const tap = o.tap ? ` tabindex="0" role="button" aria-pressed="${on.has(i)}" aria-label="Part ${i + 1}"` : '';
    return `<${p.tag} class="part${on.has(i) ? ' on' : ''}" data-i="${i}" ${p.attr}${tap}/>`;
  }).join('');
  const counts = o.counts ? parts.map((p, i) => `<text class="cnt" data-c="${i}" x="${f1(p.c[0])}" y="${f1(p.c[1])}">${i + 1}</text>`).join('') : '';
  const aria = o.tap ? `role="group" aria-label="${esc(o.label || 'Tap the parts to colour them')}"` : `role="img" aria-label="${esc(o.label || figLabel(spec))}"`;
  return `<svg class="fig fig-${spec.t}${o.tap ? ' tap' : ''} ${o.cls || ''}" viewBox="${vb}" ${aria}>${defs}${body}${over}${counts}</svg>`;
}
/* make a rendered figure tappable; calls back with the set of coloured parts */
function tapFig(svg, onChange) {
  const toggle = el => {
    el.classList.toggle('on');
    el.setAttribute('aria-pressed', el.classList.contains('on'));
    onChange($$('.part.on', svg).map(p => +p.dataset.i));
  };
  svg.addEventListener('click', e => { const p = e.target.closest('.part'); if (p) toggle(p); });
  svg.addEventListener('keydown', e => {
    const p = e.target.closest('.part');
    if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(p); }
  });
}
/* count parts one by one: pulses each part and shows its number */
async function countParts(svg, idx, { top = false, instant = false, alive = () => true } = {}) {
  for (let k = 0; k < idx.length; k++) {
    if (!alive()) return;
    const part = $(`.part[data-i="${idx[k]}"]`, svg), t = $(`.cnt[data-c="${idx[k]}"]`, svg);
    if (t) { t.textContent = k + 1; t.classList.toggle('top', top); t.classList.add('show'); }
    if (part && !instant) {
      part.classList.remove('pulse', 'pulse-on'); void part.getBoundingClientRect();
      part.classList.add(top ? 'pulse-on' : 'pulse');
      await sleep(REDUCED ? 60 : 480);
    }
  }
}
function clearCounts(svg) { $$('.cnt', svg).forEach(t => t.classList.remove('show')); }

/* ---------- saved state ---------- */
const KEY = 'kite-learning-proto-v2', OLD_KEY = 'kite-learning-proto-v1';
const freshLesson = () => ({
  started: false, stage: 0, slide: 0, beat: 0, flags: {}, missions: 0, wins: [], tool: null,
  ex: 0, exStep: 0, exDone: [], pr: { i: 0, log: [], fastAsked: false }, ma: { i: 0, ans: [], done: false, score: 0 }, complete: false, tv: 0,
});
const S = {
  auth: false, parent: 'Alex',
  kids: [{ id: 'k1', name: 'Maya', year: 4, c: 'blue' }, { id: 'k2', name: 'Leo', year: 6, c: 'teal' }],
  active: 'k1', prog: {}, voice: true, cc: true, speed: 1,   // prog[childId][lessonId] = that child's place in that lesson
};
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved && saved.kids && saved.prog) Object.assign(S, saved);
  else {
    /* carry over progress saved by the first version of the prototype, which had one lesson */
    const old = JSON.parse(localStorage.getItem(OLD_KEY) || 'null');
    if (old && old.kids && old.prog) {
      const { prog, ...rest } = old;
      Object.assign(S, rest);
      S.prog = {};
      for (const k of S.kids) {
        const p = prog[k.id];
        if (p && typeof p.stage === 'number') S.prog[k.id] = { 'understanding-fractions': { ...p, flags: { fair: p.fair == null ? null : p.fair }, tool: p.lab || null } };
      }
    }
  }
  for (const k of Object.keys(S.prog)) for (const id of Object.keys(S.prog[k])) S.prog[k][id] = Object.assign(freshLesson(), S.prog[k][id]);
} catch (e) { /* storage unavailable: the prototype still works for this visit */ }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
const kid = () => S.kids.find(k => k.id === S.active) || S.kids[0];
/* a child's place in one lesson (created the first time it is asked for) */
function prog(lessonId, kidId = kid().id) {
  const mine = S.prog[kidId] || (S.prog[kidId] = {});
  return mine[lessonId] || (mine[lessonId] = freshLesson());
}

/* sample figures for the two demo children (clearly labelled as sample data where shown) */
const DEMO = {
  k1: { streak: 4, stars: 120, week: [15, 20, 0, 25, 10, 0, 0], lessons: 5, mastered: 3, subj: { maths: 14, english: 9, vr: 6, nvr: 4 } },
  k2: { streak: 9, stars: 465, week: [20, 25, 30, 15, 20, 0, 0], lessons: 9, mastered: 6, subj: { maths: 46, english: 38, vr: 31, nvr: 27 } },
};
const demo = () => DEMO[kid().id] || DEMO.k1;

/* ---------- voice (read aloud) ---------- */
const Voice = {
  ok: 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function',
  voice: null, cur: null,
  pick() {
    if (!this.ok) return;
    let vs = [];
    try { vs = speechSynthesis.getVoices() || []; } catch (e) { }
    const gb = vs.filter(v => /en[-_]GB/i.test(v.lang));
    const want = ['Sonia', 'Libby', 'Google UK English Female', 'Martha', 'Kate', 'Serena', 'Stephanie', 'Daniel', 'Arthur'];
    this.voice = want.map(w => gb.find(v => v.name.includes(w))).find(Boolean) || gb[0] || vs.find(v => /^en/i.test(v.lang)) || null;
  },
  say(text, { rate = 0.95, onend, onstart } = {}) {
    if (!this.ok) return false;
    try {
      const busy = speechSynthesis.speaking || speechSynthesis.pending;
      if (busy) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB'; if (this.voice) u.voice = this.voice;
      u.rate = rate; u.pitch = 1.05;
      let ended = false;
      const fin = () => { if (!ended) { ended = true; onend && onend(); } };
      u.onend = fin; u.onerror = fin; u.onstart = () => onstart && onstart();
      this.cur = u;
      const start = () => { try { speechSynthesis.speak(u); } catch (e) { fin(); } };
      if (busy) setTimeout(start, 60); else start();
      return true;
    } catch (e) { return false; }
  },
  /* sentences queued back to back, so the teacher talks without gaps; onpart(i) fires as sentence i starts */
  sayAll(texts, { rate = 0.95, onpart, onend } = {}) {
    if (!this.ok || !texts.length) return false;
    try {
      const busy = speechSynthesis.speaking || speechSynthesis.pending;
      if (busy) speechSynthesis.cancel();
      let ended = false;
      const fin = () => { if (!ended) { ended = true; onend && onend(); } };
      const us = texts.map((text, i) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-GB'; if (this.voice) u.voice = this.voice;
        u.rate = rate; u.pitch = 1.05;
        u.onstart = () => onpart && onpart(i);
        u.onerror = fin;
        return u;
      });
      us[us.length - 1].onend = fin;
      this.cur = us;      // keep a reference: some browsers drop events for utterances that are garbage-collected
      const start = () => { try { us.forEach(u => speechSynthesis.speak(u)); } catch (e) { fin(); } };
      if (busy) setTimeout(start, 60); else start();
      return true;
    } catch (e) { return false; }
  },
  stop() { if (this.ok) { try { speechSynthesis.cancel(); } catch (e) { } } },
};
if (Voice.ok) { Voice.pick(); try { speechSynthesis.addEventListener('voiceschanged', () => Voice.pick()); } catch (e) { } }

/* ---------- toast ---------- */
let toastT = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ---------- curriculum map ---------- */
const SUBJECTS = [
  { id: 'maths', name: 'Mathematics', c: 'blue', ico: 'maths', line: 'Number, fractions, shape and problem solving.', topics: ['Place value and the four operations', 'Fractions, decimals and percentages', 'Geometry, measures and data'], live: true },
  { id: 'english', name: 'English', c: 'rose', ico: 'book', line: 'Reading closely and writing with care.', topics: ['Comprehension', 'Spelling, punctuation and grammar', 'Vocabulary'] },
  { id: 'vr', name: 'Verbal Reasoning', c: 'amber', ico: 'bubble', line: 'Solving puzzles made of words and letters.', topics: ['Word and letter codes', 'Synonyms and antonyms', 'Number and letter sequences'] },
  { id: 'nvr', name: 'Non-Verbal Reasoning', c: 'teal', ico: 'shapes', line: 'Spotting patterns in shapes and pictures.', topics: ['Shape sequences', 'Rotations and reflections', 'Odd one out and analogies'] },
];
const PATHWAYS = [
  { name: 'Number', note: 'Where everything starts', topics: [
    { id: 'place-value', name: 'Place Value', g: '123', done: 8 },
    { id: 'add-subtract', name: 'Addition & Subtraction', g: '+ −', done: 10 },
    { id: 'multiply-divide', name: 'Multiplication & Division', g: '× ÷', done: 5 },
    { id: 'factors', name: 'Factors, Multiples & Primes', g: '2·3' } ] },
  { name: 'Fractions, Decimals & Percentages', note: 'Parts of a whole', topics: [
    { id: 'fractions', name: 'Fractions', g: '½' },
    { id: 'decimals', name: 'Decimals', g: '0.5' },
    { id: 'percentages', name: 'Percentages', g: '%' },
    { id: 'ratio', name: 'Ratio & Proportion', g: '2:3' } ] },
  { name: 'Algebra', note: 'Patterns and unknowns', topics: [
    { id: 'sequences', name: 'Number Sequences', g: '2,4,6' },
    { id: 'algebra', name: 'Algebra & Equations', g: 'x' } ] },
  { name: 'Measurement', note: 'Maths in the real world', topics: [
    { id: 'units', name: 'Length, Mass & Capacity', g: 'cm' },
    { id: 'time', name: 'Time', i: 'clock' },
    { id: 'money', name: 'Money', g: '£' },
    { id: 'area', name: 'Perimeter, Area & Volume', g: 'm²' } ] },
  { name: 'Geometry', note: 'Shape and space', topics: [
    { id: 'shapes', name: '2D & 3D Shapes', i: 'shapes' },
    { id: 'angles', name: 'Angles', g: '90°' },
    { id: 'coordinates', name: 'Coordinates', g: '(x,y)' },
    { id: 'symmetry', name: 'Symmetry & Transformations', i: 'flip' } ] },
  { name: 'Statistics', note: 'Reading and using data', topics: [
    { id: 'charts', name: 'Tables, Charts & Graphs', i: 'chart' },
    { id: 'averages', name: 'Averages', g: 'avg' },
    { id: 'probability', name: 'Probability', g: '1/6' } ] },
  { name: 'Problem Solving', note: 'Putting it all together', topics: [
    { id: 'word-problems', name: 'Word Problems', g: '?' },
    { id: 'reasoning', name: 'Logic & Reasoning', i: 'spark' } ] },
];
const LESSONS = {
  'fractions': [['Understanding Fractions', 'Fractions on a Number Line', 'Equivalent Fractions', 'Comparing & Ordering Fractions'], ['Simplifying Fractions', 'Mixed Numbers & Improper Fractions', 'Adding & Subtracting Fractions', 'Fractions of Amounts'], ['Multiplying Fractions', 'Dividing Fractions', 'Fractions, Decimals & Percentages', '11+ Fraction Problems']],
  'place-value': [['Reading & Writing Numbers to 1,000', 'Hundreds, Tens & Ones', 'Comparing & Ordering Numbers'], ['Numbers to 10,000 and Beyond', 'Rounding to 10, 100 & 1,000', 'Negative Numbers'], ['Numbers to 10 Million', 'Roman Numerals']],
  'add-subtract': [['Number Bonds', 'Adding 2-digit Numbers', 'Subtracting 2-digit Numbers'], ['Column Addition', 'Column Subtraction', 'Estimating & Checking', 'Inverse Operations'], ['Multi-step Problems', 'Missing Number Problems', 'Mental Strategies']],
  'multiply-divide': [['Times Tables: 2, 5 & 10', 'Times Tables: 3, 4 & 8', 'Sharing & Grouping', 'Times Tables: 6, 7, 9, 11 & 12'], ['Short Multiplication', 'Short Division', 'Multiplying by 10, 100 & 1,000', 'Remainders'], ['Long Multiplication', 'Long Division', 'Order of Operations', 'Multi-step Problems']],
  'factors': [['Multiples', 'Factors'], ['Prime Numbers', 'Common Factors & Multiples', 'Square Numbers'], ['Cube Numbers', 'Prime Factors']],
  'decimals': [['Tenths', 'Hundredths', 'Decimals on a Number Line'], ['Comparing & Ordering Decimals', 'Rounding Decimals', 'Adding & Subtracting Decimals'], ['Multiplying Decimals', 'Dividing Decimals', 'Decimals & Fractions']],
  'percentages': [['What is a Percentage?', 'Percentages of 100'], ['Percentages, Fractions & Decimals', 'Finding 10%, 25% & 50%', 'Percentages of Amounts'], ['Percentage Increase & Decrease', 'Finding the Original Amount', '11+ Percentage Problems']],
  'ratio': [['Understanding Ratio', 'Simplifying Ratios'], ['Sharing in a Ratio', 'Scaling Recipes', 'Direct Proportion'], ['Scale Drawings & Maps', '11+ Ratio Problems']],
  'sequences': [['Counting Patterns', 'Finding the Rule'], ['Missing Terms', 'Square & Triangular Numbers'], ['The nth Term', 'Sequence Puzzles']],
  'algebra': [['Missing Number Sentences', 'Function Machines'], ['Using Letters for Numbers', 'Simplifying Expressions', 'Solving One-step Equations'], ['Solving Two-step Equations', 'Substitution & Formulae', 'Algebra Word Problems']],
  'units': [['Measuring Length', 'Mass & Weighing', 'Capacity & Volume'], ['Converting Metric Units', 'Reading Scales'], ['Imperial Units', 'Speed, Distance & Time', 'Measurement Problems']],
  'time': [['Telling the Time', 'a.m. and p.m.'], ['12-hour & 24-hour Clock', 'Time Intervals'], ['Timetables', 'Time Problems']],
  'money': [['Coins & Notes', 'Adding Money'], ['Giving Change', 'Best Value'], ['Budgeting Problems', 'Profit & Loss']],
  'area': [['Perimeter of Rectangles', 'Area by Counting Squares'], ['Area of Rectangles', 'Compound Shapes', 'Area of Triangles'], ['Area of Parallelograms', 'Volume of Cuboids', 'Surface Area', 'Perimeter & Area Problems']],
  'shapes': [['Naming 2D Shapes', 'Naming 3D Shapes'], ['Properties of Triangles', 'Properties of Quadrilaterals', 'Faces, Edges & Vertices'], ['Nets of 3D Shapes', 'Circles', 'Shape Reasoning']],
  'angles': [['Right Angles', 'Acute & Obtuse Angles'], ['Measuring Angles', 'Angles on a Line & at a Point', 'Angles in a Triangle'], ['Angles in Quadrilaterals', 'Angle Problems']],
  'coordinates': [['Reading Coordinates', 'Plotting Points'], ['Four Quadrants'], ['Missing Coordinates', 'Coordinate Problems']],
  'symmetry': [['Lines of Symmetry', 'Completing Symmetric Patterns'], ['Reflection', 'Translation'], ['Rotation', 'Combining Transformations']],
  'charts': [['Tally Charts & Pictograms', 'Bar Charts'], ['Tables & Two-way Tables', 'Line Graphs'], ['Pie Charts', 'Venn & Carroll Diagrams', 'Interpreting Data Problems']],
  'averages': [['Finding the Mode', 'Finding the Range'], ['Finding the Median', 'Finding the Mean'], ['Mean Problems']],
  'probability': [['Likely & Unlikely'], ['The Probability Scale'], ['Probability as a Fraction', 'Probability Problems']],
  'word-problems': [['One-step Problems', 'Choosing the Operation', 'Drawing Bar Models'], ['Two-step Problems', 'Money & Measure Problems', 'Working Backwards'], ['Multi-step Problems', 'Fraction & Ratio Problems', 'Reasoning Puzzles', 'Timed 11+ Papers']],
  'reasoning': [['Odd One Out', 'True or False'], ['Always, Sometimes, Never', 'Number Puzzles'], ['Logic Grids', 'Explain Your Thinking']],
};
const LEVELS = ['Foundation', 'Intermediate', 'Advanced'];
const LEVEL_NOTE = ['Start here: the big ideas, shown with pictures.', 'Build skill and speed with the methods.', 'Stretch into 11+ exam-style problems.'];
const ALL_TOPICS = PATHWAYS.flatMap(p => p.topics);
const topicById = id => ALL_TOPICS.find(t => t.id === id);
const lessonCount = id => LESSONS[id].reduce((a, l) => a + l.length, 0);

/* ---------- built lessons: each lesson file registers itself here ---------- */
const LESSON_DEFS = {};
const BUILT = {};                                  // topic id -> lesson ids, in teaching order
function addLesson(def) { LESSON_DEFS[def.id] = def; (BUILT[def.topic] = BUILT[def.topic] || [])[def.n - 1] = def.id; }
const builtIds = topic => (BUILT[topic] || []).filter(Boolean);
function lessonState(id, kidId) {                  // 'done' | 'open' | 'locked'
  const def = LESSON_DEFS[id], p = prog(id, kidId);
  if (p.complete) return 'done';
  if (def.n === 1 || p.started) return 'open';
  const prev = BUILT[def.topic][def.n - 2];
  return prev && prog(prev, kidId).complete ? 'open' : 'locked';
}
/* the lesson a child should do next: the first one that is open and not yet mastered */
function currentLessonId(kidId, topic = 'fractions') {
  const ids = builtIds(topic);
  return ids.find(id => lessonState(id, kidId) === 'open') || ids.find(id => !prog(id, kidId).complete) || ids[ids.length - 1];
}
const nextLessonId = id => { const d = LESSON_DEFS[id]; return (BUILT[d.topic] || [])[d.n] || null; };
function topicDone(t, kidId) { return BUILT[t.id] ? builtIds(t.id).filter(id => prog(id, kidId).complete).length : (t.done || 0); }
const STAGES = [
  { id: 'learn', label: 'Learn', ico: 'eye' }, { id: 'explore', label: 'Explore', ico: 'tap' }, { id: 'examples', label: 'Examples', ico: 'pencil' },
  { id: 'practise', label: 'Practise', ico: 'target' }, { id: 'mastery', label: 'Mastery check', ico: 'medal' },
];
