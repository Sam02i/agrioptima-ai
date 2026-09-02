import { useEffect, useState } from "react";
import type { FarmerRecommendationRequest } from "../api/recommendations";
import { getSoilForDistrict } from "../api/regions";

type Props = {
  onSubmit: (payload: FarmerRecommendationRequest) => void;
  loading: boolean;
  initialValues?: Partial<FarmerRecommendationRequest>;
};

const SEASONS = ["Kharif", "Rabi", "Zaid"] as const;
const IRRIGATION = ["none", "limited", "adequate"] as const;
const CROPS = [
  "Tomato", "Chilli", "Maize", "Paddy", "Onion", "Bajra", "Wheat",
  "Soybean", "Groundnut", "Cotton", "Sugarcane", "Brinjal", "Okra",
  "Potato", "Green Gram", "Black Gram", "Chickpea", "Mustard",
  "Sunflower", "Banana", "Turmeric", "Ginger", "Sesame", "Castor",
];

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function FarmerForm({ onSubmit, loading, initialValues }: Props) {
  const [form, setForm] = useState<FarmerRecommendationRequest>({
    name: "",
    village: "",
    district: "",
    state: "Maharashtra",
    latitude: 19.997,
    longitude: 73.789,
    area_acres: 3,
    season: "Kharif",
    irrigation: "limited",
    soil_ph: 6.8,
    nitrogen: 72,
    phosphorus: 48,
    potassium: 55,
    soil_source: "soil_health_card",
    previous_crop: "Onion",
    investment_budget_rupees: 240000,
    sowing_period: "June-July",
  });
  useEffect(()=>{if(initialValues)setForm((current)=>({...current,...initialValues}))},[initialValues]);

  const [errors, setErrors] = useState<string[]>([]);
  const [soilEstimate, setSoilEstimate] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle");

  const set = (field: keyof FarmerRecommendationRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Auto-fill soil when district changes
    if (field === "district" && typeof value === "string" && value.length > 2) {
      const estimate = getSoilForDistrict(value);
      setForm((prev) => ({
        ...prev,
        district: value,
        soil_ph: estimate.soil_ph,
        nitrogen: estimate.nitrogen,
        phosphorus: estimate.phosphorus,
        potassium: estimate.potassium,
      }));
      setSoilEstimate(true);
    }
  };

  const handlePincodeChange = async (value: string) => {
    setPincode(value);

    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setPincodeStatus("loading");
      try {
        const res = await fetch(`${API}/api/v1/pincode/${value}`);
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setForm((prev) => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
          }));
          setPincodeStatus("found");
        } else {
          setPincodeStatus("not-found");
        }
      } catch {
        setPincodeStatus("not-found");
      }
    } else {
      setPincodeStatus("idle");
    }
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (form.name.length < 2) errs.push("Name must be at least 2 characters");
    if (form.village.length < 2) errs.push("Village must be at least 2 characters");
    if (form.district.length < 2) errs.push("District must be at least 2 characters");
    if (form.area_acres <= 0) errs.push("Area must be greater than 0");
    if (form.soil_ph < 3 || form.soil_ph > 10) errs.push("Soil pH must be between 3.0 and 10.0");
    if (form.nitrogen < 0) errs.push("Nitrogen cannot be negative");
    if (form.phosphorus < 0) errs.push("Phosphorus cannot be negative");
    if (form.potassium < 0) errs.push("Potassium cannot be negative");
    if (form.investment_budget_rupees <= 0) errs.push("Investment budget must be positive");
    if (form.previous_crop.length < 2) errs.push("Previous crop must be at least 2 characters");
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length === 0) onSubmit(form);
  };

  const input = "w-full px-3 py-2 bg-[#f8faf6] border border-gray-200 rounded-xl text-[#1a2e1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a8c6a]/30 focus:border-[#4a8c6a] transition-colors placeholder:text-gray-300";
  const label = "block text-xs font-medium text-gray-500 mb-1";
  const select = `${input} appearance-none cursor-pointer`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          {errors.map((err, i) => (
            <p key={i} className="text-red-600 text-xs">{err}</p>
          ))}
        </div>
      )}

      {/* Personal */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase mb-3">Personal Information</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Farmer Name</label>
            <input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ramesh Patil" />
          </div>
          <div>
            <label className={label}>Village</label>
            <input className={input} value={form.village} onChange={(e) => set("village", e.target.value)} placeholder="Pimpalgaon" />
          </div>
          <div>
            <label className={label}>District</label>
            <input className={input} value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="Nashik" />
          </div>
          <div>
            <label className={label}>State</label>
            <input className={input} value={form.state || ""} onChange={(e) => set("state", e.target.value)} placeholder="Maharashtra" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase mb-3">Farm Location</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={label}>Pincode</label>
            <div className="relative">
              <input
                className={input}
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
              />
              {pincodeStatus === "loading" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">Looking up...</span>
              )}
              {pincodeStatus === "found" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#4a8c6a] bg-[#f0f2eb] px-2 py-0.5 rounded-full">
                  Coordinates auto-filled
                </span>
              )}
              {pincodeStatus === "not-found" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-red-500">Not found</span>
              )}
            </div>
          </div>
          <div>
            <label className={label}>Latitude</label>
            <input type="number" className={input} value={form.latitude} onChange={(e) => set("latitude", parseFloat(e.target.value) || 0)} step="0.001" />
          </div>
          <div>
            <label className={label}>Longitude</label>
            <input type="number" className={input} value={form.longitude} onChange={(e) => set("longitude", parseFloat(e.target.value) || 0)} step="0.001" />
          </div>
        </div>
      </div>

      {/* Farm */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase mb-3">Farm Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Area (acres)</label>
            <input type="number" className={input} value={form.area_acres} onChange={(e) => set("area_acres", parseFloat(e.target.value) || 0)} step="0.5" />
          </div>
          <div>
            <label className={label}>Season</label>
            <select className={select} value={form.season} onChange={(e) => set("season", e.target.value)}>
              {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Irrigation</label>
            <select className={select} value={form.irrigation} onChange={(e) => set("irrigation", e.target.value)}>
              {IRRIGATION.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Previous Crop</label>
            <select className={select} value={form.previous_crop} onChange={(e) => set("previous_crop", e.target.value)}>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Sowing Period</label>
            <input className={input} value={form.sowing_period} onChange={(e) => set("sowing_period", e.target.value)} placeholder="June-July" />
          </div>
          <div>
            <label className={label}>Budget (₹)</label>
            <input type="number" className={input} value={form.investment_budget_rupees} onChange={(e) => set("investment_budget_rupees", parseInt(e.target.value) || 0)} step="10000" />
          </div>
        </div>
      </div>

      {/* Soil */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase">Soil Data</p>
          {soilEstimate && (
            <span className="text-[10px] text-[#4a8c6a] bg-[#f0f2eb] px-2 py-0.5 rounded-full">
              Estimated from district
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Soil pH</label>
            <input type="number" className={input} value={form.soil_ph} onChange={(e) => { set("soil_ph", parseFloat(e.target.value) || 0); setSoilEstimate(false); }} step="0.1" min="3.0" max="10.0" />
          </div>
          <div>
            <label className={label}>Nitrogen (kg/ha)</label>
            <input type="number" className={input} value={form.nitrogen} onChange={(e) => { set("nitrogen", parseFloat(e.target.value) || 0); setSoilEstimate(false); }} step="1" />
          </div>
          <div>
            <label className={label}>Phosphorus (kg/ha)</label>
            <input type="number" className={input} value={form.phosphorus} onChange={(e) => { set("phosphorus", parseFloat(e.target.value) || 0); setSoilEstimate(false); }} step="1" />
          </div>
          <div>
            <label className={label}>Potassium (kg/ha)</label>
            <input type="number" className={input} value={form.potassium} onChange={(e) => { set("potassium", parseFloat(e.target.value) || 0); setSoilEstimate(false); }} step="1" />
          </div>
          <div className="col-span-2">
            <label className={label}>Soil Source</label>
            <select className={select} value={form.soil_source} onChange={(e) => set("soil_source", e.target.value)}>
              <option value="soil_health_card">Soil Health Card</option>
              <option value="lab_report">Lab Report</option>
              <option value="manual_entry">Manual Entry</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1a3c2a] hover:bg-[#244d36] text-white py-3 px-6 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Analyzing..." : "Get Crop Recommendations"}
      </button>
    </form>
  );
}
