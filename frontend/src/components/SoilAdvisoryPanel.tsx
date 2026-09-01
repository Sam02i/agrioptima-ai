import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
type FertilizerOption={fertilizer:string;quantity:number;unit:string;benefit:string};
type Advisory={soil_health_score:number;summary:string;source:string;district?:string;estimated?:boolean;ph:{value:number;status:string};nutrients:Array<{name:string;value:number;target:number;status:string;gap:number}>;missing_nutrients:string[];fertilizer_plan:Array<{fertilizer:string;quantity:number;unit:string;purpose:string;timing:string}>;fertilizer_options?:Array<{nutrient:string;options:FertilizerOption[]}>;advisory_note:string};

export default function SoilAdvisoryPanel({farmerId,farm}:{farmerId:string;farm?:{ph:number;nitrogen:number;phosphorus:number;potassium:number;area_acres:number;current_crop:string}}){
  const [data,setData]=useState<Advisory|null>(null);const [error,setError]=useState("");
  useEffect(()=>{setData(null);setError("");const request=farmerId?fetch(`${API}/soil/advisory/${farmerId}`):fetch(`${API}/soil/analyze`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(farm)});request.then(async r=>{if(!r.ok)throw new Error((await r.json()).detail||"No soil record found");return r.json()}).then(setData).catch(e=>setError(e.message))},[farmerId,farm?.ph,farm?.nitrogen,farm?.phosphorus,farm?.potassium]);
  return <section className="soil-advisory">
    <div className="soil-head"><div><span>Automatic soil prediction model</span><h2>Area-based soil intelligence</h2><p>pH and N-P-K are filled automatically using common soil values for the selected Maharashtra district.</p></div>{data&&<div className="soil-score"><b>{data.soil_health_score}</b><small>Soil health score</small></div>}</div>
    {error&&<div className="soil-loading">{error}</div>}{!data&&!error&&<div className="soil-loading">Finding common soil values for this area…</div>}
    {data&&<><div className="soil-source"><span>✓ {data.source}</span><b>{data.summary}</b><small>pH {data.ph.value} · {data.ph.status}</small></div>
      <div className="nutrient-grid">{data.nutrients.map(n=><article key={n.name} className={n.status.toLowerCase()}><div><span>{n.name}</span><b>{n.value}</b></div><div className="nutrient-track"><i style={{width:`${Math.min(100,n.value/n.target*100)}%`}}/></div><small>{n.status}{n.gap>0?` · Missing ${n.gap}`:" · At target"}</small></article>)}</div>
      <div className="fertilizer-title"><div><span>Recommended treatment</span><h3>Best fertilizer plan for this soil</h3></div><b>{data.missing_nutrients.length?`${data.missing_nutrients.join(", ")} need attention`:"NPK levels are balanced"}</b></div>
      <div className="fertilizer-plan">{data.fertilizer_plan.map(item=><article key={item.fertilizer}><span>Recommended</span><h4>{item.fertilizer}</h4><strong>{item.quantity.toLocaleString("en-IN")} {item.unit}</strong><p>{item.purpose}</p><small>{item.timing}</small></article>)}</div>
      {data.fertilizer_options?.map(group=><div className="fertilizer-alternatives" key={group.nutrient}><div><b>{group.nutrient} options</b><small>Choose one option after local confirmation—do not apply all alternatives together.</small></div><section>{group.options.map((option,index)=><article key={option.fertilizer} className={index===0?"preferred":""}><span>{index===0?"Best-value option":`Alternative ${index}`}</span><h4>{option.fertilizer}</h4><strong>{option.quantity.toLocaleString("en-IN")} {option.unit}</strong><p>{option.benefit}</p></article>)}</section></div>)}
      <p className="soil-note">ⓘ Regional values are planning estimates. {data.advisory_note}</p></>}
  </section>;
}
