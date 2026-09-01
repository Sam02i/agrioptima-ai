import { useEffect } from 'react';
import { LanguageSelector } from '../agriloop/components/LanguageSelector';
import { translations, type LanguageCode } from '../agriloop/i18n/translations';
import { useLanguage } from '../agriloop/i18n/LanguageContext';

const extras: Record<string, Partial<Record<LanguageCode,string>>> = {
  'Farm intelligence · Connected':{hi:'कृषि बुद्धिमत्ता · जुड़ा हुआ',pa:'ਖੇਤੀਬਾੜੀ ਜਾਣਕਾਰੀ · ਜੁੜੀ ਹੋਈ',hr:'खेती समझ · जुड़ी हुई',mr:'शेती बुद्धिमत्ता · जोडलेले',or:'କୃଷି ବୁଦ୍ଧିମତା · ସଂଯୁକ୍ତ'},
  'Farmer command center':{hi:'किसान कमांड सेंटर',pa:'ਕਿਸਾਨ ਕਮਾਂਡ ਕੇਂਦਰ',hr:'किसान कमांड सेंटर',mr:'शेतकरी नियंत्रण केंद्र',or:'ଚାଷୀ ନିୟନ୍ତ୍ରଣ କେନ୍ଦ୍ର'},
  'Plan crops, prove quality, reach buyers, and manage listings from one workspace.':{hi:'एक ही कार्यक्षेत्र से फसल की योजना बनाएँ, गुणवत्ता प्रमाणित करें, खरीदारों तक पहुँचें और सूचियाँ प्रबंधित करें।',pa:'ਇੱਕੋ ਵਰਕਸਪੇਸ ਤੋਂ ਫਸਲ ਯੋਜਨਾ ਬਣਾਓ, ਗੁਣਵੱਤਾ ਸਾਬਤ ਕਰੋ, ਖਰੀਦਦਾਰਾਂ ਤੱਕ ਪਹੁੰਚੋ ਅਤੇ ਸੂਚੀਆਂ ਸੰਭਾਲੋ।',hr:'एक ही जगह तै फसल की योजना बनाओ, गुणवत्ता साबित करो, खरीदारां तै जुड़ो अर सूची संभालो।',mr:'एकाच कार्यक्षेत्रातून पीक नियोजन, गुणवत्ता पडताळणी, खरेदीदार संपर्क आणि सूची व्यवस्थापन करा.',or:'ଗୋଟିଏ କାର୍ଯ୍ୟକ୍ଷେତ୍ରରୁ ଫସଲ ଯୋଜନା, ଗୁଣବତ୍ତା ପ୍ରମାଣ, କ୍ରେତା ସଂଯୋଗ ଓ ତାଲିକା ପରିଚାଳନା କରନ୍ତୁ।'},
  'Personalized farmer workspace':{hi:'व्यक्तिगत किसान कार्यक्षेत्र',pa:'ਨਿੱਜੀ ਕਿਸਾਨ ਵਰਕਸਪੇਸ',hr:'अपणा किसान काम का हिस्सा',mr:'वैयक्तिक शेतकरी कार्यक्षेत्र',or:'ବ୍ୟକ୍ତିଗତ ଚାଷୀ କାର୍ଯ୍ୟକ୍ଷେତ୍ର'},
  'Grow with evidence.':{hi:'प्रमाण के साथ उगाएँ।',pa:'ਸਬੂਤ ਨਾਲ ਉਗਾਓ।',hr:'सबूत के साथ उगाओ।',mr:'पुराव्यासह पिकवा.',or:'ପ୍ରମାଣ ସହ ଚାଷ କରନ୍ତୁ।'},
  'Sell with confidence.':{hi:'विश्वास के साथ बेचें।',pa:'ਭਰੋਸੇ ਨਾਲ ਵੇਚੋ।',hr:'भरोसे तै बेचो।',mr:'आत्मविश्वासाने विक्री करा.',or:'ଆତ୍ମବିଶ୍ୱାସରେ ବିକ୍ରି କରନ୍ତୁ।'},
  'Your soil, farm goals, produce quality, buyer access, and delivery planning are connected.':{hi:'आपकी मिट्टी, खेती के लक्ष्य, उपज की गुणवत्ता, खरीदारों तक पहुँच और वितरण योजना आपस में जुड़ी हैं।',pa:'ਤੁਹਾਡੀ ਮਿੱਟੀ, ਖੇਤੀ ਟੀਚੇ, ਉਪਜ ਗੁਣਵੱਤਾ, ਖਰੀਦਦਾਰ ਪਹੁੰਚ ਅਤੇ ਡਿਲਿਵਰੀ ਯੋਜਨਾ ਆਪਸ ਵਿੱਚ ਜੁੜੇ ਹਨ।',hr:'थारी मिट्टी, खेती के लक्ष्य, उपज की गुणवत्ता, खरीदार तक पहुँच अर डिलीवरी योजना जुड़ी सैं।',mr:'तुमची माती, शेतीची उद्दिष्टे, उत्पादन गुणवत्ता, खरेदीदार संपर्क आणि वितरण नियोजन जोडलेले आहे.',or:'ଆପଣଙ୍କ ମାଟି, ଚାଷ ଲକ୍ଷ୍ୟ, ଉତ୍ପାଦ ଗୁଣବତ୍ତା, କ୍ରେତା ସଂଯୋଗ ଓ ବିତରଣ ଯୋଜନା ପରସ୍ପର ସଂଯୁକ୍ତ।'},
  'Build my crop plan':{hi:'मेरी फसल योजना बनाएँ',pa:'ਮੇਰੀ ਫਸਲ ਯੋਜਨਾ ਬਣਾਓ',hr:'मेरी फसल योजना बनाओ',mr:'माझी पीक योजना तयार करा',or:'ମୋ ଫସଲ ଯୋଜନା ତିଆରି କରନ୍ତୁ'},
  'Acres registered':{hi:'पंजीकृत एकड़',pa:'ਰਜਿਸਟਰਡ ਏਕੜ',hr:'दर्ज एकड़',mr:'नोंदणीकृत एकर',or:'ପଞ୍ଜୀକୃତ ଏକର'},
  'Active crop listings':{hi:'सक्रिय फसल सूचियाँ',pa:'ਸਰਗਰਮ ਫਸਲ ਸੂਚੀਆਂ',hr:'चालू फसल लिस्ट',mr:'सक्रिय पीक सूची',or:'ସକ୍ରିୟ ଫସଲ ତାଲିକା'},
  'Soil pH':{hi:'मिट्टी का पीएच',pa:'ਮਿੱਟੀ ਪੀਐਚ',hr:'मिट्टी पीएच',mr:'माती पीएच',or:'ମାଟି ପିଏଚ'},
  'Investment budget':{hi:'निवेश बजट',pa:'ਨਿਵੇਸ਼ ਬਜਟ',hr:'निवेश बजट',mr:'गुंतवणूक बजेट',or:'ବିନିଯୋଗ ବଜେଟ'},
  'Search farm tools, crops, listings…':{hi:'खेती के उपकरण, फसलें और सूचियाँ खोजें…',pa:'ਖੇਤੀ ਸਾਧਨ, ਫਸਲਾਂ ਅਤੇ ਸੂਚੀਆਂ ਖੋਜੋ…',hr:'खेती औजार, फसल अर लिस्ट खोजो…',mr:'शेती साधने, पिके आणि सूची शोधा…',or:'ଚାଷ ଉପକରଣ, ଫସଲ ଓ ତାଲିକା ଖୋଜନ୍ତୁ…'},
  'Verified farmer':{hi:'सत्यापित किसान',pa:'ਪ੍ਰਮਾਣਿਤ ਕਿਸਾਨ',hr:'सत्यापित किसान',mr:'सत्यापित शेतकरी',or:'ଯାଞ୍ଚିତ ଚାଷୀ'},
  'Home':{hi:'होम',pa:'ਮੁੱਖ ਪੰਨਾ',hr:'घर',mr:'मुख्यपृष्ठ',or:'ମୂଳ ପୃଷ୍ଠା'},
  'Farmer portal':{hi:'किसान पोर्टल',pa:'ਕਿਸਾਨ ਪੋਰਟਲ',hr:'किसान पोर्टल',mr:'शेतकरी पोर्टल',or:'ଚାଷୀ ପୋର୍ଟାଲ'},
  'Buyer workspace':{hi:'खरीदार कार्यक्षेत्र',pa:'ਖਰੀਦਦਾਰ ਵਰਕਸਪੇਸ',hr:'खरीदार काम की जगह',mr:'खरेदीदार कार्यक्षेत्र',or:'କ୍ରେତା କାର୍ଯ୍ୟକ୍ଷେତ୍ର'},
  'Farmer workspace':{hi:'किसान कार्यक्षेत्र',pa:'ਕਿਸਾਨ ਵਰਕਸਪੇਸ',hr:'किसान काम की जगह',mr:'शेतकरी कार्यक्षेत्र',or:'ଚାଷୀ କାର୍ଯ୍ୟକ୍ଷେତ୍ର'},
  'Overview':{hi:'अवलोकन',pa:'ਸੰਖੇਪ',hr:'जायजा',mr:'आढावा',or:'ସାରାଂଶ'},
  'Marketplace':{hi:'बाज़ार',pa:'ਮਾਰਕੀਟ',hr:'बाजार',mr:'बाजारपेठ',or:'ବଜାର'},
  'Smart procurement':{hi:'स्मार्ट खरीद',pa:'ਸਮਾਰਟ ਖਰੀਦ',hr:'स्मार्ट खरीद',mr:'स्मार्ट खरेदी',or:'ସ୍ମାର୍ଟ କ୍ରୟ'},
  'Negotiations':{hi:'बातचीत',pa:'ਗੱਲਬਾਤ',hr:'मोलभाव',mr:'वाटाघाटी',or:'ଆଲୋଚନା'},
  'Orders':{hi:'ऑर्डर',pa:'ਆਰਡਰ',hr:'ऑर्डर',mr:'ऑर्डर',or:'ଅର୍ଡର'},
  'Shipments':{hi:'शिपमेंट',pa:'ਭੇਜੀਆਂ ਖੇਪਾਂ',hr:'भेजी खेप',mr:'मालवाहतूक',or:'ପରିବହନ'},
  'Produce passports':{hi:'उपज पासपोर्ट',pa:'ਫਸਲ ਪਾਸਪੋਰਟ',hr:'उपज पासपोर्ट',mr:'उत्पादन पासपोर्ट',or:'ଉତ୍ପାଦ ପାସପୋର୍ଟ'},
  'Credit':{hi:'ऋण',pa:'ਕਰਜ਼ਾ',hr:'उधार',mr:'पत',or:'ଋଣ'},
  'Suppliers':{hi:'आपूर्तिकर्ता',pa:'ਸਪਲਾਇਰ',hr:'सप्लायर',mr:'पुरवठादार',or:'ଯୋଗାଣକାରୀ'},
  'Procurement credit':{hi:'खरीद ऋण',pa:'ਖਰੀਦ ਕਰਜ਼ਾ',hr:'खरीद उधार',mr:'खरेदी पत',or:'କ୍ରୟ ଋଣ'},
  'Available sellers':{hi:'उपलब्ध विक्रेता',pa:'ਉਪਲਬਧ ਵਿਕਰੇਤਾ',hr:'मौजूद विक्रेता',mr:'उपलब्ध विक्रेते',or:'ଉପଲବ୍ଧ ବିକ୍ରେତା'},
  'Active orders':{hi:'सक्रिय ऑर्डर',pa:'ਸਰਗਰਮ ਆਰਡਰ',hr:'चालू ऑर्डर',mr:'सक्रिय ऑर्डर',or:'ସକ୍ରିୟ ଅର୍ଡର'},
  'Farm overview':{hi:'खेत का अवलोकन',pa:'ਖੇਤ ਸੰਖੇਪ',hr:'खेत का जायजा',mr:'शेत आढावा',or:'ଚାଷ ଜମି ସାରାଂଶ'},
  'Farmer profiles':{hi:'किसान प्रोफ़ाइल',pa:'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ',hr:'किसान प्रोफाइल',mr:'शेतकरी प्रोफाइल',or:'ଚାଷୀ ପ୍ରୋଫାଇଲ'},
  'Crop recommendation':{hi:'फसल सुझाव',pa:'ਫਸਲ ਸਿਫਾਰਸ਼',hr:'फसल सलाह',mr:'पीक शिफारस',or:'ଫସଲ ସୁପାରିଶ'},
  'Produce freshness':{hi:'उपज की ताज़गी',pa:'ਫਸਲ ਦੀ ਤਾਜ਼ਗੀ',hr:'उपज ताजगी',mr:'उत्पादन ताजेपणा',or:'ଉତ୍ପାଦ ସତେଜତା'},
  'Market listings':{hi:'बाज़ार सूची',pa:'ਮਾਰਕੀਟ ਸੂਚੀ',hr:'बाजार लिस्ट',mr:'बाजार सूची',or:'ବଜାର ତାଲିକା'},
  'Create profile':{hi:'प्रोफ़ाइल बनाएँ',pa:'ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',hr:'प्रोफाइल बनाओ',mr:'प्रोफाइल तयार करा',or:'ପ୍ରୋଫାଇଲ ତିଆରି କରନ୍ତୁ'},
  'Choose farmer profile':{hi:'किसान प्रोफ़ाइल चुनें',pa:'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਚੁਣੋ',hr:'किसान प्रोफाइल चुनो',mr:'शेतकरी प्रोफाइल निवडा',or:'ଚାଷୀ ପ୍ରୋଫାଇଲ ବାଛନ୍ତୁ'},
  'Open workspace':{hi:'कार्यक्षेत्र खोलें',pa:'ਵਰਕਸਪੇਸ ਖੋਲ੍ਹੋ',hr:'काम की जगह खोलो',mr:'कार्यक्षेत्र उघडा',or:'କାର୍ଯ୍ୟକ୍ଷେତ୍ର ଖୋଲନ୍ତୁ'},
  'Search':{hi:'खोजें',pa:'ਖੋਜੋ',hr:'खोजो',mr:'शोधा',or:'ଖୋଜନ୍ତୁ'},
  'Loading':{hi:'लोड हो रहा है',pa:'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ',hr:'लोड हो रहा',mr:'लोड होत आहे',or:'ଲୋଡ୍ ହେଉଛି'},
  'Close':{hi:'बंद करें',pa:'ਬੰਦ ਕਰੋ',hr:'बंद करो',mr:'बंद करा',or:'ବନ୍ଦ କରନ୍ତୁ'},
};

const originals=new WeakMap<Node,string>();
const attrOriginals=new WeakMap<Element,Record<string,string>>();

function dictionary(lang:LanguageCode){
  const map=new Map<string,string>();
  const english=translations.en as Record<string,unknown>;
  const target=translations[lang] as Record<string,unknown>;
  Object.keys(english).forEach((key)=>{if(typeof english[key]==='string'&&typeof target[key]==='string')map.set(english[key] as string,target[key] as string)});
  Object.entries(extras).forEach(([key,value])=>{if(value[lang])map.set(key,value[lang]!)});
  return map;
}

function translateValue(value:string,map:Map<string,string>,lang:LanguageCode){
  if(lang==='en')return value;
  const trimmed=value.trim(); const exact=map.get(trimmed);
  if(exact)return value.replace(trimmed,exact);
  let output=value;
  [...map.entries()].sort((a,b)=>b[0].length-a[0].length).forEach(([from,to])=>{if(from.length>3)output=output.replaceAll(from,to)});
  return output;
}

function apply(root:Document|ShadowRoot,lang:LanguageCode){
  const map=dictionary(lang); const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node:Node|null;
  while((node=walker.nextNode())){const parent=node.parentElement;if(!parent||['SCRIPT','STYLE','OPTION'].includes(parent.tagName))continue;if(!originals.has(node))originals.set(node,node.textContent||'');const original=originals.get(node)||'';const next=translateValue(original,map,lang);if(node.textContent!==next)node.textContent=next}
  root.querySelectorAll('input,textarea,button,[aria-label],[title]').forEach((element)=>{let saved=attrOriginals.get(element);if(!saved){saved={};attrOriginals.set(element,saved)};['placeholder','aria-label','title'].forEach((attr)=>{const current=element.getAttribute(attr);if(current&&!saved![attr])saved![attr]=current;if(saved![attr])element.setAttribute(attr,translateValue(saved![attr],map,lang))})});
}

export function GlobalTranslation({ showSelector }:{showSelector:boolean}){
  const {language}=useLanguage();
  useEffect(()=>{if(!showSelector)return;let timer=0;const run=()=>{apply(document,language);document.querySelectorAll<HTMLElement>('.buyer-exact-host').forEach((host)=>{if(host.shadowRoot)apply(host.shadowRoot,language)})};run();const observer=new MutationObserver(()=>{window.clearTimeout(timer);timer=window.setTimeout(run,30)});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});const dynamicWindowCheck=window.setInterval(run,300);return()=>{observer.disconnect();window.clearTimeout(timer);window.clearInterval(dynamicWindowCheck)}},[language,showSelector]);
  return showSelector?<div className="global-language-dock"><LanguageSelector isScrolled={true}/></div>:null;
}
