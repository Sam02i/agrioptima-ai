import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const srcRoot=path.resolve('src');
const outputFile=path.join(srcRoot,'i18n','generatedTranslations.ts');
const cacheFile=path.resolve('scripts','.ui-translation-cache.json');
const cache=fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile,'utf8')):{};
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.tsx?$/.test(entry.name)&&!entry.name.includes('.before-')&&!full.includes('/i18n/'))files.push(full)}}
walk(srcRoot);

const phrases=new Set();
// Display labels for common API enums and crops; these do not change stored data.
for(const label of ['Orange (Kinnow)','Tomato','Apple','Arhar (Tur)','Moong','Groundnut','Jowar','Jute','Mustard','Okra','Papaya','Peas','Rice','Sunflower','Turmeric','Complete','Incomplete','Maximize profit','Minimize risk','Medium','High','Low','Rainfed','Irrigated','Adequate','Limited','None','Grade A','Grade B','Grade C','English','Hindi','Marathi','Punjabi','Odia','Haryanvi','Suitable','Needs phosphorus correction','Enough for planning','Needs attention','Imported farmer soil profile · {0}','{0} active buyer listing','{0} active buyer listings'])phrases.add(label);
const excludedAttributes=new Set(['className','id','href','src','key','value','type','role','method','action']);
function useful(value){
  const text=value.replace(/\s+/g,' ').trim();
  if(text.length<3||text.length>480||!/[A-Za-z]/.test(text))return false;
  if(/^(https?:|[.#/]|[a-z-]+:\/\/)/i.test(text)||/[{}<>]/.test(text.replace(/\{\d+\}/g,'')))return false;
  if(/^(GET|POST|PUT|PATCH|DELETE|AVAILABLE|COMPLETE|MEDIUM|LOW|HIGH|TRUE|FALSE)$/i.test(text))return false;
  if(/^[\w-]+\.(png|jpe?g|webp|svg|css|tsx?|json)$/i.test(text))return false;
  if(text.includes('className')||text.includes('=>')||text.includes('://'))return false;
  if(/\b(?:inline-flex|items-center|justify-|text-(?:sm|xs|lg|white|gray)|bg-\[|rounded-|border-gray|font-semibold)/.test(text))return false;
  return text.includes(' ')||/^[A-Z][a-z]+$/.test(text);
}
function add(value){const text=value.replace(/\s+/g,' ').trim();if(useful(text))phrases.add(text)}

for(const file of files){
  const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  function visit(node){
    if(ts.isJsxText(node))add(node.text);
    if(ts.isTemplateExpression(node)){
      let message=node.head.text;
      node.templateSpans.forEach((span,index)=>{message+=`{${index}}`+span.literal.text});
      add(message);
    }
    if(ts.isBinaryExpression(node)&&node.operatorToken.kind===ts.SyntaxKind.PlusToken){
      let count=0;
      function template(item){
        if(ts.isStringLiteral(item))return item.text;
        if(ts.isBinaryExpression(item)&&item.operatorToken.kind===ts.SyntaxKind.PlusToken)return template(item.left)+template(item.right);
        return `{${count++}}`;
      }
      add(template(node));
    }
    if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)){
      const parent=node.parent;
      if(ts.isImportDeclaration(parent)||ts.isExportDeclaration(parent))return;
      if(ts.isJsxAttribute(parent)){
        const name=parent.name.getText(source);
        if(!excludedAttributes.has(name))add(node.text);
      }else if(ts.isJsxExpression(parent)&&ts.isJsxAttribute(parent.parent)&&parent.parent.name.getText(source)==='source'){
        const visible=node.text.replace(/\s+/g,' ').trim();
        if(/[A-Za-z]/.test(visible)&&!visible.includes('@')&&!/^[A-Z]+-\d+$/.test(visible))phrases.add(visible);
      }else if(ts.isPropertyAssignment(parent)){
        const key=parent.name.getText(source).replace(/["']/g,'');
        if(['title','shortTag','summary','badge','quote','metric','label','description','desc','copy','subtitle','imageAlt','benefit','timing','explanation'].includes(key))add(node.text);
      }else if(ts.isArrayLiteralExpression(parent)||ts.isCallExpression(parent)||ts.isConditionalExpression(parent)||ts.isVariableDeclaration(parent))add(node.text);
    }
    ts.forEachChild(node,visit);
  }
  visit(source);
}

const sourcePhrases=[...new Set([...phrases].map(text=>text.replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, entity)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[entity]||_))))].sort((a,b)=>a.localeCompare(b));
const targets={hi:'hi',mr:'mr',pa:'pa',or:'or'};
async function translateBatch(items,target){
  for(let attempt=1;attempt<=6;attempt++){
    try{
      const params=new URLSearchParams({client:'dict-chrome-ex',sl:'en',tl:target});
      items.forEach(item=>params.append('q',item.replace(/\{(\d+)\}/g,'ZXQVAR$1QXZ')));
      const response=await fetch(`https://clients5.google.com/translate_a/t?${params}`);
      if(!response.ok)throw new Error(`status ${response.status}`);
      const data=await response.json();
      if(!Array.isArray(data)||data.length!==items.length)throw new Error('unexpected response');
      return data.map(value=>(Array.isArray(value)?String(value[0]):String(value)).replace(/ZXQVAR\s*(\d+)\s*QXZ/gi,'{$1}'));
    }catch(error){
      if(attempt===6)throw error;
      await new Promise(resolve=>setTimeout(resolve,attempt*700));
    }
  }
}

const translated={};
async function generateLanguage([code,target]){
  const result=[];
  for(let index=0;index<sourcePhrases.length;index+=10){
    const batch=sourcePhrases.slice(index,index+10);
    const missing=batch.filter(item=>!cache[item]?.[code]||JSON.stringify((item.match(/\{\d+\}/g)||[]).sort())!==JSON.stringify((cache[item][code].match(/\{\d+\}/g)||[]).sort()));
    if(missing.length){
      const values=await translateBatch(missing,target);
      missing.forEach((item,itemIndex)=>{cache[item]??={};cache[item][code]=values[itemIndex]});
      fs.writeFileSync(cacheFile,JSON.stringify(cache,null,2));
      await new Promise(resolve=>setTimeout(resolve,120));
    }
    result.push(...batch.map(item=>cache[item][code]));
  }
  translated[code]=result;
  console.log(`${code}: ${result.length} messages ready`);
}
const targetEntries=Object.entries(targets);
for(let index=0;index<targetEntries.length;index+=2){
  await Promise.all(targetEntries.slice(index,index+2).map(generateLanguage));
}

const catalogue={};
sourcePhrases.forEach((english,index)=>{
  catalogue[english]={hi:translated.hi[index],mr:translated.mr[index],pa:translated.pa[index],or:translated.or[index],hr:translated.hi[index]};
});
const body=`// Generated by scripts/generate-ui-translations.mjs. Do not edit by hand.\nexport const generatedTranslations: Record<string,Partial<Record<'en'|'hi'|'pa'|'hr'|'mr'|'or',string>>> = ${JSON.stringify(catalogue,null,2)};\n`;
fs.writeFileSync(outputFile,body);
console.log(`Generated ${sourcePhrases.length} complete UI phrase translations.`);
