import { LocalizedText } from "../i18n/LocalizedText";
import { useEffect, useRef, useState } from "react";
import FarmerForm from "./FarmerForm";
import RecommendationResults from "./RecommendationResults";
import FreshnessPanel from "./FreshnessPanel";
import SoilAdvisoryPanel from "./SoilAdvisoryPanel";
import ProduceListingForm from "./ProduceListingForm";
import FarmerShipments from "./FarmerShipments";
import FarmerToday from "./FarmerToday";
import { getRecommendations } from "../api/recommendations";
import type {
  FarmerRecommendationRequest,
  RecommendationResponse,
} from "../api/recommendations";
import {
  getFarmerDetail,
  getFarmerRecords,
  type FarmerDetail,
  type FarmerRecord,
} from "../api/farmers";

type FarmerTab =
  | "overview"
  | "profile"
  | "crop"
  | "soil"
  | "freshness"
  | "listings"
  | "orders";
const FARM_NAV: Array<[FarmerTab, string, string]> = [
  ["overview", "Today", "⌂"],
  ["profile", "Farmer profiles", "♟"],
  ["crop", "My crop plan", "♧"],
  ["soil", "Soil & fertilizer", "◉"],
  ["freshness", "Check quality", "◎"],
  ["listings", "Prices & listing", "◫"],
  ["orders", "Orders & delivery", "▣"],
];
const FARM_COPY: Record<FarmerTab, [string, string]> = {
  overview: [
    "Today on my farm",
    "Simple actions for the crop you already grow, selling price, orders, and payment.",
  ],
  profile: [
    "Connected farmer data",
    "Review farms or help several farmers through an FPO or assisted operator.",
  ],
  crop: [
    "My current crop plan",
    "Keep your crop choice and get practical guidance for this season. Other crops are optional next-season ideas.",
  ],
  soil: [
    "Soil and fertilizer guidance",
    "Soil values load automatically. See what is missing, when to act, and choose one suitable fertilizer option.",
  ],
  freshness: [
    "Check produce quality",
    "Photograph produce before listing or dispatch to create trusted quality evidence.",
  ],
  listings: [
    "Prices and produce listing",
    "Compare recent mandi references, estimated transport, and buyer-ready listing prices.",
  ],
  orders: [
    "Orders and delivery",
    "See pickup, route tracking, produce passport, and delivery status.",
  ],
};

export default function FarmerDashboard({
  farmerId,
  onFarmerChange,
  onHome,
  onBuyer,
}: {
  farmerId: string;
  onFarmerChange: (id: string) => void;
  onHome: () => void;
  onBuyer: () => void;
}) {
  const [active, setActive] = useState<FarmerTab>("overview");
  const [menu, setMenu] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [profile, setProfile] = useState<FarmerDetail | null>(null);
  useEffect(() => {
    getFarmerRecords()
      .then((rows) => {
        setFarmers(rows);
        if (!farmerId && rows[0]) onFarmerChange(rows[0].farmer_id);
      })
      .catch(() => setError("Start the backend to load farmer records."));
  }, [farmerId]);
  useEffect(() => {
    if (farmerId)
      getFarmerDetail(farmerId)
        .then(setProfile)
        .catch(() => setError("Unable to load the selected farmer profile."));
  }, [farmerId]);
  const farmer =
    profile?.farmer || farmers.find((item) => item.farmer_id === farmerId);
  const farm = profile?.farms[0];
  const initials = (farmer?.name || "Farmer")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const go = (tab: FarmerTab) => {
    setActive(tab);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submit = async (payload: FarmerRecommendationRequest) => {
    setLoading(true);
    setError(null);
    try {
      setResults(await getRecommendations(payload));
      setTimeout(
        () => ref.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to recommend crops");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="farmer-app">
      {menu && (
        <button
          className="sidebar-scrim"
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        />
      )}
      <aside className={`farmer-sidebar ${menu ? "open" : ""}`}>
        <div className="buyer-brand">
          <span>♧</span>
          <b><LocalizedText source={"AgriOptimaᴬᴵ"} /></b>
          <button onClick={() => setMenu(false)}>×</button>
        </div>
        <div className="workspace-card">
          <span><LocalizedText source={"{0}"} values={[initials]} /></span>
          <div>
            <b><LocalizedText source={"{0}"} values={[farmer?.name || "Select farmer"]} /></b>
            <small><LocalizedText source={"Farmer workspace"} /></small>
          </div>
          <i>⌄</i>
        </div>
        <nav>
          <p><LocalizedText source={"Farm intelligence"} /></p>
          {FARM_NAV.map(([key, label, icon]) => (
            <button
              key={key}
              aria-current={active === key ? "page" : undefined}
              className={active === key ? "active" : ""}
              onClick={() => go(key)}
            >
              <span><LocalizedText source={"{0}"} values={[icon]} /></span><LocalizedText source={" {0} "} values={[label]} /></button>
          ))}
        </nav>
        <div className="sidebar-status">
          <span><LocalizedText source={"● Farm connected"} /></span>
          <strong><LocalizedText source={"{0} profiles ready"} values={[farmers.length]} /></strong>
          <small><LocalizedText source={"Plan · Grade · Sell · Deliver"} /></small>
          <button onClick={onHome}><LocalizedText source={"← Public landing page"} /></button>
        </div>
      </aside>
      <main className="farmer-main">
        <header className="buyer-topbar">
          <button className="mobile-nav" aria-label="Open farmer navigation" onClick={() => setMenu(true)}>
            ☰
          </button>
          <div className="global-search">
            ⌕ <input placeholder="Search farm tools, crops, listings…" />
            <kbd><LocalizedText source={"⌘ K"} /></kbd>
          </div>
          <div className="farmer-profile-switch">
            <select
              aria-label="Choose farmer profile"
              value={farmerId}
              onChange={(event) => onFarmerChange(event.target.value)}
            >
              {farmers.map((item) => (
                <option key={item.farmer_id} value={item.farmer_id}><LocalizedText source={" {0} · {1} "} values={[item.name, item.district]} /></option>
              ))}
            </select>
          </div>
          <div className="portal-switch">
            <button onClick={onHome}><LocalizedText source={"Home"} /></button>
            <button onClick={onBuyer}><LocalizedText source={"Buyer portal"} /></button>
          </div>
          <div className="buyer-person">
            <span><LocalizedText source={"{0}"} values={[initials]} /></span>
            <div>
              <b><LocalizedText source={"{0}"} values={[farmer?.name || "Farmer"]} /></b>
              <small><LocalizedText source={"Verified farmer"} /></small>
            </div>
            <i>⌄</i>
          </div>
        </header>
        <div className="buyer-content">
          <section className="buyer-heading">
            <div>
              <span><LocalizedText source={" {0}  · Connected "} values={[farmer
                  ? `${farmer.district}, ${farmer.state}`
                  : "Farm intelligence"]} /></span>
              <h1><LocalizedText source={"{0}"} values={[FARM_COPY[active][0]]} /></h1>
              <p><LocalizedText source={"{0}"} values={[FARM_COPY[active][1]]} /></p>
            </div>
            {active !== "overview" && (
              <button onClick={() => go("overview")}><LocalizedText source={"← Farm overview"} /></button>
            )}
          </section>
          {active === "overview" && (
            <FarmerToday
              farmerName={farmer?.name || "Farmer"}
              district={farmer?.district || "your area"}
              farm={farm}
              listings={profile?.listings || []}
              onNavigate={(tab) => go(tab as FarmerTab)}
            />
          )}
          {active === "profile" &&
            (profile ? (
              <section className="farmer-record-card">
                <div>
                  <span><LocalizedText source={"{0}"} values={[initials]} /></span>
                  <div>
                    <h2><LocalizedText source={"{0}"} values={[profile.farmer.name]} /></h2>
                    <p><LocalizedText source={" {0}, {1},  {2} "} values={[profile.farmer.village, profile.farmer.district, profile.farmer.state]} /></p>
                  </div>
                </div>
                <div className="farmer-record-grid">
                  <span>
                    <small><LocalizedText source={"Profile status"} /></small>
                    <b><LocalizedText source={"{0}"} values={[profile.farmer.profile_status]} /></b>
                  </span>
                  <span>
                    <small><LocalizedText source={"Preferred language"} /></small>
                    <b><LocalizedText source={"{0}"} values={[profile.farmer.preferred_language]} /></b>
                  </span>
                  <span>
                    <small><LocalizedText source={"Primary goal"} /></small>
                    <b><LocalizedText source={"{0}"} values={[profile.needs?.primary_goal || "—"]} /></b>
                  </span>
                  <span>
                    <small><LocalizedText source={"Risk preference"} /></small>
                    <b><LocalizedText source={"{0}"} values={[profile.needs?.risk_preference || "—"]} /></b>
                  </span>
                  <span>
                    <small><LocalizedText source={"Current crop"} /></small>
                    <b><LocalizedText source={"{0}"} values={[farm?.current_crop || "—"]} /></b>
                  </span>
                  <span>
                    <small><LocalizedText source={"Irrigation"} /></small>
                    <b><LocalizedText source={"{0}"} values={[farm?.irrigation_type || "—"]} /></b>
                  </span>
                </div>
              </section>
            ) : (
              <div className="demo-panel"><LocalizedText source={"Loading farmer record…"} /></div>
            ))}
          {active === "profile" && farmer && (
            <section className="nearby-farmers">
              <span className="panel-kicker"><LocalizedText source={"Farmers in the same area"} /></span>
              <h2><LocalizedText source={"Other farmers near {0}"} values={[farmer.district]} /></h2>
              <div className="farmer-grid">
                {farmers
                  .filter(
                    (item) =>
                      item.farmer_id !== farmerId &&
                      item.district === farmer.district,
                  )
                  .slice(0, 4)
                  .map((item) => (
                    <article key={item.farmer_id} className="farmer-card">
                      <div className="farmer-avatar">
                        {item.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h3><LocalizedText source={"{0}"} values={[item.name]} /></h3>
                        <p><LocalizedText source={" {0}, {1} "} values={[item.village, item.district]} /></p>
                        <button onClick={() => onFarmerChange(item.farmer_id)}><LocalizedText source={" View profile → "} /></button>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          )}
          {active === "soil" &&
            (farm ? (
              <SoilAdvisoryPanel farmerId={farmerId} farm={farm} />
            ) : (
              <div className="demo-panel"><LocalizedText source={" Loading connected Soil Health Card… "} /></div>
            ))}
          {active === "freshness" && <FreshnessPanel />}
          {active === "listings" && (
            <ProduceListingForm
              farmerId={farmerId}
              existing={profile?.listings || []}
            />
          )}{" "}
      {active === "orders" && <FarmerShipments farmerId={farmerId} />}
          {active === "crop" && (
            <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
              <div>
                {error && (
                  <div className="mb-3 p-3 bg-red-50 text-red-700 text-xs rounded-xl"><LocalizedText source={" {0} "} values={[error]} /></div>
                )}
                <FarmerForm
                  key={farmerId}
                  onSubmit={submit}
                  loading={loading}
                  initialValues={
                    farmer && farm
                      ? {
                          name: farmer.name,
                          village: farmer.village,
                          district: farmer.district,
                          state: farmer.state,
                          latitude: farm.latitude,
                          longitude: farm.longitude,
                          area_acres: farm.area_acres,
                          irrigation:
                            farm.water_availability === "low"
                              ? "limited"
                              : farm.irrigation_type === "rainfed"
                                ? "none"
                                : "adequate",
                          soil_ph: farm.ph ?? 6.8,
                          nitrogen: farm.nitrogen ?? 0,
                          phosphorus: farm.phosphorus ?? 0,
                          potassium: farm.potassium ?? 0,
                          previous_crop:
                            farm.current_crop || farm.previous_crop || "Tomato",
                          investment_budget_rupees: Math.max(
                            1,
                            Math.round(
                              Number(
                                profile?.needs?.investment_budget || 80000,
                              ),
                            ),
                          ),
                        }
                      : undefined
                  }
                />
              </div>
              <div ref={ref}>
                {results ? (
                  <RecommendationResults
                    data={results}
                    currentCrop={farm?.current_crop || farm?.previous_crop}
                  />
                ) : (
                  <div className="demo-panel empty-workspace">
                    <span>♧</span>
                    <h3><LocalizedText source={" Your {0}  plan will appear here "} values={[farm?.current_crop || farm?.previous_crop || "crop"]} /></h3>
                    <p><LocalizedText source={" Confirm the few details on the left. Soil values are already connected and no technical entry is required. "} /></p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <footer className="buyer-footer"><LocalizedText source={" Farmer workspace · Crop planning · Soil intelligence · Freshness · Produce listings · Orders "} /></footer>
      </main>
    </div>
  );
}
