import { LocalizedText } from "../i18n/LocalizedText";
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
type FertilizerOption = {
  fertilizer: string;
  quantity: number;
  unit: string;
  benefit: string;
};
type Advisory = {
  soil_health_score: number;
  summary: string;
  source: string;
  district?: string;
  estimated?: boolean;
  ph: { value: number; status: string };
  nutrients: Array<{
    name: string;
    value: number;
    target: number;
    status: string;
    gap: number;
  }>;
  missing_nutrients: string[];
  fertilizer_plan: Array<{
    fertilizer: string;
    quantity: number;
    unit: string;
    purpose: string;
    timing: string;
  }>;
  fertilizer_options?: Array<{ nutrient: string; options: FertilizerOption[] }>;
  advisory_note: string;
};

export default function SoilAdvisoryPanel({
  farmerId,
  farm,
}: {
  farmerId: string;
  farm?: {
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    area_acres: number;
    current_crop: string;
  };
}) {
  const [data, setData] = useState<Advisory | null>(null);
  const [error, setError] = useState("");
  const [card, setCard] = useState<any>(null);
  const [cardStatus, setCardStatus] = useState("");
  useEffect(() => {
    setData(null);
    setError("");
    const request = farmerId
      ? fetch(`${API}/soil/advisory/${farmerId}`)
      : fetch(`${API}/soil/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(farm),
        });
    request
      .then(async (r) => {
        if (!r.ok)
          throw new Error((await r.json()).detail || "No soil record found");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [farmerId, farm?.ph, farm?.nitrogen, farm?.phosphorus, farm?.potassium]);
  const uploadCard = (file: File) => {
    setCardStatus("Saving card securely…");
    const reader = new FileReader();
    reader.onload = async () => {
      const response = await apiFetch(`${API}/soil/cards/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_id: farmerId,
          filename: file.name,
          content_type: file.type,
          image_data: reader.result,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setCardStatus(result.detail || "Card could not be read");
        return;
      }
      setCard(result);
      setCardStatus("Draft ready—please compare it with the printed card.");
    };
    reader.readAsDataURL(file);
  };
  const confirmCard = async () => {
    if (!card) return;
    const response = await apiFetch(`${API}/soil/cards/${card.card_id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card.values),
    });
    if (response.ok) {
      setCardStatus("✓ Soil Health Card values confirmed by farmer");
      setCard(null);
    } else setCardStatus("Could not confirm the card");
  };
  return (
    <section className="soil-advisory">
      <div className="soil-head">
        <div>
          <span><LocalizedText source={"Automatic farm record"} /></span>
          <h2><LocalizedText source={"What does my soil need?"} /></h2>
          <p><LocalizedText source={" You do not need to enter N, P, or K. We use the connected Soil Health Card or area estimate and turn it into practical actions for  {0}. "} values={[farm?.current_crop || "your crop"]} /></p>
        </div>
        {data && (
          <div className="soil-score">
            <b><LocalizedText source={"{0}"} values={[data.soil_health_score]} /></b>
            <small><LocalizedText source={"Soil health score"} /></small>
          </div>
        )}
      </div>
      {error && <div className="soil-loading"><LocalizedText source={"{0}"} values={[error]} /></div>}
      {!data && !error && (
        <div className="soil-loading"><LocalizedText source={" Finding common soil values for this area… "} /></div>
      )}
      <div className="soil-card-upload">
        <b><LocalizedText source={"Use my Soil Health Card"} /></b>
        <p><LocalizedText source={" Upload a photo or PDF. Draft values are never treated as measurements until you confirm them. "} /></p>
        <label className="soil-read-aloud"><LocalizedText source={" Upload card "} /><input
            hidden
            type="file"
            accept="image/*,.pdf"
            onChange={(e) =>
              e.target.files?.[0] && uploadCard(e.target.files[0])
            }
          />
        </label>
        {cardStatus && <small><LocalizedText source={"{0}"} values={[cardStatus]} /></small>}
        {card && (
          <div className="farmer-record-grid">
            {Object.entries(card.values).map(([key, value]) => (
              <label key={key}>
                <small><LocalizedText source={"{0}"} values={[key.toUpperCase()]} /></small>
                <input
                  type="number"
                  step="0.1"
                  value={Number(value)}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      values: { ...card.values, [key]: Number(e.target.value) },
                    })
                  }
                />
              </label>
            ))}
            <button className="soil-read-aloud" onClick={confirmCard}><LocalizedText source={" Confirm these values "} /></button>
          </div>
        )}
      </div>
      {data && (
        <>
          <div className="soil-source">
            <span><LocalizedText source={"✓ {0}"} values={[data.source]} /></span>
            <b><LocalizedText source={"{0}"} values={[data.summary]} /></b>
            <small><LocalizedText source={" pH {0} · {1} "} values={[data.ph.value, data.ph.status]} /></small>
          </div>
          <div className="simple-soil-status">
            {data.nutrients.map((n) => (
              <article key={n.name} className={n.status.toLowerCase()}>
                <span><LocalizedText source={"{0}"} values={[n.status === "Sufficient" ? "✓" : "!"]} /></span>
                <div>
                  <b><LocalizedText source={"{0}"} values={[n.name]} /></b>
                  <small><LocalizedText source={" {0} "} values={[n.status === "Sufficient"
                      ? "Enough for planning"
                      : n.status === "Low"
                        ? "Needs attention"
                        : "Watch this nutrient"]} /></small>
                </div>
              </article>
            ))}
          </div>
          <details className="soil-advanced">
            <summary><LocalizedText source={"See technical soil values (advanced)"} /></summary>
            <div className="nutrient-grid">
              {data.nutrients.map((n) => (
                <article key={n.name} className={n.status.toLowerCase()}>
                  <div>
                    <span><LocalizedText source={"{0}"} values={[n.name]} /></span>
                    <b><LocalizedText source={"{0}"} values={[n.value]} /></b>
                  </div>
                  <div className="nutrient-track">
                    <i
                      style={{
                        width: `${Math.min(100, (n.value / n.target) * 100)}%`,
                      }}
                    />
                  </div>
                  <small><LocalizedText source={" {0} {1} "} values={[n.status, n.gap > 0 ? ` · Gap ${n.gap}` : " · At target"]} /></small>
                </article>
              ))}
            </div>
          </details>
          <div className="fertilizer-title">
            <div>
              <span><LocalizedText source={"Your next field action"} /></span>
              <h3><LocalizedText source={"Choose one fertilizer option"} /></h3>
            </div>
            <b><LocalizedText source={" {0} "} values={[data.missing_nutrients.length
                ? `${data.missing_nutrients.join(", ")} need attention`
                : "Soil nutrients look balanced"]} /></b>
          </div>
          <div className="fertilizer-plan">
            {data.fertilizer_plan.map((item) => (
              <article key={item.fertilizer}>
                <span><LocalizedText source={"Recommended"} /></span>
                <h4><LocalizedText source={"{0}"} values={[item.fertilizer]} /></h4>
                <strong><LocalizedText source={" {0} {1} "} values={[item.quantity.toLocaleString("en-IN"), item.unit]} /></strong>
                <p><LocalizedText source={"{0}"} values={[item.purpose]} /></p>
                <small><LocalizedText source={"{0}"} values={[item.timing]} /></small>
              </article>
            ))}
          </div>
          {data.fertilizer_options?.map((group) => (
            <div className="fertilizer-alternatives" key={group.nutrient}>
              <div>
                <b><LocalizedText source={"{0} options"} values={[group.nutrient]} /></b>
                <small><LocalizedText source={" Choose one option after local confirmation—do not apply all alternatives together. "} /></small>
              </div>
              <section>
                {group.options.map((option, index) => (
                  <article
                    key={option.fertilizer}
                    className={index === 0 ? "preferred" : ""}
                  >
                    <span><LocalizedText source={" {0} "} values={[index === 0
                        ? "Best-value option"
                        : `Alternative ${index}`]} /></span>
                    <h4><LocalizedText source={"{0}"} values={[option.fertilizer]} /></h4>
                    <strong><LocalizedText source={" {0} {1} "} values={[option.quantity.toLocaleString("en-IN"), option.unit]} /></strong>
                    <p><LocalizedText source={"{0}"} values={[option.benefit]} /></p>
                  </article>
                ))}
              </section>
            </div>
          ))}
          <button
            className="soil-read-aloud"
            onClick={() => {
              if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(
                  new SpeechSynthesisUtterance(
                    `${data.summary}. Choose one fertilizer option only. ${data.fertilizer_plan.map((x) => `${x.fertilizer}, ${x.quantity} ${x.unit}, ${x.timing}`).join(". ")}`,
                  ),
                );
              }
            }}
          ><LocalizedText source={" 🔊 Read advice aloud "} /></button>
          <p className="soil-note"><LocalizedText source={" ⓘ Regional values are planning estimates. {0} "} values={[data.advisory_note]} /></p>
        </>
      )}
    </section>
  );
}
