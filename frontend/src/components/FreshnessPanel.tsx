import { useState } from "react";

const API = "http://127.0.0.1:8000";

interface FreshnessResult {
  freshness_level: number;
  freshness_label: string;
  confidence: number;
  margin: number;
  probabilities: Record<number, number>;
  review: {
    decision: string;
    reasons: string[];
    confidence_threshold: number;
    margin_threshold: number;
  };
}

interface SingleResult {
  image_name: string;
  prediction: FreshnessResult;
}

const LEVEL_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "VERY FRESH", color: "bg-green-500" },
  2: { label: "FRESH", color: "bg-green-400" },
  3: { label: "MODERATE", color: "bg-yellow-400" },
  4: { label: "AGING", color: "bg-orange-400" },
  5: { label: "ROTTEN", color: "bg-red-500" },
};

export default function FreshnessPanel() {
  const [mode, setMode] = useState<"single" | "inspect">("single");
  const [files, setFiles] = useState<FileList | null>(null);
  const [result, setResult] = useState<SingleResult | null>(null);
  const [multiResult, setMultiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!files || files.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setMultiResult(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(files[0]);

    const formData = new FormData();

    if (mode === "single") {
      formData.append("image", files[0]);
      try {
        const res = await fetch(`${API}/freshness/tomato/predict`, { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail?.message || "Prediction failed");
        }
        setResult(await res.json());
      } catch (e: any) {
        setError(e.message);
      }
    } else {
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }
      try {
        const res = await fetch(`${API}/freshness/tomato/inspect`, { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail?.message || "Inspection failed");
        }
        setMultiResult(await res.json());
      } catch (e: any) {
        setError(e.message);
      }
    }
    setLoading(false);
  };

  const pred = result?.prediction;

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-sm font-semibold text-[#1a2e1a]">Freshness Assessment</h3>
          <div className="flex bg-gray-50 rounded-lg p-0.5">
            <button
              onClick={() => setMode("single")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                mode === "single" ? "bg-white shadow-sm text-[#2d5a3d]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Single Image
            </button>
            <button
              onClick={() => setMode("inspect")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                mode === "inspect" ? "bg-white shadow-sm text-[#2d5a3d]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Shipment Inspection (3-5)
            </button>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#8aab7f] transition-colors">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={mode === "inspect"}
            onChange={(e) => setFiles(e.target.files)}
            className="hidden"
            id="freshness-upload"
          />
          <label htmlFor="freshness-upload" className="cursor-pointer">
            <div className="w-12 h-12 bg-[#f0f2eb] rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📷</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              {files ? `${files.length} file(s) selected` : "Click to upload produce images"}
            </p>
            <p className="text-[10px] text-gray-400">JPEG, PNG, or WEBP — {mode === "inspect" ? "3 to 5 images" : "single image"}</p>
          </label>
        </div>

        {files && files.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-4 w-full py-2.5 bg-[#2d5a3d] text-white rounded-xl text-sm font-medium hover:bg-[#1a4030] transition-colors disabled:opacity-50"
          >
            {loading ? "Analyzing..." : mode === "single" ? "Assess Freshness" : "Inspect Shipment"}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{error}</div>
      )}

      {/* Single result */}
      {pred && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Image preview */}
            <div>
              {preview && (
                <img src={preview} alt="Uploaded" className="w-full h-64 object-cover rounded-xl" />
              )}
            </div>
            {/* Result */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${LEVEL_LABELS[pred.freshness_level]?.color || "bg-gray-400"} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                  {pred.freshness_level}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1a2e1a]">
                    {LEVEL_LABELS[pred.freshness_level]?.label || pred.freshness_label}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Confidence: {(pred.confidence * 100).toFixed(1)}% · Margin: {(pred.margin * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Probabilities */}
              <div className="space-y-2 mb-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-6">{level}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${LEVEL_LABELS[level]?.color || "bg-gray-400"} rounded-full transition-all duration-700`}
                        style={{ width: `${(pred.probabilities[level] || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 w-10 text-right">
                      {((pred.probabilities[level] || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Review decision */}
              <div className={`p-3 rounded-lg text-xs ${
                pred.review.decision === "AUTO_ACCEPT"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-yellow-50 text-yellow-700 border border-yellow-200"
              }`}>
                <div className="font-medium mb-1">{pred.review.decision.replace("_", " ")}</div>
                {pred.review.reasons.length > 0 && (
                  <div className="text-[10px] opacity-75">
                    {pred.review.reasons.map((r) => r.replace("_", " ")).join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi result */}
      {multiResult && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-[#1a2e1a] mb-3">
              Aggregated Result — {multiResult.image_count} images
            </h4>
            {(() => {
              const agg = multiResult.aggregated_prediction;
              return (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${LEVEL_LABELS[agg.freshness_level]?.color || "bg-gray-400"} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                    {agg.freshness_level}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1a2e1a]">
                      {LEVEL_LABELS[agg.freshness_level]?.label || agg.freshness_label}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Confidence: {(agg.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Individual results */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
            {multiResult.individual_predictions.map((pred: any, i: number) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-center">
                <div className={`w-8 h-8 ${LEVEL_LABELS[pred.freshness_level]?.color || "bg-gray-400"} rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto mb-2`}>
                  {pred.freshness_level}
                </div>
                <div className="text-[10px] font-medium text-[#1a2e1a]">{pred.image_name}</div>
                <div className="text-[10px] text-gray-400">{LEVEL_LABELS[pred.freshness_level]?.label}</div>
                <div className="text-[10px] text-gray-400">{(pred.confidence * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !multiResult && !loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-[#f0f2eb] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍅</span>
          </div>
          <h3 className="text-lg font-semibold text-[#1a2e1a] mb-2">Freshness Assessment</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Upload images of produce to get ML-powered freshness grading from Level 1 (Very Fresh) to Level 5 (Rotten).
          </p>
        </div>
      )}
    </div>
  );
}
