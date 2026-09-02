import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface CreditScore {
  buyer_id: string;
  procurement_credit_score: number;
  risk_band: string;
  predicted_30dpd_probability: number;
  predicted_7day_late_probability: number;
  indicative_credit_limit: number;
  available_limit: number;
  major_positive_factors: string[];
  major_negative_factors: string[];
  manual_review_flags: string[];
  model_confidence: string;
  history_quality: string;
  verified_transaction_count: number;
  disclaimer: string;
}

interface CreditFeatures {
  on_time_payment_rate: number;
  seven_day_repayment_rate: number;
  average_days_past_due: number;
  historical_default_rate: number;
  order_completion_rate: number;
  buyer_cancellation_rate: number;
  dispute_rate: number;
  repeat_supplier_rate: number;
  number_unique_suppliers: number;
  average_transaction_value: number;
  verified_procurement_gmv: number;
  history_days: number;
}

interface CreditPosition {
  buyer_id: string;
  approved_limit: number;
  utilized_amount: number;
  available_limit: number;
  active_drawdowns: any[];
  repayment_history: any[];
}

export default function CreditPanel() {
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [score, setScore] = useState<CreditScore | null>(null);
  const [features, setFeatures] = useState<CreditFeatures | null>(null);
  const [position, setPosition] = useState<CreditPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawAmount, setDrawAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  useEffect(()=>{const initial=localStorage.getItem('agrioptima_buyer_id')||'BUYER_0002';loadScore(initial);const handler=(event:Event)=>loadScore((event as CustomEvent<string>).detail);window.addEventListener('agrioptima-buyer-change',handler);return()=>window.removeEventListener('agrioptima-buyer-change',handler)},[]);

  const loadScore = async (bid: string) => {
    setLoading(true);
    setError(null);
    setSelectedBuyer(bid);
    try {
      const [profileRes, posRes] = await Promise.all([
        fetch(`${API}/credit/buyer/${bid}/profile`),
        fetch(`${API}/credit/buyer/${bid}/credit-position`),
      ]);
      if (!profileRes.ok) throw new Error("Buyer not found");
      const profile = await profileRes.json();
      setScore(profile.score);
      setFeatures(profile.platform_derived_features);
      setPosition(await posRes.json());
    } catch (e: any) {
      setError(e.message);
      setScore(null);
      setFeatures(null);
      setPosition(null);
    } finally {
      setLoading(false);
    }
  };

  const simulateDraw = async () => {
    if (!selectedBuyer || !drawAmount) return;
    try {
      const res = await fetch(`${API}/credit/buyer/${selectedBuyer}/simulate-draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(drawAmount), transaction_id: `TXN_${Date.now()}` }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosition(data);
        setDrawAmount("");
        // Reload score
        loadScore(selectedBuyer);
      }
    } catch {}
  };

  const simulateRepay = async () => {
    if (!selectedBuyer || !repayAmount) return;
    try {
      const res = await fetch(`${API}/credit/buyer/${selectedBuyer}/simulate-repayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(repayAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosition(data);
        setRepayAmount("");
        loadScore(selectedBuyer);
      }
    } catch {}
  };

  const bandColor = (band: string) => {
    const colors: Record<string, string> = {
      EXCELLENT: "bg-green-100 text-green-800",
      STRONG: "bg-emerald-100 text-emerald-800",
      GOOD: "bg-blue-100 text-blue-800",
      MODERATE: "bg-yellow-100 text-yellow-800",
      HIGH_RISK: "bg-orange-100 text-orange-800",
      VERY_HIGH_RISK: "bg-red-100 text-red-800",
    };
    return colors[band] || "bg-gray-100 text-gray-800";
  };

  const scoreMeaning = (value: number) => {
    if (value >= 90) return "Excellent repayment profile with the lowest observed risk.";
    if (value >= 80) return "Strong repayment profile with relatively low observed risk.";
    if (value >= 70) return "Good profile; normal credit controls are still recommended.";
    if (value >= 60) return "Moderate risk; consider a smaller limit or additional checks.";
    if (value >= 40) return "High risk; manual review and tighter terms are recommended.";
    return "Very high risk; avoid automatic approval and complete a detailed review.";
  };

  const percent = (value?: number) => `${((value || 0) * 100).toFixed(1)}%`;
  const rupees = (value?: number) => `₹${Math.round(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      {loading && (
        <div className="p-3 bg-[#e8f0eb] border border-[#c5d9be] rounded-xl text-[#2d5a3d] text-xs text-center">
          Loading credit assessment...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{error}</div>
      )}

      {score && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Score card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm lg:order-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1a2e1a]">Credit Score</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{score.buyer_id}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${bandColor(score.risk_band)}`}>
                {score.risk_band}
              </span>
            </div>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-[#2d5a3d]">{score.procurement_credit_score}</div>
              <div className="text-xs text-gray-400 mt-1">out of 100</div>
            </div>
            {/* Score bar */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                style={{ width: `${score.procurement_credit_score}%` }}
              />
            </div>
            <div className="rounded-xl bg-[#f3f7f4] border border-[#dce9df] p-3 mb-4">
              <div className="text-xs font-semibold text-[#2d5a3d] mb-1">What this score means</div>
              <p className="text-xs leading-5 text-gray-600">{scoreMeaning(score.procurement_credit_score)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400">30-day DPD Risk</div>
                <div className="font-semibold text-[#1a2e1a]">{(score.predicted_30dpd_probability * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400">7-day Late Risk</div>
                <div className="font-semibold text-[#1a2e1a]">{percent(score.predicted_7day_late_probability)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400">Confidence</div>
                <div className="font-semibold text-[#1a2e1a]">{score.model_confidence}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400">History Quality</div>
                <div className="font-semibold text-[#1a2e1a]">{score.history_quality}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400">Verified Transactions</div>
                <div className="font-semibold text-[#1a2e1a]">{score.verified_transaction_count}</div>
              </div>
            </div>
          </div>

          {features && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm lg:col-span-2 lg:order-3">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1a2e1a]">Credit Behaviour Details</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Observed procurement and repayment history used in this assessment</p>
                </div>
                <div className="text-[11px] text-gray-400">{Math.round(features.history_days)} days of history</div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  ["On-time payments", percent(features.on_time_payment_rate), "Higher is better"],
                  ["Paid within 7 days", percent(features.seven_day_repayment_rate), "Higher is better"],
                  ["Average payment delay", `${features.average_days_past_due.toFixed(1)} days`, "Lower is better"],
                  ["Historical default rate", percent(features.historical_default_rate), "Lower is better"],
                  ["Completed orders", percent(features.order_completion_rate), "Successfully completed"],
                  ["Cancellation rate", percent(features.buyer_cancellation_rate), "Lower is better"],
                  ["Dispute rate", percent(features.dispute_rate), "Lower is better"],
                  ["Repeat suppliers", percent(features.repeat_supplier_rate), `${Math.round(features.number_unique_suppliers)} unique suppliers`],
                  ["Average transaction", rupees(features.average_transaction_value), "Typical invoice value"],
                  ["Verified procurement", rupees(features.verified_procurement_gmv), "Total observed GMV"],
                  ["Verified transactions", score.verified_transaction_count.toLocaleString("en-IN"), "Used for assessment"],
                  ["History quality", score.history_quality.replaceAll("_", " "), score.model_confidence.replaceAll("_", " ")],
                ].map(([label, value, hint]) => (
                  <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="text-[11px] text-gray-400">{label}</div>
                    <div className="text-sm font-semibold text-[#1a2e1a] mt-1">{value}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{hint}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credit position & factors */}
          <div className="space-y-6 lg:order-2">
            {/* Credit limit */}
            {position && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-[#1a2e1a] mb-3">Revolving Credit</h3>
                <div className="grid grid-cols-3 gap-3 text-xs mb-4">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-400">Approved Limit</div>
                    <div className="font-semibold text-[#1a2e1a]">₹{position.approved_limit?.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-400">Utilized</div>
                    <div className="font-semibold text-orange-600">₹{position.utilized_amount?.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-400">Available</div>
                    <div className="font-semibold text-green-600">₹{position.available_limit?.toLocaleString()}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Credit utilization</span>
                    <span>{position.approved_limit ? percent(position.utilized_amount / position.approved_limit) : "0.0%"}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: `${Math.min(100, position.approved_limit ? position.utilized_amount / position.approved_limit * 100 : 0)}%` }}
                    />
                  </div>
                </div>
                {/* Draw/Repay */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 min-w-0">
                    <input
                      type="number"
                      placeholder="Draw amount"
                      value={drawAmount}
                      onChange={(e) => setDrawAmount(e.target.value)}
                      className="min-w-0 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                    <button onClick={simulateDraw} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600">
                      Draw
                    </button>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 min-w-0">
                    <input
                      type="number"
                      placeholder="Repay amount"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      className="min-w-0 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                    <button onClick={simulateRepay} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600">
                      Repay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Factors */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1a2e1a] mb-3">Assessment Factors</h3>
              <p className="text-[11px] text-gray-400 mb-3">The strongest signals that raised or lowered this buyer's score.</p>
              <div className="space-y-2">
                {score.major_positive_factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600">{f}</span>
                  </div>
                ))}
                {score.major_negative_factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-red-400 mt-0.5">✗</span>
                    <span className="text-gray-600">{f}</span>
                  </div>
                ))}
                {score.manual_review_flags.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    {score.manual_review_flags.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-orange-400 mt-0.5">⚠</span>
                        <span className="text-orange-600">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!score && !loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-[#f0f2eb] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h3 className="text-lg font-semibold text-[#1a2e1a] mb-2">Credit Intelligence</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Select a buyer above to see their procurement credit score, risk assessment, and revolving credit position.
          </p>
        </div>
      )}

      {score?.disclaimer && (
        <p className="text-[10px] text-gray-400 text-center mt-4">{score.disclaimer}</p>
      )}
    </div>
  );
}
