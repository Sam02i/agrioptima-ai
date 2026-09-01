import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
type Farmer = { farmer_id: string; name: string; state: string; district: string; village: string; preferred_language: string; profile_status: string; farm_count: number; listing_count: number; total_area_acres: number; crops: string[] };
type Listing = { listing_id: string; farmer_id: string; farmer_name: string; crop_name: string; crop_variety: string; available_quantity_kg: number; price_per_kg: number; minimum_order_quantity_kg: number; harvest_date?: string; expected_harvest_date?: string; declared_grade: string; packaging_type?: string; district: string; state: string; image_data?: string };
type Detail = { farmer: Farmer; farms: Array<Record<string, string | number | null>>; needs: Record<string, string | number | boolean | null> | null; listings: Listing[] };

export default function FarmerMarketplace({ mode }: { mode: "farmers" | "marketplace" }) {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [crop, setCrop] = useState("All");
  const [error, setError] = useState("");
  const [mandi,setMandi]=useState<Array<{market:string;district:string;modal_price:number;arrival_date?:string}>>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/marketplace/farmers`).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`${API}/marketplace/listings`).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([f, l]) => { setFarmers(f.farmers || []); setListings(l.listings || []); }).catch(() => setError("Farmer marketplace data is unavailable. Restart the backend and try again."));
  }, []);
  useEffect(()=>{const commodity=crop==="All"?(listings[0]?.crop_name||"Tomato"):crop;if(!commodity)return;fetch(`${API}/marketplace/mandi-prices?crop=${encodeURIComponent(commodity)}`).then(r=>r.ok?r.json():Promise.reject()).then(d=>setMandi(d.prices||[])).catch(()=>setMandi([]))},[crop,listings]);

  const openFarmer = async (id: string) => {
    const response = await fetch(`${API}/marketplace/farmers/${id}`);
    if (response.ok) setSelected(await response.json());
  };
  const crops = ["All", ...Array.from(new Set(listings.map((item) => item.crop_name)))];
  const shown = crop === "All" ? listings : listings.filter((item) => item.crop_name === crop);

  if (error) return <div className="demo-panel text-sm text-red-600">{error}</div>;
  return <div className="space-y-5">
    {mode === "marketplace" && <>
      <div className="market-filter"><div><b>Verified produce marketplace</b><small>{listings.length} available listings from {farmers.length} farmers</small></div><div>{crops.map((item) => <button key={item} onClick={() => setCrop(item)} className={crop === item ? "active" : ""}>{item}</button>)}</div></div>
      <section className="mandi-strip"><div><b>Latest mandi prices</b><small>AGMARKNET data · price per kg</small></div>{mandi.length?mandi.slice(0,4).map((m,i)=><article key={`${m.market}-${i}`}><small>{m.market||m.district}</small><b>₹{(Number(m.modal_price)/100).toFixed(2)}/kg</b><span>{m.arrival_date||"Latest available"}</span></article>):<p>Live mandi data is unavailable; farmer prices remain visible below.</p>}</section>
      <div className="listing-grid">{shown.map((listing) => <article key={listing.listing_id} className="listing-card"><div className="produce-visual">{listing.image_data?<img src={listing.image_data} alt={`${listing.crop_name} listed by ${listing.farmer_name}`} onError={e=>{e.currentTarget.style.display="none"}}/>:<span>{listing.crop_name === "Tomato" ? "🍅" : listing.crop_name === "Onion" ? "🧅" : listing.crop_name === "Orange" ? "🍊" : "🌾"}</span>}<i>{listing.declared_grade.replace("GRADE_", "Grade ")}</i></div><div className="p-5"><span className="text-[10px] uppercase tracking-wider text-[#758078]">{listing.district}, {listing.state}</span><h3>{listing.crop_name} · {listing.crop_variety}</h3><button onClick={() => openFarmer(listing.farmer_id)}>{listing.farmer_name}</button><div className="listing-numbers"><span><small>Available</small><b>{listing.available_quantity_kg.toLocaleString("en-IN")} kg</b></span><span><small>Farmer price</small><b>₹{listing.price_per_kg}/kg</b></span></div><div className="listing-footer"><span>Min. order {listing.minimum_order_quantity_kg} kg</span><button onClick={() => openFarmer(listing.farmer_id)}>View supplier →</button></div></div></article>)}</div>
    </>}
    {mode === "farmers" && <div className="farmer-grid">{farmers.map((farmer) => <article key={farmer.farmer_id} className="farmer-card"><div className="farmer-avatar">{farmer.name.split(" ").map((part) => part[0]).join("")}</div><div className="flex-1"><div className="flex justify-between gap-3"><div><h3>{farmer.name}</h3><p>📍 {farmer.village}, {farmer.district}</p></div><span className="verified-pill">✓ {farmer.profile_status}</span></div><div className="farmer-metrics"><span><b>{farmer.farm_count}</b><small>Farm</small></span><span><b>{farmer.total_area_acres}</b><small>Acres</small></span><span><b>{farmer.listing_count}</b><small>Listings</small></span></div><div className="flex flex-wrap gap-1 mt-4">{farmer.crops.map((item) => <span key={item} className="crop-tag">{item}</span>)}</div><button onClick={() => openFarmer(farmer.farmer_id)} className="farmer-open">Open farmer profile →</button></div></article>)}</div>}

    {selected && <div className="profile-overlay" onClick={() => setSelected(null)}><aside onClick={(e) => e.stopPropagation()}><button className="profile-close" onClick={() => setSelected(null)}>×</button><span className="panel-kicker">Verified farmer profile</span><h2>{selected.farmer.name}</h2><p>📍 {selected.farmer.village}, {selected.farmer.district}, {selected.farmer.state}</p><section><h3>Farm information</h3>{selected.farms.map((farm) => <div key={String(farm.farm_id)} className="detail-row"><span>{String(farm.farm_name)}</span><b>{String(farm.area_acres)} acres</b><small>Soil pH {String(farm.ph ?? "—")} · {String(farm.irrigation_type ?? "Irrigation not specified")}</small></div>)}</section>{selected.needs && <section><h3>Farmer needs</h3><div className="need-grid"><span>Budget <b>₹{Number(selected.needs.investment_budget || 0).toLocaleString("en-IN")}</b></span><span>Goal <b>{String(selected.needs.primary_goal).replaceAll("_", " ")}</b></span><span>Risk preference <b>{String(selected.needs.risk_preference)}</b></span><span>Preferred market <b>{String(selected.needs.preferred_market_distance_km)} km</b></span></div></section>}<section><h3>Crop listings</h3>{selected.listings.map((item) => <div key={item.listing_id} className="detail-row"><span>{item.crop_name} · {item.crop_variety}</span><b>{item.available_quantity_kg} kg at ₹{item.price_per_kg}/kg</b></div>)}</section></aside></div>}
  </div>;
}
