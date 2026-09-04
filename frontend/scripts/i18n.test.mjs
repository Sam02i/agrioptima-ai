import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { LocalizedText, translateUi } from '../src/i18n/LocalizedText.tsx';
import { generatedTranslations } from '../src/i18n/generatedTranslations.ts';
import { LanguageProvider } from '../src/agriloop/i18n/LanguageContext.tsx';
import FarmerToday from '../src/components/FarmerToday.tsx';
import FarmerForm from '../src/components/FarmerForm.tsx';
import ProduceListingForm from '../src/components/ProduceListingForm.tsx';

const languages=['hi','mr','pa','or','hr'];
const scripts={hi:/[\u0900-\u097f]/,hr:/[\u0900-\u097f]/,mr:/[\u0900-\u097f]/,pa:/[\u0a00-\u0a7f]/,or:/[\u0b00-\u0b7f]/};
const render=(element,language)=>renderToStaticMarkup(React.createElement(LanguageProvider,{initialLanguage:language},element));

test('all explicit visible messages have a translation in every selected language',()=>{
  const missing=[];
  function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())walk(file);
    else if(file.endsWith('.tsx')&&!file.includes('.before-')){
      const sf=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
      function visit(node){
        if(ts.isJsxAttribute(node)&&node.name.getText(sf)==='source'&&node.initializer&&ts.isJsxExpression(node.initializer)&&node.initializer.expression&&ts.isStringLiteral(node.initializer.expression)){
          const text=node.initializer.expression.text.trim();
          // Brand, keyboard shortcuts and measurement symbols stay unchanged.
          if(/[A-Za-z]{3}/.test(text)&&!text.includes('AgriOptima')&&!text.includes('AgriLoop')&&!text.includes('@')&&!/^(?:SOC|ISO|SHP-|GMV|ETA|N|P|K|pH|kg|km|°C|kg\/ha|₹|⌘)/.test(text)&&!/^\{\d+\}[ /%₹.·–:()-]*$/.test(text)){
            for(const language of languages)if(translateUi(text,language)===text)missing.push(`${file}: ${language}: ${text}`);
          }
        }
        ts.forEachChild(node,visit);
      }
      visit(sf);
    }
  }}
  walk(path.resolve('src'));
  assert.deepEqual(missing,[]);
});

test('catalogue has every supported target and preserves message placeholders',()=>{
  const errors=[];
  for(const [source,targets] of Object.entries(generatedTranslations)){
    for(const language of languages){
      if(!targets[language])errors.push(`${language}: missing ${source}`);
      const expected=source.match(/\{\d+\}/g)||[];
      const actual=targets[language]?.match(/\{\d+\}/g)||[];
      if(JSON.stringify([...expected].sort())!==JSON.stringify([...actual].sort()))errors.push(`${language}: placeholders ${source}`);
    }
  }
  assert.deepEqual(errors,[]);
});

for(const language of languages){
  test(`${language}: full sentences render in the selected script`,()=>{
    for(const source of ['Today on my farm','Keep growing {0}.','We’ll help with the next step.','What does my soil need?','Compare price and list produce →']){
      const translated=translateUi(source,language);
      assert.notEqual(translated,source,source);
      assert.match(translated,scripts[language],source);
    }
  });
  test(`${language}: interpolated values are preserved without exposing placeholders`,()=>{
    const html=render(React.createElement(LocalizedText,{source:'Keep growing {0}.',values:['TEST-CROP-987']}),language);
    assert.ok(html.includes('TEST-CROP-987'));
    assert.ok(!html.includes('{0}'));
    assert.ok(!html.includes('Keep growing'));
  });
  test(`${language}: farmer overview renders translated headings and actions`,()=>{
    const html=render(React.createElement(FarmerToday,{farmerName:'Test Farmer',district:'Test District',farm:{current_crop:'Tomato',area_acres:2.4,irrigation_type:'rainfed'},listings:[],onNavigate:()=>{}}),language);
    for(const phrase of ['Keep growing','No soil numbers to enter','Local selling signal','Using this with an FPO','Manage farmer profiles','We’ll help with the next step'])assert.ok(!html.includes(phrase),phrase);
    assert.match(html,scripts[language]);
    assert.ok(html.includes('2.4'));
  });
  test(`${language}: crop and produce forms translate without changing saved values`,()=>{
    const form=render(React.createElement(FarmerForm,{onSubmit:()=>{},loading:false}),language);
    assert.ok(!form.includes('Your crop choice comes first'));
    assert.ok(form.includes('value="Maharashtra"'));
    const listing=render(React.createElement(ProduceListingForm,{farmerId:'TEST',existing:[]}),language);
    assert.ok(!listing.includes('List produce for buyers'));
    assert.ok(!listing.includes('My active listings'));
    assert.ok(listing.includes('value="Tomato"'));
  });
}

test('English remains unchanged and React values are not rewritten',()=>{
  assert.equal(translateUi('Keep growing {0}.','en'),'Keep growing {0}.');
  const html=render(React.createElement(LocalizedText,{source:'{0}',values:[React.createElement('input',{value:'Tomato',readOnly:true})]}),'hi');
  assert.ok(html.includes('value="Tomato"'));
});
