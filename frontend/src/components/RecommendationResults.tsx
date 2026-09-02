import type { RecommendationResponse, RecommendationItem, RejectedCrop, ClimateContext } from "../api/recommendations";

type Props = {
  data: RecommendationResponse;
  currentCrop?: string;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "bg-[#4a8c6a]" : value >= 40 ? "bg-[#b59a3a]" : "bg-[#c45a5a]";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color} score-fill`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-400 w-8 text-right">{value}</span>
    </div>
  );
}

function CropCard({ rec, rank }: { rec: RecommendationItem; rank: number }) {
  const b = rec.score_breakdown || {};
  const profit = rec.expected_profit_rs_per_acre;
  const revenue = rec.expected_revenue_rs_per_acre;
  const cost = rec.cost_of_cultivation_rs_per_acre;

  return (
    <div className="card-hover bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f0f2eb] flex items-center justify-center text-xs font-bold text-[#4a8c6a]">
            #{rank}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-[#1a2e1a]">{rec.crop}</h4>
            <p className="text-xs text-gray-400">Yield: {rec.reference_yield_kg_per_acre.toLocaleString()} kg/acre</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#1a2e1a]">{rec.opportunity_score}</div>
          <div className="text-xs text-gray-400">/ 100</div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="space-y-1.5 mb-4">
        {b.soil_fit !== undefined && <ScoreBar label="Soil fit" value={b.soil_fit} />}
        {b.climate_fit !== undefined && <ScoreBar label="Climate" value={b.climate_fit} />}
        {b.water_fit !== undefined && <ScoreBar label="Water fit" value={b.water_fit} />}
        {b.rainfall_fit !== undefined && <ScoreBar label="Rainfall match" value={b.rainfall_fit} />}
        {b.buyer_demand !== undefined && <ScoreBar label="Buyer demand" value={b.buyer_demand} />}
        {b.price_opportunity !== undefined && <ScoreBar label="Price opportunity" value={b.price_opportunity} />}
        {b.profitability !== undefined && <ScoreBar label="Profitability" value={b.profitability} />}
        {b.saturation_risk !== undefined && <ScoreBar label="Saturation risk" value={b.saturation_risk} />}
      </div>

      {/* Economics */}
      {profit !== undefined && (
        <div className="bg-[#f8faf6] border border-gray-100 rounded-xl p-3 mb-4">
          <p className="text-[10px] tracking-[0.1em] text-gray-400 uppercase mb-2">Economics per acre</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-400">Cost</p>
              <p className="text-sm font-semibold text-gray-700">
                {cost ? `₹${(cost / 1000).toFixed(0)}K` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Revenue</p>
              <p className="text-sm font-semibold text-gray-700">
                {revenue ? `₹${(revenue / 1000).toFixed(0)}K` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Profit</p>
              <p className={`text-sm font-semibold ${profit && profit > 0 ? "text-[#4a8c6a]" : "text-red-500"}`}>
                {profit ? `₹${(profit / 1000).toFixed(0)}K` : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg">
          Confidence: {rec.confidence}
        </span>
      </div>

      {/* Reason codes */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {rec.reason_codes.map((code) => (
          <span key={code} className="text-xs bg-[#f0f2eb] text-[#4a8c6a] px-2.5 py-1 rounded-lg">
            {code.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      {/* Explanations */}
      {rec.explanations && rec.explanations.length > 0 && (
        <div className="space-y-1 mb-3">
          {rec.explanations.map((exp, i) => (
            <p key={i} className="text-xs text-gray-500">{exp}</p>
          ))}
        </div>
      )}

      {/* Sources */}
      {rec.sources && rec.sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50">
          {rec.sources.map((src, i) => (
            <span key={i} className="text-[10px] text-gray-400">
              {src.provider} ({src.status || src.type})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RejectedCard({ rec }: { rec: RejectedCrop }) {
  return (
    <div className="bg-[#fdf6f6] border border-red-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-400">x</span>
        <span className="font-medium text-gray-700">{rec.crop}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-1">
        {rec.rejection_codes.map((code) => (
          <span key={code} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">{code.replace(/_/g, " ")}</span>
        ))}
      </div>
      <p className="text-sm text-gray-500">{rec.explanation}</p>
    </div>
  );
}

function ClimateInsight({ ctx }: { ctx: ClimateContext }) {
  if (!ctx || !ctx.key_insight) return null;

  const statusColors: Record<string, string> = {
    well_below_normal: "bg-amber-50 border-amber-200 text-amber-800",
    below_normal: "bg-yellow-50 border-yellow-200 text-yellow-800",
    near_normal: "bg-green-50 border-green-200 text-green-800",
    above_normal: "bg-blue-50 border-blue-200 text-blue-800",
    unknown: "bg-gray-50 border-gray-200 text-gray-600",
  };
  const cls = statusColors[ctx.rainfall_status] || statusColors.unknown;

  return (
    <div className={`border rounded-2xl p-5 mb-8 ${cls.split(" ").slice(0, 2).join(" ")}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Climate Context</p>
          <p className="text-sm leading-relaxed opacity-80">{ctx.key_insight}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {ctx.preferred_crops.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/60">
                Preferred: {ctx.preferred_crops.join(", ")}
              </span>
            )}
            {ctx.caution_crops.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/60">
                Caution: {ctx.caution_crops.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationResults({ data, currentCrop }: Props) {
  const chosen=data.recommendations.find(item=>item.crop.toLowerCase()===currentCrop?.toLowerCase());
  const chosenRejected=data.rejected.find(item=>item.crop.toLowerCase()===currentCrop?.toLowerCase());
  const alternatives=data.recommendations.filter(item=>item!==chosen).slice(0,3);
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#1a2e1a] mb-2 text-center">My current crop plan</h2>
      <div className="flex justify-center gap-6 text-sm text-gray-500 mb-6 flex-wrap">
        <span>Season: <strong>{data.season}</strong></span>
        <span>Weather: <strong>{data.data_status.weather}</strong></span>
        {data.data_status.nasa_climate && (
          <span>Climate: <strong>{data.data_status.nasa_climate}</strong></span>
        )}
        <span>Soil: <strong>{data.data_status.soil}</strong></span>
      </div>

      {data.climate_context && <ClimateInsight ctx={data.climate_context} />}

      <div className="mb-10">
        <p className="text-xs tracking-[0.1em] text-gray-400 uppercase mb-4">Plan for {currentCrop||"your selected crop"}</p>
        <div className="space-y-4">
          {chosen&&<CropCard rec={chosen} rank={1}/>} 
          {!chosen&&chosenRejected&&<div className="current-crop-caution"><b>Continue with {currentCrop} with caution</b><p>{chosenRejected.explanation} This is guidance—not a command to change crops. Review water, timing, and input risk with a local agriculture officer.</p></div>}
          {!chosen&&!chosenRejected&&data.recommendations[0]&&<CropCard rec={data.recommendations[0]} rank={1}/>} 
        </div>
      </div>
      {alternatives.length>0&&<details className="next-season-options"><summary>Optional ideas for next season</summary><p>These do not replace your current crop. They are shown only for future discussion with your family, FPO, or agriculture officer.</p><div className="space-y-4">{alternatives.map((rec,i)=><CropCard key={rec.crop} rec={rec} rank={i+1}/>)}</div></details>}
    </div>
  );
}
