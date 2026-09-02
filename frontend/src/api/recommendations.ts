export type FarmerRecommendationRequest = {
  name: string;
  village: string;
  district: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  area_acres: number;
  season: "Kharif" | "Rabi" | "Zaid";
  irrigation: "none" | "limited" | "adequate";
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  soil_source: "soil_health_card" | "lab_report" | "manual_entry";
  previous_crop: string;
  investment_budget_rupees: number;
  sowing_period: string;
};

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type RecommendationItem = {
  crop: string;
  opportunity_score: number;
  confidence: number;
  reference_yield_kg_per_acre: number;
  expected_revenue_rs_per_acre?: number;
  expected_profit_rs_per_acre?: number;
  cost_of_cultivation_rs_per_acre?: number;
  reason_codes: string[];
  explanations?: string[];
  score_breakdown?: Record<string, number>;
  sources?: { provider: string; status?: string; type?: string }[];
};

export type RejectedCrop = {
  crop: string;
  rejection_codes: string[];
  explanation: string;
};

export type ClimateContext = {
  rainfall_status: string;
  rainfall_mm: number | null;
  temperature_status: string;
  temperature_c: number;
  key_insight: string;
  preferred_crops: string[];
  caution_crops: string[];
};

export type RecommendationResponse = {
  season: string;
  climate_context: ClimateContext;
  data_status: {
    weather: string;
    nasa_climate?: string;
    soil: string;
  };
  recommendations: RecommendationItem[];
  rejected: RejectedCrop[];
};

export async function getRecommendations(
  payload: FarmerRecommendationRequest
): Promise<RecommendationResponse> {
  const response = await fetch(`${API}/crop/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    const detail=Array.isArray(error.detail)?error.detail.map((item:any)=>`${item.loc?.slice(-1)[0]||"Field"}: ${item.msg}`).join(" · "):error.detail;
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}
