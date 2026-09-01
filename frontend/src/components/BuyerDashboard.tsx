import { useRef, useState } from "react";
import FarmerForm from "./FarmerForm";
import RecommendationResults from "./RecommendationResults";
import CreditPanel from "./CreditPanel";
import FreshnessPanel from "./FreshnessPanel";
import SupplierRankingPanel from "./SupplierRankingPanel";
import LogisticsOptimizerPanel from "./LogisticsOptimizerPanel";
import DashboardOverview from "./DashboardOverview";
import FarmerMarketplace from "./FarmerMarketplace";
import { getRecommendations } from "../api/recommendations";
import type { FarmerRecommendationRequest, RecommendationResponse } from "../api/recommendations";

type Tab = "overview" | "marketplace" | "farmers" | "crop" | "freshness" | "credit" | "ranking" | "logistics";
const NAV: Array<{ key: Tab; label: string; icon: string }> = [
  { key: "overview", label: "Overview", icon: "⌂" }, { key: "marketplace", label: "Marketplace", icon: "◫" },
  { key: "farmers", label: "Farmers", icon: "♟" }, { key: "ranking", label: "Smart procurement", icon: "✦" },
  { key: "logistics", label: "Logistics optimizer", icon: "⇢" }, { key: "freshness", label: "Freshness engine", icon: "◎" },
  { key: "credit", label: "Buyer credit", icon: "₹" }, { key: "crop", label: "Crop intelligence", icon: "♧" },
];
const COPY: Record<Tab, [string, string]> = {
  overview: ["Buyer command center", "Your connected view of supply, risk, quality, credit, and logistics."],
  marketplace: ["Verified produce marketplace", "Discover active crop listings from connected farmer data."],
  farmers: ["Farmer network", "Review verified profiles, farms, needs, and available crop listings."],
  crop: ["Crop intelligence", "Build an explainable crop recommendation from a farmer's soil, season, and budget."],
  freshness: ["Freshness engine", "Grade produce images and inspect multi-image shipments with the tomato model."],
  credit: ["Buyer credit intelligence", "Understand repayment behaviour, risk, limits, and the evidence behind each score."],
  ranking: ["Smart procurement", "Match a buyer RFQ to the best farmer lots using transparent ranking factors."],
  logistics: ["Logistics optimizer", "Compare direct, shared, and collection-hub delivery with final buyer cost."],
};

export default function BuyerDashboard({ onHome, onFarmer }: { onHome: () => void; onFarmer: () => void }) {
  const [active, setActive] = useState<Tab>("overview"); const [sidebar, setSidebar] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null); const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = (tab: string) => { setActive(tab as Tab); setSidebar(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleSubmit = async (payload: FarmerRecommendationRequest) => { setLoading(true); setError(null); setResults(null); try { setResults(await getRecommendations(payload)); setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); } finally { setLoading(false); } };
  return <div className="buyer-app">
    {sidebar && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebar(false)} />}
    <aside className={`buyer-sidebar ${sidebar ? "open" : ""}`}><div className="buyer-brand"><span>♧</span><b>AgriOptima</b><button onClick={() => setSidebar(false)}>×</button></div><div className="workspace-card"><span>AM</span><div><b>Mehta Foods</b><small>Buyer workspace</small></div><i>⌄</i></div><nav><p>Intelligence workspace</p>{NAV.map((item) => <button key={item.key} className={active === item.key ? "active" : ""} onClick={() => navigate(item.key)}><span>{item.icon}</span>{item.label}{item.key === "marketplace" && <em>5</em>}</button>)}</nav><div className="sidebar-status"><span>● Platform connected</span><strong>7 engines active</strong><small>Farmer data · Models · APIs</small><button onClick={onHome}>← Public landing page</button></div></aside>
    <main className="buyer-main"><header className="buyer-topbar"><button className="mobile-nav" onClick={() => setSidebar(true)}>☰</button><div className="global-search">⌕ <input placeholder="Search farmers, crops, buyers, shipments…"/><kbd>⌘ K</kbd></div><div className="portal-switch"><button onClick={onHome}>Home</button><button onClick={onFarmer}>Farmer portal</button></div><div className="buyer-person"><span>AM</span><div><b>Arjun Mehta</b><small>Procurement lead</small></div><i>⌄</i></div></header><div className="buyer-content"><section className="buyer-heading"><div><span>Tuesday, 1 September</span><h1>{COPY[active][0]}</h1><p>{COPY[active][1]}</p></div>{active !== "overview" && <button onClick={() => navigate("overview")}>← Command center</button>}</section>
      {active === "overview" && <DashboardOverview onNavigate={navigate} />}{active === "marketplace" && <FarmerMarketplace mode="marketplace" />}{active === "farmers" && <FarmerMarketplace mode="farmers" />}{active === "credit" && <CreditPanel />}{active === "freshness" && <FreshnessPanel />}{active === "ranking" && <SupplierRankingPanel />}{active === "logistics" && <LogisticsOptimizerPanel />}
      {active === "crop" && <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start"><div className="lg:sticky lg:top-24">{error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{error}</div>}{loading && <div className="mb-4 p-3 bg-[#edf2df] border border-[#d8dfc2] rounded-xl text-[#173f2b] text-xs text-center">Analyzing farm profile…</div>}<FarmerForm onSubmit={handleSubmit} loading={loading} /></div><div ref={resultsRef}>{results ? <RecommendationResults data={results} /> : <div className="demo-panel empty-workspace"><span>♧</span><h3>Build a crop recommendation</h3><p>Complete the farmer profile to receive feasible, ranked, and explainable crop opportunities.</p></div>}</div></div>}
    </div><footer className="buyer-footer">AgriOptima AI · Farmer marketplace · Crop intelligence · Freshness · Credit · Supplier ranking · Logistics</footer></main>
  </div>;
}
