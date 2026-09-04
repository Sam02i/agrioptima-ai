import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root=path.resolve('src');
const files=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const name=path.join(dir,item.name);if(item.isDirectory()&&!['i18n','assets'].includes(item.name))walk(name);else if(item.isFile()&&name.endsWith('.tsx')&&!name.includes('.before-'))files.push(name)}}
walk(root);

function hasJsxOrCallback(node){
  let found=false;
  function visit(item){if(ts.isJsxElement(item)||ts.isJsxSelfClosingElement(item)||ts.isJsxFragment(item)||ts.isArrowFunction(item)||ts.isFunctionExpression(item)){found=true;return}ts.forEachChild(item,visit)}
  visit(node);return found;
}

let messages=0;
for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  if(text.includes("import { LocalizedText }"))continue;
  const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const edits=[];
  function processChildren(children){
    let group=[];
    function flush(){
      if(!group.length)return;
      let source='';const values=[];
      for(const child of group){
        if(ts.isJsxText(child))source+=child.text.replace(/\s+/g,' ');
        else if(child.expression){
          if(ts.isStringLiteral(child.expression))source+=child.expression.text;
          else {source+=`{${values.length}}`;values.push(child.expression.getText(sf))}
        }
      }
      if(source.trim()&&(/[A-Za-z]/.test(source)||values.length)){
        const valueProp=values.length?` values={[${values.join(', ')}]}`:'';
        edits.push({start:group[0].pos,end:group.at(-1).end,value:`<LocalizedText source={${JSON.stringify(source)}}${valueProp} />`});
        messages++;
      }
      group=[];
    }
    for(const child of children){
      if(ts.isJsxText(child)||(ts.isJsxExpression(child)&&child.expression&&!hasJsxOrCallback(child.expression)))group.push(child);
      else flush();
    }
    flush();
  }
  function visit(node){
    if(ts.isJsxElement(node)){
      const tag=node.openingElement.tagName.getText(sf);
      if(['script','style','code','pre','LocalizedText'].includes(tag))return;
      processChildren(node.children);
    }
    ts.forEachChild(node,visit);
  }
  visit(sf);
  if(!edits.length)continue;
  let result=text;
  for(const edit of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,edit.start)+edit.value+result.slice(edit.end);
  let module=path.relative(path.dirname(file),path.join(root,'i18n','LocalizedText')).replaceAll(path.sep,'/');if(!module.startsWith('.'))module='./'+module;
  result=`import { LocalizedText } from ${JSON.stringify(module)};\n`+result;
  fs.writeFileSync(file,result);
}
console.log(`Migrated ${messages} React text segments to explicit localized messages.`);
