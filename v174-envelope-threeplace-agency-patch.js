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

function baseMultiData(destinations) {
  const data = {
    size: 'large',
    fontSize: '20',
    xOffsetCm: '0',
    yOffsetCm: '0',
    zipcode: '',
    address: '',
    company: '',
    recipient: '',
    memo: '',
    printMode: 'escape'
  };
  destinations.forEach((destination, index) => {
    const position = index + 1;
    data[`d${position}_company`] = destination.company;
    data[`d${position}_address`] = destination.address;
    data[`d${position}_zipcode`] = destination.zipcode || '';
    data[`d${position}_recipient`] = destination.recipient || '';
  });
  return data;
}

const NEW_OR_UPDATED_TEMPLATES = [
  {
    name: '基隆三處',
    category: '三處通報',
    mode: 'multi',
    builtin: true,
    data: baseMultiData([
      {
        company: '基隆市政府社會處',
        address: '基隆市中正區義一路1號'
      },
      {
        company: '基隆市警察局',
        address: '基隆市信義區信二路205號'
      },
      {
        company: '基隆移民署',
        address: '基隆市中正區義一路18號11樓'
      }
    ]),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '宜蘭三處',
    category: '三處通報',
    mode: 'multi',
    builtin: true,
    data: baseMultiData([
      {
        company: '宜蘭縣政府勞工處',
        address: '宜蘭市縣政北路1號'
      },
      {
        company: '宜蘭縣政府警察局',
        address: '宜蘭縣宜蘭市民權里中山路二段167號'
      },
      {
        company: '宜蘭移民署',
        address: '宜蘭縣宜蘭市神農里民權路一段53號'
      }
    ]),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '宜蘭縣政府勞工處',
    category: '勞工局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '宜蘭市縣政北路1號',
      company: '宜蘭縣政府勞工處'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '基隆市政府社會處',
    category: '勞工局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '基隆市中正區義一路1號',
      company: '基隆市政府社會處'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '新北市政府勞工局',
    category: '勞工局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '新北市板橋區中山路一段161號7樓',
      company: '新北市政府勞工局'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '桃園市政府勞動局',
    category: '勞工局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '桃園市桃園區縣府路1號3、4樓',
      company: '桃園市政府勞動局'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '新竹縣政府勞工處',
    category: '勞工局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '新竹縣竹北市光明六路10號',
      company: '新竹縣政府勞工處'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '苗栗縣政府勞工及青年發展處',
    category: '勞工局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '苗栗市府前路1號',
      company: '苗栗縣政府勞工及青年發展處'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '新竹科學園區管理局',
    category: '勞工局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '新竹市東區新安路2號',
      company: '新竹科學園區管理局'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '勞保局台北總局',
    category: '勞健保局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '臺北市中正區羅斯福路1段4號',
      company: '勞保局台北總局'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '台北健保總局',
    category: '勞健保局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '臺北市大安區信義路三段140號',
      company: '台北健保總局'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '勞保局北區業務組',
    category: '勞健保局',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      address: '桃園市中壢區中山東路3段525號',
      company: '勞保局北區業務組'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  }
];

const UPDATED_NAMES = new Set(
  NEW_OR_UPDATED_TEMPLATES.map((template) => template.name)
);

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

function replaceFunction(html, functionName, source, { required = true } = {}) {
  const signature = `function ${functionName}(`;
  const functionStart = html.indexOf(signature);
  if (functionStart < 0) {
    if (required) throw new Error(`Function not found: ${functionName}`);
    return html;
  }

  const bodyStart = html.indexOf('{', functionStart + signature.length);
  if (bodyStart < 0) {
    if (required) throw new Error(`Function body not found: ${functionName}`);
    return html;
  }

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

  if (required) throw new Error(`Function end not found: ${functionName}`);
  return html;
}

const helperBlock = `
  /* FOR-E ENVELOPE ADDRESS V1.7.4 START */
  const LEGACY_MULTI_TEMPLATE_NAMES=new Set(['逃逸通報｜桃園三處','轉出通報｜桃園三處','逃逸通報｜新北三處','轉出通報｜新北三處']);
  const TEMPLATE_CATEGORY_ORDER=['專勤隊','移民署','收容所','勞動部','就業中心','勞工局','勞健保局','體檢醫院','雇主','三處通報','單一地點'];
  const TEMPLATE_REGION_ORDER=['臺北','新北','桃園','新竹','苗栗','基隆','宜蘭','南投','臺中','彰化','雲林','嘉義','臺南','高雄','屏東','花蓮','臺東','澎湖','金門','連江','其他'];
  const TEMPLATE_CATEGORY_OVERRIDES={
    '勞動部勞動力發展署':'勞動部',
    '臺北收容所':'收容所',
    '台北收容所':'收容所',
    '宜蘭收容所':'收容所',
    '南投收容所':'收容所',
    '高雄收容所':'收容所',
    '鴻生國際顧問有限公司':'體檢醫院',
    '宜蘭縣政府勞工處':'勞工局',
    '基隆市政府社會處':'勞工局',
    '新北市政府勞工局':'勞工局',
    '桃園市政府勞動局':'勞工局',
    '新竹縣政府勞工處':'勞工局',
    '苗栗縣政府勞工及青年發展處':'勞工局',
    '新竹科學園區管理局':'勞工局',
    '勞保局台北總局':'勞健保局',
    '台北健保總局':'勞健保局',
    '勞保局北區業務組':'勞健保局'
  };
  function templateModeValue(t){
    const raw=(t&&t.mode)||(t&&t.data&&t.data.printMode)||'single';
    return raw==='escape'||raw==='transfer'||raw==='multi' ? raw : 'single';
  }
  function normalizedLocationText(value){
    return String(value||'')
      .replaceAll('台北','臺北')
      .replaceAll('台中','臺中')
      .replaceAll('台南','臺南')
      .replaceAll('台東','臺東');
  }
  function templatePrimaryAddress(t){
    const d=(t&&t.data)||{};
    return String(d.address||d.d1_address||'');
  }
  function locationShortNameFromText(value){
    const text=normalizedLocationText(value);
    const entries=[
      ['新北','新北'],['臺北','臺北'],['桃園','桃園'],['新竹','新竹'],['苗栗','苗栗'],
      ['基隆','基隆'],['宜蘭','宜蘭'],['南投','南投'],['臺中','臺中'],['彰化','彰化'],
      ['雲林','雲林'],['嘉義','嘉義'],['臺南','臺南'],['高雄','高雄'],['屏東','屏東'],
      ['花蓮','花蓮'],['臺東','臺東'],['澎湖','澎湖'],['金門','金門'],['連江','連江']
    ];
    const found=entries.find(([needle])=>text.includes(needle));
    return found?found[1]:'';
  }
  function templateRegionLabel(t){
    const d=(t&&t.data)||{};
    const text=[t&&t.name,d.address,d.company,d.d1_address,d.d1_company,d.d2_address,d.d2_company,d.d3_address,d.d3_company].filter(Boolean).join(' ');
    return locationShortNameFromText(text)||'其他';
  }
  function templateCategoryLabel(t){
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
    if(text.includes('勞保局')||text.includes('健保總局')||text.includes('勞健保局')) return '勞健保局';
    if(text.includes('勞工局')||text.includes('勞工處')||text.includes('勞動局')||text.includes('勞工及青年發展處')) return '勞工局';
    if(text.includes('鴻生國際顧問')||text.includes('體檢醫院')) return '體檢醫院';
    if(text.includes('移民署')) return '移民署';
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
    ].map(x=>normalizedLocationText(String(x||'').trim())).join('|')).join('||');
  }
  function threePlaceRegion(data,fallbackName=''){
    const text=[fallbackName,data&&data.memo,data&&data.d1_company,data&&data.d1_address,data&&data.d2_company,data&&data.d2_address,data&&data.d3_company,data&&data.d3_address].filter(Boolean).join(' ');
    return locationShortNameFromText(text);
  }
  function threePlaceTemplateName(data,fallbackName=''){
    const region=threePlaceRegion(data,fallbackName);
    if(region) return region+'三處';
    const cleaned=String(fallbackName||'')
      .replace(/^【三處通報】/,'')
      .replace(/^(逃逸通報|轉出通報)[｜|]/,'')
      .trim();
    if(cleaned.endsWith('三處')) return cleaned;
    return cleaned ? cleaned+'三處' : '三處通報';
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
  /* FOR-E ENVELOPE ADDRESS V1.7.4 END */
`;

const mergeFunction = `function mergeBuiltinTemplates(force=false){
    const original=loadTemplates();
    const defaultsByName=new Map(DEFAULT_TEMPLATES.map(t=>[String(t&&t.name||''),t]));
    let list=original.filter(t=>!LEGACY_MULTI_TEMPLATE_NAMES.has(String(t&&t.name||'')));
    list=list.map(t=>{
      const name=String(t&&t.name||'');
      if(t&&t.builtin&&defaultsByName.has(name)) return JSON.parse(JSON.stringify(defaultsByName.get(name)));
      return t;
    });
    const seenNames=new Set();
    list=list.filter(t=>{
      const name=String(t&&t.name||'');
      if(!name) return true;
      if(seenNames.has(name)) return false;
      seenNames.add(name);
      return true;
    });
    DEFAULT_TEMPLATES.forEach(template=>{
      const name=String(template&&template.name||'');
      if(!seenNames.has(name)){
        list.push(JSON.parse(JSON.stringify(template)));
        seenNames.add(name);
      }
    });
    const changed=JSON.stringify(list)!==JSON.stringify(original);
    if(changed||force) localStorage.setItem(STORAGE_KEY,JSON.stringify(list));
    return changed;
  }`;

const seedFunction = `function seedBuiltinTemplates(){
    if(localStorage.getItem(BUILTIN_SEED_KEY)==='done') return;
    mergeBuiltinTemplates(false);
    localStorage.setItem(BUILTIN_SEED_KEY,'done');
  }`;

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

    select.innerHTML='<option value="">選擇範本'+(keyword ? '（找到 '+filtered.length+' 筆）' : '')+'</option>'+filtered.map(({t,i})=>{
      const mode=templateModeValue(t);
      const d=(t&&t.data)||{};
      const builtin=t.builtin ? '★' : '';
      if(mode!=='single'){
        const title=threePlaceTemplateName(d,t.name||'');
        const destinations=templateDestinationNames(t).join('／');
        return '<option value="'+i+'">'+builtin+'【三處通報】'+esc(title)+(destinations ? '｜'+esc(destinations) : '')+'</option>';
      }
      const tag=templateCategoryLabel(t);
      const title=String(t.name||'未命名範本');
      const recipient=String(d.recipient||'').trim();
      const company=String(d.company||'').trim();
      const address=String(d.address||'').trim();
      let sub='';
      if(recipient && !title.includes(recipient)) sub=recipient;
      else if(company && !title.includes(company)) sub=company;
      else sub=address;
      return '<option value="'+i+'">'+builtin+'【'+esc(tag)+'】'+esc(title)+(sub ? '｜'+esc(sub) : '')+'</option>';
    }).join('');
    if(current && list[Number(current)] && (!keyword || filtered.some(x=>String(x.i)===String(current)))) select.value=current;
  }`;

const nameFunction = `function getTemplateDisplayName(data,fallbackName){
    const mode=(data&&data.printMode)||'single';
    if(mode!=='single') return threePlaceTemplateName(data,fallbackName||'');
    const fallback=String(fallbackName||'').trim();
    if(fallback) return fallback;
    return data.company||data.recipient||data.address||'未命名範本';
  }`;

const saveFunction = `function saveTemplate(){
    const data=getForm();
    if(data.printMode!=='single') data.size='large';
    const name=getTemplateDisplayName(data,$('templateName').value.trim());
    const list=loadTemplates();
    const idx=list.findIndex(t=>String(t&&t.name||'')===name);
    const item={name,data,mode:data.printMode||'single',category:data.printMode!=='single'?'三處通報':undefined,updatedAt:new Date().toISOString()};
    if(idx>=0) list[idx]=item; else list.unshift(item);
    saveTemplates(list);
    $('templateName').value=name;
    renderTemplates();
    const newIndex=loadTemplates().findIndex(t=>String(t&&t.name||'')===name);
    if(newIndex>=0&&$('templateSelect')) $('templateSelect').value=String(newIndex);
    const destinationText=data.printMode!=='single'?[data.d1_company,data.d2_company,data.d3_company].filter(Boolean).join('／'):'';
    alert('已儲存範本：'+(data.printMode!=='single'?'【三處通報】':'')+name+(destinationText?'｜'+destinationText:''));
  }`;

function patchHtml(html) {
  const arrayRange = findBalancedArray(html, 'const DEFAULT_TEMPLATES=');
  const templates = JSON.parse(html.slice(arrayRange.start, arrayRange.end));
  const nextTemplates = templates.filter((template) => {
    const name = String(template && template.name || '');
    return !UPDATED_NAMES.has(name);
  });
  nextTemplates.push(...NEW_OR_UPDATED_TEMPLATES);
  html = html.slice(0, arrayRange.start) + JSON.stringify(nextTemplates, null, 2) + html.slice(arrayRange.end);

  html = html.replace(
    /const BUILTIN_SEED_KEY='[^']*';/,
    "const BUILTIN_SEED_KEY='forward_envelope_builtin_seed_v20260904_addresses_v5';"
  );

  html = html.replace(
    /\n\s*\/\* FOR-E ENVELOPE ADDRESS V1\.7(?:\.\d+)? START \*\/[\s\S]*?\/\* FOR-E ENVELOPE ADDRESS V1\.7(?:\.\d+)? END \*\/[\r\n]*/g,
    '\n'
  );
  html = html.replace(/;\n\s*const sizes=\{/, `;\n${helperBlock}\n  const sizes={`);

  html = replaceFunction(html, 'mergeBuiltinTemplates', mergeFunction);
  html = replaceFunction(html, 'seedBuiltinTemplates', seedFunction);
  html = replaceFunction(html, 'renderTemplates', renderFunction);
  html = replaceFunction(html, 'getTemplateDisplayName', nameFunction);
  html = replaceFunction(html, 'saveTemplate', saveFunction);

  html = html.replace(
    /<div class="hint">已內建常用[^<]*自建範本仍可匯出\/匯入備份。<\/div>/,
    '<div class="hint">地址範本依項目排序；三處通報會顯示「【三處通報】地名三處｜勞工單位／警察局／移民署」。自建範本仍可匯出／匯入備份。</div>'
  );
  html = html.replace(
    /<div class="hint">(?:三處名稱會完整顯示於範本選項；)?共用同一個案件內容與備註；每個地點可各自填公司名稱、地址、郵遞區號與收件人。列印時會產生 3 張大信封。<\/div>/,
    '<div class="hint">儲存三處通報時，範本會自動命名為「地名三處」，並顯示三個通報單位名稱；列印時會產生 3 張大信封。</div>'
  );
  html = html.replace(/<title>FOR-e信封列印系統[^<]*<\/title>/, '<title>FOR-e信封列印系統 V1.7.4</title>');
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

if (!patched) throw new Error('No envelope system file was patched by V1.7.4.');
console.log(`Applied FOR-e three-place/agency V1.7.4 patch to ${patched} file(s).`);
