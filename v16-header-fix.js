const fs=require('fs');
const path=require('path');
const root=__dirname;
const b64=fs.readFileSync(path.join(root,'header-original.b64'),'utf8').trim();
const data='data:image/jpeg;base64,'+b64;
for(const rel of ['dist/index.html','public/index.html']){
  const p=path.join(root,rel);
  if(!fs.existsSync(p)) continue;
  let html=fs.readFileSync(p,'utf8');
  const replacement=`function printHeader(){return '<div class="print-header"><img src="${data}" alt="灃禾集團表頭"></div>'}`;
  if(/function printHeader\(\)\{return [\s\S]*?\}/.test(html)){
    html=html.replace(/function printHeader\(\)\{return [\s\S]*?\}/,replacement);
  }else{
    html=html.replace('const deep = v => JSON.parse(JSON.stringify(v));','const deep = v => JSON.parse(JSON.stringify(v));\n'+replacement);
  }
  fs.writeFileSync(p,html,'utf8');
}
console.log('Embedded original Forward Group JPG header into final HTML');
