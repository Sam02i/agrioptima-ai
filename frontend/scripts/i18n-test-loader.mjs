import { registerHooks } from 'node:module';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

registerHooks({
  resolve(specifier,context,next){
    if(specifier.startsWith('.')&&context.parentURL){
      for(const extension of ['','.ts','.tsx']){
        const url=new URL(specifier+extension,context.parentURL);
        if(/\.tsx?$/.test(url.pathname)&&fs.existsSync(fileURLToPath(url)))return {url:url.href,shortCircuit:true};
      }
    }
    return next(specifier,context);
  },
  load(url,context,next){
    if(/\.tsx?$/.test(url)){
      const text=fs.readFileSync(fileURLToPath(url),'utf8').replaceAll('import.meta.env','({})');
      return {format:'module',shortCircuit:true,source:ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText};
    }
    return next(url,context);
  }
});
