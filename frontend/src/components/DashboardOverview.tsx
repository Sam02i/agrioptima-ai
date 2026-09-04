import { LocalizedText } from "../i18n/LocalizedText";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type Summary = { farmer_count: number; farm_count: number; available_listing_count: number; available_quantity_kg: number; crop_count: number; crops: Array<{ crop_name: string; available_kg: number; average_price_per_kg: number }> };

export default function DashboardOverview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [buyers, setBuyers] = useState(0);

  useEffect(() => {
    fetch(`${API}/marketplace/summary`).then((r) => r.ok ? r.json() : null).then(setSummary).catch(() => null);
    fetch(`${API}/credit/buyers`).then((r) => r.ok ? r.json() : null).then((d) => setBuyers(d?.count || 0)).catch(() => null);
  }, []);

  const stats = [
    ["Verified farmers", summary?.farmer_count ?? "—", `${summary?.farm_count ?? 0} registered farms`, "👨🏽‍🌾"],
    ["Available listings", summary?.available_listing_count ?? "—", `${summary?.crop_count ?? 0} crop varieties`, "🧺"],
    ["Matched supply", summary ? `${(summary.available_quantity_kg / 1000).toFixed(1)}T` : "—", "Ready for procurement", "📦"],
    ["Buyer profiles", buyers || "—", "Credit intelligence ready", "💳"],
  ];

  return <div className="space-y-5">
    <section className="buyer-hero">
      <div>
        <span className="hero-chip"><LocalizedText source={"✦ Buyer command center · Connected"} /></span>
        <h2><LocalizedText source={"Smarter procurement."} /><br/><em><LocalizedText source={"Stronger margins."} /></em></h2>
        <p><LocalizedText source={"Discover verified farmer supply, assess freshness and credit, rank suppliers, and optimize every shipment from one intelligent workspace."} /></p>
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={() => onNavigate("ranking")} className="lime-button"><LocalizedText source={"Build procurement plan →"} /></button>
          <button onClick={() => onNavigate("marketplace")} className="ivory-button"><LocalizedText source={"Explore farmer listings"} /></button>
        </div>
        <div className="hero-proof"><span><LocalizedText source={"✓ Farmer data connected"} /></span><span><LocalizedText source={"✓ 7 intelligence engines"} /></span><span><LocalizedText source={"✓ Explainable decisions"} /></span></div>
      </div>
      <article className="market-signal-card">
        <div className="flex justify-between text-[10px] uppercase tracking-wider"><span className="text-[#EAE7DD]"><LocalizedText source={"● Live supply signal"} /></span><span className="text-white/50"><LocalizedText source={"Imported dataset"} /></span></div>
        <div className="mt-7"><small><LocalizedText source={"Best available opportunity"} /></small><strong><LocalizedText source={"{0}"} values={[summary?.crops?.[0]?.crop_name || "Marketplace"]} /></strong></div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <span><small><LocalizedText source={"Available supply"} /></small><b><LocalizedText source={"{0}"} values={[summary ? `${(summary.available_quantity_kg / 1000).toFixed(1)} tonnes` : "Loading"]} /></b></span>
          <span><small><LocalizedText source={"Farmer network"} /></small><b><LocalizedText source={"{0} verified"} values={[summary?.farmer_count ?? "—"]} /></b></span>
          <span><small><LocalizedText source={"Buyer intelligence"} /></small><b><LocalizedText source={"{0} profiles"} values={[buyers || "—"]} /></b></span>
          <span><small><LocalizedText source={"Model coverage"} /></small><b><LocalizedText source={"End to end"} /></b></span>
        </div>
        <button onClick={() => onNavigate("marketplace")}><LocalizedText source={"View live marketplace →"} /></button>
      </article>
    </section>

    <section className="dashboard-stats">{stats.map(([label, value, note, icon]) => <article key={String(label)}><span><LocalizedText source={"{0}"} values={[icon]} /></span><p><LocalizedText source={"{0}"} values={[label]} /></p><strong><LocalizedText source={"{0}"} values={[value]} /></strong><small><LocalizedText source={"{0}"} values={[note]} /></small></article>)}</section>

    <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-5">
      <article className="demo-panel"><div className="panel-kicker"><LocalizedText source={"Connected intelligence"} /></div><h3><LocalizedText source={"Every backend engine, one workflow"} /></h3><div className="engine-grid">
        {[
          ["🌱", "Crop recommendation", "Farm profile → ranked crops", "crop"],
          ["🍅", "Freshness assessment", "Image → produce grade", "freshness"],
          ["💳", "Buyer credit", "History → risk and limit", "credit"],
          ["📊", "Supplier ranking", "RFQ → best farmer lots", "ranking"],
          ["🚚", "Logistics optimizer", "Routes → landed cost", "logistics"],
          ["👨🏽‍🌾", "Farmer marketplace", "Profiles → available supply", "farmers"],
        ].map(([icon, title, copy, tab]) => <button key={title} onClick={() => onNavigate(tab)}><span><LocalizedText source={"{0}"} values={[icon]} /></span><div><b><LocalizedText source={"{0}"} values={[title]} /></b><small><LocalizedText source={"{0}"} values={[copy]} /></small></div><i>→</i></button>)}
      </div></article>
      <article className="demo-panel"><div className="panel-kicker"><LocalizedText source={"Supply snapshot"} /></div><h3><LocalizedText source={"Available crops"} /></h3><div className="crop-pulse">{summary?.crops?.map((crop) => <div key={crop.crop_name}><span><b><LocalizedText source={"{0}"} values={[crop.crop_name]} /></b><small><LocalizedText source={"₹{0}/kg average"} values={[crop.average_price_per_kg]} /></small></span><strong><LocalizedText source={"{0}T"} values={[(crop.available_kg / 1000).toFixed(1)]} /></strong></div>) || <p className="text-sm text-gray-400"><LocalizedText source={"Loading supply data…"} /></p>}</div><button onClick={() => onNavigate("marketplace")} className="panel-link"><LocalizedText source={"Review all listings →"} /></button></article>
    </section>
  </div>;
}
