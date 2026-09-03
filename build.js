const fs = require('fs');
const path = require('path');

const root = __dirname;
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });
fs.cpSync(publicDir, distDir, { recursive: true });

const indexPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
<rect width="180" height="180" rx="34" fill="#fff"/>
<rect x="28" y="70" width="124" height="72" rx="18" fill="#f58220"/>
<path d="M55 18h61l25 25v56H39V34c0-9 7-16 16-16z" fill="#fff" stroke="#f58220" stroke-width="8"/>
<path d="M116 18v25h25" fill="#fff2e6" stroke="#f58220" stroke-width="5"/>
<circle cx="70" cy="65" r="7" fill="#1f2937"/><circle cx="111" cy="65" r="7" fill="#1f2937"/>
<path d="M77 82q13 12 26 0" fill="none" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
<circle cx="53" cy="78" r="7" fill="#ffb578" opacity=".65"/><circle cx="128" cy="78" r="7" fill="#ffb578" opacity=".65"/>
<path d="M48 113h28v20H48z" fill="#fff" opacity=".95"/><path d="M104 106l29 15-29 15z" fill="#ffe0ad" stroke="#c99549" stroke-width="3"/>
<rect x="72" y="100" width="18" height="25" rx="4" fill="#f7a34e"/><rect x="67" y="122" width="28" height="8" rx="4" fill="#b85b0a"/>
<text x="90" y="165" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="800" fill="#1f2937">FOR-<tspan fill="#f58220">e</tspan></text>
</svg>`;
const brandLogo = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(logoSvg);
const headerB64 = fs.readFileSync(path.join(publicDir, 'forward-group-header.b64'), 'utf8').trim();
const companyHeaderImage = 'data:image/jpeg;base64,' + headerB64;

const css = `
.brand{display:flex!important;align-items:center!important;gap:12px!important}
.brand-mark{width:54px!important;height:54px!important;border-radius:16px!important;background:#fff!important;display:grid!important;place-items:center!important;overflow:hidden!important;box-shadow:0 2px 10px rgba(0,0,0,.12)!important;flex:0 0 54px!important}
.brand-mark img{width:100%;height:100%;object-fit:cover;display:block}
.brand h1{font-size:18px!important;line-height:1.2!important}
.print-header{margin:0 0 10px 0;width:100%}
.print-header img{display:block;width:100%;height:auto;object-fit:contain}
`;
html = html.replace('</style>', css + '\n</style>');
html = html.replace(/<title>[^<]*<\/title>/, '<title>FOR-e 用印／還函／逃跑／信封列印</title>');
html = html.replace(
  'const deep = v => JSON.parse(JSON.stringify(v));',
  `const deep = v => JSON.parse(JSON.stringify(v));\nconst brandLogo = '${brandLogo}';\nconst companyHeaderImage = '${companyHeaderImage}';\nfunction printHeader(){return \`<div class="print-header"><img src="${companyHeaderImage}" alt="灃禾集團表頭"></div>\`}`
);
html = html.replace(
  '<div class="brand"><div class="brand-mark">F</div><div><h1>FOR-e 文件管理</h1><small>用印／還函／逃跑／信封列印</small></div></div>',
  '<div class="brand"><div class="brand-mark"><img src="${brandLogo}" alt="FOR-e logo"></div><div><h1>FOR-e 用印／還函／逃跑／信封列印</h1><small>文件管理系統</small></div></div>'
);
html = html.replace(
  'return `<div class="paper"><table class="doc-table">',
  'return `<div class="paper">${printHeader()}<table class="doc-table">'
);
html = html.replace(
  'return `<div class="paper"><div class="seal-logo">FOR-e DOCUMENT CONTROL</div><table class="doc-table seal-intro">',
  'return `<div class="paper">${printHeader()}<div class="seal-logo">FOR-e DOCUMENT CONTROL</div><table class="doc-table seal-intro">'
);
fs.writeFileSync(indexPath, html, 'utf8');
console.log(`Built FOR-e branded base: ${html.length} bytes`);
