const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const chunkPaths = [0, 1, 2, 3, 4].map((index) =>
  path.join(root, `header-b64-${index}.txt`)
);

for (const chunkPath of chunkPaths) {
  if (!fs.existsSync(chunkPath)) {
    throw new Error(`Missing header data chunk: ${path.basename(chunkPath)}`);
  }
}

const headerBase64 = chunkPaths
  .map((chunkPath) => fs.readFileSync(chunkPath, 'utf8').replace(/\s+/g, ''))
  .join('');
const headerBytes = Buffer.from(headerBase64, 'base64');
const headerSha256 = crypto.createHash('sha256').update(headerBytes).digest('hex');
const expectedLength = 17915;
const expectedSha256 = '96043db465ead52a07bd65fd8bd87e1884374432b84af0c9c7de0e54435bac7a';

if (headerBytes.length !== expectedLength || headerSha256 !== expectedSha256) {
  throw new Error(
    `Header image verification failed: ${headerBytes.length} bytes, sha256=${headerSha256}`
  );
}

if (
  headerBytes[0] !== 0xff ||
  headerBytes[1] !== 0xd8 ||
  headerBytes[headerBytes.length - 2] !== 0xff ||
  headerBytes[headerBytes.length - 1] !== 0xd9
) {
  throw new Error('Forward Group header is not a complete JPEG file.');
}

const headerDataUri = `data:image/jpeg;base64,${headerBase64}`;
const headerMarkup = `<div class="print-header"><img src="${headerDataUri}" alt="灃禾集團表頭" width="720" height="86"></div>`;

const headerCss = `
/* FOR-E HEADER FULL DISPLAY START */
.paper .print-header,
.print-header {
  display: block !important;
  position: static !important;
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  margin: 0 0 12px !important;
  padding: 0 !important;
  overflow: visible !important;
  background: transparent !important;
  line-height: 0 !important;
}
.paper .print-header img,
.print-header img {
  display: block !important;
  position: static !important;
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  aspect-ratio: 720 / 86 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  object-fit: contain !important;
  object-position: center top !important;
  background: transparent !important;
}
/* FOR-E HEADER FULL DISPLAY END */
`;

function replaceFunction(html, functionName, replacementSource) {
  const signature = `function ${functionName}()`;
  const functionStart = html.indexOf(signature);
  if (functionStart < 0) return null;

  const bodyStart = html.indexOf('{', functionStart + signature.length);
  if (bodyStart < 0) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = bodyStart; index < html.length; index += 1) {
    const char = html[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return (
          html.slice(0, functionStart) +
          replacementSource +
          html.slice(index + 1)
        );
      }
    }
  }

  return null;
}

for (const relativePath of ['dist/index.html', 'public/index.html']) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) continue;

  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(
    /\/\* FOR-E HEADER FULL DISPLAY START \*\/[\s\S]*?\/\* FOR-E HEADER FULL DISPLAY END \*\//g,
    ''
  );
  html = html.replace('</style>', `${headerCss}\n</style>`);

  const functionSource = `function printHeader(){return ${JSON.stringify(headerMarkup)}}`;
  const replacedHtml = replaceFunction(html, 'printHeader', functionSource);

  if (replacedHtml !== null) {
    html = replacedHtml;
  } else {
    html = html.replace(
      'const deep = v => JSON.parse(JSON.stringify(v));',
      `const deep = v => JSON.parse(JSON.stringify(v));\n${functionSource}`
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

console.log(
  `Embedded verified Forward Group header: ${headerBytes.length} bytes, sha256=${headerSha256}`
);
