const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = __dirname;
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });
fs.cpSync(publicDir, distDir, { recursive: true });

const encoded = [0, 1, 2]
  .map(i => fs.readFileSync(path.join(publicDir, `doc-bundle-${i}.txt`), 'utf8').trim())
  .join('');

let html = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');

html = html.replace(
  '<title>FOR-e 文件管理系統</title>',
  '<title>FOR-e 文件／信封列印系統</title>'
);

html = html.replace(
  '<small>簽收／用印管理系統</small>',
  '<small>用印／還函／逃跑／信封列印</small>'
);

html = html.replace(
  "let state = {view:'seal', escape:blankEscape(), returnDoc:blankReturn(), seal:blankSeal(), editingId:null};",
  "const initialView=(()=>{const v=new URLSearchParams(location.search).get('view');return ['seal','return','escape','history'].includes(v)?v:'seal'})();\nlet state = {view:initialView, escape:blankEscape(), returnDoc:blankReturn(), seal:blankSeal(), editingId:null};"
);

html = html.replace(
  "<nav class=\"top-nav\">${navBtn('seal','◎','用印申請明細')}${navBtn('return','▤','客戶還函簽收單')}${navBtn('escape','↪','逃跑簽收單')}${navBtn('history','◷','歷史紀錄')}</nav>",
  "<nav class=\"top-nav\">${navBtn('seal','◎','用印申請明細')}${navBtn('return','▤','客戶還函簽收單')}${navBtn('escape','↪','逃跑簽收單')}<a class=\"nav-btn\" href=\"/envelope.html\"><span class=\"nav-icon\">✉</span>信封列印</a>${navBtn('history','◷','歷史紀錄')}</nav>"
);

fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
console.log(`Built FOR-e integrated system: ${html.length} bytes`);
