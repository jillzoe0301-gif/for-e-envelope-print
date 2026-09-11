const fs = require('fs');
const path = require('path');

const root = __dirname;
const targets = [
  'dist/for-e-envelope-print-system.html',
  'public/for-e-envelope-print-system.html'
];

const oldRule = "if(text.includes('就業中心')||text.includes('就業服務中心')||text.includes('就業服務站')) return '就業中心';";
const newRule = "if(text.includes('就業中心')||text.includes('就業服務中心')||text.includes('就業服務站')||text.includes('就業服務處')||text.includes('台北市就業服務處')||text.includes('臺北市就業服務處')) return '就業中心';";

let patched = 0;
for (const relativePath of targets) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) continue;

  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes(newRule)) {
    patched += 1;
    continue;
  }
  if (!html.includes(oldRule)) {
    throw new Error(`Employment-center classification rule not found in ${relativePath}`);
  }

  html = html.replaceAll(oldRule, newRule);
  html = html.replace(
    /<title>FOR-e信封列印系統[^<]*<\/title>/,
    '<title>FOR-e信封列印系統 V1.7.5</title>'
  );
  fs.writeFileSync(filePath, html, 'utf8');
  patched += 1;
}

if (!patched) {
  throw new Error('No envelope system file was patched by V1.7.5.');
}

console.log(`Classified 就業服務處 as 就業中心 in ${patched} file(s).`);
