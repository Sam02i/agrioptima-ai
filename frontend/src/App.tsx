import { useEffect, useState } from "react";
import BuyerDashboard from "./components/BuyerDashboard";
import FarmerDashboard from "./components/FarmerDashboard";
import AgriLoopLanding from "./agriloop/AgriLoopLanding";
import { LanguageProvider } from "./agriloop/i18n/LanguageContext";

type View = "landing" | "buyer" | "farmer";
const readView = (): View => window.location.hash === "#buyer" ? "buyer" : window.location.hash === "#farmer" ? "farmer" : "landing";

export default function App() {
  const [view,setView]=useState<View>(readView);
  useEffect(()=>{const handler=()=>setView(readView());window.addEventListener("hashchange",handler);return()=>window.removeEventListener("hashchange",handler)},[]);
  const go=(next:View)=>{window.location.hash=next==="landing"?"":next;setView(next);window.scrollTo({top:0})};
  if(view==="buyer") return <BuyerDashboard onHome={()=>go("landing")} onFarmer={()=>go("farmer")}/>;
  if(view==="farmer") return <FarmerDashboard onHome={()=>go("landing")} onBuyer={()=>go("buyer")}/>;
  return <LanguageProvider><AgriLoopLanding onBuyer={()=>go("buyer")} onFarmer={()=>go("farmer")}/></LanguageProvider>;
}
