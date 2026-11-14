// Builds the single-file prototype from src/.
//   kite-learning.html  -> the page as published (no <html>/<head>/<body>: the host adds them)
//   preview.html        -> the same page wrapped in a skeleton, for opening locally
const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
// order matters: shared code first, then the lesson frame, then each lesson's content, then the screens
const LESSON_FILES = fs.readdirSync(path.join(__dirname, 'src', 'lessons')).filter(f => f.endsWith('.js')).sort().map(f => 'lessons/' + f);
const js = ['core.js', 'tools.js', 'teacher.js', 'frame.js', ...LESSON_FILES, 'views.js', 'main.js'].map(src).join('\n');
const page = `${src('head.html')}<style>
${src('styles.css')}</style>
<div id="app"></div>
<div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
<script>
(() => {
'use strict';
${js}
})();
</script>
`;
fs.writeFileSync(path.join(__dirname, 'kite-learning.html'), page);
fs.writeFileSync(path.join(__dirname, 'preview.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>${page}</body></html>`);
console.log('built', (page.length / 1024).toFixed(1) + ' KB');
