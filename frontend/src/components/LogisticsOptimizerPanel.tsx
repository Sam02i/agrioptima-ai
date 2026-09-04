import { LocalizedText } from "../i18n/LocalizedText";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type Farmer = { name: string; quantity_kg: number; price_per_kg: number; reliability_score: number; lat: number; lon: number };
type ModelDetail = { model: string; total_cost: number; cost_per_kg: number; eta_hours: number; trips_required: number; handling_points: number; weight_utilisation_pct: number; vehicle?: string; main_vehicle?: string; route_distance_km?: number; total_route_distance_km?: number };
type QuoteResult = {
  logistics_result: {
    models: Record<string, ModelDetail>;
    model_comparison: Array<{ model: string; overall_score: number; cost_score: number; eta_score: number; utilisation_score: number }>;
    recommended_model: { name: string; reason: string; total_cost: number; cost_per_kg: number; overall_score: number };
    landed_cost: { total_landed_cost: number; blended_landed_cost_per_kg: number; within_buyer_budget?: boolean };
  };
  buyer_quote: {
    breakdown: Record<string, number>;
    spoilage_detail: { spoilage_rate_pct: number; eta_hours_used: number };
    final_buyer_cost: number;
    final_cost_per_kg: number;
  };
};

const DEFAULT_FARMERS: Farmer[] = [
  { name: "Farmer A", quantity_kg: 3000, price_per_kg: 22, reliability_score: 91, lat: 30.90, lon: 75.85 },
  { name: "Farmer B", quantity_kg: 3000, price_per_kg: 24, reliability_score: 88, lat: 30.95, lon: 75.90 },
  { name: "Farmer C", quantity_kg: 4000, price_per_kg: 21, reliability_score: 94, lat: 31.00, lon: 75.95 },
];

const modelLabel = (name: string) => ({
  MODEL_1_DIRECT: "Direct farmer delivery",
  MODEL_2_MULTI_FARMER_DIRECT: "Shared multi-farmer pickup",
  MODEL_3_COLLECTION_HUB: "Collection hub consolidation",
}[name] || name.replaceAll("_", " "));

export default function LogisticsOptimizerPanel() {
  const [crop, setCrop] = useState("tomato");
  const [basePrice, setBasePrice] = useState(25);
  const [budget, setBudget] = useState(35);
  const [farmers, setFarmers] = useState<Farmer[]>(DEFAULT_FARMERS);
  const [buyer, setBuyer] = useState({ name: "Azadpur Mandi", lat: 28.70, lon: 77.16 });
  const [useHub, setUseHub] = useState(true);
  const [hub, setHub] = useState({ name: "Ludhiana Hub", lat: 30.80, lon: 75.80 });
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateFarmer = (index: number, field: keyof Farmer, value: string) => {
    setFarmers((current) => current.map((farmer, i) => i === index
      ? { ...farmer, [field]: field === "name" ? value : Number(value) }
      : farmer));
  };

  const addFarmer = () => setFarmers((current) => [...current, {
    name: `Farmer ${String.fromCharCode(65 + current.length)}`, quantity_kg: 1000,
    price_per_kg: basePrice, reliability_score: 80, lat: 30.9, lon: 75.9,
  }]);

  const optimize = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const payload = {
        crop, farmer_price_per_kg: basePrice,
        farmers: farmers.map(({ lat, lon, ...farmer }) => ({ ...farmer, latlon: [lat, lon] })),
        buyer: { name: buyer.name, latlon: [buyer.lat, buyer.lon] },
        collection_hub: useHub ? { name: hub.name, latlon: [hub.lat, hub.lon] } : undefined,
        max_landed_cost_per_kg: budget,
        delivery_mode: "SHARED",
      };
      const response = await fetch(`${API}/logistics/buyer-quote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to optimize logistics");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to optimize logistics");
    } finally { setLoading(false); }
  };

  const money = (value: number) => `₹${Math.round(value || 0).toLocaleString("en-IN")}`;

  return <div className="space-y-6">
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-[#26483E]"><LocalizedText source={"Shipment Plan"} /></h3>
      <p className="text-xs text-gray-400 mt-1 mb-5"><LocalizedText source={"Compare direct, shared pickup, and collection-hub delivery models."} /></p>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-xs text-gray-500"><LocalizedText source={"Crop"} /><input value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></label>
        <label className="text-xs text-gray-500"><LocalizedText source={"Default farmer price (₹/kg)"} /><input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></label>
        <label className="text-xs text-gray-500"><LocalizedText source={"Maximum landed cost (₹/kg)"} /><input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></label>
      </div>
    </div>

    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4"><div><h3 className="text-base font-semibold text-[#26483E]"><LocalizedText source={"Farmer Pickups"} /></h3><p className="text-xs text-gray-400 mt-1"><LocalizedText source={"Quantity, price, reliability, and coordinates for each pickup."} /></p></div><button onClick={addFarmer} className="px-3 py-2 bg-[#EAE7DD] text-[#26483E] rounded-lg text-xs font-semibold"><LocalizedText source={"+ Add farmer"} /></button></div>
      <div className="space-y-3">{farmers.map((farmer, index) => <div key={`${farmer.name}-${index}`} className="grid sm:grid-cols-2 lg:grid-cols-7 gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
        <input value={farmer.name} onChange={(e) => updateFarmer(index, "name", e.target.value)} aria-label="Farmer name" className="lg:col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-xs" />
        <input type="number" value={farmer.quantity_kg} onChange={(e) => updateFarmer(index, "quantity_kg", e.target.value)} title="Quantity kg" aria-label="Quantity kg" className="border border-gray-200 rounded-lg px-2 py-2 text-xs" />
        <input type="number" value={farmer.price_per_kg} onChange={(e) => updateFarmer(index, "price_per_kg", e.target.value)} title="Price per kg" aria-label="Price per kg" className="border border-gray-200 rounded-lg px-2 py-2 text-xs" />
        <input type="number" value={farmer.reliability_score} onChange={(e) => updateFarmer(index, "reliability_score", e.target.value)} title="Reliability score" aria-label="Reliability score" className="border border-gray-200 rounded-lg px-2 py-2 text-xs" />
        <input type="number" step="0.01" value={farmer.lat} onChange={(e) => updateFarmer(index, "lat", e.target.value)} title="Latitude" aria-label="Latitude" className="border border-gray-200 rounded-lg px-2 py-2 text-xs" />
        <div className="flex gap-1"><input type="number" step="0.01" value={farmer.lon} onChange={(e) => updateFarmer(index, "lon", e.target.value)} title="Longitude" aria-label="Longitude" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs" /><button onClick={() => setFarmers((current) => current.filter((_, i) => i !== index))} className="text-red-500 text-xs px-1">×</button></div>
        <div className="lg:col-span-7 text-[10px] text-gray-400"><LocalizedText source={"{0} kg · ₹{1}/kg · Reliability {2}/100 · {3}, {4}"} values={[farmer.quantity_kg.toLocaleString("en-IN"), farmer.price_per_kg, farmer.reliability_score, farmer.lat, farmer.lon]} /></div>
      </div>)}</div>
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"><h3 className="text-sm font-semibold text-[#26483E] mb-3"><LocalizedText source={"Buyer Destination"} /></h3><div className="grid grid-cols-3 gap-2"><input value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-2 text-xs" /><input type="number" step="0.01" value={buyer.lat} onChange={(e) => setBuyer({ ...buyer, lat: Number(e.target.value) })} className="border border-gray-200 rounded-lg px-2 py-2 text-xs" /><input type="number" step="0.01" value={buyer.lon} onChange={(e) => setBuyer({ ...buyer, lon: Number(e.target.value) })} className="border border-gray-200 rounded-lg px-2 py-2 text-xs" /></div></div>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"><label className="flex items-center gap-2 text-sm font-semibold text-[#26483E] mb-3"><input type="checkbox" checked={useHub} onChange={(e) => setUseHub(e.target.checked)} /><LocalizedText source={" Include collection hub"} /></label><div className="grid grid-cols-3 gap-2 opacity-100"><input disabled={!useHub} value={hub.name} onChange={(e) => setHub({ ...hub, name: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-2 text-xs disabled:opacity-40" /><input disabled={!useHub} type="number" step="0.01" value={hub.lat} onChange={(e) => setHub({ ...hub, lat: Number(e.target.value) })} className="border border-gray-200 rounded-lg px-2 py-2 text-xs disabled:opacity-40" /><input disabled={!useHub} type="number" step="0.01" value={hub.lon} onChange={(e) => setHub({ ...hub, lon: Number(e.target.value) })} className="border border-gray-200 rounded-lg px-2 py-2 text-xs disabled:opacity-40" /></div></div>
    </div>

    <button onClick={optimize} disabled={loading || farmers.length === 0} className="px-7 py-3 rounded-xl bg-[#26483E] text-white text-sm font-semibold disabled:opacity-50"><LocalizedText source={"{0}"} values={[loading ? "Comparing routes..." : "Optimize Logistics & Buyer Cost"]} /></button>
    {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700"><LocalizedText source={"{0}"} values={[error]} /></div>}

    {result && <>
      <div className="bg-[#26483E] text-white rounded-2xl p-6 shadow-sm"><div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"><div><div className="text-xs text-green-200"><LocalizedText source={"Recommended model"} /></div><h3 className="text-xl font-bold mt-1"><LocalizedText source={"{0}"} values={[modelLabel(result.logistics_result.recommended_model.name)]} /></h3><p className="text-xs text-green-100 mt-2 max-w-2xl leading-5"><LocalizedText source={"{0}"} values={[result.logistics_result.recommended_model.reason]} /></p></div><div className="grid grid-cols-2 gap-5 text-right"><div><div className="text-2xl font-bold"><LocalizedText source={"{0}"} values={[money(result.logistics_result.recommended_model.total_cost)]} /></div><div className="text-[10px] text-green-200"><LocalizedText source={"transport cost"} /></div></div><div><div className="text-2xl font-bold"><LocalizedText source={"₹{0}"} values={[result.logistics_result.recommended_model.cost_per_kg.toFixed(2)]} /></div><div className="text-[10px] text-green-200"><LocalizedText source={"per kg"} /></div></div></div></div></div>
      <div className="grid lg:grid-cols-3 gap-4">{Object.values(result.logistics_result.models).map((model) => <div key={model.model} className={`bg-white border rounded-2xl p-5 shadow-sm ${model.model === result.logistics_result.recommended_model.name ? "border-green-400" : "border-gray-100"}`}><div className="flex justify-between gap-2"><h4 className="text-sm font-semibold text-[#26483E]"><LocalizedText source={"{0}"} values={[modelLabel(model.model)]} /></h4>{model.model === result.logistics_result.recommended_model.name && <span className="text-[10px] bg-green-100 text-green-700 rounded px-2 py-1"><LocalizedText source={"BEST"} /></span>}</div><div className="grid grid-cols-2 gap-2 mt-4 text-xs"><div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400"><LocalizedText source={"Cost"} /></span><div className="font-semibold"><LocalizedText source={"{0}"} values={[money(model.total_cost)]} /></div></div><div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400"><LocalizedText source={"Cost/kg"} /></span><div className="font-semibold"><LocalizedText source={"₹{0}"} values={[model.cost_per_kg.toFixed(2)]} /></div></div><div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400"><LocalizedText source={"ETA"} /></span><div className="font-semibold"><LocalizedText source={"{0} hr"} values={[model.eta_hours.toFixed(1)]} /></div></div><div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400"><LocalizedText source={"Utilization"} /></span><div className="font-semibold"><LocalizedText source={"{0}%"} values={[model.weight_utilisation_pct.toFixed(1)]} /></div></div><div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400"><LocalizedText source={"Trips"} /></span><div className="font-semibold"><LocalizedText source={"{0}"} values={[model.trips_required]} /></div></div><div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400"><LocalizedText source={"Vehicle"} /></span><div className="font-semibold truncate"><LocalizedText source={"{0}"} values={[model.vehicle || model.main_vehicle]} /></div></div></div></div>)}</div>
      <div className="grid lg:grid-cols-2 gap-6"><div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"><h3 className="text-sm font-semibold text-[#26483E] mb-4"><LocalizedText source={"Final Buyer Cost"} /></h3><div className="space-y-2">{Object.entries(result.buyer_quote.breakdown).map(([label, value]) => <div key={label} className="flex justify-between text-xs border-b border-gray-50 pb-2"><span className="text-gray-500 capitalize"><LocalizedText source={"{0}"} values={[label.replaceAll("_", " ")]} /></span><span className="font-semibold"><LocalizedText source={"{0}"} values={[money(value)]} /></span></div>)}</div><div className="flex justify-between mt-4 pt-4 border-t"><span className="font-semibold"><LocalizedText source={"Final buyer cost"} /></span><div className="text-right"><div className="text-xl font-bold text-[#26483E]"><LocalizedText source={"{0}"} values={[money(result.buyer_quote.final_buyer_cost)]} /></div><div className="text-xs text-gray-400"><LocalizedText source={"₹{0}/kg"} values={[result.buyer_quote.final_cost_per_kg.toFixed(2)]} /></div></div></div></div><div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"><h3 className="text-sm font-semibold text-[#26483E] mb-4"><LocalizedText source={"Landed Cost & Risk"} /></h3><div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-xl p-3 text-xs"><div className="text-gray-400"><LocalizedText source={"Blended landed cost"} /></div><div className="text-lg font-bold text-[#26483E]"><LocalizedText source={"₹{0}/kg"} values={[result.logistics_result.landed_cost.blended_landed_cost_per_kg.toFixed(2)]} /></div></div><div className="bg-gray-50 rounded-xl p-3 text-xs"><div className="text-gray-400"><LocalizedText source={"Spoilage estimate"} /></div><div className="text-lg font-bold text-[#26483E]"><LocalizedText source={"{0}%"} values={[result.buyer_quote.spoilage_detail.spoilage_rate_pct.toFixed(1)]} /></div></div><div className="bg-gray-50 rounded-xl p-3 text-xs"><div className="text-gray-400"><LocalizedText source={"Total landed cost"} /></div><div className="text-lg font-bold text-[#26483E]"><LocalizedText source={"{0}"} values={[money(result.logistics_result.landed_cost.total_landed_cost)]} /></div></div><div className={`rounded-xl p-3 text-xs ${result.logistics_result.landed_cost.within_buyer_budget ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}><div><LocalizedText source={"Buyer budget"} /></div><div className="text-lg font-bold"><LocalizedText source={"{0}"} values={[result.logistics_result.landed_cost.within_buyer_budget ? "Within budget" : "Over budget"]} /></div></div></div></div></div>
    </>}
    <p className="text-[10px] text-gray-400 text-center"><LocalizedText source={"Planning estimate. Live road routing falls back to geographic-distance estimation when routing services are unavailable."} /></p>
  </div>;
}
