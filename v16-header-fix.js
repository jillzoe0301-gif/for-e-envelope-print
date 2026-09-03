const fs=require('fs');
const path=require('path');
const root=__dirname;
for(const rel of ['dist/index.html','public/index.html']){
  const p=path.join(root,rel);
  if(!fs.existsSync(p)) continue;
  let html=fs.readFileSync(p,'utf8');
  const replacement=`function printHeader(){return '<div class="print-header"><img src="/group-header.jpg?v=20260903-1535" alt="灃禾集團表頭"></div>'}`;
  if(/function printHeader\(\)\{return [\s\S]*?\}/.test(html)){
    html=html.replace(/function printHeader\(\)\{return [\s\S]*?\}/,replacement);
  }else{
    html=html.replace('const deep = v => JSON.parse(JSON.stringify(v));','const deep = v => JSON.parse(JSON.stringify(v));\n'+replacement);
  }
  fs.writeFileSync(p,html,'utf8');
}
console.log('Use static /group-header.jpg for document header');
