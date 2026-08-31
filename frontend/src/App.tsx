import { useState, useRef } from "react";
import FarmerForm from "./components/FarmerForm";
import RecommendationResults from "./components/RecommendationResults";
import { getRecommendations } from "./api/recommendations";
import type { FarmerRecommendationRequest, RecommendationResponse } from "./api/recommendations";

function App() {
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (payload: FarmerRecommendationRequest) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await getRecommendations(payload);
      setResults(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2eb]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2d5a3d] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
              </svg>
            </div>
            <span className="text-base font-semibold text-[#1a2e1a]">AgriOptima</span>
            <span className="text-[10px] font-medium text-[#4a8c6a] bg-[#e8f0eb] px-1.5 py-0.5 rounded">AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <a href="#workspace" className="hover:text-gray-800 transition-colors">Farmer intelligence</a>
          </div>
        </div>
      </nav>

      {/* Hero — compact */}
      <section className="bg-gradient-to-b from-[#e8f0eb] to-[#f0f2eb] py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] tracking-[0.2em] text-[#4a8c6a] font-medium uppercase mb-3">
            Transparent Agricultural Intelligence
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2e1a] leading-tight mb-3">
            Grow with evidence.{" "}
            <span className="font-serif italic text-[#3d7a5a]">Recommend with confidence.</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mb-6">
            Filters infeasible crops first, makes every crop score explainable, and helps farmers choose the right crop.
          </p>
        </div>
      </section>

      {/* Main workspace — side by side */}
      <section id="workspace" className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* Left — form */}
          <div className="lg:sticky lg:top-20">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{error}</div>
            )}
            {loading && (
              <div className="mb-4 p-3 bg-[#e8f0eb] border border-[#c5d9be] rounded-xl text-[#2d5a3d] text-xs text-center">
                Analyzing farm profile...
              </div>
            )}
            <FarmerForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Right — results or empty state */}
          <div ref={resultsRef}>
            {results ? (
              <RecommendationResults data={results} />
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 shadow-sm text-center">
                <div className="w-16 h-16 bg-[#f0f2eb] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#8aab7f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#1a2e1a] mb-2">No results yet</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Fill in the farm profile on the left and click "Get Crop Recommendations" to see ranked crops.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-200 bg-white text-center">
        <p className="text-[11px] text-gray-400">AgriOptima AI — Open-Meteo · AGMARKNET · Soil Health Card</p>
      </footer>
    </div>
  );
}

export default App;
