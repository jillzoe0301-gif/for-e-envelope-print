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

const headerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200">
<rect width="1000" height="200" fill="#fff"/>
<path d="M0 0h620l95 100-95 100H0z" fill="#fff"/>
<path d="M620 0l78 83-78 117h380V0z" fill="#f55b09"/>
<g transform="translate(26 34)" fill="none" stroke="#f55b09" stroke-width="8">
<ellipse cx="78" cy="65" rx="72" ry="54"/>
<path d="M9 93C36 37 62 14 112 7M20 106C58 68 88 46 138 35"/>
</g>
<g fill="#f55b09" transform="translate(64 60)"><circle cx="0" cy="0" r="10"/><circle cx="33" cy="5" r="10"/><circle cx="66" cy="0" r="10"/><path d="M-8 16h16l-5 38h-20zM25 21h16l-5 38H16zM58 16h16l-5 38H49z"/></g>
<text x="185" y="64" font-family="Microsoft JhengHei,Arial" font-size="40" letter-spacing="12" fill="#f55b09">灃禾集團</text>
<line x1="185" y1="78" x2="555" y2="78" stroke="#f55b09" stroke-width="2"/>
<text x="185" y="125" font-family="Arial" font-size="36" letter-spacing="4" fill="#f55b09">FORWARD GROUP</text>
<text x="188" y="162" font-family="Microsoft JhengHei,Arial" font-size="21" fill="#333">■ 顧問輔導  ■ 人力資源  ■ 職能訓練</text>
<g fill="#fff" font-family="Arial">
<text x="720" y="55" font-size="24" font-weight="700">Email : service@forwardhrm.com.tw</text>
<text x="720" y="92" font-size="24" font-weight="700">Website : www.forwardhrm.com.tw</text>
<text x="720" y="130" font-size="24">Tel : 03-357-7001</text>
<text x="720" y="168" font-size="24">Fax : 03-357-8277</text>
</g>
</svg>`;
const brandLogo = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(logoSvg);
const companyHeaderImage = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(headerSvg);

const css = `
.brand{display:flex!important;align-items:center!important;gap:12px!important}
.brand-mark{width:54px!important;height:54px!important;border-radius:16px!important;background:#fff!important;display:grid!important;place-items:center!important;overflow:hidden!important;box-shadow:0 2px 10px rgba(0,0,0,.12)!important;flex:0 0 54px!important}
.brand-mark img{width:100%;height:100%;object-fit:cover;display:block}
.brand h1{font-size:18px!important;line-height:1.2!important}
.print-header{margin-bottom:10px}
.print-header img{display:block;width:100%;height:auto}
.check-row{display:flex!important;align-items:center!important;gap:6px 12px!important;flex-wrap:nowrap!important;overflow-x:auto!important;padding-bottom:2px!important}
.check-row label{display:inline-flex!important;align-items:center!important;gap:4px!important;white-space:nowrap!important;font-size:11px!important;line-height:1!important;flex:0 0 auto!important}
.check-row input[type="checkbox"]{width:13px!important;height:13px!important;min-width:13px!important;min-height:13px!important;flex:0 0 13px!important;margin:0!important}
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
console.log(`Built FOR-e V1.5: ${html.length} bytes`);
