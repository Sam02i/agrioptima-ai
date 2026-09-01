import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

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
        <span className="hero-chip">✦ Buyer command center · Connected</span>
        <h2>Smarter procurement.<br/><em>Stronger margins.</em></h2>
        <p>Discover verified farmer supply, assess freshness and credit, rank suppliers, and optimize every shipment from one intelligent workspace.</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={() => onNavigate("ranking")} className="lime-button">Build procurement plan →</button>
          <button onClick={() => onNavigate("marketplace")} className="ivory-button">Explore farmer listings</button>
        </div>
        <div className="hero-proof"><span>✓ Farmer data connected</span><span>✓ 7 intelligence engines</span><span>✓ Explainable decisions</span></div>
      </div>
      <article className="market-signal-card">
        <div className="flex justify-between text-[10px] uppercase tracking-wider"><span className="text-[#d5f23f]">● Live supply signal</span><span className="text-white/50">Imported dataset</span></div>
        <div className="mt-7"><small>Best available opportunity</small><strong>{summary?.crops?.[0]?.crop_name || "Marketplace"}</strong></div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <span><small>Available supply</small><b>{summary ? `${(summary.available_quantity_kg / 1000).toFixed(1)} tonnes` : "Loading"}</b></span>
          <span><small>Farmer network</small><b>{summary?.farmer_count ?? "—"} verified</b></span>
          <span><small>Buyer intelligence</small><b>{buyers || "—"} profiles</b></span>
          <span><small>Model coverage</small><b>End to end</b></span>
        </div>
        <button onClick={() => onNavigate("marketplace")}>View live marketplace →</button>
      </article>
    </section>

    <section className="dashboard-stats">{stats.map(([label, value, note, icon]) => <article key={String(label)}><span>{icon}</span><p>{label}</p><strong>{value}</strong><small>{note}</small></article>)}</section>

    <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-5">
      <article className="demo-panel"><div className="panel-kicker">Connected intelligence</div><h3>Every backend engine, one workflow</h3><div className="engine-grid">
        {[
          ["🌱", "Crop recommendation", "Farm profile → ranked crops", "crop"],
          ["🍅", "Freshness assessment", "Image → produce grade", "freshness"],
          ["💳", "Buyer credit", "History → risk and limit", "credit"],
          ["📊", "Supplier ranking", "RFQ → best farmer lots", "ranking"],
          ["🚚", "Logistics optimizer", "Routes → landed cost", "logistics"],
          ["👨🏽‍🌾", "Farmer marketplace", "Profiles → available supply", "farmers"],
        ].map(([icon, title, copy, tab]) => <button key={title} onClick={() => onNavigate(tab)}><span>{icon}</span><div><b>{title}</b><small>{copy}</small></div><i>→</i></button>)}
      </div></article>
      <article className="demo-panel"><div className="panel-kicker">Supply snapshot</div><h3>Available crops</h3><div className="crop-pulse">{summary?.crops?.map((crop) => <div key={crop.crop_name}><span><b>{crop.crop_name}</b><small>₹{crop.average_price_per_kg}/kg average</small></span><strong>{(crop.available_kg / 1000).toFixed(1)}T</strong></div>) || <p className="text-sm text-gray-400">Loading supply data…</p>}</div><button onClick={() => onNavigate("marketplace")} className="panel-link">Review all listings →</button></article>
    </section>
  </div>;
}
