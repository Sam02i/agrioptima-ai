import { useEffect, useState } from "react";
import BuyerExactDashboard from "./buyerExact/BuyerExactDashboard";
import FarmerDashboard from "./components/FarmerDashboard";
import AgriLoopLanding from "./agriloop/AgriLoopLanding";
import { LanguageProvider } from "./agriloop/i18n/LanguageContext";

type View = "landing" | "buyer" | "farmer";
const readView = (): View => window.location.hash === "#buyer" ? "buyer" : window.location.hash === "#farmer" ? "farmer" : "landing";

export default function App() {
  const [view,setView]=useState<View>(readView);
  const [farmerId,setFarmerId]=useState(()=>localStorage.getItem("agrioptima_farmer_id")||"");
  useEffect(()=>{const handler=()=>setView(readView());window.addEventListener("hashchange",handler);return()=>window.removeEventListener("hashchange",handler)},[]);
  const go=(next:View)=>{window.location.hash=next==="landing"?"":next;setView(next);window.scrollTo({top:0})};
  const openFarmer=(id?:string)=>{if(id){setFarmerId(id);localStorage.setItem("agrioptima_farmer_id",id)}go("farmer")};
  if(view==="buyer") return <BuyerExactDashboard onHome={()=>go("landing")} onFarmer={()=>openFarmer()}/>;
  if(view==="farmer") return <FarmerDashboard farmerId={farmerId} onFarmerChange={(id)=>{setFarmerId(id);localStorage.setItem("agrioptima_farmer_id",id)}} onHome={()=>go("landing")} onBuyer={()=>go("buyer")}/>;
  return <LanguageProvider><AgriLoopLanding onBuyer={()=>go("buyer")} onFarmer={openFarmer}/></LanguageProvider>;
}
