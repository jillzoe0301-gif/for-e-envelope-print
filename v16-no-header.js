const fs=require('fs');
const path=require('path');
for(const rel of ['dist/index.html','public/index.html']){
  const p=path.join(__dirname,rel);
  if(!fs.existsSync(p)) continue;
  let html=fs.readFileSync(p,'utf8');
  html=html.replace(/function printHeader\(\)\{return [\s\S]*?\}/,'function printHeader(){return ""}');
  html=html.replace(/<div class="print-header">[\s\S]*?<\/div>/g,'');
  fs.writeFileSync(p,html,'utf8');
}
console.log('FOR-e header disabled; Git main UI preserved');
