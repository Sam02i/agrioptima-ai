import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type Candidate = {
  lot_id: string;
  farmer_name: string;
  crop_name: string;
  crop_variety: string;
  price_per_unit: number;
  available_quantity: number;
  quality_grade: string;
  farmer_reliability: number;
  harvest_date: string;
  modal_price: number;
};

type RankingResult = Candidate & {
  eligible: boolean;
  rejection_reason: string | null;
  ranking_score: number;
  distance_km: number | null;
  scores: Record<string, number>;
  confidence: { score: number; level: string; explanation: string };
  fair_price: { status: string; reference_price?: number; difference?: number };
  explanation: string[];
};

const today = new Date().toISOString().slice(0, 10);

const DEFAULT_CANDIDATES: Candidate[] = [
  { lot_id: "LOT_001", farmer_name: "Asha Farms", crop_name: "Tomato", crop_variety: "Hybrid", price_per_unit: 28, available_quantity: 1200, quality_grade: "A", farmer_reliability: 92, harvest_date: today, modal_price: 30 },
  { lot_id: "LOT_002", farmer_name: "Kisan Produce", crop_name: "Tomato", crop_variety: "Hybrid", price_per_unit: 25, available_quantity: 800, quality_grade: "B", farmer_reliability: 84, harvest_date: today, modal_price: 30 },
  { lot_id: "LOT_003", farmer_name: "Green Valley", crop_name: "Tomato", crop_variety: "Local", price_per_unit: 35, available_quantity: 1500, quality_grade: "A", farmer_reliability: 76, harvest_date: today, modal_price: 30 },
];

export default function SupplierRankingPanel() {
  const [crop, setCrop] = useState("Tomato");
  const [variety, setVariety] = useState("");
  const [quantity, setQuantity] = useState(1000);
  const [minGrade, setMinGrade] = useState("B");
  const [maxPrice, setMaxPrice] = useState(32);
  const [candidates, setCandidates] = useState<Candidate[]>(DEFAULT_CANDIDATES);
  const [results, setResults] = useState<RankingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateCandidate = (index: number, field: keyof Candidate, value: string) => {
    const numeric: (keyof Candidate)[] = ["price_per_unit", "available_quantity", "farmer_reliability", "modal_price"];
    setCandidates((current) => current.map((candidate, i) => i === index
      ? { ...candidate, [field]: numeric.includes(field) ? Number(value) : value }
      : candidate));
  };

  const addCandidate = () => setCandidates((current) => [...current, {
    lot_id: `LOT_${String(current.length + 1).padStart(3, "0")}`,
    farmer_name: "New Supplier", crop_name: crop, crop_variety: variety,
    price_per_unit: 30, available_quantity: 1000, quality_grade: "B",
    farmer_reliability: 70, harvest_date: today, modal_price: 30,
  }]);

  const rankSuppliers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/ranking/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfq: {
            crop_name: crop,
            crop_variety: variety || null,
            required_quantity: quantity,
            minimum_quality_grade: minGrade,
            maximum_acceptable_price: maxPrice || null,
          },
          candidates,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to rank suppliers");
      setResults(data.results || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to rank suppliers");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => ({
    FAIR: "bg-green-100 text-green-700", ABOVE_MARKET: "bg-red-100 text-red-700",
    BELOW_MARKET: "bg-blue-100 text-blue-700", INSUFFICIENT_DATA: "bg-gray-100 text-gray-600",
  }[status] || "bg-gray-100 text-gray-600");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-[#1a2e1a]">Buyer Requirement (RFQ)</h3>
          <p className="text-xs text-gray-400 mt-1">Set the procurement requirement used to filter and rank supplier lots.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="text-xs text-gray-500">Crop
            <input value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-gray-500">Variety (optional)
            <input value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="Any variety" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-gray-500">Required quantity (kg)
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-gray-500">Minimum grade
            <select value={minGrade} onChange={(e) => setMinGrade(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option>A</option><option>B</option><option>C</option>
            </select>
          </label>
          <label className="text-xs text-gray-500">Maximum price (₹/kg)
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#1a2e1a]">Supplier Lots</h3>
            <p className="text-xs text-gray-400 mt-1">Edit the demo lots or add another supplier.</p>
          </div>
          <button onClick={addCandidate} className="px-3 py-2 rounded-lg bg-[#e8f0eb] text-[#2d5a3d] text-xs font-semibold">+ Add supplier</button>
        </div>
        <div className="space-y-3">
          {candidates.map((candidate, index) => (
            <div key={`${candidate.lot_id}-${index}`} className="grid sm:grid-cols-2 lg:grid-cols-8 gap-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
              <input value={candidate.farmer_name} onChange={(e) => updateCandidate(index, "farmer_name", e.target.value)} aria-label="Supplier name" className="lg:col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
              <input value={candidate.crop_name} onChange={(e) => updateCandidate(index, "crop_name", e.target.value)} aria-label="Crop" className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
              <input type="number" value={candidate.price_per_unit} onChange={(e) => updateCandidate(index, "price_per_unit", e.target.value)} aria-label="Price per kg" title="Price per kg" className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
              <input type="number" value={candidate.available_quantity} onChange={(e) => updateCandidate(index, "available_quantity", e.target.value)} aria-label="Available quantity" title="Available quantity" className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
              <select value={candidate.quality_grade} onChange={(e) => updateCandidate(index, "quality_grade", e.target.value)} aria-label="Quality grade" className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white"><option>A</option><option>B</option><option>C</option></select>
              <input type="number" value={candidate.farmer_reliability} onChange={(e) => updateCandidate(index, "farmer_reliability", e.target.value)} aria-label="Reliability" title="Reliability score" className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
              <button onClick={() => setCandidates((current) => current.filter((_, i) => i !== index))} className="text-xs text-red-500 hover:bg-red-50 rounded-lg">Remove</button>
              <div className="lg:col-span-8 flex flex-wrap gap-x-4 text-[10px] text-gray-400 px-1">
                <span>₹{candidate.price_per_unit}/kg</span><span>{candidate.available_quantity} kg</span><span>Grade {candidate.quality_grade}</span><span>Reliability {candidate.farmer_reliability}/100</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={rankSuppliers} disabled={loading || candidates.length === 0} className="mt-5 w-full sm:w-auto px-6 py-2.5 bg-[#2d5a3d] text-white rounded-xl text-sm font-semibold disabled:opacity-50">
          {loading ? "Ranking suppliers..." : "Rank Suppliers"}
        </button>
        {error && <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1a2e1a]">Ranking Results</h3>
            <span className="text-xs text-gray-400">{results.filter((r) => r.eligible).length} eligible of {results.length}</span>
          </div>
          {results.map((result, index) => (
            <div key={result.lot_id} className={`bg-white rounded-2xl border shadow-sm p-5 ${result.eligible ? "border-gray-100" : "border-red-100"}`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${result.eligible ? "bg-[#2d5a3d] text-white" : "bg-red-100 text-red-600"}`}>{result.eligible ? index + 1 : "×"}</div>
                  <div><div className="font-semibold text-[#1a2e1a]">{result.farmer_name}</div><div className="text-xs text-gray-400">{result.lot_id} · {result.crop_name} {result.crop_variety || ""}</div></div>
                </div>
                {result.eligible ? <div className="text-right"><div className="text-2xl font-bold text-[#2d5a3d]">{result.ranking_score.toFixed(1)}</div><div className="text-[10px] text-gray-400">ranking score</div></div> : <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs">Rejected</span>}
              </div>
              {!result.eligible ? <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg p-3">{result.rejection_reason}</p> : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
                    {Object.entries(result.scores).map(([label, value]) => <div key={label} className="bg-gray-50 rounded-lg p-2"><div className="text-[10px] text-gray-400 capitalize">{label}</div><div className="text-sm font-semibold text-[#1a2e1a]">{value.toFixed(1)}</div></div>)}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    <span className={`px-2 py-1 rounded ${statusColor(result.fair_price.status)}`}>{result.fair_price.status.replaceAll("_", " ")}</span>
                    <span className="px-2 py-1 rounded bg-purple-50 text-purple-700">{result.confidence.level} confidence · {result.confidence.score.toFixed(0)}</span>
                    <span className="px-2 py-1 rounded bg-gray-50 text-gray-600">₹{result.price_per_unit}/kg · {result.available_quantity} kg</span>
                  </div>
                  <ul className="mt-3 space-y-1">{result.explanation.map((item) => <li key={item} className="text-xs text-gray-600">✓ {item}</li>)}</ul>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-gray-400 text-center">Deterministic decision-support ranking. Verify supplier records, quality, logistics, and pricing before procurement.</p>
    </div>
  );
}
