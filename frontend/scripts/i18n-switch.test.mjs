import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act,useState} from 'react';
import { Window } from 'happy-dom';
import { LocalizedText,translateUi } from '../src/i18n/LocalizedText.tsx';
import { LanguageProvider,useLanguage } from '../src/agriloop/i18n/LanguageContext.tsx';

test('language changes update existing text, new dialogs and buyer shadow content',async()=>{
  const window=new Window();
  Object.assign(globalThis,{window,document:window.document,HTMLElement:window.HTMLElement,Node:window.Node,IS_REACT_ACT_ENVIRONMENT:true});
  const {createRoot}=await import('react-dom/client');
  const {createPortal}=await import('react-dom');
  const container=document.createElement('div');document.body.append(container);
  const host=document.createElement('div');document.body.append(host);const shadow=host.attachShadow({mode:'open'});
  let switchLanguage,showDialog;
  function Harness(){
    const {setLanguage}=useLanguage();const [open,setOpen]=useState(false);
    switchLanguage=setLanguage;showDialog=setOpen;
    return React.createElement(React.Fragment,null,
      React.createElement('h1',null,React.createElement(LocalizedText,{source:'Today on my farm'})),
      React.createElement('input',{value:'Tomato',readOnly:true}),
      open&&createPortal(React.createElement('article',null,
        React.createElement(LocalizedText,{source:'Keep growing {0}.',values:['TEST-CROP']})),shadow));
  }
  const root=createRoot(container);
  try{
    await act(async()=>root.render(React.createElement(LanguageProvider,{initialLanguage:'en'},React.createElement(Harness))));
    for(const language of ['hi','mr','pa','or','hr','en','hi']){
      await act(async()=>switchLanguage(language));
      assert.equal(container.querySelector('h1').textContent,translateUi('Today on my farm',language));
      assert.equal(container.querySelector('input').value,'Tomato');
      await act(async()=>showDialog(true));
      assert.equal(shadow.textContent,translateUi('Keep growing {0}.',language).replace('{0}','TEST-CROP'));
      await act(async()=>showDialog(false));
    }
  }finally{await act(async()=>root.unmount());await window.happyDOM.close();}
});
