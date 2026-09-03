const fs=require('fs');
const path=require('path');

const root=__dirname;
const indexPath=path.join(root,'dist','index.html');
let html=fs.readFileSync(indexPath,'utf8');

const headerB64=fs.readFileSync(path.join(root,'forward-group-header.b64'),'utf8').trim();
const exactHeader='data:image/jpeg;base64,'+headerB64;
html=html.replace(/const companyHeaderImage = '[^']*';/, "const companyHeaderImage = '"+exactHeader+"';");

const css=`
/* V1.7 exact header + UI refinements */
.stamp-options label{font-size:13px!important;line-height:1.25!important;font-weight:800!important}
.stamp-options input[type="checkbox"]{width:14px!important;height:14px!important;min-width:14px!important;min-height:14px!important;flex-basis:14px!important}
`;
html=html.replace('</style>',css+'\n</style>');
html=html.replace(/<title>[^<]*<\/title>/,'<title>FOR-e 用印／還函／逃跑／信封列印 V1.7</title>');

const runtime=`
/* V1.7 runtime overrides */
const _v17SealEditor=sealEditor;
sealEditor=function(){
  if(state.seal.returnMethodOther==null) state.seal.returnMethodOther='';
  let out=_v17SealEditor();
  if(state.seal.returnMethod==='其他'){
    const marker='<div class="field"><label for="seal-purpose">文件用途</label>';
    const extra='<div class="field"><label for="seal-return-other">其他回收方式說明</label><input id="seal-return-other" type="text" value="'+esc(state.seal.returnMethodOther||'')+'" placeholder="請輸入文件回收方式"></div>';
    out=out.replace(marker,extra+marker);
  }
  return out;
};

const _v17SealPreview=sealPreview;
sealPreview=function(){
  if(state.seal.returnMethod==='其他' && String(state.seal.returnMethodOther||'').trim()){
    const old=state.seal.returnMethod;
    state.seal.returnMethod=String(state.seal.returnMethodOther).trim();
    const out=_v17SealPreview();
    state.seal.returnMethod=old;
    return out;
  }
  return _v17SealPreview();
};

const _v17BindSeal=bindSeal;
bindSeal=function(){
  _v17BindSeal();
  const ret=$('#seal-return');
  if(ret){
    const syncReturn=()=>{
      state.seal.returnMethod=ret.value;
      if(state.seal.returnMethod==='其他'){
        if(state.seal.returnMethodOther==null) state.seal.returnMethodOther='';
        app();
      }else{
        refreshPreview();
      }
    };
    ret.onchange=syncReturn;
    ret.oninput=syncReturn;
  }
  const other=$('#seal-return-other');
  if(other) other.oninput=()=>{state.seal.returnMethodOther=other.value;refreshPreview()};
};
`;
html=html.replace('\napp();',runtime+'\napp();');

fs.writeFileSync(indexPath,html,'utf8');
const publicIndex=path.join(root,'public','index.html');
if(fs.existsSync(path.dirname(publicIndex))) fs.writeFileSync(publicIndex,html,'utf8');
console.log('Applied FOR-e V1.7 exact header + other return method + larger stamp labels:',html.length,'bytes');
