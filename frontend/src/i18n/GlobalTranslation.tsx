import { useEffect } from 'react';
import { LanguageSelector } from '../agriloop/components/LanguageSelector';
import { useLanguage } from '../agriloop/i18n/LanguageContext';
import { translateUi } from './LocalizedText';

const sources = new WeakMap<Element, Map<string,{source:string;applied:string}>>();
const attributes = ['placeholder','aria-label','title','alt'] as const;

/** Legacy attribute bridge only. Visible text is rendered by LocalizedText.
 * Input values, select values, IDs and React-owned text nodes are never mutated.
 */
export function GlobalTranslation({ showSelector }:{showSelector:boolean}) {
  const {language}=useLanguage();
  useEffect(()=>{
    document.documentElement.lang=language==='hr'?'hi':language;
    let scheduled=0;
    const apply=(root:Document|ShadowRoot)=>{
      root.querySelectorAll<HTMLElement>('[placeholder],[aria-label],[title],[alt]').forEach(element=>{
        if(element.closest('.global-language-dock,[data-i18n-native]'))return;
        let saved=sources.get(element);if(!saved){saved=new Map();sources.set(element,saved)}
        for(const attribute of attributes){
          const current=element.getAttribute(attribute);if(current===null)continue;
          let record=saved.get(attribute);
          if(!record||current!==record.applied)record={source:current,applied:current};
          const next=translateUi(record.source,language);
          if(current!==next)element.setAttribute(attribute,next);
          saved.set(attribute,{source:record.source,applied:next});
        }
      });
    };
    const run=()=>{apply(document);document.querySelectorAll('.buyer-exact-host').forEach(host=>{if(host.shadowRoot)apply(host.shadowRoot)})};
    const observer=new MutationObserver(()=>{cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(run)});
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:[...attributes]});
    run();
    return()=>{observer.disconnect();cancelAnimationFrame(scheduled)};
  },[language]);
  return showSelector?<div className="global-language-dock"><LanguageSelector isScrolled /></div>:null;
}
