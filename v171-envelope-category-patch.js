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

const ADDITIONAL_BUILTIN_TEMPLATES = [
  {
    name: '南投收容所',
    category: '收容所',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '542018',
      address: '南投縣草屯鎮中正路1776巷43號',
      company: '南投收容所'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '創威光電股份有限公司',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '231029',
      address: '新北市新店區寶興里寶中路119號6樓',
      company: '創威光電股份有限公司'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '中精壓鑄股份有限公司中壢',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '桃園市中壢區永福里中壢工業區中園路172號',
      company: '中精壓鑄股份有限公司中壢'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '中精壓鑄股份有限公司三重',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '新北市三重區頂崁里光復路2段74號',
      company: '中精壓鑄股份有限公司三重'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '布列德麵包股份有限公司 台北總公司-許心慈小姐',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '臺北市中正區重慶南路1段100號4樓',
      company: '布列德麵包股份有限公司 台北總公司',
      recipient: '許心慈小姐'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '研能科技股份有限公司 陳玉梅小姐',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '桃園市觀音區草漯里榮工南路六號',
      company: '研能科技股份有限公司',
      recipient: '陳玉梅小姐'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '台灣工機廠股份有限公司 白主任',
    category: '雇主',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '桃園市蘆竹區內厝里內溪路39巷15弄1號',
      company: '台灣工機廠股份有限公司',
      recipient: '白主任'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  }
];

const CATEGORY_OVERRIDES = new Map([
  ['勞動部勞動力發展署', '勞動部'],
  ['臺北收容所', '收容所'],
  ['台北收容所', '收容所'],
  ['宜蘭收容所', '收容所'],
  ['南投收容所', '收容所'],
  ['高雄收容所', '收容所'],
  ['鴻生國際顧問有限公司', '體檢醫院']
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

const helperBlock = `
  /* FOR-E ENVELOPE ADDRESS V1.7.1 START */
  const LEGACY_MULTI_TEMPLATE_NAMES=new Set(['逃逸通報｜桃園三處','轉出通報｜桃園三處','逃逸通報｜新北三處','轉出通報｜新北三處']);
  const TEMPLATE_CATEGORY_ORDER=['專勤隊','移民署','收容所','勞動部','就業中心','體檢醫院','雇主','三處通報','單一地點'];
  const TEMPLATE_REGION_ORDER=['臺北','新北','桃園','新竹','基隆','宜蘭','南投','高雄','其他'];
  const TEMPLATE_CATEGORY_OVERRIDES={
    '勞動部勞動力發展署':'勞動部',
    '臺北收容所':'收容所',
    '台北收容所':'收容所',
    '宜蘭收容所':'收容所',
    '南投收容所':'收容所',
    '高雄收容所':'收容所',
    '鴻生國際顧問有限公司':'體檢醫院'
  };
  function templateModeValue(t){
    const raw=(t&&t.mode)||(t&&t.data&&t.data.printMode)||'single';
    return raw==='escape'||raw==='transfer'||raw==='multi' ? raw : 'single';
  }
  function templatePrimaryAddress(t){
    const d=(t&&t.data)||{};
    return String(d.address||d.d1_address||'');
  }
  function templateRegionLabel(t){
    const address=templatePrimaryAddress(t).replaceAll('台北市','臺北市');
    if(address.includes('臺北市')) return '臺北';
    if(address.includes('新北市')) return '新北';
    if(address.includes('桃園市')) return '桃園';
    if(address.includes('新竹縣')||address.includes('新竹市')) return '新竹';
    if(address.includes('基隆市')) return '基隆';
    if(address.includes('宜蘭縣')) return '宜蘭';
    if(address.includes('南投縣')) return '南投';
    if(address.includes('高雄市')) return '高雄';
    return '其他';
  }
  function templateCategoryLabel(t){
    if(templateModeValue(t)!=='single') return '三處通報';
    const d=(t&&t.data)||{};
    const name=String(t&&t.name||'').trim();
    const explicit=String((t&&t.category)||(d&&d.category)||'').trim();
    if(TEMPLATE_CATEGORY_ORDER.includes(explicit)) return explicit;
    if(TEMPLATE_CATEGORY_OVERRIDES[name]) return TEMPLATE_CATEGORY_OVERRIDES[name];
    const text=[name,d.company,d.address,d.recipient].filter(Boolean).join(' ');
    if(text.includes('專勤隊')) return '專勤隊';
    if(text.includes('收容所')) return '收容所';
    if(text.includes('勞動部')||text.includes('勞動力發展署')) return '勞動部';
    if(text.includes('鴻生國際顧問')||text.includes('體檢醫院')) return '體檢醫院';
    if(text.includes('移民署')) return '移民署';
    if(text.includes('就業中心')||text.includes('就業服務中心')||text.includes('就業服務站')) return '就業中心';
    if(text.includes('有限公司')||text.includes('股份有限公司')||text.includes('企業')||text.includes('雇主')||text.includes('工廠')||text.includes('顧問')) return '雇主';
    return '單一地點';
  }
  function templateCategoryRank(t){
    const rank=TEMPLATE_CATEGORY_ORDER.indexOf(templateCategoryLabel(t));
    return rank<0?999:rank;
  }
  function templateDestinationNames(t){
    const d=(t&&t.data)||{};
    return [d.d1_company,d.d2_company,d.d3_company].map(x=>String(x||'').trim()).filter(Boolean);
  }
  function templateDestinationFingerprint(t){
    const d=(t&&t.data)||{};
    return [1,2,3].map(i=>[
      d['d'+i+'_company'],d['d'+i+'_address'],d['d'+i+'_zipcode']
    ].map(x=>String(x||'').trim().replaceAll('台北市','臺北市')).join('|')).join('||');
  }
  function compareTemplateEntries(a,b){
    const categoryA=templateCategoryRank(a.t),categoryB=templateCategoryRank(b.t);
    if(categoryA!==categoryB) return categoryA-categoryB;
    const regionA=TEMPLATE_REGION_ORDER.indexOf(templateRegionLabel(a.t));
    const regionB=TEMPLATE_REGION_ORDER.indexOf(templateRegionLabel(b.t));
    const safeRegionA=regionA<0?999:regionA;
    const safeRegionB=regionB<0?999:regionB;
    if(safeRegionA!==safeRegionB) return safeRegionA-safeRegionB;
    return String(a.t.name||'').localeCompare(String(b.t.name||''),'zh-Hant');
  }
  /* FOR-E ENVELOPE ADDRESS V1.7.1 END */
`;

const renderFunction = `function renderTemplates(){
    const list=loadTemplates();
    const select=$('templateSelect');
    if(!select) return;
    const current=select.value;
    const keyword=($('templateSearch') ? $('templateSearch').value.trim().toLowerCase() : '');
    const seenMultiDestinations=new Set();
    const filtered=list
      .map((t,i)=>({t,i}))
      .filter(({t})=>!keyword || templateSearchText(t).includes(keyword))
      .sort(compareTemplateEntries)
      .filter(({t})=>{
        if(templateModeValue(t)==='single') return true;
        const fingerprint=templateDestinationFingerprint(t);
        if(!fingerprint) return true;
        if(seenMultiDestinations.has(fingerprint)) return false;
        seenMultiDestinations.add(fingerprint);
        return true;
      });

    select.innerHTML='<option value="">選擇範本'+(keyword ? \`（找到 \${filtered.length} 筆）\` : '')+'</option>'+filtered.map(({t,i})=>{
      const mode=templateModeValue(t);
      const tag=templateCategoryLabel(t);
      const title=String(t.name||'未命名範本');
      const d=(t&&t.data)||{};
      let sub='';
      if(mode==='single'){
        const recipient=String(d.recipient||'').trim();
        const company=String(d.company||'').trim();
        const address=String(d.address||'').trim();
        if(recipient && !title.includes(recipient)) sub=recipient;
        else if(company && !title.includes(company)) sub=company;
        else sub=address;
      }else{
        sub=templateDestinationNames(t).join('／');
      }
      const builtin=t.builtin ? '★' : '';
      return \`<option value="\${i}">\${builtin}【\${esc(tag)}】\${esc(title)}\${sub ? '｜' + esc(sub) : ''}</option>\`;
    }).join('');
    if(current && list[Number(current)] && (!keyword || filtered.some(x=>String(x.i)===String(current)))) select.value=current;
  }`;

function patchHtml(html) {
  const arrayRange = findBalancedArray(html, 'const DEFAULT_TEMPLATES=');
  const templates = JSON.parse(html.slice(arrayRange.start, arrayRange.end));
  const additionsByName = new Map(
    ADDITIONAL_BUILTIN_TEMPLATES.map((template) => [template.name, template])
  );

  const nextTemplates = templates
    .filter((template) => !additionsByName.has(String(template && template.name || '')))
    .map((template) => {
      const name = String(template && template.name || '');
      if (CATEGORY_OVERRIDES.has(name)) {
        return { ...template, category: CATEGORY_OVERRIDES.get(name) };
      }
      return template;
    });

  nextTemplates.push(...ADDITIONAL_BUILTIN_TEMPLATES);
  html = html.slice(0, arrayRange.start) + JSON.stringify(nextTemplates, null, 2) + html.slice(arrayRange.end);

  html = html.replace(
    /const BUILTIN_SEED_KEY='[^']*';/,
    "const BUILTIN_SEED_KEY='forward_envelope_builtin_seed_v20260904_addresses_v3';"
  );

  html = html.replace(
    /\n\s*\/\* FOR-E ENVELOPE ADDRESS V1\.7(?:\.1)? START \*\/[\s\S]*?\/\* FOR-E ENVELOPE ADDRESS V1\.7(?:\.1)? END \*\/[\r\n]*/g,
    '\n'
  );
  html = html.replace(/;\n\s*const sizes=\{/, `;\n${helperBlock}\n  const sizes={`);
  html = replaceFunction(html, 'renderTemplates', renderFunction);

  html = html.replace(
    '已內建常用專勤隊、移民署、就業中心、雇主及三處通報地址；同地區依「專勤隊、移民署、就業中心、雇主」排序。',
    '地址範本依項目排序：專勤隊、移民署、收容所、勞動部、就業中心、體檢醫院、雇主、三處通報；同項目再依地區排序。'
  );
  html = html.replace(/<title>FOR-e信封列印系統[^<]*<\/title>/, '<title>FOR-e信封列印系統 V1.7.1</title>');
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

if (!patched) throw new Error('No envelope system file was patched by V1.7.1.');
console.log(`Applied FOR-e envelope category/address V1.7.1 patch to ${patched} file(s).`);
