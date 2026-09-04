import { LocalizedText } from "../../i18n/LocalizedText";
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Building2, Sprout, X } from 'lucide-react';
import { createFarmerProfile, getFarmerRecords, type FarmerRecord } from '../../api/farmers';
import { useLanguage } from '../i18n/LanguageContext';
import type { LanguageCode } from '../i18n/translations';

const portalCopy:Record<LanguageCode,Record<string,string>>={
  en:{join:'Join the AgriOptimaᴬᴵ network',question:'How would you like to continue?',help:'Choose your workspace. You can switch between Farmer and Buyer portals at any time.',farmer:"I’m a Farmer",farmerHelp:'Plan crops, grade freshness, publish produce, find buyers, and manage your farm.',choose:'Choose farmer profile',open:'Open workspace',create:'+ Create profile',buyer:"I’m a Buyer",buyerHelp:'Access the Buyer Intelligence dashboard, farmer data, credit scoring, sourcing, and logistics.',openBuyer:'Open Buyer dashboard',name:'Farmer name',village:'Village',district:'District',acres:'Farm acres',budget:'Investment budget',saving:'Creating profile…',createOpen:'Create and open workspace →',existing:'Use an existing profile'},
  hi:{join:'एग्रीऑप्टिमा नेटवर्क से जुड़ें',question:'आप किस रूप में आगे बढ़ना चाहते हैं?',help:'अपना कार्यक्षेत्र चुनें। आप किसान और खरीदार पोर्टल के बीच कभी भी बदल सकते हैं।',farmer:'मैं किसान हूँ',farmerHelp:'फसल की योजना बनाएँ, ताज़गी जाँचें, उपज सूचीबद्ध करें, खरीदार खोजें और अपना खेत प्रबंधित करें।',choose:'किसान प्रोफ़ाइल चुनें',open:'कार्यक्षेत्र खोलें',create:'+ नई प्रोफ़ाइल बनाएँ',buyer:'मैं खरीदार हूँ',buyerHelp:'खरीदार इंटेलिजेंस डैशबोर्ड, किसान डेटा, क्रेडिट स्कोर, खरीद और लॉजिस्टिक्स देखें।',openBuyer:'खरीदार डैशबोर्ड खोलें',name:'किसान का नाम',village:'गाँव',district:'ज़िला',acres:'खेत का क्षेत्रफल',budget:'निवेश बजट',saving:'प्रोफ़ाइल बनाई जा रही है…',createOpen:'प्रोफ़ाइल बनाकर खोलें →',existing:'मौजूदा प्रोफ़ाइल चुनें'},
  pa:{join:'ਐਗਰੀਆਪਟੀਮਾ ਨੈੱਟਵਰਕ ਨਾਲ ਜੁੜੋ',question:'ਤੁਸੀਂ ਕਿਸ ਤਰ੍ਹਾਂ ਅੱਗੇ ਵਧਣਾ ਚਾਹੁੰਦੇ ਹੋ?',help:'ਆਪਣਾ ਵਰਕਸਪੇਸ ਚੁਣੋ। ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਵੇਲੇ ਕਿਸਾਨ ਅਤੇ ਖਰੀਦਦਾਰ ਪੋਰਟਲ ਬਦਲ ਸਕਦੇ ਹੋ।',farmer:'ਮੈਂ ਕਿਸਾਨ ਹਾਂ',farmerHelp:'ਫਸਲ ਯੋਜਨਾ ਬਣਾਓ, ਤਾਜ਼ਗੀ ਜਾਂਚੋ, ਉਪਜ ਸੂਚੀਬੱਧ ਕਰੋ, ਖਰੀਦਦਾਰ ਲੱਭੋ ਅਤੇ ਖੇਤ ਸੰਭਾਲੋ।',choose:'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਚੁਣੋ',open:'ਵਰਕਸਪੇਸ ਖੋਲ੍ਹੋ',create:'+ ਨਵੀਂ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',buyer:'ਮੈਂ ਖਰੀਦਦਾਰ ਹਾਂ',buyerHelp:'ਖਰੀਦਦਾਰ ਡੈਸ਼ਬੋਰਡ, ਕਿਸਾਨ ਡਾਟਾ, ਕਰੈਡਿਟ ਸਕੋਰ, ਖਰੀਦ ਅਤੇ ਲਾਜਿਸਟਿਕਸ ਵੇਖੋ।',openBuyer:'ਖਰੀਦਦਾਰ ਡੈਸ਼ਬੋਰਡ ਖੋਲ੍ਹੋ',name:'ਕਿਸਾਨ ਦਾ ਨਾਮ',village:'ਪਿੰਡ',district:'ਜ਼ਿਲ੍ਹਾ',acres:'ਖੇਤ ਏਕੜ',budget:'ਨਿਵੇਸ਼ ਬਜਟ',saving:'ਪ੍ਰੋਫਾਈਲ ਬਣ ਰਹੀ ਹੈ…',createOpen:'ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ ਤੇ ਖੋਲ੍ਹੋ →',existing:'ਮੌਜੂਦਾ ਪ੍ਰੋਫਾਈਲ ਵਰਤੋ'},
  hr:{join:'एग्रीऑप्टिमा नेटवर्क तै जुड़ो',question:'आप किस रूप म्हं आगे बढ़णा चाहो हो?',help:'अपणा काम का हिस्सा चुनो। किसान अर खरीदार पोर्टल कदे भी बदल सको हो।',farmer:'मैं किसान सूँ',farmerHelp:'फसल की योजना बनाओ, ताजगी जाँचो, उपज लगाओ, खरीदार ढूँढो अर खेत संभालो।',choose:'किसान प्रोफाइल चुनो',open:'काम की जगह खोलो',create:'+ नई प्रोफाइल बनाओ',buyer:'मैं खरीदार सूँ',buyerHelp:'खरीदार डैशबोर्ड, किसान डेटा, क्रेडिट स्कोर, खरीद अर ढुलाई देखो।',openBuyer:'खरीदार डैशबोर्ड खोलो',name:'किसान का नाम',village:'गाम',district:'जिला',acres:'खेत के एकड़',budget:'निवेश बजट',saving:'प्रोफाइल बन री सै…',createOpen:'प्रोफाइल बनाके खोलो →',existing:'पुराणी प्रोफाइल चुनो'},
  mr:{join:'ॲग्रीऑप्टिमा नेटवर्कमध्ये सामील व्हा',question:'तुम्हाला कसे पुढे जायचे आहे?',help:'तुमचे कार्यक्षेत्र निवडा. शेतकरी आणि खरेदीदार पोर्टलमध्ये कधीही बदल करता येईल.',farmer:'मी शेतकरी आहे',farmerHelp:'पीक नियोजन करा, ताजेपणा तपासा, उत्पादन सूचीबद्ध करा, खरेदीदार शोधा आणि शेत व्यवस्थापित करा.',choose:'शेतकरी प्रोफाइल निवडा',open:'कार्यक्षेत्र उघडा',create:'+ नवीन प्रोफाइल तयार करा',buyer:'मी खरेदीदार आहे',buyerHelp:'खरेदीदार डॅशबोर्ड, शेतकरी डेटा, क्रेडिट स्कोअर, खरेदी आणि लॉजिस्टिक्स पहा.',openBuyer:'खरेदीदार डॅशबोर्ड उघडा',name:'शेतकऱ्याचे नाव',village:'गाव',district:'जिल्हा',acres:'शेत एकर',budget:'गुंतवणूक बजेट',saving:'प्रोफाइल तयार होत आहे…',createOpen:'प्रोफाइल तयार करून उघडा →',existing:'विद्यमान प्रोफाइल वापरा'},
  or:{join:'ଏଗ୍ରିଅପ୍ଟିମା ନେଟୱର୍କରେ ଯୋଗ ଦିଅନ୍ତୁ',question:'ଆପଣ କେଉଁ ଭୂମିକାରେ ଆଗକୁ ବଢ଼ିବେ?',help:'ନିଜ କାର୍ଯ୍ୟକ୍ଷେତ୍ର ବାଛନ୍ତୁ। ଚାଷୀ ଓ କ୍ରେତା ପୋର୍ଟାଲ ମଧ୍ୟରେ ଯେକୌଣସି ସମୟରେ ବଦଳାଇ ପାରିବେ।',farmer:'ମୁଁ ଜଣେ ଚାଷୀ',farmerHelp:'ଫସଲ ଯୋଜନା, ସତେଜତା ଯାଞ୍ଚ, ଉତ୍ପାଦ ତାଲିକା, କ୍ରେତା ସନ୍ଧାନ ଓ ଚାଷ ପରିଚାଳନା କରନ୍ତୁ।',choose:'ଚାଷୀ ପ୍ରୋଫାଇଲ ବାଛନ୍ତୁ',open:'କାର୍ଯ୍ୟକ୍ଷେତ୍ର ଖୋଲନ୍ତୁ',create:'+ ନୂଆ ପ୍ରୋଫାଇଲ ତିଆରି କରନ୍ତୁ',buyer:'ମୁଁ ଜଣେ କ୍ରେତା',buyerHelp:'କ୍ରେତା ଡ୍ୟାସବୋର୍ଡ, ଚାଷୀ ତଥ୍ୟ, କ୍ରେଡିଟ ସ୍କୋର, କ୍ରୟ ଓ ପରିବହନ ଦେଖନ୍ତୁ।',openBuyer:'କ୍ରେତା ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ',name:'ଚାଷୀଙ୍କ ନାମ',village:'ଗାଁ',district:'ଜିଲ୍ଲା',acres:'ଚାଷ ଜମି ଏକର',budget:'ବିନିଯୋଗ ବଜେଟ',saving:'ପ୍ରୋଫାଇଲ ତିଆରି ହେଉଛି…',createOpen:'ପ୍ରୋଫାଇଲ ତିଆରି କରି ଖୋଲନ୍ତୁ →',existing:'ଥିବା ପ୍ରୋଫାଇଲ ବ୍ୟବହାର କରନ୍ତୁ'}
};

interface PortalChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFarmer: (farmerId?: string) => void;
  onBuyer: () => void;
}

export function PortalChoiceModal({ isOpen, onClose, onFarmer, onBuyer }: PortalChoiceModalProps) {
  const {language}=useLanguage(); const copy=portalCopy[language];
  const [farmers,setFarmers]=useState<FarmerRecord[]>([]);
  const [selected,setSelected]=useState('');
  const [recordsError,setRecordsError]=useState('');
  const [createMode,setCreateMode]=useState(false);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({name:'',village:'',district:'',state:'Maharashtra',area_acres:2,soil_ph:6.8,investment_budget_rupees:80000});
  const saveFarmer=async(event:FormEvent)=>{event.preventDefault();setSaving(true);setRecordsError('');try{const created=await createFarmerProfile(form);onFarmer(created.farmer_id)}catch(error){setRecordsError(error instanceof Error?error.message:'Unable to create profile')}finally{setSaving(false)}};
  useEffect(()=>{if(!isOpen)return;getFarmerRecords().then((rows)=>{setFarmers(rows);setSelected((current)=>current||rows[0]?.farmer_id||'')}).catch(()=>setRecordsError('Start the backend to load farmer records.'))},[isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl border border-white/80">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close role selection"
          className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-[#EAE7DD] px-6 py-8 text-center sm:px-10 sm:py-10">
          <span className="inline-flex items-center rounded-full border border-[#EAE7DD] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#26483E]"><LocalizedText source={" {0} "} values={[copy.join]} /></span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-[#26483E] sm:text-4xl"><LocalizedText source={"{0}"} values={[copy.question]} /></h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base"><LocalizedText source={" {0} "} values={[copy.help]} /></p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
          <div
            className="group rounded-3xl border border-emerald-100 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-[#EAE7DD] hover:shadow-xl"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EAE7DD] text-[#26483E]">
              <Sprout className="h-7 w-7" />
            </span>
            <h3 className="mt-5 font-serif text-2xl font-bold text-[#26483E]"><LocalizedText source={"{0}"} values={[copy.farmer]} /></h3>
            <p className="mt-2 text-sm leading-6 text-gray-600"><LocalizedText source={"{0}"} values={[copy.farmerHelp]} /></p>
            {!createMode&&farmers.length>0&&<label className="mt-4 block text-xs font-bold uppercase tracking-wider text-[#26483E]"><LocalizedText source={"{0}"} values={[copy.choose]} /><select value={selected} onChange={(event)=>setSelected(event.target.value)} className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-gray-800 outline-none focus:ring-2 focus:ring-emerald-600">{farmers.map((farmer)=><option key={farmer.farmer_id} value={farmer.farmer_id}><LocalizedText source={"{0} · {1}"} values={[farmer.name, farmer.district]} /></option>)}</select></label>}
            {recordsError&&<small className="mt-3 block text-xs text-amber-700"><LocalizedText source={"{0}"} values={[recordsError]} /></small>}
            {!createMode?<div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => onFarmer(selected || undefined)} className="inline-flex items-center gap-2 rounded-full bg-[#26483E] px-4 py-2.5 text-sm font-bold text-white"><LocalizedText source={"{0} "} values={[copy.open]} /><ArrowRight className="h-4 w-4" /></button><button type="button" onClick={()=>setCreateMode(true)} className="rounded-full border border-emerald-200 px-4 py-2.5 text-sm font-bold text-[#26483E]"><LocalizedText source={"{0}"} values={[copy.create]} /></button></div>:<form onSubmit={saveFarmer} className="mt-4 grid grid-cols-2 gap-2"><input required placeholder={copy.name} value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="col-span-2 rounded-xl border border-emerald-200 px-3 py-2 text-sm"/><input required placeholder={copy.village} value={form.village} onChange={(e)=>setForm({...form,village:e.target.value})} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm"/><input required placeholder={copy.district} value={form.district} onChange={(e)=>setForm({...form,district:e.target.value})} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm"/><label className="text-xs text-gray-500"><LocalizedText source={"{0}"} values={[copy.acres]} /><input required type="number" min="0.1" step="0.1" value={form.area_acres} onChange={(e)=>setForm({...form,area_acres:Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm"/></label><label className="text-xs text-gray-500"><LocalizedText source={"{0}"} values={[copy.budget]} /><input required type="number" min="1000" step="1000" value={form.investment_budget_rupees} onChange={(e)=>setForm({...form,investment_budget_rupees:Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm"/></label><button type="submit" disabled={saving} className="col-span-2 rounded-full bg-[#26483E] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><LocalizedText source={"{0}"} values={[saving?copy.saving:copy.createOpen]} /></button><button type="button" onClick={()=>setCreateMode(false)} className="col-span-2 text-xs font-bold text-gray-500"><LocalizedText source={"{0}"} values={[copy.existing]} /></button></form>}
          </div>

          <button
            type="button"
            onClick={onBuyer}
            className="group rounded-3xl border border-emerald-900/10 bg-[#26483E] p-6 text-left text-white transition-all hover:-translate-y-1 hover:bg-[#26483E] hover:shadow-xl"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EAE7DD] text-[#26483E]">
              <Building2 className="h-7 w-7" />
            </span>
            <h3 className="mt-5 font-serif text-2xl font-bold"><LocalizedText source={"{0}"} values={[copy.buyer]} /></h3>
            <p className="mt-2 text-sm leading-6 text-white/75"><LocalizedText source={"{0}"} values={[copy.buyerHelp]} /></p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#EAE7DD]"><LocalizedText source={"{0} "} values={[copy.openBuyer]} /><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
