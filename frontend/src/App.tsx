import { lazy, Suspense, useEffect, useState } from "react";
import { GlobalTranslation } from "./i18n/GlobalTranslation";

const BuyerExactDashboard=lazy(()=>import("./buyerExact/BuyerExactDashboard"));
const FarmerDashboard=lazy(()=>import("./components/FarmerDashboard"));
const AgriLoopLanding=lazy(()=>import("./agriloop/AgriLoopLanding"));

type View = "landing" | "buyer" | "farmer";
const readView = (): View => window.location.hash === "#buyer" ? "buyer" : window.location.hash === "#farmer" ? "farmer" : "landing";

export default function App() {
  const [view,setView]=useState<View>(readView);
  const [farmerId,setFarmerId]=useState(()=>localStorage.getItem("agrioptima_farmer_id")||"");
  useEffect(()=>{const handler=()=>setView(readView());window.addEventListener("hashchange",handler);return()=>window.removeEventListener("hashchange",handler)},[]);
  const go=(next:View)=>{window.location.hash=next==="landing"?"":next;setView(next);window.scrollTo({top:0})};
  const openFarmer=(id?:string)=>{if(id){setFarmerId(id);localStorage.setItem("agrioptima_farmer_id",id)}go("farmer")};
  const loading=<div className="min-h-screen grid place-items-center bg-[#f6f5ec] text-[#153f2e]"><div><b>AgriOptimaᴬᴵ</b><p>Opening your workspace…</p></div></div>;
  if(view==="buyer") return <Suspense fallback={loading}><GlobalTranslation showSelector/><BuyerExactDashboard onHome={()=>go("landing")} onFarmer={()=>openFarmer()}/></Suspense>;
  if(view==="farmer") return <Suspense fallback={loading}><GlobalTranslation showSelector/><FarmerDashboard farmerId={farmerId} onFarmerChange={(id)=>{setFarmerId(id);localStorage.setItem("agrioptima_farmer_id",id)}} onHome={()=>go("landing")} onBuyer={()=>go("buyer")}/></Suspense>;
  return <Suspense fallback={loading}><GlobalTranslation showSelector={false}/><AgriLoopLanding onBuyer={()=>go("buyer")} onFarmer={openFarmer}/></Suspense>;
}
