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
          <b>AgriOptimaᴬᴵ</b>
          <button onClick={() => setMenu(false)}>×</button>
        </div>
        <div className="workspace-card">
          <span>{initials}</span>
          <div>
            <b>{farmer?.name || "Select farmer"}</b>
            <small>Farmer workspace</small>
          </div>
          <i>⌄</i>
        </div>
        <nav>
          <p>Farm intelligence</p>
          {FARM_NAV.map(([key, label, icon]) => (
            <button
              key={key}
              className={active === key ? "active" : ""}
              onClick={() => go(key)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-status">
          <span>● Farm connected</span>
          <strong>{farmers.length} profiles ready</strong>
          <small>Plan · Grade · Sell · Deliver</small>
          <button onClick={onHome}>← Public landing page</button>
        </div>
      </aside>
      <main className="farmer-main">
        <header className="buyer-topbar">
          <button className="mobile-nav" onClick={() => setMenu(true)}>
            ☰
          </button>
          <div className="global-search">
            ⌕ <input placeholder="Search farm tools, crops, listings…" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="farmer-profile-switch">
            <select
              aria-label="Choose farmer profile"
              value={farmerId}
              onChange={(event) => onFarmerChange(event.target.value)}
            >
              {farmers.map((item) => (
                <option key={item.farmer_id} value={item.farmer_id}>
                  {item.name} · {item.district}
                </option>
              ))}
            </select>
          </div>
          <div className="portal-switch">
            <button onClick={onHome}>Home</button>
            <button onClick={onBuyer}>Buyer portal</button>
          </div>
          <div className="buyer-person">
            <span>{initials}</span>
            <div>
              <b>{farmer?.name || "Farmer"}</b>
              <small>Verified farmer</small>
            </div>
            <i>⌄</i>
          </div>
        </header>
        <div className="buyer-content">
          <section className="buyer-heading">
            <div>
              <span>
                {farmer
                  ? `${farmer.district}, ${farmer.state}`
                  : "Farm intelligence"}{" "}
                · Connected
              </span>
              <h1>{FARM_COPY[active][0]}</h1>
              <p>{FARM_COPY[active][1]}</p>
            </div>
            {active !== "overview" && (
              <button onClick={() => go("overview")}>← Farm overview</button>
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
                  <span>{initials}</span>
                  <div>
                    <h2>{profile.farmer.name}</h2>
                    <p>
                      {profile.farmer.village}, {profile.farmer.district},{" "}
                      {profile.farmer.state}
                    </p>
                  </div>
                </div>
                <div className="farmer-record-grid">
                  <span>
                    <small>Profile status</small>
                    <b>{profile.farmer.profile_status}</b>
                  </span>
                  <span>
                    <small>Preferred language</small>
                    <b>{profile.farmer.preferred_language}</b>
                  </span>
                  <span>
                    <small>Primary goal</small>
                    <b>{profile.needs?.primary_goal || "—"}</b>
                  </span>
                  <span>
                    <small>Risk preference</small>
                    <b>{profile.needs?.risk_preference || "—"}</b>
                  </span>
                  <span>
                    <small>Current crop</small>
                    <b>{farm?.current_crop || "—"}</b>
                  </span>
                  <span>
                    <small>Irrigation</small>
                    <b>{farm?.irrigation_type || "—"}</b>
                  </span>
                </div>
              </section>
            ) : (
              <div className="demo-panel">Loading farmer record…</div>
            ))}
          {active === "profile" && farmer && (
            <section className="nearby-farmers">
              <span className="panel-kicker">Farmers in the same area</span>
              <h2>Other farmers near {farmer.district}</h2>
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
                        <h3>{item.name}</h3>
                        <p>
                          {item.village}, {item.district}
                        </p>
                        <button onClick={() => onFarmerChange(item.farmer_id)}>
                          View profile →
                        </button>
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
              <div className="demo-panel">
                Loading connected Soil Health Card…
              </div>
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
                  <div className="mb-3 p-3 bg-red-50 text-red-700 text-xs rounded-xl">
                    {error}
                  </div>
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
                    <h3>
                      Your {farm?.current_crop || farm?.previous_crop || "crop"}{" "}
                      plan will appear here
                    </h3>
                    <p>
                      Confirm the few details on the left. Soil values are
                      already connected and no technical entry is required.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <footer className="buyer-footer">
          Farmer workspace · Crop planning · Soil intelligence · Freshness ·
          Produce listings · Orders
        </footer>
      </main>
    </div>
  );
}
