const fs = require('fs');
const path = require('path');

const root = __dirname;
const targets = ['dist/index.html', 'public/index.html'];

function replaceFunction(html, functionName, replacementSource) {
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
        return html.slice(0, functionStart) + replacementSource + html.slice(index + 1);
      }
    }
  }

  throw new Error(`Function end not found: ${functionName}`);
}

function sourceOf(fn, targetName) {
  return fn.toString().replace(/^function\s+\w+/, `function ${targetName}`);
}

function patchedReturnEditor() {
  const d = state.returnDoc;
  return `<div class="grid-2">
    <section class="panel editor-panel">
      <div class="panel-head"><h3>簽收單內容</h3><span class="tag">${esc(returnTypeName(d.type))}</span></div>
      <div class="panel-body">
        <div class="form-section">
          <div class="section-title">基本資料</div>
          <div class="form-grid">
            <div class="field">
              <label for="ret-type">簽收單類型</label>
              <div class="control-row">
                <select id="ret-type">${Object.entries(returnTypes).map(([k,v])=>`<option value="${esc(k)}" ${k===d.type?'selected':''}>${esc(v.name)}</option>`).join('')}</select>
                <button class="btn small" type="button" data-manage-return>管理類型</button>
              </div>
              <div class="hint">類型名稱、欄位格式、常用文件都可自行新增、修改或刪除。</div>
            </div>
            ${field('提供日期','ret-date',d.date,'date')}
            ${field('公司名稱','ret-company',d.company,'text','full')}
            <div class="field full return-reason-field">
              <label for="ret-reason">還函原因說明</label>
              <textarea id="ret-reason" rows="3" placeholder="請輸入本次還函原因或補充說明">${esc(d.reason||'')}</textarea>
            </div>
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">文件明細</div>
          <div class="table-toolbar">
            <span class="hint">只輸入實際交付的文件；列印時不會補任何空白格。可在「管理類型」調整常用文件選項。</span>
            <button class="btn small" data-add="return">＋新增一列</button>
          </div>
          ${returnEditTable()}
        </div>
        <div class="form-section">
          <div class="section-title">內部點收欄</div>
          <div class="form-grid return-approval-grid">
            ${field('業務主管','ret-bm',d.businessManager||'')}
            ${field('行政主管','ret-am',d.adminManager||'')}
            ${fieldSelect('行政承辦','ret-ah',optionList('handlers'),d.adminHandler||'','full')}
          </div>
        </div>
      </div>
    </section>
    <section class="panel preview-panel">
      <div class="panel-head"><h3>列印預覽</h3><span class="hint">A4 直式</span></div>
      <div class="preview-wrap">${returnPreview()}</div>
    </section>
  </div>`;
}

function patchedReturnPreview() {
  const d = state.returnDoc;
  const layout = d.layout || returnTypeDef(d.type).layout || 'labor';
  const person = layout === 'worker';
  const title = returnTypeName(d.type);
  const rows = d.items.filter(it =>
    String(it.name ?? '').trim() ||
    String(it.remark ?? '').trim() ||
    String(it.docNo ?? '').trim() ||
    String(it.worker ?? '').trim()
  );
  const colhead = person ? '<th>外國人名字</th>' : '<th>發文日</th><th>發文字號</th>';
  const detailRows = rows.map(r => `<tr>
    <td>${esc(r.name)}</td>
    <td class="center">${esc(r.copyType)}</td>
    ${person
      ? `<td>${esc(r.worker)}</td>`
      : `<td class="center">${esc(fmtDate(r.docDate))}</td><td class="center">${esc(r.docNo)}</td>`}
    <td>${esc(r.remark)}</td>
  </tr>`).join('');
  const detailTable = `<table class="doc-table return-detail-table">
    <thead><tr><th>文件項目</th><th style="width:13%">正 / 影本</th>${colhead}<th>備註</th></tr></thead>
    <tbody>${detailRows}</tbody>
  </table>`;

  return `<div class="paper return-paper">
    <table class="doc-table return-meta-table">
      <tr><td class="label center" style="width:24%">公　司　名　稱</td><td colspan="4">${esc(d.company)}</td></tr>
      <tr><td class="label center">提　供　日　期</td><td colspan="4">${esc(fmtDate(d.date))}</td></tr>
      <tr><td class="label center">還函原因說明</td><td colspan="4" class="return-reason-cell">${esc(d.reason||'')}</td></tr>
      <tr><td colspan="5" class="section-fill">${esc(title)}</td></tr>
    </table>
    ${detailTable}
    ${layout==='employer' ? `<table class="doc-table">
      <tr><td colspan="5" class="section-fill">雇 主 印 章</td></tr>
      <tr><td class="label">雇主大章</td><td colspan="2" class="stamp-space muted">章樣</td><td class="label">雇主小章</td><td class="stamp-space muted">章樣</td></tr>
    </table>` : ''}
    <table class="doc-table return-sign-table">
      <colgroup><col style="width:50%"><col style="width:50%"></colgroup>
      <tr>
        <td class="return-sign-box"><b>業務主管：</b>${esc(d.businessManager||'')}</td>
        <td class="return-sign-box"><b>行政主管：</b>${esc(d.adminManager||'')}</td>
      </tr>
      <tr><td colspan="2" class="return-handler-box"><b>行政承辦：</b>${esc(d.adminHandler||'')}</td></tr>
      <tr>
        <td class="return-receipt-box"><b>點收人簽名：</b></td>
        <td class="return-receipt-box"><b>點收日期：</b></td>
      </tr>
      <tr><td colspan="2" class="note return-note">文件一經確認點收，視同完成收受，後續如再反映未收到之情形，將不再受理。</td></tr>
    </table>
  </div>`;
}

function patchedBindReturn() {
  $('#ret-type').onchange = e => {
    state.returnDoc.type = e.target.value;
    state.returnDoc.layout = returnTypeDef(state.returnDoc.type).layout || 'labor';
    app();
  };
  const manage = $('[data-manage-return]');
  if (manage) manage.onclick = () => openReturnManager(state.returnDoc.type);
  const map = {
    'ret-date':'date',
    'ret-company':'company',
    'ret-reason':'reason',
    'ret-bm':'businessManager',
    'ret-am':'adminManager',
    'ret-ah':'adminHandler'
  };
  Object.entries(map).forEach(([id,key]) => {
    const element = $('#'+id);
    if (element) element.oninput = () => {
      state.returnDoc[key] = element.value;
      refreshPreview();
    };
  });
  $$('[data-ret-item]').forEach(element => element.oninput = () => {
    state.returnDoc.items[+element.dataset.i][element.dataset.retItem] = element.value;
    refreshPreview();
  });
  $('[data-add="return"]').onclick = () => {
    state.returnDoc.items.push({name:'',copyType:'影本',docDate:'',docNo:'',worker:'',remark:''});
    app();
  };
  $$('[data-del-ret]').forEach(button => button.onclick = () => {
    state.returnDoc.items.splice(+button.dataset.delRet,1);
    if (!state.returnDoc.items.length) {
      state.returnDoc.items.push({name:'',copyType:'影本',docDate:'',docNo:'',worker:'',remark:''});
    }
    app();
  });
}

const css = `
/* FOR-E RETURN RECEIPT V1.7.6 START */
.return-reason-field textarea{
  width:100%;
  min-height:76px;
  border:1px solid #ccd3db;
  border-radius:8px;
  padding:9px 10px;
  background:#fff;
  line-height:1.55;
  resize:vertical;
}
.return-approval-grid{grid-template-columns:1fr 1fr!important}
.return-paper .return-meta-table td{padding:7px 9px}
.return-paper .return-reason-cell{
  min-height:44px;
  white-space:pre-wrap;
  line-height:1.55;
  vertical-align:top;
}
.return-paper .return-detail-table{margin-top:0}
.return-paper .return-sign-table{margin-top:0;table-layout:fixed}
.return-paper .return-sign-table td{padding:9px 11px}
.return-paper .return-sign-box{
  width:50%;
  height:58px;
  vertical-align:top;
  line-height:1.55;
}
.return-paper .return-handler-box{
  height:40px;
  vertical-align:middle;
}
.return-paper .return-receipt-box{
  width:50%;
  height:58px;
  vertical-align:top;
  line-height:1.55;
}
.return-paper .return-note{
  padding:8px 10px;
  line-height:1.55;
}
@media(max-width:720px){.return-approval-grid{grid-template-columns:1fr!important}}
/* FOR-E RETURN RECEIPT V1.7.6 END */
`;

const returnTypesRuntimePatch = `
/* FOR-E INITIAL RECRUITMENT SUGGESTION V1.7.6 START */
(function(){
  const key=Object.keys(returnTypes).find(k=>{
    const def=returnTypes[k]||{};
    return def.layout==='labor' || String(def.name||k).includes('勞動部') || String(def.name||k).includes('勞工局');
  });
  if(!key||!returnTypes[key]) return;
  const suggestions=Array.isArray(returnTypes[key].suggestions)?returnTypes[key].suggestions:[];
  if(!suggestions.includes('初次招募函')){
    returnTypes[key].suggestions=['初次招募函',...suggestions];
    localStorage.setItem(returnTypeStorageKey,JSON.stringify(returnTypes));
  }
})();
/* FOR-E INITIAL RECRUITMENT SUGGESTION V1.7.6 END */
`;

let patched = 0;
for (const relativePath of targets) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) continue;

  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(
    /\/\* FOR-E RETURN RECEIPT V1\.7\.6 START \*\/[\s\S]*?\/\* FOR-E RETURN RECEIPT V1\.7\.6 END \*\//g,
    ''
  );
  html = html.replace('</style>', `${css}\n</style>`);

  if (!html.includes("suggestions:['初次招募函'")) {
    html = html.replace(
      "labor:{name:'勞動部／勞工局還函',layout:'labor',suggestions:['重新招募函'",
      "labor:{name:'勞動部／勞工局還函',layout:'labor',suggestions:['初次招募函','重新招募函'"
    );
  }

  html = html.replace(
    /\/\* FOR-E INITIAL RECRUITMENT SUGGESTION V1\.7\.6 START \*\/[\s\S]*?\/\* FOR-E INITIAL RECRUITMENT SUGGESTION V1\.7\.6 END \*\//g,
    ''
  );
  html = html.replace(
    'let returnTypes=loadSettings(returnTypeStorageKey,defaultReturnTypes);',
    `let returnTypes=loadSettings(returnTypeStorageKey,defaultReturnTypes);${returnTypesRuntimePatch}`
  );

  html = replaceFunction(html, 'returnEditor', sourceOf(patchedReturnEditor, 'returnEditor'));
  html = replaceFunction(html, 'returnPreview', sourceOf(patchedReturnPreview, 'returnPreview'));
  html = replaceFunction(html, 'bindReturn', sourceOf(patchedBindReturn, 'bindReturn'));
  html = html.replace(
    /<title>FOR-e 用印／還函／逃跑／信封列印[^<]*<\/title>/,
    '<title>FOR-e 用印／還函／逃跑／信封列印 V1.7.6</title>'
  );

  fs.writeFileSync(filePath, html, 'utf8');
  patched += 1;
}

if (!patched) throw new Error('No main document system file was patched by V1.7.6.');
console.log(`Applied FOR-e customer return receipt V1.7.6 patch to ${patched} file(s).`);
