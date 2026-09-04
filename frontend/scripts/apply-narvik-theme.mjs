import fs from 'node:fs';
import path from 'node:path';

// Mechanical palette migration: leave photos, translations and data untouched.
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(css|tsx)$/.test(file)&&!file.includes('/i18n/'))files.push(file);}}
walk('src');
function tone(r,g,b){return (r*.2126+g*.7152+b*.0722)>165?'#EAE7DD':'#99775C';}
for(const file of files){
  const before=fs.readFileSync(file,'utf8');
  let after=before.replace(/#([\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})(?![\da-f\w-])/gi,(all,hex)=>{
    if (hex === '8492') return all; // Printed dispatch identifier, not a colour.
    if(hex.length<5)hex=[...hex].map(x=>x+x).join('');
    return tone(parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16))+hex.slice(6);
  });
  after=after.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(\s*,\s*[\d.]+)?\s*\)/g,(_,r,g,b,alpha)=>{
    const light=tone(+r,+g,+b)==='#EAE7DD';
    return `${alpha?'rgba':'rgb'}(${light?'234,231,221':'153,119,92'}${alpha||''})`;
  });
  if(after!==before)fs.writeFileSync(file,after);
}
console.log('Applied Narvik / Sorrell palette to UI styles and component colour literals.');
