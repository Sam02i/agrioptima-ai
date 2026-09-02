import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
type Farm={current_crop?:string;previous_crop?:string;area_acres?:number;irrigation_type?:string;ph?:number};
type Listing={listing_status:string;crop_name:string;available_quantity_kg:number;price_per_kg:number};
type Mandi={recommended_price_per_kg?:number;average_price_per_kg?:number;prices?:Array<{market:string;district:string;price_per_kg:number;arrival_date?:string}>;fetched_at?:string};

export default function FarmerToday({farmerName,district,farm,listings,onNavigate}:{farmerName:string;district:string;farm?:Farm;listings:Listing[];onNavigate:(tab:string)=>void}){
  const crop=(farm?.current_crop||farm?.previous_crop||listings[0]?.crop_name||"your crop").trim();
  const [mandi,setMandi]=useState<Mandi|null>(null);
  useEffect(()=>{if(crop==="your crop")return;fetch(`${API}/marketplace/mandi-prices?crop=${encodeURIComponent(crop)}`).then(r=>r.ok?r.json():Promise.reject()).then(setMandi).catch(()=>setMandi(null))},[crop]);
  const active=listings.filter(x=>x.listing_status==="AVAILABLE");
  const suggested=mandi?.recommended_price_per_kg||mandi?.average_price_per_kg;
  const nearest=mandi?.prices?.slice(0,3)||[];
  const advice=useMemo(()=>[
    `Continue with ${crop}. Review the nutrient plan before the next irrigation or field application.`,
    suggested?`Current market reference is about ₹${suggested} per kg. Compare net return before setting your price.`:"Check the latest mandi price before listing your produce.",
    active.length?`${active.length} listing${active.length===1?" is":"s are"} visible to buyers. Keep quantity and harvest details updated.`:"Create a produce listing early so verified buyers can discover your harvest.",
  ],[crop,suggested,active.length]);
  const speak=()=>{if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Hello ${farmerName}. ${advice.join(" ")}`))};
  return <div className="farmer-today">
    <section className="today-hero"><div><span>Today · {district}</span><h2>Keep growing {crop}.<br/><em>We’ll help with the next step.</em></h2><p>No soil numbers to enter. Your connected farm record, local market prices, quality checks, buyers, and delivery are brought together here.</p><div><button onClick={()=>onNavigate("crop")}>Open my {crop} plan →</button><button className="today-listen" onClick={speak}>🔊 Read this aloud</button></div></div><aside><small>Current crop</small><b>{crop}</b><span>{farm?.area_acres||0} acres · {farm?.irrigation_type||"Irrigation recorded"}</span><i>✓ Farmer choice preserved</i></aside></section>
    <section className="today-actions"><div className="today-section-head"><span>What to do now</span><h3>Three simple actions</h3></div>{advice.map((item,index)=><article key={item}><b>{index+1}</b><p>{item}</p><button onClick={()=>onNavigate(index===0?"soil":index===1?"listings":"orders")}>Open →</button></article>)}</section>
    <section className="today-grid"><article><span>Local selling signal</span><h3>{crop} market guidance</h3>{suggested?<><strong>₹{suggested}/kg <small>suggested reference</small></strong><div className="today-markets">{nearest.map((m,i)=><p key={`${m.market}-${i}`}><b>{m.market}</b><span>{m.district||"Regional mandi"} · ₹{m.price_per_kg}/kg</span></p>)}</div></>:<p>Fetching recent AGMARKNET records…</p>}<button onClick={()=>onNavigate("listings")}>Compare price and list produce →</button></article><article><span>Farm-to-market progress</span><h3>Your selling journey</h3><ol><li className="done">Farm profile connected</li><li className={active.length?"done":""}>{active.length?`${active.length} active buyer listing${active.length===1?"":"s"}`:"Produce listing not created"}</li><li>Quality check before dispatch</li><li>Order, tracking and payment</li></ol><button onClick={()=>onNavigate(active.length?"orders":"listings")}>{active.length?"View orders and delivery":"Create my listing"} →</button></article></section>
    <section className="assisted-use"><span>👥</span><div><b>Using this with an FPO or agriculture officer?</b><p>One assisted operator can switch profiles, upload records, create listings, and explain recommendations for many farmers.</p></div><button onClick={()=>onNavigate("profile")}>Manage farmer profiles</button></section>
  </div>
}
