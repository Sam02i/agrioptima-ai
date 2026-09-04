import { LocalizedText } from "../i18n/LocalizedText";
import { translateUi } from "../i18n/LocalizedText";
import { useLanguage } from "../agriloop/i18n/LanguageContext";
import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
type Farm={current_crop?:string;previous_crop?:string;area_acres?:number;irrigation_type?:string;ph?:number};
type Listing={listing_status:string;crop_name:string;available_quantity_kg:number;price_per_kg:number};
type Mandi={recommended_price_per_kg?:number;average_price_per_kg?:number;prices?:Array<{market:string;district:string;price_per_kg:number;arrival_date?:string}>;fetched_at?:string};

export default function FarmerToday({farmerName,district,farm,listings,onNavigate}:{farmerName:string;district:string;farm?:Farm;listings:Listing[];onNavigate:(tab:string)=>void}){
  const {language}=useLanguage();
  const crop=(farm?.current_crop||farm?.previous_crop||listings[0]?.crop_name||"your crop").trim();
  const [mandi,setMandi]=useState<Mandi|null>(null);
  useEffect(()=>{if(crop==="your crop")return;fetch(`${API}/marketplace/mandi-prices?crop=${encodeURIComponent(crop)}`).then(r=>r.ok?r.json():Promise.reject()).then(setMandi).catch(()=>setMandi(null))},[crop]);
  const active=listings.filter(x=>x.listing_status==="AVAILABLE");
  const suggested=mandi?.recommended_price_per_kg||mandi?.average_price_per_kg;
  const nearest=mandi?.prices?.slice(0,3)||[];
  const advice=useMemo(()=>[
    `Continue with ${crop}. Review the nutrient plan before the next irrigation or field application.`,
    suggested?`Current market reference is about ₹${suggested} per kg. Compare net return before setting your price.`:"Check the latest mandi price before listing your produce.",
    active.length?(active.length===1?"1 listing is visible to buyers. Keep quantity and harvest details updated.":`${active.length} listings are visible to buyers. Keep quantity and harvest details updated.`):"Create a produce listing early so verified buyers can discover your harvest.",
  ],[crop,suggested,active.length]);
  const speak=()=>{if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(`${farmerName}. ${advice.map(item=>translateUi(item,language)).join(" ")}`);utterance.lang={en:'en-IN',hi:'hi-IN',hr:'hi-IN',mr:'mr-IN',pa:'pa-IN',or:'or-IN'}[language];window.speechSynthesis.speak(utterance)};
  return <div className="farmer-today">
    <section className="today-hero"><div><span><LocalizedText source={"Today · {0}"} values={[district]} /></span><h2><LocalizedText source={"Keep growing {0}."} values={[crop]} /><br/><em><LocalizedText source={"We’ll help with the next step."} /></em></h2><p><LocalizedText source={"No soil numbers to enter. Your connected farm record, local market prices, quality checks, buyers, and delivery are brought together here."} /></p><div><button onClick={()=>onNavigate("crop")}><LocalizedText source={"{0} →"} values={[crop==="your crop"?"Open crop plan":"Open my "+crop+" plan"]} /></button><button className="today-listen" onClick={speak}><LocalizedText source={"🔊 Read this aloud"} /></button></div></div><aside><small><LocalizedText source={"Current crop"} /></small><b><LocalizedText source={"{0}"} values={[crop]} /></b><span><LocalizedText source={"{0} acres · {1}"} values={[farm?.area_acres||0, farm?.irrigation_type||"Irrigation recorded"]} /></span><i><LocalizedText source={"✓ Farmer choice preserved"} /></i></aside></section>
    <section className="today-actions"><div className="today-section-head"><span><LocalizedText source={"What to do now"} /></span><h3><LocalizedText source={"Three simple actions"} /></h3></div>{advice.map((item,index)=><article key={item}><b><LocalizedText source={"{0}"} values={[index+1]} /></b><p><LocalizedText source={"{0}"} values={[item]} /></p><button onClick={()=>onNavigate(index===0?"soil":"listings")}><LocalizedText source={index===0?"Soil health":index===1?"Compare price and list produce →":"Create my listing"} /></button></article>)}</section>
    <section className="today-grid"><article><span><LocalizedText source={"Local selling signal"} /></span><h3><LocalizedText source={"{0} market guidance"} values={[crop]} /></h3>{suggested?<><strong><LocalizedText source={"₹{0}/kg "} values={[suggested]} /><small><LocalizedText source={"suggested reference"} /></small></strong><div className="today-markets">{nearest.map((m,i)=><p key={`${m.market}-${i}`}><b><LocalizedText source={"{0}"} values={[m.market]} /></b><span><LocalizedText source={"{0} · ₹{1}/kg"} values={[m.district||"Regional mandi", m.price_per_kg]} /></span></p>)}</div></>:<p><LocalizedText source={"Fetching recent AGMARKNET records…"} /></p>}<button onClick={()=>onNavigate("listings")}><LocalizedText source={"Compare price and list produce →"} /></button></article><article><span><LocalizedText source={"Farm-to-market progress"} /></span><h3><LocalizedText source={"Your selling journey"} /></h3><ol><li className="done"><LocalizedText source={"Farm profile connected"} /></li><li className={active.length?"done":""}><LocalizedText source={"{0}"} values={[active.length?`${active.length} active buyer listing${active.length===1?"":"s"}`:"Produce listing not created"]} /></li><li><LocalizedText source={"Quality check before dispatch"} /></li><li><LocalizedText source={"Order, tracking and payment"} /></li></ol><button onClick={()=>onNavigate(active.length?"orders":"listings")}><LocalizedText source={"{0} →"} values={[active.length?"View orders and delivery":"Create my listing"]} /></button></article></section>
    <section className="assisted-use"><span>👥</span><div><b><LocalizedText source={"Using this with an FPO or agriculture officer?"} /></b><p><LocalizedText source={"One assisted operator can switch profiles, upload records, create listings, and explain recommendations for many farmers."} /></p></div><button onClick={()=>onNavigate("profile")}><LocalizedText source={"Manage farmer profiles"} /></button></section>
  </div>
}
