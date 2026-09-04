import { Fragment, type ReactNode } from 'react';
import { useLanguage } from '../agriloop/i18n/LanguageContext';
import { generatedTranslations } from './generatedTranslations';
import { translations, type LanguageCode } from '../agriloop/i18n/translations';
import { reviewedTranslations } from './reviewedTranslations';

const dictionaries = new Map<LanguageCode, Map<string,string>>();
const templates = new Map<LanguageCode, Array<{pattern:RegExp;keys:string[];target:string}>>();
const escapeRegex=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const displayLabels:Record<string,string>={COMPLETE:'Complete',INCOMPLETE:'Incomplete',MAXIMIZE_PROFIT:'Maximize profit',MINIMIZE_RISK:'Minimize risk',MEDIUM:'Medium',HIGH:'High',LOW:'Low',rainfed:'Rainfed',irrigated:'Irrigated',adequate:'Adequate',limited:'Limited',none:'None',GRADE_A:'Grade A',GRADE_B:'Grade B',GRADE_C:'Grade C',en:'English',hi:'Hindi',mr:'Marathi',pa:'Punjabi',or:'Odia',hr:'Haryanvi'};
function dictionary(language:LanguageCode) {
  if(dictionaries.has(language)) return dictionaries.get(language)!;
  const map = new Map<string,string>();
  for(const [source,targets] of Object.entries(generatedTranslations)) if(targets[language]) map.set(source,targets[language]!);
  const target=translations[language] as Record<string,unknown>;
  for(const [key,source] of Object.entries(translations.en)) if(typeof source==='string'&&typeof target[key]==='string') map.set(source,target[key] as string);
  for(const [source,targets] of Object.entries(reviewedTranslations)) if(targets[language]) map.set(source,targets[language]!);
  dictionaries.set(language,map);return map;
}

/** Translate display text only. Never change a form value or API identifier. */
export function translateUi(source: string, language: LanguageCode): string {
  source = source.replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, entity: string) => ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[entity] || _));
  if (language === 'en') return source;
  const normalized = source.replace(/\s+/g, ' ').trim();
  const key = displayLabels[normalized]||normalized;
  const translated = dictionary(language).get(key);
  if (translated) return source.replace(source.trim(), translated);
  if(!templates.has(language)){
    const list:Array<{pattern:RegExp;keys:string[];target:string}>=[];
    dictionary(language).forEach((target,english)=>{
      const keys=english.match(/\{\d+\}/g);
      if(!keys||!/[A-Za-z]{3}/.test(english))return;
      if(keys.some(key=>!target.includes(key)))return;
      list.push({pattern:new RegExp('^'+english.split(/\{\d+\}/g).map(escapeRegex).join('(.+?)')+'$'),keys,target});
    });
    templates.set(language,list);
  }
  for(const {pattern,keys,target} of templates.get(language)!){
    const match=key.match(pattern);if(!match)continue;
    const values=new Map(keys.map((token,index)=>[token,match[index+1]]));
    return target.replace(/\{\d+\}/g,token=>{
      const value=values.get(token)||token;
      return dictionary(language).get(value)||value;
    });
  }
  return source;
}

export function LocalizedText({ source, values = [] }: { source: string; values?: ReactNode[] }) {
  const { language } = useLanguage();
  const message = translateUi(source, language);
  // Preserve values as React nodes: do not stringify components or user data.
  return <>{message.split(/(\{\d+\})/g).map((part, index) => {
    const match = part.match(/^\{(\d+)\}$/);
    if (!match) return part;
    const value = values[Number(match[1])];
    return <Fragment key={index}>{typeof value === 'string' ? translateUi(value, language) : value}</Fragment>;
  })}</>;
}
