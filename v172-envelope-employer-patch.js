const fs = require('fs');
const path = require('path');

const root = __dirname;
const TARGETS = [
  'dist/for-e-envelope-print-system.html',
  'public/for-e-envelope-print-system.html'
];

function baseSingleData({ zipcode = '', address, company, recipient = '' }) {
  return {
    size: 'small',
    fontSize: '20',
    xOffsetCm: '0',
    yOffsetCm: '0',
    zipcode,
    address,
    company,
    recipient,
    memo: '',
    printMode: 'single',
    d1_company: '',
    d1_address: '',
    d1_zipcode: '',
    d1_recipient: '',
    d2_company: '',
    d2_address: '',
    d2_zipcode: '',
    d2_recipient: '',
    d3_company: '',
    d3_address: '',
    d3_zipcode: '',
    d3_recipient: ''
  };
}

const NEW_OR_UPDATED_TEMPLATES = [
  {
    name: '創威光電股份有限公司 黃綉婷小姐',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '231029',
      address: '新北市新店區寶興里寶中路119號6樓',
      company: '創威光電股份有限公司',
      recipient: '黃綉婷小姐'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '開元食品工業股份有限公司總公司 姜小姐#240',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '臺北市內湖區民善街83號7樓',
      company: '開元食品工業股份有限公司總公司',
      recipient: '姜小姐#240'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '聯華製粉食品股份有限公司 林俐廷小姐',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '桃園市楊梅區員本里民富路3段647號',
      company: '聯華製粉食品股份有限公司',
      recipient: '林俐廷小姐'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '聯華製粉食品股份有限公司總公司 李秘書分機1101',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '臺北市南港區南港路1段209號10樓',
      company: '聯華製粉食品股份有限公司總公司',
      recipient: '李秘書分機1101'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  }
];

const REPLACED_TEMPLATE_NAMES = new Set([
  '創威光電股份有限公司',
  ...NEW_OR_UPDATED_TEMPLATES.map((template) => template.name)
]);

function findBalancedArray(html, marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Marker not found: ${marker}`);
  const start = html.indexOf('[', markerIndex + marker.length);
  if (start < 0) throw new Error(`Array start not found after: ${marker}`);

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = start; index < html.length; index += 1) {
    const char = html[index];

    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) return { start, end: index + 1 };
    }
  }

  throw new Error(`Array end not found after: ${marker}`);
}

function replaceFunction(html, functionName, source) {
  const signature = `function ${functionName}(`;
  const functionStart = html.indexOf(signature);
  if (functionStart < 0) throw new Error(`Function not found: ${functionName}`);

  const bodyStart = html.indexOf('{', functionStart + signature.length);
  if (bodyStart < 0) throw new Error(`Function body not found: ${functionName}`);

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = bodyStart; index < html.length; index += 1) {
    const char = html[index];

    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
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
        return html.slice(0, functionStart) + source + html.slice(index + 1);
      }
    }
  }

  throw new Error(`Function end not found: ${functionName}`);
}

const categoryFunction = `function templateCategoryLabel(t){
    if(templateModeValue(t)!=='single') return '三處通報';
    const d=(t&&t.data)||{};
    const name=String(t&&t.name||'').trim();
    const explicit=String((t&&t.category)||(d&&d.category)||'').trim();
    const text=[name,d.company,d.address,d.recipient].filter(Boolean).join(' ');
    if(text.includes('就業中心')||text.includes('就業服務中心')||text.includes('就業服務站')) return '就業中心';
    if(TEMPLATE_CATEGORY_ORDER.includes(explicit)) return explicit;
    if(TEMPLATE_CATEGORY_OVERRIDES[name]) return TEMPLATE_CATEGORY_OVERRIDES[name];
    if(text.includes('專勤隊')) return '專勤隊';
    if(text.includes('收容所')) return '收容所';
    if(text.includes('勞動部')||text.includes('勞動力發展署')) return '勞動部';
    if(text.includes('鴻生國際顧問')||text.includes('體檢醫院')) return '體檢醫院';
    if(text.includes('移民署')) return '移民署';
    if(text.includes('有限公司')||text.includes('股份有限公司')||text.includes('企業')||text.includes('雇主')||text.includes('工廠')||text.includes('顧問')) return '雇主';
    return '單一地點';
  }`;

const mergeFunction = `function mergeBuiltinTemplates(force=false){
    const original=loadTemplates();
    let list=original.filter(t=>{
      const name=String(t&&t.name||'');
      if(LEGACY_MULTI_TEMPLATE_NAMES.has(name)) return false;
      if(t&&t.builtin&&name==='創威光電股份有限公司') return false;
      return true;
    });
    const originalJson=JSON.stringify(original);
    const byName=new Map(list.map((t,i)=>[String(t&&t.name||''),i]));
    DEFAULT_TEMPLATES.forEach(template=>{
      const name=String(template.name||'');
      if(byName.has(name)){
        const index=byName.get(name);
        if(force && list[index] && list[index].builtin){
          list[index]=JSON.parse(JSON.stringify(template));
        }
      }else{
        list.push(JSON.parse(JSON.stringify(template)));
        byName.set(name,list.length-1);
      }
    });
    const seenNames=new Set();
    list=list.filter(t=>{
      const name=String(t&&t.name||'');
      if(!name) return true;
      if(seenNames.has(name)) return false;
      seenNames.add(name);
      return true;
    });
    const changed=JSON.stringify(list)!==originalJson;
    if(changed||force) localStorage.setItem(STORAGE_KEY,JSON.stringify(list));
    return changed;
  }`;

function patchHtml(html) {
  const arrayRange = findBalancedArray(html, 'const DEFAULT_TEMPLATES=');
  const templates = JSON.parse(html.slice(arrayRange.start, arrayRange.end));
  const nextTemplates = templates.filter((template) => {
    const name = String(template && template.name || '');
    return !REPLACED_TEMPLATE_NAMES.has(name);
  });
  nextTemplates.push(...NEW_OR_UPDATED_TEMPLATES);
  html = html.slice(0, arrayRange.start) + JSON.stringify(nextTemplates, null, 2) + html.slice(arrayRange.end);

  html = html.replace(
    /const BUILTIN_SEED_KEY='[^']*';/,
    "const BUILTIN_SEED_KEY='forward_envelope_builtin_seed_v20260904_addresses_v4';"
  );
  html = replaceFunction(html, 'templateCategoryLabel', categoryFunction);
  html = replaceFunction(html, 'mergeBuiltinTemplates', mergeFunction);
  html = html.replace(/<title>FOR-e信封列印系統[^<]*<\/title>/, '<title>FOR-e信封列印系統 V1.7.2</title>');
  return html;
}

let patched = 0;
for (const relativePath of TARGETS) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) continue;
  const before = fs.readFileSync(filePath, 'utf8');
  const after = patchHtml(before);
  fs.writeFileSync(filePath, after, 'utf8');
  patched += 1;
}

if (!patched) throw new Error('No envelope system file was patched by V1.7.2.');
console.log(`Applied FOR-e employment-center/employer address V1.7.2 patch to ${patched} file(s).`);
