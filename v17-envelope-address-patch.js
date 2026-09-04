const fs = require('fs');
const path = require('path');

const root = __dirname;
const TARGETS = [
  'dist/for-e-envelope-print-system.html',
  'public/for-e-envelope-print-system.html'
];

const LEGACY_MULTI_NAMES = new Set([
  '逃逸通報｜桃園三處',
  '轉出通報｜桃園三處',
  '逃逸通報｜新北三處',
  '轉出通報｜新北三處'
]);

function baseSingleData({ zipcode, address, company }) {
  return {
    size: 'small',
    fontSize: '20',
    xOffsetCm: '0',
    yOffsetCm: '0',
    zipcode,
    address,
    company,
    recipient: '',
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
    data[`d${position}_zipcode`] = destination.zipcode;
    data[`d${position}_recipient`] = '';
  });
  return data;
}

const NEW_BUILTIN_TEMPLATES = [
  {
    name: '台北專勤隊',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '116080',
      address: '臺北市文山區興隆路三段306號',
      company: '台北專勤隊'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '勞動部勞動力發展署',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '11042',
      address: '台北市中正區中華路1段39號10樓',
      company: '勞動部勞動力發展署'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '臺北收容所',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '237010',
      address: '新北市三峽區大埔路150號',
      company: '臺北收容所'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '鴻生國際顧問有限公司',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '241017',
      address: '新北市三重區重新路5段609巷6號5樓之8',
      company: '鴻生國際顧問有限公司'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '桃園專勤隊',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '338027',
      address: '桃園市蘆竹區龍安街二段968號3樓',
      company: '桃園專勤隊'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '宜蘭收容所',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '269024',
      address: '宜蘭縣冬山鄉梅花路255巷22弄33號',
      company: '宜蘭收容所'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '高雄收容所',
    mode: 'single',
    builtin: true,
    data: baseSingleData({
      zipcode: '828106',
      address: '高雄市永安區維新路光明三巷17號',
      company: '高雄收容所'
    }),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '桃園三處',
    mode: 'multi',
    builtin: true,
    data: baseMultiData([
      { company: '桃園市政府勞動局', address: '桃園市桃園區縣府路1號3、4樓', zipcode: '330206' },
      { company: '移民署桃園市服務站', address: '桃園市桃園區縣府路106號1樓', zipcode: '330026' },
      { company: '桃園市政府警察局', address: '桃園市桃園區縣府路3號', zipcode: '330206' }
    ]),
    updatedAt: '2026-09-04T00:00:00.000Z'
  },
  {
    name: '新北三處',
    mode: 'multi',
    builtin: true,
    data: baseMultiData([
      { company: '新北市政府勞工處', address: '新北市板橋區中山路一段161號7樓', zipcode: '220242' },
      { company: '移民署新北市服務站', address: '新北市中和區民安街135號', zipcode: '235016' },
      { company: '新北市政府警察局', address: '新北市板橋區府中路32號', zipcode: '220238' }
    ]),
    updatedAt: '2026-09-04T00:00:00.000Z'
  }
];

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
        return html.slice(0, functionStart) + source + html.slice(index + 1);
      }
    }
  }

  throw new Error(`Function end not found: ${functionName}`);
}

const helperBlock = `
  /* FOR-E ENVELOPE ADDRESS V1.7 START */
  const LEGACY_MULTI_TEMPLATE_NAMES=new Set(['逃逸通報｜桃園三處','轉出通報｜桃園三處','逃逸通報｜新北三處','轉出通報｜新北三處']);
  const TEMPLATE_REGION_ORDER=['臺北','新北','桃園','新竹','基隆','宜蘭','高雄','其他'];
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
    if(address.includes('高雄市')) return '高雄';
    return '其他';
  }
  function templateCategoryRank(t){
    const d=(t&&t.data)||{};
    const text=[t&&t.name,d.company,d.address,d.d1_company,d.d2_company,d.d3_company].filter(Boolean).join(' ');
    if(templateModeValue(t)!=='single') return 5;
    if(text.includes('專勤隊')) return 1;
    if(text.includes('移民署')||text.includes('收容所')) return 2;
    if(text.includes('就業中心')||text.includes('就業服務')||text.includes('勞動力發展署')) return 3;
    if(text.includes('有限公司')||text.includes('股份有限公司')||text.includes('企業')||text.includes('雇主')||text.includes('工廠')||text.includes('顧問')) return 4;
    return 9;
  }
  function templateCategoryLabel(t){
    const rank=templateCategoryRank(t);
    if(templateModeValue(t)!=='single') return '三處通報';
    if(rank===1) return '專勤隊';
    if(rank===2) return '移民署';
    if(rank===3) return '就業中心';
    if(rank===4) return '雇主';
    return '單一地點';
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
    const regionA=TEMPLATE_REGION_ORDER.indexOf(templateRegionLabel(a.t));
    const regionB=TEMPLATE_REGION_ORDER.indexOf(templateRegionLabel(b.t));
    const safeRegionA=regionA<0?999:regionA;
    const safeRegionB=regionB<0?999:regionB;
    if(safeRegionA!==safeRegionB) return safeRegionA-safeRegionB;
    const categoryA=templateCategoryRank(a.t),categoryB=templateCategoryRank(b.t);
    if(categoryA!==categoryB) return categoryA-categoryB;
    return String(a.t.name||'').localeCompare(String(b.t.name||''),'zh-Hant');
  }
  /* FOR-E ENVELOPE ADDRESS V1.7 END */
`;

const mergeFunction = `function mergeBuiltinTemplates(force=false){
    const original=loadTemplates();
    let list=original.filter(t=>!LEGACY_MULTI_TEMPLATE_NAMES.has(String(t&&t.name||'')));
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

    select.innerHTML='<option value="">選擇範本'+(keyword ? \`（找到 \${filtered.length} 筆）\` : '')+'</option>'+filtered.map(({t,i})=>{
      const mode=templateModeValue(t);
      const tag=templateCategoryLabel(t);
      const title=t.name||'未命名範本';
      const sub=mode==='single'
        ? ((t.data && (t.data.company || t.data.recipient || t.data.address)) || '')
        : templateDestinationNames(t).join('／');
      const builtin=t.builtin ? '★' : '';
      return \`<option value="\${i}">\${builtin}【\${esc(tag)}】\${esc(title)}\${sub ? '｜' + esc(sub) : ''}</option>\`;
    }).join('');
    if(current && list[Number(current)] && (!keyword || filtered.some(x=>String(x.i)===String(current)))) select.value=current;
  }`;

function patchHtml(html) {
  const arrayRange = findBalancedArray(html, 'const DEFAULT_TEMPLATES=');
  const templates = JSON.parse(html.slice(arrayRange.start, arrayRange.end));
  const retained = templates.filter((template) => !LEGACY_MULTI_NAMES.has(template.name));
  const newNames = new Set(NEW_BUILTIN_TEMPLATES.map((template) => template.name));
  const withoutPreviousNew = retained.filter((template) => !newNames.has(template.name));
  const nextTemplates = [...withoutPreviousNew, ...NEW_BUILTIN_TEMPLATES];
  html = html.slice(0, arrayRange.start) + JSON.stringify(nextTemplates, null, 2) + html.slice(arrayRange.end);

  html = html.replace(
    /const BUILTIN_SEED_KEY='[^']*';/,
    "const BUILTIN_SEED_KEY='forward_envelope_builtin_seed_v20260904_addresses_v2';"
  );
  html = html.replace(
    /\n\s*\/\* FOR-E ENVELOPE ADDRESS V1\.7 START \*\/[\s\S]*?\/\* FOR-E ENVELOPE ADDRESS V1\.7 END \*\/[\r\n]*/g,
    '\n'
  );
  html = html.replace(/;\n\s*const sizes=\{/, `;\n${helperBlock}\n  const sizes={`);
  html = replaceFunction(html, 'mergeBuiltinTemplates', mergeFunction);
  html = replaceFunction(html, 'seedBuiltinTemplates', seedFunction);
  html = replaceFunction(html, 'renderTemplates', renderFunction);

  html = html.replace(
    "setForm(list[Number(idx)].data);\n    $('templateName').value=list[Number(idx)].name;",
    "const selectedTemplate=list[Number(idx)];\n    const templateData=JSON.parse(JSON.stringify(selectedTemplate.data||{}));\n    const selectedMode=templateModeValue(selectedTemplate);\n    if(selectedMode!=='single'){\n      const currentMode=$('printMode').value;\n      templateData.printMode=(currentMode==='escape'||currentMode==='transfer')?currentMode:(selectedMode==='transfer'?'transfer':'escape');\n      templateData.size='large';\n    }\n    setForm(templateData);\n    $('templateName').value=selectedTemplate.name;"
  );

  html = html.replace(
    '已內建常用就業中心與逃逸/轉出通報三處地址，可用搜尋快速找範本；自建範本仍可匯出/匯入備份。',
    '已內建常用專勤隊、移民署、就業中心、雇主及三處通報地址；同地區依「專勤隊、移民署、就業中心、雇主」排序。'
  );
  html = html.replace(
    '<div class="hint">共用同一個案件內容與備註；每個地點可各自填公司名稱、地址、郵遞區號與收件人。列印時會產生 3 張大信封。</div>',
    '<div class="hint">三處名稱會完整顯示於範本選項；共用同一個案件內容與備註，列印時會產生 3 張大信封。</div>'
  );
  html = html.replace(/<title>FOR-e信封列印系統[^<]*<\/title>/, '<title>FOR-e信封列印系統 V1.7</title>');
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

if (!patched) throw new Error('No envelope system file was patched.');
console.log(`Applied FOR-e envelope address V1.7 patch to ${patched} file(s).`);
