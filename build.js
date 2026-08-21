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

const currentCss = '.check-row{display:flex;gap:10px 18px;align-items:center;flex-wrap:wrap;padding:8px 0}.check-row label{font-weight:700;font-size:13px;color:#303743;display:flex;align-items:center;gap:5px}';
const compactCss = '.check-row{display:flex;gap:10px 18px;align-items:center;flex-wrap:nowrap;padding:8px 0;overflow-x:auto}.check-row label{font-weight:700;font-size:13px;color:#303743;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;flex:0 0 auto}.check-row input[type="checkbox"]{width:16px!important;height:16px!important;min-width:16px;min-height:16px;margin:0;flex:0 0 16px}';

if (!html.includes(currentCss)) {
  throw new Error('Stamp checkbox CSS target not found; refusing to deploy an unverified layout patch.');
}

html = html.replace(currentCss, compactCss);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Built FOR-e V1.4.1: compact stamp checkboxes + single-line labels');
