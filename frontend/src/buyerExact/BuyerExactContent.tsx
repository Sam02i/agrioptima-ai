import { LocalizedText } from "../i18n/LocalizedText";
"use client";

import { lazy, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Bell,
  Box,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  Leaf,
  MapPin,
  Menu,
  Navigation,
  PackageCheck,
  QrCode,
  Route,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  ThermometerSun,
  Truck,
  Users,
  WalletCards,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress, ProgressIndicator, ProgressTrack } from "./ui/progress";
const CreditPanel=lazy(()=>import("../components/CreditPanel"));
const FreshnessPanel=lazy(()=>import("../components/FreshnessPanel"));
const LogisticsOptimizerPanel=lazy(()=>import("../components/LogisticsOptimizerPanel"));
import { apiFetch } from "../api/client";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type Seller = {
  id: string;
  farmerId?: string;
  crop: string;
  name: string;
  location: string;
  variety: string;
  quantity: number;
  price: number;
  freshness: number;
  reliability: number;
  distance: number;
  delivery: string;
  image: string;
  grade?: string;
  packaging?: string;
  harvest?: string;
};
const cropPhotoModules = import.meta.glob(
  "../assets/marketplace/crops/*.{jpg,webp}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;
const cropSlugs: Record<string, string> = {
  apple: "apple",
  "arhar (tur)": "arhar-tur",
  bajra: "bajra",
  banana: "banana",
  barley: "barley",
  brinjal: "brinjal",
  cabbage: "cabbage",
  cauliflower: "cauliflower",
  chana: "chana",
  chili: "chili",
  coriander: "coriander",
  cotton: "cotton",
  "cumin (jeera)": "cumin",
  garlic: "garlic",
  ginger: "ginger",
  grapes: "grapes",
  groundnut: "groundnut",
  guava: "guava",
  jowar: "jowar",
  jute: "jute",
  maize: "maize",
  mango: "mango",
  masoor: "masoor",
  moong: "moong",
  mustard: "mustard",
  "okra (bhindi)": "okra",
  onion: "onion",
  "orange (kinnow)": "orange",
  papaya: "papaya",
  peas: "peas",
  pomegranate: "pomegranate",
  potato: "potato",
  rice: "rice",
  "sesame (til)": "sesame",
  soybean: "soybean",
  sugarcane: "sugarcane",
  sunflower: "sunflower",
  tomato: "tomato",
  turmeric: "turmeric",
  urad: "urad",
  wheat: "wheat",
};
function marketplacePhoto(crop: string) {
  const slug = cropSlugs[crop.trim().toLowerCase()];
  return (
    cropPhotoModules[`../assets/marketplace/crops/${slug}.webp`] ||
    cropPhotoModules[`../assets/marketplace/crops/${slug}.jpg`] ||
    cropVisual(crop, "Verified produce")
  );
}
function cropVisual(crop: string, farmer: string, index = 0) {
  const key = crop.toLowerCase();
  const emoji = key.includes("apple")
    ? "🍎"
    : key.includes("tomato")
      ? "🍅"
      : key.includes("onion")
        ? "🧅"
        : key.includes("orange") || key.includes("kinnow")
          ? "🍊"
          : key.includes("potato")
            ? "🥔"
            : key.includes("maize")
              ? "🌽"
              : key.includes("chilli")
                ? "🌶️"
                : key.includes("groundnut")
                  ? "🥜"
                  : key.includes("turmeric")
                    ? "🫚"
                    : key.includes("cotton")
                      ? "☁️"
                      : key.includes("jute")
                        ? "🌿"
                        : "🌾";
  const palettes = [
    ["#EAE7DD", "#26483E"],
    ["#EAE7DD", "#26483E"],
    ["#EAE7DD", "#26483E"],
    ["#EAE7DD", "#26483E"],
    ["#EAE7DD", "#26483E"],
  ];
  const [light, dark] = palettes[index % palettes.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs><rect width="900" height="520" fill="url(#g)"/><circle cx="450" cy="220" r="155" fill="#EAE7DD" opacity=".4"/><text x="450" y="285" text-anchor="middle" font-size="190">${emoji}</text><rect x="215" y="426" width="470" height="55" rx="28" fill="#26483E" opacity=".92"/><text x="450" y="461" text-anchor="middle" font-family="Arial" font-size="24" font-weight="700" fill="white">${crop} · ${farmer}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
const sellers: Seller[] = [
  {
    id: "demo-1",
    crop: "Tomato",
    name: "Sahyadri Farms FPO",
    location: "Nashik, Maharashtra",
    variety: "Abhinav · Grade A",
    quantity: 3000,
    price: 27,
    freshness: 94,
    reliability: 96,
    distance: 82,
    delivery: "Today, 7 PM",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=85",
  },
];
const nav = [
  ["Overview", LayoutDashboard],
  ["Marketplace", Store],
  ["Smart procurement", Sparkles],
  ["Orders", ShoppingBasket],
  ["Produce passports", FileCheck2],
  ["Credit", WalletCards],
  ["Suppliers", Users],
] as const;
const stats = [
  ["Available sellers", "1", "Complete demo farmer", Store, "green"],
  ["Active orders", "1", "Single tracked example", ShoppingBasket, "blue"],
  ["In transit", "1", "Arriving today", Truck, "amber"],
  ["Demo procurement", "₹1.06L", "4 tonnes", Box, "green"],
  ["Landed-cost view", "Ready", "One verified route", ArrowDownRight, "blue"],
  ["Buyer profile", "1", "Credit history retained", CreditCard, "lime"],
] as const;

function Brand() {
  return (
    <div className="brand">
      <span>
        <Leaf />
      </span><LocalizedText source={" AgriOptimaᴬᴵ "} /></div>
  );
}
function Header({
  menu,
  onHome,
  onFarmer,
  buyer,
  buyers,
  changeBuyer,
}: {
  menu: () => void;
  onHome: () => void;
  onFarmer: () => void;
  buyer: string;
  buyers: string[];
  changeBuyer: (id: string) => void;
}) {
  const buyerNumber = buyer.replace("BUYER_", "");
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={menu}>
        <Menu />
      </button>
      <div className="search">
        <Search />
        <input placeholder="Search sellers, orders, shipments…" />
        <kbd><LocalizedText source={"⌘ K"} /></kbd>
      </div>
      <div className="top-actions">
        <select
          className="buyer-data-switch"
          value={buyer}
          onChange={(e) => changeBuyer(e.target.value)}
          aria-label="Choose buyer profile"
        >
          {buyers.map((id) => (
            <option key={id} value={id}><LocalizedText source={" {0} "} values={[id]} /></option>
          ))}
        </select>
        <div className="exact-portal-switch">
          <button onClick={onHome}><LocalizedText source={"Home"} /></button>
          <button onClick={onFarmer}><LocalizedText source={"Farmer portal"} /></button>
        </div>
        <button className="bell">
          <Bell />
          <i />
        </button>
        <span className="avatar"><LocalizedText source={"B{0}"} values={[buyerNumber.slice(-1)]} /></span>
        <div className="person">
          <b><LocalizedText source={"{0}"} values={[buyer]} /></b>
          <small><LocalizedText source={"Verified buyer profile"} /></small>
        </div>
        <ChevronDown />
      </div>
    </header>
  );
}
function Sidebar({
  active,
  setActive,
  open,
  close,
  buyer,
  availableCredit,
}: {
  active: string;
  setActive: (v: string) => void;
  open: boolean;
  close: () => void;
  buyer: string;
  availableCredit: number;
}) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-head">
        <Brand />
        <button onClick={close}>
          <X />
        </button>
      </div>
      <div className="workspace">
        <span><LocalizedText source={"B{0}"} values={[buyer.slice(-1)]} /></span>
        <div>
          <b><LocalizedText source={"{0}"} values={[buyer]} /></b>
          <small><LocalizedText source={"Buyer workspace"} /></small>
        </div>
        <ChevronDown />
      </div>
      <nav>
        <p><LocalizedText source={"Workspace"} /></p>
        {nav.map(([label, Icon]) => (
          <button
            aria-current={active === label ? "page" : undefined}
            className={active === label ? "active" : ""}
            key={label}
            onClick={() => {
              setActive(label);
              close();
            }}
          >
            <Icon />
            <span><LocalizedText source={"{0}"} values={[label]} /></span>
          </button>
        ))}
      </nav>
      <div className="credit-mini">
        <div>
          <CircleDollarSign /><LocalizedText source={" Procurement credit "} /></div>
        <strong><LocalizedText source={"₹{0}"} values={[Math.round(availableCredit).toLocaleString("en-IN")]} /></strong>
        <small><LocalizedText source={"Current profile availability"} /></small>
        <Progress value={24}>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <button onClick={() => setActive("Credit")}><LocalizedText source={" View credit profile "} /><ArrowRight />
        </button>
      </div>
    </aside>
  );
}
function Heading({
  children,
  title,
  copy,
}: {
  children?: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-heading">
      <div>
        <span className="eyebrow"><LocalizedText source={"Tuesday, 1 September"} /></span>
        <h1><LocalizedText source={"{0}"} values={[title]} /></h1>
        <p><LocalizedText source={"{0}"} values={[copy]} /></p>
      </div><LocalizedText source={" {0} "} values={[children]} /></section>
  );
}

function Overview({
  market, plan, openShipment, buyer,
}: {
  market: () => void;
  plan: () => void;
  openShipment: (id: string) => void;
  buyer: string;
}) {
  return (
    <div className="page dashboard-page simple-overview">
      <section className="opening-hero">
        <div className="opening-copy">
          <h1><LocalizedText source="Marketplace" /></h1>
          <div className="opening-actions">
            <Button onClick={market}><LocalizedText source=" Explore verified produce " /><ArrowRight /></Button>
            <Button variant="outline" onClick={plan}><LocalizedText source=" Build procurement plan " /></Button>
          </div>
        </div>
      </section>
      <OrdersPage buyer={buyer} openPassport={openShipment} />
    </div>
  );
}
function PanelTitle({
  eyebrow,
  title,
  action,
  badge,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  badge?: string;
}) {
  return (
    <div className="panel-title">
      <div>
        <span className="eyebrow"><LocalizedText source={"{0}"} values={[eyebrow]} /></span>
        <h2><LocalizedText source={"{0}"} values={[title]} /></h2>
      </div>
      {action && (
        <button><LocalizedText source={" {0} "} values={[action]} /><ChevronDown />
        </button>
      )}
      {badge && <Badge><LocalizedText source={"{0}"} values={[badge]} /></Badge>}
    </div>
  );
}
function Alert({
  icon: Icon,
  tone,
  title,
  copy,
}: {
  icon: typeof Clock3;
  tone: string;
  title: string;
  copy: string;
}) {
  return (
    <button>
      <span className={tone}>
        <Icon />
      </span>
      <div>
        <b><LocalizedText source={"{0}"} values={[title]} /></b>
        <small><LocalizedText source={"{0}"} values={[copy]} /></small>
      </div>
      <ArrowRight />
    </button>
  );
}
function RouteMap() {
  return (
    <div className="route-map">
      <span className="node n1">
        <Leaf /><LocalizedText source={" 3T"} /><small><LocalizedText source={"Nashik"} /></small>
      </span>
      <span className="node n2">
        <Leaf /><LocalizedText source={" 4T"} /><small><LocalizedText source={"Pimpalgaon"} /></small>
      </span>
      <span className="node n3">
        <Leaf /><LocalizedText source={" 3T"} /><small><LocalizedText source={"Sinnar"} /></small>
      </span>
      <i className="r1" />
      <i className="r2" />
      <i className="r3" />
      <span className="node hub">
        <Truck /><LocalizedText source={" 10T"} /><small><LocalizedText source={"Clubbed"} /></small>
      </span>
    </div>
  );
}
function Shipment({
  crop,
  qty,
  order,
  status,
  eta,
  delay,
  onClick,
}: {
  crop: string;
  qty: string;
  order: string;
  status: string;
  eta: string;
  delay?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="shipment" onClick={onClick}>
      <span className={`produce ${crop === "Tomato" ? "tomato" : "onion"}`} />
      <span>
        <b><LocalizedText source={" {0} {1} "} values={[qty, crop]} /></b>
        <small><LocalizedText source={"{0}"} values={[order]} /></small>
      </span>
      <span className={delay ? "delay" : ""}>
        <span>
          <i /><LocalizedText source={" {0} "} values={[status]} /></span>
        <b><LocalizedText source={"{0}"} values={[eta]} /></b>
      </span>
      <span className="shipment-open">
        <ArrowRight />
      </span>
    </button>
  );
}

function Marketplace({
  selected,
  toggle,
  buyer,
}: {
  selected: string[];
  toggle: (id: string) => void;
  buyer: string;
}) {
  const [liveSellers, setLiveSellers] = useState<Seller[]>(sellers);
  const [showComparison, setShowComparison] = useState(false);
  const [farmerDetail, setFarmerDetail] = useState<any>(null);
  const [requirementOpen, setRequirementOpen] = useState(false);
  const [requirementSent, setRequirementSent] = useState(false);
  const [orderNotice, setOrderNotice] = useState("");
  const [query, setQuery] = useState("");
  const [nearOnly, setNearOnly] = useState(false);
  const [todayOnly, setTodayOnly] = useState(false);
  const [gradeOnly, setGradeOnly] = useState(false);
  const openFarmer = async (id?: string) => {
    if (!id) return;
    const response = await fetch(
      `${API}/marketplace/farmers/${id}`,
    );
    if (response.ok) setFarmerDetail(await response.json());
  };
  const createOrder = async (s: Seller) => {
    const entered = window.prompt(
      `How many kg of ${s.crop} do you want to order?`,
      String(Math.min(1000, s.quantity)),
    );
    if (!entered) return;
    const quantity = Number(entered);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setOrderNotice("Enter a valid quantity.");
      return;
    }
    setOrderNotice("Creating saved order…");
    const response = await apiFetch(`${API}/trade/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_id: s.id,
        buyer_id: buyer,
        quantity_kg: quantity,
        destination: "Buyer warehouse",
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setOrderNotice(result.detail || "Order could not be created.");
      return;
    }
    setOrderNotice(
      `${result.id} created. It is now visible to the farmer and in Orders.`,
    );
    window.dispatchEvent(
      new CustomEvent("agrioptima-order-change", { detail: result.id }),
    );
  };
  useEffect(() => {
    Promise.all([
      fetch(`${API}/marketplace/listings`).then((r) => r.json()),
      fetch(`${API}/marketplace/farmers`).then((r) => r.json()),
    ])
      .then(([listingData, farmerData]) => {
        const farmersById = new Map(
          (farmerData.farmers || []).map((farmer: any) => [
            farmer.farmer_id,
            farmer,
          ]),
        );
        const rows = (listingData.listings || []).map(
          (listing: any, index: number) => {
            const farmer: any = farmersById.get(listing.farmer_id) || {};
            const crop = listing.crop_name || "Produce";
            const name =
              farmer.name || listing.farmer_name || "Verified farmer";
            const grade = String(listing.declared_grade || "GRADE_A").replace(
              "GRADE_",
              "Grade ",
            );
            const supplied = String(listing.image_data || "");
            const usable =
              supplied.startsWith("data:image/") ||
              supplied.startsWith("blob:");
            return {
              id: String(listing.listing_id),
              farmerId: String(listing.farmer_id),
              crop,
              name,
              location: `${listing.district}, ${listing.state}`,
              variety: `${listing.crop_variety || "Standard"} · ${grade}`,
              quantity: Number(
                listing.available_quantity_kg || listing.quantity_kg || 0,
              ),
              grade,
              packaging: String(listing.packaging_type || "Crates").replaceAll(
                "_",
                " ",
              ),
              harvest: String(
                listing.harvest_date ||
                  listing.expected_harvest_date ||
                  "Latest harvest",
              ),
              price: Number(Number(listing.price_per_kg || 0).toFixed(2)),
              freshness: 88 + (index % 10),
              reliability: 90 + (index % 8),
              distance: 45 + index * 13,
              delivery: index % 2 ? "Tomorrow, 8 AM" : "Today, 7 PM",
              image: usable ? supplied : marketplacePhoto(crop),
            };
          },
        );
        if (rows.length) setLiveSellers(rows);
      })
      .catch(() => undefined);
  }, []);
  const visibleSellers = liveSellers.filter(
    (s) =>
      (!query ||
        `${s.crop} ${s.name} ${s.location}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!nearOnly || s.distance <= 150) &&
      (!todayOnly || s.delivery.startsWith("Today")) &&
      (!gradeOnly ||
        s.variety.toLowerCase().includes("grade_a") ||
        s.variety.toLowerCase().includes("grade a")),
  );
  const portalTarget =
    document.querySelector<HTMLElement>(".buyer-exact-host")?.shadowRoot ||
    document.body;
  return (
    <div className="page">
      <Heading
        title="Available produce"
        copy="Compare true landed cost—not just the quoted price."
      >
        <Button
          onClick={() => {
            setRequirementOpen(true);
            setRequirementSent(false);
          }}
        >
          <ShoppingBasket /><LocalizedText source={" Post requirement "} /></Button>
      </Heading>
      <section className="filters">
        <div className="search">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crop, farmer, location…"
          />
        </div>
        <button
          type="button"
          aria-pressed={gradeOnly}
          className={gradeOnly ? "active" : ""}
          onClick={() => setGradeOnly((v) => !v)}
        ><LocalizedText source={" {0} "} values={[gradeOnly ? "Grade A only" : "All grades"]} /><ChevronDown />
        </button>
        <button
          type="button"
          aria-pressed={nearOnly}
          className={nearOnly ? "active" : ""}
          onClick={() => setNearOnly((v) => !v)}
        ><LocalizedText source={" {0} "} values={[nearOnly ? "Within 150 km" : "Any distance"]} /><ChevronDown />
        </button>
        <button
          type="button"
          aria-pressed={todayOnly}
          className={todayOnly ? "active" : ""}
          onClick={() => setTodayOnly((v) => !v)}
        ><LocalizedText source={" {0} "} values={[todayOnly ? "Available today" : "Any delivery"]} /><ChevronDown />
        </button>
        <span><LocalizedText source={"{0} verified farmer listings"} values={[visibleSellers.length]} /></span>
      </section>
      <section className="seller-grid">
        {orderNotice && (
          <div className="requirement-success" role="status">
            <b><LocalizedText source={"{0}"} values={[orderNotice]} /></b>
          </div>
        )}
        {visibleSellers.map((s, i) => (
          <article className="seller-card" key={s.id}>
            <div className="seller-img">
              <img
                src={s.image}
                alt={`${s.crop} offered by ${s.name}`}
                onError={(event) => {
                  event.currentTarget.src = cropVisual(s.crop, s.name, i);
                }}
              />
              <span>
                <Zap /><LocalizedText source={" {0}% fresh "} values={[s.freshness]} /></span>
              <button
                className={selected.includes(s.id) ? "selected" : ""}
                onClick={() => toggle(s.id)}
              ><LocalizedText source={" {0} "} values={[selected.includes(s.id) ? "✓ Added" : "+ Compare"]} /></button>
            </div>
            <div className="seller-body">
              <div className="seller-title">
                <div>
                  <span><LocalizedText source={"{0}"} values={[s.variety]} /></span>
                  <h2><LocalizedText source={"{0}"} values={[s.crop]} /></h2>
                  <small className="farmer-name"><LocalizedText source={"Sold by {0}"} values={[s.name]} /></small>
                  <p>
                    <MapPin /><LocalizedText source={" {0} · {1} km "} values={[s.location, s.distance]} /></p>
                </div>
                <div>
                  <strong><LocalizedText source={"₹{0}"} values={[s.price]} /></strong>
                  <small><LocalizedText source={"/kg"} /></small>
                </div>
              </div>
              <div className="badges">
                <Badge>
                  <ShieldCheck /><LocalizedText source={" AI verified "} /></Badge>
                <Badge variant="outline"><LocalizedText source={"Passport ready"} /></Badge>
                <Badge variant="outline"><LocalizedText source={"{0}"} values={[s.grade || "Grade A"]} /></Badge>
                <Badge variant="outline"><LocalizedText source={"{0}"} values={[s.packaging || "Crates"]} /></Badge>
              </div>
              <div className="facts">
                <span>
                  <small><LocalizedText source={"Available"} /></small>
                  <b><LocalizedText source={"{0} kg"} values={[s.quantity.toLocaleString("en-IN")]} /></b>
                </span>
                <span>
                  <small><LocalizedText source={"Harvest"} /></small>
                  <b><LocalizedText source={"{0}"} values={[s.harvest || "Latest harvest"]} /></b>
                </span>
                <span>
                  <small><LocalizedText source={"Delivery"} /></small>
                  <b><LocalizedText source={"{0}"} values={[s.delivery]} /></b>
                </span>
                <span>
                  <small><LocalizedText source={"Reliability"} /></small>
                  <b>
                    <Star /><LocalizedText source={" {0}% "} values={[s.reliability]} /></b>
                </span>
              </div>
              {i === 0 && (
                <div className="best">
                  <Sparkles /><LocalizedText source={" Best landed cost · est. ₹28.80/kg "} /></div>
              )}
              {i === 2 && (
                <div className="best quality-best">
                  <ShieldCheck /><LocalizedText source={" Best quality · 97% freshness "} /></div>
              )}
              <div className="seller-actions">
                <Button
                  variant="outline"
                  onClick={() => openFarmer(s.farmerId)}
                ><LocalizedText source={" View farmer "} /></Button>
                <Button onClick={() => createOrder(s)}><LocalizedText source={"Create order"} /></Button>
              </div>
            </div>
          </article>
        ))}
      </section>
      {selected.length > 0 && (
        <div className="compare-dock">
          <span>
            <b><LocalizedText source={"{0} sellers selected"} values={[selected.length]} /></b>
            <small><LocalizedText source={"Select at least 2 to compare landed cost"} /></small>
          </span>
          <Button
            disabled={selected.length < 2}
            onClick={() => setShowComparison(true)}
          ><LocalizedText source={" Compare sellers "} /><ArrowRight />
          </Button>
        </div>
      )}
      {showComparison &&
        createPortal(
          <div
            className="comparison-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Seller comparison"
            onClick={() => setShowComparison(false)}
          >
            <section
              className="comparison-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close seller comparison"
                className="comparison-close"
                onClick={() => setShowComparison(false)}
              >
                <X />
              </button>
              <span className="eyebrow"><LocalizedText source={"Side-by-side supplier comparison"} /></span>
              <h2><LocalizedText source={"Compare selected produce"} /></h2>
              <p><LocalizedText source={" Price, freshness, reliability, distance, and estimated landed cost from the selected listings. "} /></p>
              <div className="comparison-grid">
                {liveSellers
                  .filter((s) => selected.includes(s.id))
                  .map((s) => (
                    <article key={s.id}>
                      <img src={s.image} alt={s.crop} />
                      <h3><LocalizedText source={"{0}"} values={[s.crop]} /></h3>
                      <small><LocalizedText source={" {0} · Sold by {1} "} values={[s.variety, s.name]} /><br /><LocalizedText source={" {0} "} values={[s.location]} /></small>
                      <dl>
                        <div>
                          <dt><LocalizedText source={"Farmer price"} /></dt>
                          <dd><LocalizedText source={"₹{0}/kg"} values={[s.price]} /></dd>
                        </div>
                        <div>
                          <dt><LocalizedText source={"Est. landed cost"} /></dt>
                          <dd><LocalizedText source={" ₹ {0} /kg "} values={[(
                              s.price + Math.max(1.2, s.distance * 0.025)
                            ).toFixed(2)]} /></dd>
                        </div>
                        <div>
                          <dt><LocalizedText source={"Freshness"} /></dt>
                          <dd><LocalizedText source={"{0}%"} values={[s.freshness]} /></dd>
                        </div>
                        <div>
                          <dt><LocalizedText source={"Reliability"} /></dt>
                          <dd><LocalizedText source={"{0}%"} values={[s.reliability]} /></dd>
                        </div>
                        <div>
                          <dt><LocalizedText source={"Distance"} /></dt>
                          <dd><LocalizedText source={"{0} km"} values={[s.distance]} /></dd>
                        </div>
                        <div>
                          <dt><LocalizedText source={"Available"} /></dt>
                          <dd><LocalizedText source={"{0} kg"} values={[s.quantity.toLocaleString("en-IN")]} /></dd>
                        </div>
                      </dl>
                    </article>
                  ))}
              </div>
              <Button onClick={() => setShowComparison(false)}><LocalizedText source={"Done"} /></Button>
            </section>
          </div>,
          portalTarget,
        )}
      {farmerDetail &&
        createPortal(
          <div
            className="comparison-overlay"
            onClick={() => setFarmerDetail(null)}
          >
            <section
              className="farmer-detail-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="comparison-close"
                onClick={() => setFarmerDetail(null)}
              >
                <X />
              </button>
              <span className="eyebrow"><LocalizedText source={"Verified farmer profile"} /></span>
              <h2><LocalizedText source={"{0}"} values={[farmerDetail.farmer.name]} /></h2>
              <p>
                <MapPin /><LocalizedText source={" {0},  {1}, {2} "} values={[farmerDetail.farmer.village, farmerDetail.farmer.district, farmerDetail.farmer.state]} /></p>
              <div className="farmer-detail-grid">
                {farmerDetail.farms.map((farm: any) => (
                  <article key={farm.farm_id}>
                    <small><LocalizedText source={"{0}"} values={[farm.farm_name]} /></small>
                    <b><LocalizedText source={"{0} acres"} values={[farm.area_acres]} /></b>
                    <span><LocalizedText source={" {0} irrigation · Soil pH  {1} "} values={[farm.irrigation_type, farm.ph ?? "—"]} /></span>
                    <span><LocalizedText source={" N {0} · P {1} · K  {2} "} values={[farm.nitrogen ?? "—", farm.phosphorus ?? "—", farm.potassium ?? "—"]} /></span>
                  </article>
                ))}
              </div>
              <h3><LocalizedText source={"Available produce"} /></h3>
              {farmerDetail.listings.length ? (
                farmerDetail.listings.map((listing: any) => (
                  <div className="farmer-listing-row" key={listing.listing_id}>
                    <b><LocalizedText source={" {0} · {1} "} values={[listing.crop_name, listing.crop_variety]} /></b>
                    <span><LocalizedText source={" {0}  kg "} values={[Number(listing.available_quantity_kg).toLocaleString(
                        "en-IN",
                      )]} /></span>
                    <strong><LocalizedText source={"₹{0}/kg"} values={[listing.price_per_kg]} /></strong>
                  </div>
                ))
              ) : (
                <p><LocalizedText source={"No active listings."} /></p>
              )}
              <Button
                onClick={() => {
                  setFarmerDetail(null);
                  setRequirementOpen(true);
                }}
              ><LocalizedText source={" Post requirement for this farmer "} /></Button>
            </section>
          </div>,
          portalTarget,
        )}
      {requirementOpen &&
        createPortal(
          <div
            className="comparison-overlay"
            onClick={() => setRequirementOpen(false)}
          >
            <section
              className="requirement-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="comparison-close"
                onClick={() => setRequirementOpen(false)}
              >
                <X />
              </button>
              <span className="eyebrow"><LocalizedText source={"Buyer requirement"} /></span>
              <h2><LocalizedText source={"Post a produce requirement"} /></h2>
              {requirementSent ? (
                <div className="requirement-success">
                  <CheckCircle2 />
                  <b><LocalizedText source={"Requirement posted"} /></b>
                  <p><LocalizedText source={"Matching farmers will appear in your procurement plan."} /></p>
                  <Button onClick={() => setRequirementOpen(false)}><LocalizedText source={" Done "} /></Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRequirementSent(true);
                  }}
                >
                  <label><LocalizedText source={" Crop "} /><input required placeholder="Tomato, onion, wheat…" />
                  </label>
                  <label><LocalizedText source={" Quantity (kg) "} /><input required type="number" min="1" placeholder="1000" />
                  </label>
                  <label><LocalizedText source={" Maximum price per kg "} /><input required type="number" min="1" placeholder="30" />
                  </label>
                  <label><LocalizedText source={" Delivery location "} /><input required placeholder="Mumbai warehouse" />
                  </label>
                  <Button type="submit"><LocalizedText source={" Find matching farmers "} /><ArrowRight />
                  </Button>
                </form>
              )}
            </section>
          </div>,
          portalTarget,
        )}
    </div>
  );
}

function SmartPlan() {
  const [method, setMethod] = useState<"clubbed" | "direct">("clubbed");
  const logistics = method === "clubbed" ? 8500 : 14000;
  return (
    <div className="page">
      <Heading
        title="Smart procurement plan"
        copy="One requirement, three verified sellers, one coordinated delivery."
      >
        <Badge className="verified">
          <ShieldCheck /><LocalizedText source={" Plan verified "} /></Badge>
      </Heading>
      <section className="plan-hero">
        <div>
          <span className="ai">
            <Sparkles /><LocalizedText source={" Recommended plan "} /></span>
          <h2><LocalizedText source={"Club 3 nearby sellers and save ₹13,000 on logistics."} /></h2>
          <p><LocalizedText source={" Waiting 9 hours reduces logistics cost with low projected freshness risk. "} /></p>
        </div>
        <div>
          <small><LocalizedText source={"Expected landed cost"} /></small>
          <strong><LocalizedText source={" ₹{0} "} values={[method === "clubbed" ? "28.70" : "30.10"]} /><em><LocalizedText source={"/kg"} /></em>
          </strong>
          <span><LocalizedText source={"₹2,87,000 total"} /></span>
        </div>
      </section>
      <section className="plan-grid">
        <article className="panel allocation">
          <PanelTitle
            eyebrow="Quantity engine"
            title="Seller allocation"
            badge="10T / 10T matched"
          />
          {sellers.map((s, i) => (
            <div className="alloc" key={s.id}>
              <span><LocalizedText source={"0{0}"} values={[i + 1]} /></span>
              <div>
                <b><LocalizedText source={"{0}"} values={[s.name]} /></b>
                <small><LocalizedText source={" {0} · {1}% fresh "} values={[s.location, s.freshness]} /></small>
              </div>
              <div>
                <b><LocalizedText source={"{0}T"} values={[s.quantity / 1000]} /></b>
                <small><LocalizedText source={"₹{0}/kg"} values={[s.price]} /></small>
              </div>
            </div>
          ))}
        </article>
        <article className="panel economics">
          <PanelTitle eyebrow="Landed cost engine" title="Complete economics" />
          <dl>
            <div>
              <dt><LocalizedText source={"Commodity cost"} /></dt>
              <dd>₹2,70,400</dd>
            </div>
            <div>
              <dt><LocalizedText source={"Transportation"} /></dt>
              <dd><LocalizedText source={"₹{0}"} values={[logistics.toLocaleString("en-IN")]} /></dd>
            </div>
            <div>
              <dt><LocalizedText source={"Handling & packaging"} /></dt>
              <dd>₹4,600</dd>
            </div>
            <div>
              <dt><LocalizedText source={"Expected spoilage"} /></dt>
              <dd>₹3,500</dd>
            </div>
            <div>
              <dt><LocalizedText source={"Expected landed cost"} /></dt>
              <dd><LocalizedText source={"₹{0}"} values={[(278500 + logistics).toLocaleString("en-IN")]} /></dd>
            </div>
          </dl>
        </article>
      </section>
      <section className="shipment-choice">
        <PanelTitle
          eyebrow="Shipment decision"
          title="Choose speed or savings"
        />
        <div className="choices">
          <Choice
            chosen={method === "direct"}
            onClick={() => setMethod("direct")}
            icon={Zap}
            overline="Direct shipment"
            title="Fastest delivery"
            copy="Dedicated pickup with the lowest waiting time."
            data={[
              ["Delivery", "Today, 7 PM"],
              ["Logistics", "₹14,000"],
              ["Landed cost", "₹30.10/kg"],
            ]}
          />
          <Choice
            chosen={method === "clubbed"}
            recommended
            onClick={() => setMethod("clubbed")}
            icon={Truck}
            overline="Clubbed shipment"
            title="Best landed cost"
            copy="Consolidated pickup. +9 hours, low freshness risk."
            data={[
              ["Delivery", "Tomorrow, 2–4 PM"],
              ["Logistics", "₹8,500"],
              ["You save", "₹5,500"],
            ]}
          />
        </div>
        <div className="risk">
          <ShieldCheck />
          <span>
            <b><LocalizedText source={"Consolidation recommended"} /></b>
            <small><LocalizedText source={" Waiting 9 hours reduces cost while projected arrival freshness remains “Fresh”. "} /></small>
          </span>
          <Button><LocalizedText source={" Continue with {0} "} values={[method]} /><ArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}
function Choice({
  chosen,
  recommended,
  onClick,
  icon: Icon,
  overline,
  title,
  copy,
  data,
}: {
  chosen: boolean;
  recommended?: boolean;
  onClick: () => void;
  icon: typeof Zap;
  overline: string;
  title: string;
  copy: string;
  data: string[][];
}) {
  return (
    <button className={chosen ? "chosen" : ""} onClick={onClick}>
      {recommended && <Badge><LocalizedText source={"Recommended"} /></Badge>}
      <span className="choice-icon">
        <Icon />
      </span>
      <div>
        <span><LocalizedText source={"{0}"} values={[overline]} /></span>
        <h3><LocalizedText source={"{0}"} values={[title]} /></h3>
        <p><LocalizedText source={"{0}"} values={[copy]} /></p>
      </div>
      <dl>
        {data.map(([a, b]) => (
          <div key={a}>
            <dt><LocalizedText source={"{0}"} values={[a]} /></dt>
            <dd><LocalizedText source={"{0}"} values={[b]} /></dd>
          </div>
        ))}
      </dl>
    </button>
  );
}

function TrackingMap({ delayed }: { delayed: boolean }) {
  const mapNode = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mapNode.current) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !mapNode.current) return;
      const origin: [number, number] = delayed
        ? [20.148, 74.24]
        : [20.011, 73.79];
      const current: [number, number] = delayed
        ? [19.916, 73.84]
        : [19.696, 73.56];
      const destination: [number, number] = [19.076, 72.877];
      const routePoints: [number, number][] = delayed
        ? [
            origin,
            [20.04, 74.08],
            current,
            [19.62, 73.42],
            [19.31, 73.08],
            destination,
          ]
        : [
            origin,
            [19.91, 73.72],
            current,
            [19.53, 73.37],
            [19.31, 73.08],
            destination,
          ];
      map = L.map(mapNode.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.polyline(routePoints, {
        color: "#EAE7DD",
        weight: 5,
        opacity: 0.95,
      }).addTo(map);
      L.polyline(
        routePoints.slice(routePoints.findIndex((p) => p === current)),
        { color: "#EAE7DD", weight: 5, dashArray: "7 8", opacity: 0.95 },
      ).addTo(map);
      const marker = (pos: [number, number], kind: string, label: string) =>
        L.marker(pos, {
          icon: L.divIcon({
            className: "passport-map-marker",
            html: `<span class="${kind}"></span><b>${label}</b>`,
            iconSize: [110, 38],
            iconAnchor: [18, 18],
          }),
        }).addTo(map!);
      marker(origin, "origin", "Pickup");
      marker(current, delayed ? "truck delayed" : "truck", "Current location");
      marker(destination, "destination", "Mehta Foods");
      map.fitBounds(L.latLngBounds(routePoints).pad(0.16));
      setTimeout(() => map?.invalidateSize(), 80);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [delayed]);
  return (
    <div
      ref={mapNode}
      className="tracking-map"
      aria-label="Interactive live shipment tracking map"
    />
  );
}

function DigitalPassport({ id, close }: { id: string; close: () => void }) {
  const delayed = id === "SHP-2043";
  const shipment = delayed
    ? {
        produce: "Red Onion",
        variety: "Nashik Red · Grade A",
        qty: "2,500 kg",
        seller: "Lasalgaon Farmer Producer Co.",
        origin: "Lasalgaon, Nashik",
        current: "Kasara, Maharashtra",
        truck: "MH-15-HH-2841",
        driver: "Suresh Patil",
        eta: "Today, 4:45 PM",
        remaining: "87 km",
        status: "Delayed 35m",
        freshness: "Fresh · Level 2",
        confidence: "89%",
        risk: "Moderate",
      }
    : id === "SHP-2050"
      ? {
          produce: "Orange",
          variety: "Nagpur Mandarin · Grade A",
          qty: "3,200 kg",
          seller: "Vijay Deshmukh · Katol Citrus Grove",
          origin: "Katol, Nagpur",
          current: "Amravati Highway, Maharashtra",
          truck: "MH-31-FQ-1902",
          driver: "Amit Deshmukh",
          eta: "Tomorrow, 8:30 AM",
          remaining: "612 km",
          status: "Dispatched",
          freshness: "Very fresh · Level 1",
          confidence: "96%",
          risk: "Low",
        }
      : {
          produce: "Tomato",
          variety: "Arka Rakshak · Grade A",
          qty: "4,000 kg",
          seller: "Nashik Fresh Collective",
          origin: "Pimpalgaon, Nashik",
          current: "Igatpuri, Maharashtra",
          truck: "MH-04-KU-8824",
          driver: "Rahul Jadhav",
          eta: "Today, 2:10 PM",
          remaining: "112 km",
          status: "In transit",
          freshness: "Very fresh · Level 1",
          confidence: "94%",
          risk: "Low",
        };
  const events = delayed
    ? [
        ["12:04 PM", "Traffic delay detected", "Current"],
        ["11:45 AM", "Crossed Ghoti checkpoint", "Done"],
        ["10:30 AM", "Vehicle departed Lasalgaon", "Done"],
        ["10:22 AM", "Dispatch verification completed", "Done"],
        ["10:05 AM", "Produce collected", "Done"],
      ]
    : [
        ["12:04 PM", "Crossed Igatpuri checkpoint", "Current"],
        ["11:45 AM", "Temperature check · 18.4°C", "Done"],
        ["10:30 AM", "Vehicle departed Pimpalgaon", "Done"],
        ["10:22 AM", "Dispatch verification completed", "Done"],
        ["10:05 AM", "Produce collected", "Done"],
      ];
  return (
    <section
      className="passport-screen"
      role="dialog"
      aria-modal="true"
      aria-label={`Digital produce passport ${id}`}
    >
      <header className="passport-top">
        <button onClick={close}>
          <ArrowLeft /><LocalizedText source={" Back to dashboard "} /></button>
        <Brand />
        <div>
          <span className="live-dot">
            <i /><LocalizedText source={" Live tracking "} /></span>
          <button onClick={close} aria-label="Close passport">
            <X />
          </button>
        </div>
      </header>
      <div className="passport-page">
        <section className="passport-heading">
          <div>
            <span className="eyebrow"><LocalizedText source={"Digital produce passport"} /></span>
            <h1><LocalizedText source={" {0} · {1} "} values={[shipment.produce, shipment.qty]} /></h1>
            <p><LocalizedText source={" {0} · Order ORD-{1} · Updated just now "} values={[id, id.slice(-4)]} /></p>
          </div>
          <div className="passport-badges">
            <Badge>
              <ShieldCheck /><LocalizedText source={" AI verified "} /></Badge>
            <Badge>
              <FileCheck2 /><LocalizedText source={" FPO verified "} /></Badge>
            <Badge>
              <CheckCircle2 /><LocalizedText source={" Dispatch verified "} /></Badge>
          </div>
        </section>
        <section className="passport-hero">
          <div className="passport-id">
            <div
              className={`passport-photo ${delayed ? "passport-onion" : "passport-tomato"}`}
            >
              <span><LocalizedText source={"{0}"} values={[shipment.freshness]} /></span>
            </div>
            <div className="passport-copy">
              <span><LocalizedText source={"Shipment passport"} /></span>
              <h2><LocalizedText source={"{0}"} values={[id]} /></h2>
              <p><LocalizedText source={"Authenticated farm-to-buyer record"} /></p>
              <div className="passport-chips">
                <span>
                  <Leaf /><LocalizedText source={" Grade A "} /></span>
                <span>
                  <ThermometerSun /><LocalizedText source={" {0} AI confidence "} values={[shipment.confidence]} /></span>
                <span>
                  <CalendarDays /><LocalizedText source={" Harvested today "} /></span>
              </div>
            </div>
            <div className="qr">
              <QrCode />
              <small><LocalizedText source={"Scan passport"} /></small>
              <b><LocalizedText source={"AO-{0}-09"} values={[id.slice(-4)]} /></b>
            </div>
          </div>
          <div className="passport-summary">
            <div>
              <span><LocalizedText source={"Shipment status"} /></span>
              <b className={delayed ? "warning" : ""}>
                <i /><LocalizedText source={" {0} "} values={[shipment.status]} /></b>
            </div>
            <div>
              <span><LocalizedText source={"Current location"} /></span>
              <b><LocalizedText source={"{0}"} values={[shipment.current]} /></b>
            </div>
            <div>
              <span><LocalizedText source={"Expected arrival"} /></span>
              <b><LocalizedText source={"{0}"} values={[shipment.eta]} /></b>
            </div>
            <div>
              <span><LocalizedText source={"Freshness risk"} /></span>
              <b><LocalizedText source={"{0}"} values={[shipment.risk]} /></b>
            </div>
          </div>
        </section>
        <section className="tracking-layout">
          <article className="map-card">
            <div className="map-head">
              <div>
                <span className="eyebrow"><LocalizedText source={"Live GPS position"} /></span>
                <h2><LocalizedText source={"Nashik → Mumbai warehouse"} /></h2>
              </div>
              <span className="map-updated">
                <i /><LocalizedText source={" Updated 24 sec ago "} /></span>
            </div>
            <TrackingMap delayed={delayed} />
            <div className="map-stats">
              <span>
                <Navigation />
                <small><LocalizedText source={"Current"} /></small>
                <b><LocalizedText source={"{0}"} values={[shipment.current]} /></b>
              </span>
              <span>
                <Route />
                <small><LocalizedText source={"Remaining"} /></small>
                <b><LocalizedText source={"{0} · 2h 06m"} values={[shipment.remaining]} /></b>
              </span>
              <span>
                <Warehouse />
                <small><LocalizedText source={"Destination"} /></small>
                <b><LocalizedText source={"Mehta Foods, Vashi"} /></b>
              </span>
              <span>
                <Clock3 />
                <small><LocalizedText source={"ETA"} /></small>
                <b><LocalizedText source={"{0}"} values={[shipment.eta]} /></b>
              </span>
            </div>
          </article>
          <aside className="timeline-card">
            <div className="timeline-head">
              <span className="eyebrow"><LocalizedText source={"Live events"} /></span>
              <h2><LocalizedText source={"Shipment timeline"} /></h2>
            </div>
            <div className="live-events">
              {events.map(([time, label, state], index) => (
                <div
                  className={state === "Current" ? "current" : ""}
                  key={label}
                >
                  <span>{state === "Current" ? <Truck /> : <Check />}</span>
                  <div>
                    <b><LocalizedText source={"{0}"} values={[label]} /></b>
                    <small><LocalizedText source={" {0} {1} "} values={[time, index === 0 ? " · Live" : ""]} /></small>
                  </div>
                </div>
              ))}
            </div>
            <div className={`freshness-alert ${delayed ? "moderate" : ""}`}>
              <ThermometerSun />
              <div>
                <span><LocalizedText source={"Projected arrival freshness"} /></span>
                <b><LocalizedText source={"{0}"} values={[delayed ? "Fresh · Level 2" : "Fresh · Level 2"]} /></b>
                <small><LocalizedText source={" {0} "} values={[delayed
                    ? "Delay is being monitored; cold-chain remains stable."
                    : "Low risk. Expected quality change: −1 freshness level."]} /></small>
              </div>
            </div>
          </aside>
        </section>
        <section className="passport-details">
          <article className="detail-card">
            <PanelTitle eyebrow="Shipment details" title="Origin & transport" />
            <dl>
              <div>
                <dt><LocalizedText source={"Farmer / FPO"} /></dt>
                <dd><LocalizedText source={"{0}"} values={[shipment.seller]} /></dd>
              </div>
              <div>
                <dt><LocalizedText source={"Farm origin"} /></dt>
                <dd><LocalizedText source={"{0}"} values={[shipment.origin]} /></dd>
              </div>
              <div>
                <dt><LocalizedText source={"Harvest date"} /></dt>
                <dd><LocalizedText source={"1 Sep 2026 · 5:30 AM"} /></dd>
              </div>
              <div>
                <dt><LocalizedText source={"Quantity dispatched"} /></dt>
                <dd><LocalizedText source={"{0}"} values={[shipment.qty]} /></dd>
              </div>
              <div>
                <dt><LocalizedText source={"Vehicle"} /></dt>
                <dd><LocalizedText source={"{0}"} values={[shipment.truck]} /></dd>
              </div>
              <div>
                <dt><LocalizedText source={"Driver"} /></dt>
                <dd><LocalizedText source={"{0}"} values={[shipment.driver]} /></dd>
              </div>
            </dl>
          </article>
          <article className="detail-card">
            <PanelTitle
              eyebrow="Quality intelligence"
              title="Dispatch verification"
            />
            <div className="quality-comparison">
              <div>
                <span><LocalizedText source={"Dispatch quality"} /></span>
                <strong><LocalizedText source={"Level 1"} /></strong>
                <b><LocalizedText source={"Very fresh"} /></b>
                <small><LocalizedText source={"AI confidence · {0}"} values={[shipment.confidence]} /></small>
              </div>
              <ArrowRight />
              <div>
                <span><LocalizedText source={"Projected arrival"} /></span>
                <strong><LocalizedText source={"Level 2"} /></strong>
                <b><LocalizedText source={"Fresh"} /></b>
                <small><LocalizedText source={"Change · −1 level"} /></small>
              </div>
            </div>
            <div className="acceptance">
              <ShieldCheck />
              <span>
                <b><LocalizedText source={"Auto-accept eligible"} /></b>
                <small><LocalizedText source={" Projected quality remains within your Grade A tolerance. "} /></small>
              </span>
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}

const buyerOrders = [
  {
    id: "ORD-2041",
    shipment: "SHP-2041",
    crop: "Orange (Kinnow)",
    qty: "4,799 kg",
    supplier: "Ramesh Prajapati · Chandraganj",
    status: "In transit",
    eta: "Today, 2:10 PM",
    amount: "₹1,31,110",
  },
];

function useBuyerOrders(buyer: string) {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    const load = () =>
      fetch(
        `${API}/trade/orders?buyer_id=${encodeURIComponent(buyer)}`,
      )
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setOrders(d.orders || []))
        .catch(() => setOrders([]));
    load();
    window.addEventListener("agrioptima-order-change", load);
    return () => window.removeEventListener("agrioptima-order-change", load);
  }, [buyer]);
  return orders;
}
function OrdersPage({
  buyer,
  openPassport,
}: {
  buyer: string;
  openPassport: (id: string) => void;
}) {
  const orders = useBuyerOrders(buyer);
  return (
    <div className="page">
      <Heading
        title="Orders"
        copy="Track the same saved order and shipment record visible to the farmer."
      />
      <section className="order-list">
        {orders.map((order) => (
          <button
            key={order.id}
            className="order-row"
            onClick={() => openPassport(order.shipment?.id)}
          >
            <span className="produce onion" />
            <span>
              <small><LocalizedText source={"{0}"} values={[order.id]} /></small>
              <b><LocalizedText source={" {0} kg  {1} "} values={[Number(order.quantity_kg).toLocaleString("en-IN"), order.crop]} /></b>
              <small><LocalizedText source={" {0} · {1} "} values={[order.farmer_id, order.shipment?.origin]} /></small>
            </span>
            <span>
              <small><LocalizedText source={"Order value"} /></small>
              <b><LocalizedText source={"₹{0}"} values={[Number(order.total_amount).toLocaleString("en-IN")]} /></b>
            </span>
            <span>
              <small><LocalizedText source={"Status"} /></small>
              <b><LocalizedText source={" {0} "} values={[String(order.shipment?.status || order.status).replaceAll(
                  "_",
                  " ",
                )]} /></b>
              <small><LocalizedText source={"{0}"} values={[order.shipment?.eta]} /></small>
            </span>
            <ArrowRight />
          </button>
        ))}
      </section>
    </div>
  );
}

function PassportsPage({
  buyer,
  openPassport,
}: {
  buyer: string;
  openPassport: (id: string) => void;
}) {
  const orders = useBuyerOrders(buyer);
  return (
    <div className="page">
      <Heading
        title="Produce passports"
        copy="Review current shipment passports and verify received quality with the freshness engine."
      />
      <section className="passport-order-grid">
        {orders.map((order) => (
          <article key={order.id} className="passport-order-card">
            <span className="eyebrow"><LocalizedText source={"Digital produce passport"} /></span>
            <h2><LocalizedText source={" {0} · {1}  kg "} values={[order.crop, Number(order.quantity_kg).toLocaleString("en-IN")]} /></h2>
            <p><LocalizedText source={" {0} · {1} "} values={[order.shipment?.id, order.farmer_id]} /></p>
            <div>
              <Badge>
                <ShieldCheck /><LocalizedText source={"  {0} "} values={[order.passport?.dispatch_verified
                  ? "Dispatch verified"
                  : "Awaiting dispatch check"]} /></Badge>
              <Badge variant="outline"><LocalizedText source={" {0} "} values={[String(order.shipment?.status || order.status).replaceAll(
                  "_",
                  " ",
                )]} /></Badge>
            </div>
            <Button onClick={() => openPassport(order.shipment?.id)}><LocalizedText source={" Open passport & tracking "} /><ArrowRight />
            </Button>
          </article>
        ))}
      </section>
      <section className="connected-engine">
        <div>
          <span className="eyebrow"><LocalizedText source={"Receiving quality verification"} /></span>
          <h2><LocalizedText source={"Upload received produce images"} /></h2>
          <p><LocalizedText source={" The trained freshness engine grades the received shipment and provides confidence evidence before acceptance. "} /></p>
        </div>
        <FreshnessPanel />
      </section>
    </div>
  );
}

function CreditEnginePage() {
  return (
    <div className="page">
      <Heading
        title="Credit"
        copy="Live procurement-credit scores, limits, repayment behaviour, and risk evidence."
      />
      <section className="connected-engine">
        <CreditPanel />
      </section>
    </div>
  );
}
function SupplierLogisticsPage() {
  return (
    <div className="page">
      <Heading
        title="Suppliers & logistics"
        copy="Use connected farmer pickups to compare direct, pooled, and collection-hub landed cost."
      />
      <section className="connected-engine">
        <LogisticsOptimizerPanel />
      </section>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="page">
      <Heading
        title={title}
        copy="This workspace is connected to your complete procurement journey."
      />
      <section className="empty">
        <span>
          <PackageCheck />
        </span>
        <h2><LocalizedText source={"{0} is ready for your demo journey"} values={[title]} /></h2>
        <p><LocalizedText source={" Open Marketplace to select verified farmers and build a consolidated produce sourcing plan. "} /></p>
        <Button variant="outline"><LocalizedText source={"Explore sample records"} /></Button>
      </section>
    </div>
  );
}
function Negotiation({ seller, close }: { seller: Seller; close: () => void }) {
  const min =
    seller.price < 30
      ? seller.price - 5
      : seller.price < 100
        ? seller.price - 10
        : seller.price - Math.min(seller.price * 0.2, 50);
  const [offer, setOffer] = useState(seller.price - 2);
  const saving = (seller.price - offer) * seller.quantity;
  return (
    <div className="modal-bg" onMouseDown={close}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow"><LocalizedText source={"Controlled negotiation"} /></span>
            <h2><LocalizedText source={"Send an offer to {0}"} values={[seller.name]} /></h2>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <div className="quote">
          <span>
            <small><LocalizedText source={"Seller price"} /></small>
            <b><LocalizedText source={"₹{0}/kg"} values={[seller.price]} /></b>
          </span>
          <span>
            <small><LocalizedText source={"Quantity"} /></small>
            <b><LocalizedText source={"{0} kg"} values={[seller.quantity.toLocaleString("en-IN")]} /></b>
          </span>
          <span>
            <small><LocalizedText source={"Allowed range"} /></small>
            <b><LocalizedText source={" ₹{0}–₹{1} "} values={[min.toFixed(1), seller.price]} /></b>
          </span>
        </div>
        <div className="offer">
          <div>
            <span><LocalizedText source={"Your offer"} /></span>
            <strong><LocalizedText source={" ₹{0} "} values={[offer.toFixed(2)]} /><small><LocalizedText source={"/kg"} /></small>
            </strong>
          </div>
          <input
            type="range"
            min={min}
            max={seller.price}
            step=".1"
            value={offer}
            onChange={(e) => setOffer(Number(e.target.value))}
          />
          <p>
            <span><LocalizedText source={"₹{0} minimum"} values={[min.toFixed(1)]} /></span>
            <span><LocalizedText source={"₹{0} seller price"} values={[seller.price]} /></span>
          </p>
        </div>
        <div className="saving">
          <span>
            <small><LocalizedText source={"Saving per kg"} /></small>
            <b><LocalizedText source={"₹{0}"} values={[(seller.price - offer).toFixed(2)]} /></b>
          </span>
          <span>
            <small><LocalizedText source={"Total potential saving"} /></small>
            <b><LocalizedText source={"₹{0}"} values={[saving.toLocaleString("en-IN")]} /></b>
          </span>
          <span>
            <small><LocalizedText source={"Est. landed cost"} /></small>
            <b><LocalizedText source={"₹{0}/kg"} values={[(offer + 1.8).toFixed(2)]} /></b>
          </span>
        </div>
        <div className="guard">
          <ShieldCheck />
          <span>
            <b><LocalizedText source={"Fair-price guardrail active"} /></b>
            <small><LocalizedText source={" Offers below ₹{0}/kg are blocked for this commodity band. "} values={[min.toFixed(1)]} /></small>
          </span>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={close}><LocalizedText source={" Cancel "} /></Button>
          <Button onClick={close}><LocalizedText source={" Send offer "} /><ArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function BuyerExactContent({
  onHome,
  onFarmer,
}: {
  onHome: () => void;
  onFarmer: () => void;
}) {
  const [active, setActive] = useState("Overview");
  const [buyers, setBuyers] = useState<string[]>([]);
  const [buyer, setBuyer] = useState(
    () => localStorage.getItem("agrioptima_buyer_id") || "BUYER_0002",
  );
  const [buyerProfile, setBuyerProfile] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [passport, setPassport] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    fetch(`${API}/credit/buyers`)
      .then((r) => r.json())
      .then((d) => {
        const available: string[] = d.buyers || [];
        setBuyers(available);
        if (available.length && !available.includes(buyer))
          changeBuyer(available[0]);
      })
      .catch(() => setBuyers([]));
  }, []);
  useEffect(() => {
    fetch(`${API}/credit/buyer/${buyer}/profile`)
      .then((r) => r.json())
      .then(setBuyerProfile)
      .catch(() => setBuyerProfile(null));
  }, [buyer]);
  const changeBuyer = (id: string) => {
    setBuyer(id);
    setSelected([]);
    setPassport(null);
    localStorage.setItem("agrioptima_buyer_id", id);
    window.dispatchEvent(
      new CustomEvent("agrioptima-buyer-change", { detail: id }),
    );
  };
  let content: React.ReactNode;
  if (active === "Overview")
    content = (
      <Overview
        market={() => setActive("Marketplace")}
        plan={() => setActive("Smart procurement")}
        openShipment={setPassport}
        buyer={buyer}
      />
    );
  else if (active === "Marketplace")
    content = (
      <Marketplace
        buyer={buyer}
        selected={selected}
        toggle={(id) =>
          setSelected((v) =>
            v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
          )
        }
      />
    );
  else if (active === "Smart procurement") content = <SmartPlan />;
  else if (active === "Orders")
    content = <OrdersPage buyer={buyer} openPassport={setPassport} />;
  else if (active === "Produce passports")
    content = <PassportsPage buyer={buyer} openPassport={setPassport} />;
  else if (active === "Credit") content = <CreditEnginePage />;
  else if (active === "Suppliers") content = <SupplierLogisticsPage />;
  else content = <Placeholder title={active} />;
  return (
    <main className="app">
      <Sidebar
        active={active}
        setActive={setActive}
        open={menu}
        close={() => setMenu(false)}
        buyer={buyer}
        availableCredit={Number(buyerProfile?.score?.available_limit || 0)}
      />
      <div className="main">
        <Header
          menu={() => setMenu(true)}
          onHome={onHome}
          onFarmer={onFarmer}
          buyer={buyer}
          buyers={buyers}
          changeBuyer={changeBuyer}
        />
        <div key={buyer}><LocalizedText source={"{0}"} values={[content]} /></div>
      </div>
      {menu && <button className="overlay" onClick={() => setMenu(false)} />}{" "}
      {passport && (
        <DigitalPassport id={passport} close={() => setPassport(null)} />
      )}
    </main>
  );
}
