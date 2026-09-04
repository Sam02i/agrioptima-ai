import { LocalizedText } from "../i18n/LocalizedText";
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
type Listing = {
  listing_id: string;
  crop_name: string;
  crop_variety: string;
  available_quantity_kg: number;
  price_per_kg: number;
  listing_status: string;
  image_data?: string;
};
type MandiPrice = {
  market: string;
  district: string;
  price_per_kg: number;
  arrival_date?: string;
};

export default function ProduceListingForm({
  farmerId,
  existing = [],
}: {
  farmerId: string;
  existing?: Listing[];
}) {
  const [items, setItems] = useState(existing);
  const [form, setForm] = useState({
    crop_name: "Tomato",
    crop_variety: "Local Red",
    quantity_kg: "1000",
    price_per_kg: "25",
    minimum_order_quantity_kg: "100",
    declared_grade: "GRADE_A",
  });
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState("");
  const [mandi, setMandi] = useState<{
    prices: MandiPrice[];
    average_price_per_kg: number | null;
    recommended_price_per_kg: number | null;
    recommended_listing_low: number | null;
    recommended_listing_high: number | null;
    minimum_price_per_kg: number | null;
    maximum_price_per_kg: number | null;
    source: string;
    fetched_at?: string;
  } | null>(null);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [transport, setTransport] = useState("2.5");
  useEffect(() => setItems(existing), [farmerId, existing]);
  useEffect(() => {
    const crop = form.crop_name.trim();
    if (crop.length < 2) {
      setMandi(null);
      return;
    }
    const timer = window.setTimeout(() => {
      setMandiLoading(true);
      fetch(`${API}/marketplace/mandi-prices?crop=${encodeURIComponent(crop)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setMandi)
        .catch(() => setMandi(null))
        .finally(() => setMandiLoading(false));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [form.crop_name]);

  const chooseImage = (file?: File) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setMessage("Please choose an image below 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await apiFetch(`${API}/marketplace/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          farmer_id: farmerId,
          quantity_kg: Number(form.quantity_kg),
          price_per_kg: Number(form.price_per_kg),
          minimum_order_quantity_kg: Number(form.minimum_order_quantity_kg),
          image_data: image || null,
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).detail || "Unable to publish listing",
        );
      const saved = await response.json();
      setItems((current) => [
        {
          listing_id: saved.listing_id,
          crop_name: form.crop_name,
          crop_variety: form.crop_variety,
          available_quantity_kg: Number(form.quantity_kg),
          price_per_kg: Number(form.price_per_kg),
          listing_status: "AVAILABLE",
          image_data: image,
        },
        ...current,
      ]);
      setMessage("Produce is now live in the buyer marketplace.");
      setImage("");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Unable to publish listing",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async (item: Listing) => {
    if (!window.confirm(`Remove ${item.crop_name} from the buyer marketplace?`))
      return;
    setRemoving(item.listing_id);
    setMessage("");
    try {
      const response = await apiFetch(
        `${API}/marketplace/listings/${item.listing_id}?farmer_id=${encodeURIComponent(farmerId)}`,
        { method: "DELETE" },
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).detail || "Unable to remove produce",
        );
      setItems((current) =>
        current.filter((row) => row.listing_id !== item.listing_id),
      );
      setMessage(`${item.crop_name} was removed from the buyer marketplace.`);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Unable to remove produce",
      );
    } finally {
      setRemoving("");
    }
  };

  return (
    <div className="farmer-listing-layout">
      <form className="manual-listing" onSubmit={submit}>
        <span className="panel-kicker"><LocalizedText source={"Manual produce listing"} /></span>
        <h2><LocalizedText source={"List produce for buyers"} /></h2>
        <p><LocalizedText source={" Set the produce, available quantity, price, grade, and an optional real image. "} /></p>
        <div className="listing-form-grid">
          <label><LocalizedText source={" Produce "} /><input
              required
              value={form.crop_name}
              onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
            />
          </label>
          <label><LocalizedText source={" Variety "} /><input
              required
              value={form.crop_variety}
              onChange={(e) =>
                setForm({ ...form, crop_variety: e.target.value })
              }
            />
          </label>
          <label><LocalizedText source={" Quantity (kg) "} /><input
              required
              min="1"
              type="number"
              value={form.quantity_kg}
              onChange={(e) =>
                setForm({ ...form, quantity_kg: e.target.value })
              }
            />
          </label>
          <label><LocalizedText source={" Price (₹/kg) "} /><input
              required
              min="1"
              step="0.5"
              type="number"
              value={form.price_per_kg}
              onChange={(e) =>
                setForm({ ...form, price_per_kg: e.target.value })
              }
            />
          </label>
          <label><LocalizedText source={" Minimum order (kg) "} /><input
              required
              min="1"
              type="number"
              value={form.minimum_order_quantity_kg}
              onChange={(e) =>
                setForm({ ...form, minimum_order_quantity_kg: e.target.value })
              }
            />
          </label>
          <label><LocalizedText source={" Declared grade "} /><select
              value={form.declared_grade}
              onChange={(e) =>
                setForm({ ...form, declared_grade: e.target.value })
              }
            >
              <option value="GRADE_A"><LocalizedText source={"Grade A"} /></option>
              <option value="GRADE_B"><LocalizedText source={"Grade B"} /></option>
              <option value="GRADE_C"><LocalizedText source={"Grade C"} /></option>
            </select>
          </label>
        </div>
        <section className="mandi-price-guide">
          <div>
            <span><LocalizedText source={"Latest local selling guidance"} /></span>
            <b><LocalizedText source={"{0}"} values={[form.crop_name]} /></b>
            <small><LocalizedText source={" {0} "} values={[mandiLoading
                ? "Checking AGMARKNET prices…"
                : mandi?.prices.length
                  ? `${mandi.prices.length} recent market records · ${mandi.fetched_at ? `updated ${new Date(mandi.fetched_at).toLocaleString("en-IN")}` : "latest available"}`
                  : "No recent mandi record available"]} /></small>
          </div>
          {mandi?.recommended_price_per_kg && (
            <>
              <div className="mandi-price-summary">
                <span>
                  <small><LocalizedText source={"Market range"} /></small>
                  <b><LocalizedText source={" ₹{0}–₹{1} "} values={[mandi.minimum_price_per_kg, mandi.maximum_price_per_kg]} /></b>
                </span>
                <span>
                  <small><LocalizedText source={"Suggested listing range"} /></small>
                  <b><LocalizedText source={" ₹{0}–₹ {1} "} values={[mandi.recommended_listing_low, mandi.recommended_listing_high]} /></b>
                </span>
                <span>
                  <small><LocalizedText source={"Suggested price"} /></small>
                  <b><LocalizedText source={"₹{0}/kg"} values={[mandi.recommended_price_per_kg]} /></b>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      price_per_kg: String(mandi.recommended_price_per_kg),
                    })
                  }
                ><LocalizedText source={" Use suggested price "} /></button>
              </div>
              <label className="transport-cost"><LocalizedText source={" Estimated transport and fees (₹/kg) "} /><input
                  type="number"
                  min="0"
                  step="0.5"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                />
                <b><LocalizedText source={" Estimated net at suggested price: ₹ {0} /kg "} values={[Math.max(
                    0,
                    Number(mandi.recommended_price_per_kg) -
                      Number(transport || 0),
                  ).toFixed(2)]} /></b>
              </label>
              <div className="mandi-markets">
                {mandi.prices.slice(0, 3).map((row, index) => (
                  <span key={`${row.market}-${index}`}>
                    <b><LocalizedText source={"{0}"} values={[row.market]} /></b>
                    <small><LocalizedText source={" {0} · ₹{1} /kg · net ₹ {2} "} values={[row.district || "Regional market", row.price_per_kg, Math.max(
                        0,
                        row.price_per_kg - Number(transport || 0),
                      ).toFixed(2)]} /></small>
                    <i><LocalizedText source={"{0}"} values={[row.arrival_date || "Latest record"]} /></i>
                  </span>
                ))}
              </div>
              <p><LocalizedText source={" Source: {0}. Compare the amount left after transport and fees—not only the highest market price. "} values={[mandi.source]} /></p>
            </>
          )}
        </section>
        <label className="listing-image-upload">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => chooseImage(e.target.files?.[0])}
          />
          {image ? (
            <img src={image} alt="Produce listing preview" />
          ) : (
            <span><LocalizedText source={" ＋ Add produce image "} /><small><LocalizedText source={"JPG, PNG, or WebP · maximum 2 MB"} /></small>
            </span>
          )}
        </label>
        <button className="publish-listing" disabled={saving || !farmerId}><LocalizedText source={" {0} "} values={[saving ? "Publishing…" : "Publish to buyer marketplace →"]} /></button>
        {message && <p className="listing-message"><LocalizedText source={"{0}"} values={[message]} /></p>}
      </form>
      <section className="my-listings">
        <span className="panel-kicker"><LocalizedText source={"Current inventory"} /></span>
        <h2><LocalizedText source={"My active listings"} /></h2>
        {items.length === 0 ? (
          <p><LocalizedText source={"No produce listed yet."} /></p>
        ) : (
          items.map((item) => (
            <article key={item.listing_id}>
              {item.image_data ? (
                <img src={item.image_data} alt={item.crop_name} />
              ) : (
                <div><LocalizedText source={" {0} "} values={[item.crop_name.toLowerCase().includes("tomato")
                    ? "🍅"
                    : item.crop_name.toLowerCase().includes("onion")
                      ? "🧅"
                      : "🌾"]} /></div>
              )}
              <span>
                <b><LocalizedText source={" {0} · {1} "} values={[item.crop_name, item.crop_variety]} /></b>
                <small><LocalizedText source={" {0} kg available "} values={[item.available_quantity_kg.toLocaleString("en-IN")]} /></small>
              </span>
              <strong><LocalizedText source={" ₹{0}/kg"} values={[item.price_per_kg]} /><small><LocalizedText source={"{0}"} values={[item.listing_status]} /></small>
              </strong>
              <button
                className="remove-listing"
                disabled={removing === item.listing_id}
                onClick={() => remove(item)}
              ><LocalizedText source={" {0} "} values={[removing === item.listing_id ? "Removing…" : "Remove produce"]} /></button>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
