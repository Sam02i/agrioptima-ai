"""
Procurement Credit Intelligence Engine — buyer credit scoring.
Adapted from: procurement-credit-intelligence-engine/
"""
from datetime import date, datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any
import hashlib, json, subprocess, os
import numpy as np
import pandas as pd

router = APIRouter(prefix="/credit", tags=["Credit Intelligence"])

# ── Constants ──
# Credit demo data is shared at the repository level, alongside backend/frontend.
CREDIT_ROOT = Path(__file__).resolve().parents[3] / "data" / "credit_engine"
DISCLAIMER = "Indicative risk assessment only. Final credit sanction, pricing and limits are determined by the regulated lending partner."
SYNTHETIC_NOTICE = "Model trained/evaluated on synthetic/demo transaction data unless explicitly replaced by verified historical production data."

# ── Schemas ──
class DrawRequest(BaseModel):
    amount: float = Field(gt=0)
    transaction_id: str = Field(min_length=1)
    draw_date: date | None = None
    apr: float | None = Field(default=None, ge=0, le=1)

class RepaymentRequest(BaseModel):
    amount: float = Field(gt=0)
    repayment_date: date | None = None

class ScoreResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    buyer_id: str
    procurement_credit_score: int = Field(ge=0, le=100)
    risk_band: str
    predicted_30dpd_probability: float
    predicted_7day_late_probability: float
    indicative_credit_limit: float
    current_utilized_amount: float
    available_limit: float
    major_positive_factors: list[str]
    major_negative_factors: list[str]
    manual_review_flags: list[str]
    model_confidence: str
    history_quality: str
    verified_transaction_count: int
    model_version: str
    generated_at: datetime
    disclaimer: str

# ── Scoring helpers ──
def pd_to_score(probability: float) -> int:
    return max(0, min(100, round(100 * (1 - float(probability)))))

def risk_band(score: int) -> str:
    if score >= 90: return "EXCELLENT"
    if score >= 80: return "STRONG"
    if score >= 70: return "GOOD"
    if score >= 60: return "MODERATE"
    if score >= 40: return "HIGH_RISK"
    return "VERY_HIGH_RISK"

# ── Feature engineering (simplified from credit_engine) ──
BOOL_COLS = ["digital_passport_verified", "dispatch_verified", "receiving_verified", "invoice_verified", "payment_verified"]

def prepare_transactions(df, as_of=None):
    required = {"transaction_id", "buyer_id", "seller_id", "invoice_amount", "procurement_date"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")
    x = df.copy()
    for col in ["procurement_date", "payment_due_date", "actual_payment_date"]:
        if col in x:
            x[col] = pd.to_datetime(x[col], errors="coerce")
    for col in BOOL_COLS:
        if col not in x: x[col] = False
        x[col] = x[col].fillna(False).astype(bool)
    for col in ["invoice_amount", "amount_paid", "outstanding_amount"]:
        if col in x:
            x[col] = pd.to_numeric(x[col], errors="coerce").fillna(0)
    if "days_past_due" not in x:
        endpoint = x.get("actual_payment_date", pd.Series(pd.NaT, index=x.index)).fillna(pd.Timestamp.now())
        due = x.get("payment_due_date", x.procurement_date + pd.Timedelta(days=7))
        x["days_past_due"] = (endpoint - due).dt.days.clip(lower=0)
    x["days_past_due"] = pd.to_numeric(x["days_past_due"], errors="coerce").fillna(0).clip(lower=0)
    return x.sort_values(["buyer_id", "procurement_date"])

def trust_level(row):
    checks = sum(bool(row.get(c, False)) for c in BOOL_COLS)
    if checks == 5 and not row.get("cancelled", False): return "HIGH_TRUST"
    if checks >= 3: return "VERIFIED"
    if checks >= 1: return "PARTIALLY_VERIFIED"
    return "UNVERIFIED"

def buyer_features(df, buyer_id, as_of=None):
    x = prepare_transactions(df, as_of)
    x = x[x.buyer_id == buyer_id].copy()
    if x.empty: raise KeyError(f"Unknown buyer: {buyer_id}")
    now = pd.Timestamp(as_of) if as_of is not None else x.procurement_date.max() + pd.Timedelta(days=1)
    dpd = x.days_past_due
    age = max(1, (x.procurement_date.max() - x.procurement_date.min()).days)
    r30 = x[x.procurement_date >= now - pd.Timedelta(days=30)]
    r90 = x[x.procurement_date >= now - pd.Timedelta(days=90)]
    completed = ~x.get("cancelled", pd.Series(False, index=x.index)).astype(bool)
    def meanbool(col, frame=x):
        return float(frame.get(col, pd.Series(False, index=frame.index)).fillna(False).astype(bool).mean()) if len(frame) else 0
    f = {
        "transaction_count": len(x),
        "completed_transaction_count": int(completed.sum()),
        "verified_transaction_count": int(len(x)),
        "on_time_payment_rate": float((dpd == 0).mean()),
        "seven_day_repayment_rate": float((dpd <= 7).mean()),
        "fifteen_day_repayment_rate": float((dpd <= 15).mean()),
        "thirty_day_repayment_rate": float((dpd < 30).mean()),
        "average_days_past_due": float(dpd.mean()),
        "median_days_past_due": float(dpd.median()),
        "maximum_days_past_due": float(dpd.max()),
        "days_past_due_std": float(dpd.std(ddof=0)),
        "pct_1_7_late": float(dpd.between(1, 7).mean()),
        "pct_8_15_late": float(dpd.between(8, 15).mean()),
        "pct_16_30_late": float(dpd.between(16, 30).mean()),
        "pct_30_plus_late": float((dpd >= 30).mean()),
        "historical_default_rate": float((dpd >= 30).mean()),
        "recent_default_count": int((r90.days_past_due >= 30).sum()) if len(r90) else 0,
        "consecutive_on_time_payments": _streak(dpd == 0, True),
        "consecutive_late_payments": _streak(dpd > 0, True),
        "current_overdue_amount": float(x.get("outstanding_amount", pd.Series(0, index=x.index)).sum()),
        "overdue_to_gmv_ratio": float(x.get("outstanding_amount", pd.Series(0, index=x.index)).sum() / max(r90.invoice_amount.sum(), 1)),
        "verified_procurement_gmv": float(x.invoice_amount.sum()),
        "gmv_last_30_days": float(r30.invoice_amount.sum()) if len(r30) else 0,
        "gmv_last_90_days": float(r90.invoice_amount.sum()) if len(r90) else 0,
        "gmv_last_180_days": float(x[x.procurement_date >= now - pd.Timedelta(days=180)].invoice_amount.sum()),
        "gmv_last_365_days": float(x[x.procurement_date >= now - pd.Timedelta(days=365)].invoice_amount.sum()),
        "average_transaction_value": float(x.invoice_amount.mean()),
        "median_transaction_value": float(x.invoice_amount.median()),
        "maximum_transaction_value": float(x.invoice_amount.max()),
        "transaction_frequency": len(x) / age * 30,
        "monthly_gmv_volatility": float(x.set_index("procurement_date").invoice_amount.resample("MS").sum().std(ddof=0) / max(x.set_index("procurement_date").invoice_amount.resample("MS").sum().mean(), 1)),
        "order_completion_rate": float(completed.mean()),
        "buyer_cancellation_rate": meanbool("cancelled"),
        "quantity_acceptance_rate": float((x.get("quantity_delivered", pd.Series(0, index=x.index)) / x.get("quantity_ordered", pd.Series(1, index=x.index)).replace(0, 1)).clip(0, 1).mean()),
        "quality_rejection_rate": meanbool("quality_dispute"),
        "dispute_rate": meanbool("transaction_dispute"),
        "repeat_supplier_rate": float((x.seller_id.value_counts() > 1).sum() / max(x.seller_id.nunique(), 1)),
        "number_unique_suppliers": int(x.seller_id.nunique()),
        "top_supplier_share": float(x.groupby("seller_id").invoice_amount.sum().nlargest(1).sum() / max(x.invoice_amount.sum(), 1)),
        "top_3_supplier_share": float(x.groupby("seller_id").invoice_amount.sum().nlargest(3).sum() / max(x.invoice_amount.sum(), 1)),
        "supplier_concentration_index": float(((x.groupby("seller_id").invoice_amount.sum() / x.invoice_amount.sum()) ** 2).sum()),
        "number_unique_crops": int(x.crop.nunique()) if "crop" in x else 0,
        "crop_concentration": float(x.groupby("crop").invoice_amount.sum().max() / max(x.invoice_amount.sum(), 1)) if "crop" in x else 0,
        "average_credit_cycle_days": float(((x.get("actual_payment_date", pd.Series(pd.NaT, index=x.index)) - x.procurement_date).dt.days).mean()),
        "average_days_between_procurements": float(x.procurement_date.sort_values().diff().dt.days.dropna().mean()) if len(x) > 1 else float(age),
        "transaction_activity_consistency": 1 / (1 + (x.procurement_date.sort_values().diff().dt.days.dropna().std(ddof=0) if len(x) > 1 else age)),
        "average_crop_perishability": float(x.get("crop_perishability_score", pd.Series(0.5, index=x.index)).mean()),
        "high_perishability_transaction_share": float((x.get("crop_perishability_score", pd.Series(0.5, index=x.index)) >= .7).mean()),
        "average_transport_distance": float(x.get("transport_distance_km", pd.Series(100, index=x.index)).mean()),
        "long_distance_transaction_share": float((x.get("transport_distance_km", pd.Series(100, index=x.index)) > 200).mean()),
        "average_expected_shelf_life": float(x.get("expected_shelf_life_days", pd.Series(30, index=x.index)).mean()),
        "market_price_volatility_exposure": float(((x.get("market_price_at_procurement", x.price_per_kg) - x.price_per_kg) / x.price_per_kg.replace(0, np.nan)).std(ddof=0)),
        "average_transaction_margin": 0.0,
        "negative_margin_transaction_rate": 0.0,
        "digital_passport_verified_rate": meanbool("digital_passport_verified"),
        "dispatch_verified_rate": meanbool("dispatch_verified"),
        "receiving_verified_rate": meanbool("receiving_verified"),
        "invoice_verified_rate": meanbool("invoice_verified"),
        "payment_verified_rate": meanbool("payment_verified"),
        "fully_verified_transaction_rate": float((x.apply(trust_level, axis=1) == "HIGH_TRUST").mean()),
        "recent_30d_dpd": float(r30.days_past_due.mean()) if len(r30) else 0,
        "recent_90d_dpd": float(r90.days_past_due.mean()) if len(r90) else 0,
        "recent_on_time_rate": float((r90.days_past_due == 0).mean()) if len(r90) else 0,
        "recent_gmv": float(r90.invoice_amount.sum()),
        "recent_dispute_rate": meanbool("transaction_dispute", r90),
        "recent_cancellation_rate": meanbool("cancelled", r90),
        "recent_overdue_ratio": float(r90.get("outstanding_amount", pd.Series(0, index=r90.index)).sum() / max(r90.invoice_amount.sum(), 1)),
        "history_days": age,
    }
    return {k: float(np.nan_to_num(f.get(k, 0), nan=0, posinf=0, neginf=0)) for k in f}

def _streak(values, wanted):
    n = 0
    for v in reversed(list(values)):
        if bool(v) == wanted: n += 1
        else: break
    return n

def explanations(f):
    pos, neg = [], []
    if f.get("seven_day_repayment_rate", 0) >= .8: pos.append(f"{f['seven_day_repayment_rate']:.0%} of transactions repaid within seven days")
    if f.get("historical_default_rate", 0) == 0: pos.append("No material delinquency in observed history")
    if f.get("verified_transaction_count", 0) >= 30: pos.append("Established verified procurement history")
    if f.get("repeat_supplier_rate", 0) >= .4: pos.append("Strong repeat-supplier relationships")
    if f.get("recent_90d_dpd", 0) > f.get("average_days_past_due", 0) + 3: neg.append("Recent repayment delays increased")
    if f.get("overdue_to_gmv_ratio", 0) > .1: neg.append(f"Current overdue is {f['overdue_to_gmv_ratio']:.0%} of recent procurement volume")
    if f.get("top_supplier_share", 0) > .65: neg.append("High dependence on a single supplier")
    if f.get("monthly_gmv_volatility", 0) > 1: neg.append("High transaction-volume volatility")
    if f.get("verified_transaction_count", 0) < 10: neg.append("Limited verified transaction history")
    return pos[:4] or ["Transaction history available for behavioural assessment"], neg[:4]

def confidence_level(f):
    n = int(f.get("verified_transaction_count", 0)); days = f.get("history_days", 0)
    if n < 3: return "INSUFFICIENT_HISTORY", "VERY_THIN_FILE"
    if n < 10 or days < 60: return "LOW_CONFIDENCE", "THIN_FILE"
    if n < 30 or days < 180: return "MEDIUM_CONFIDENCE", "DEVELOPING"
    return "HIGH_CONFIDENCE", "ESTABLISHED"

def indicative_limit(f, pd_val):
    monthly = max(f.get("gmv_last_90_days", 0) / 3, f.get("average_transaction_value", 0))
    risk = max(.05, 1 - pd_val * 1.7)
    history = min(1, f.get("verified_transaction_count", 0) / 50)
    repay = .45 + .55 * f.get("seven_day_repayment_rate", 0)
    concentration = max(.55, 1 - .45 * f.get("top_supplier_share", 0))
    overdue = max(0, 1 - min(1, f.get("overdue_to_gmv_ratio", 0) * 2))
    raw = monthly * 0.3 * risk * max(.15, history) * repay * concentration * overdue
    return float(round(max(500, min(500000, raw)) / 100) * 100)

def detect_risk_flags(df, buyer_id=None):
    x = df[df.buyer_id == buyer_id] if buyer_id else df
    flags = []
    if len(x) >= 5:
        recent = x.sort_values("procurement_date").tail(max(3, len(x) // 10)).invoice_amount.mean()
        med = x.invoice_amount.median()
        if med > 0 and recent > 4 * med: flags.append("MANUAL_REVIEW: sudden procurement GMV spike")
        identical = x.invoice_amount.round(0).value_counts(normalize=True).max()
        if identical > .65: flags.append("MANUAL_REVIEW: unusually frequent identical transaction amounts")
    if len(x) and x.get("payment_verified", pd.Series([False])).mean() < .2 and x.invoice_amount.sum() > 500000:
        flags.append("MANUAL_REVIEW: high GMV with limited payment verification")
    return flags

# ── DB for audit ──
import sqlite3
CREDIT_DB = CREDIT_ROOT / "credit_engine.db"
CREDIT_DB.parent.mkdir(parents=True, exist_ok=True)
_cdb = sqlite3.connect(CREDIT_DB)
_cdb.executescript("""
CREATE TABLE IF NOT EXISTS credit_score_history(
    id INTEGER PRIMARY KEY AUTOINCREMENT, buyer_id TEXT, score INTEGER, risk_band TEXT, model_version TEXT, generated_at TEXT
);
CREATE TABLE IF NOT EXISTS buyer_feature_snapshots(
    id INTEGER PRIMARY KEY AUTOINCREMENT, buyer_id TEXT, snapshot_at TEXT, features_json TEXT
);
""")
_cdb.commit()

# ── In-memory accounts ──
accounts = {}

def score_buyer(buyer_id: str):
    csv_path = CREDIT_ROOT / "synthetic_transactions.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Demo data missing at {csv_path}. Run the data generation first.")
    df = pd.read_csv(csv_path)
    f = buyer_features(df, buyer_id)
    # Compute a heuristic credit probability from key features
    on_time = f.get("on_time_payment_rate", 0.5)
    seven_day = f.get("seven_day_repayment_rate", 0.5)
    default_rate = f.get("historical_default_rate", 0)
    recent_dpd = f.get("recent_90d_dpd", 0)
    prob = max(0, min(1, default_rate * 0.4 + (1 - on_time) * 0.25 + (1 - seven_day) * 0.2 + min(1, recent_dpd / 30) * 0.15))
    score = pd_to_score(prob)
    pos, neg = explanations(f)
    conf, hq = confidence_level(f)
    limit = indicative_limit(f, prob)
    result = {
        "buyer_id": buyer_id,
        "procurement_credit_score": score,
        "risk_band": risk_band(score),
        "predicted_30dpd_probability": round(prob, 6),
        "predicted_7day_late_probability": round(min(1, max(prob, float(1 - f["seven_day_repayment_rate"]))), 6),
        "indicative_credit_limit": limit,
        "current_utilized_amount": 0.0,
        "available_limit": limit,
        "major_positive_factors": pos,
        "major_negative_factors": neg,
        "manual_review_flags": detect_risk_flags(df, buyer_id),
        "model_confidence": conf,
        "history_quality": hq,
        "verified_transaction_count": int(f.get("verified_transaction_count", 0)),
        "model_version": "demo-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": DISCLAIMER,
    }
    # Audit
    try:
        _cdb.execute("INSERT INTO credit_score_history(buyer_id,score,risk_band,model_version,generated_at) VALUES(?,?,?,?,?)",
                     (buyer_id, score, risk_band(score), "demo-v1", result["generated_at"]))
        _cdb.execute("INSERT INTO buyer_feature_snapshots(buyer_id,snapshot_at,features_json) VALUES(?,?,?)",
                     (buyer_id, result["generated_at"], json.dumps(f)))
        _cdb.commit()
    except Exception:
        pass
    return result, f

def get_or_create_account(buyer_id):
    if buyer_id not in accounts:
        s, _ = score_buyer(buyer_id)
        accounts[buyer_id] = {"buyer_id": buyer_id, "approved_limit": s["indicative_credit_limit"],
                              "active_drawdowns": [], "repayment_history": []}
    return accounts[buyer_id]

# ── Revolving credit simulation ──
def draw_credit(acct, amount, transaction_id, draw_date=None, apr=.18):
    if amount <= 0: raise ValueError("Draw amount must be positive")
    outstanding = sum(d["outstanding"] for d in acct["active_drawdowns"])
    available = acct["approved_limit"] - outstanding
    if amount > available: raise ValueError("Draw exceeds available limit")
    if any(d["transaction_id"] == transaction_id for d in acct["active_drawdowns"]):
        raise ValueError("Transaction already financed")
    d = {"transaction_id": transaction_id, "principal": amount, "outstanding": amount,
         "draw_date": (draw_date or date.today()).isoformat(), "apr": apr}
    acct["active_drawdowns"].append(d)
    return acct

def repay_credit(acct, amount, repayment_date=None):
    if amount <= 0: raise ValueError("Repayment must be positive")
    outstanding = sum(d["outstanding"] for d in acct["active_drawdowns"])
    if amount > outstanding: raise ValueError("Repayment exceeds principal outstanding")
    remaining = float(amount)
    for d in acct["active_drawdowns"]:
        applied = min(remaining, d["outstanding"])
        d["outstanding"] -= applied
        remaining -= applied
        if remaining <= 0: break
    acct["active_drawdowns"] = [d for d in acct["active_drawdowns"] if d["outstanding"] > .005]
    acct["repayment_history"].append({"amount": float(amount), "date": (repayment_date or date.today()).isoformat()})
    return acct

# ── Endpoints ──
@router.get("/health")
def health():
    return {"status": "healthy", "disclaimer": DISCLAIMER, "data_notice": SYNTHETIC_NOTICE}

@router.get("/buyer/{buyer_id}/score")
def score(buyer_id: str):
    try:
        result, _ = score_buyer(buyer_id)
        return result
    except (KeyError, FileNotFoundError) as e:
        raise HTTPException(404, str(e))

@router.get("/buyer/{buyer_id}/profile")
def profile(buyer_id: str):
    try:
        s, f = score_buyer(buyer_id)
        return {"score": s, "platform_derived_features": f, "disclaimer": DISCLAIMER}
    except (KeyError, FileNotFoundError) as e:
        raise HTTPException(404, str(e))

@router.get("/buyer/{buyer_id}/features")
def features(buyer_id: str):
    try:
        csv_path = CREDIT_ROOT / "synthetic_transactions.csv"
        df = pd.read_csv(csv_path)
        return {"buyer_id": buyer_id, "platform_derived_features": buyer_features(df, buyer_id),
                "excluded_features": ["religion", "caste", "ethnicity", "gender"],
                "disclaimer": DISCLAIMER}
    except (KeyError, FileNotFoundError) as e:
        raise HTTPException(404, str(e))

@router.get("/buyer/{buyer_id}/explanation")
def explanation(buyer_id: str):
    try:
        csv_path = CREDIT_ROOT / "synthetic_transactions.csv"
        df = pd.read_csv(csv_path)
        f = buyer_features(df, buyer_id)
        p, n = explanations(f)
        return {"buyer_id": buyer_id, "positive_factors": p, "negative_factors": n, "disclaimer": DISCLAIMER}
    except (KeyError, FileNotFoundError) as e:
        raise HTTPException(404, str(e))

@router.get("/buyer/{buyer_id}/credit-position")
def position(buyer_id: str):
    acct = get_or_create_account(buyer_id)
    outstanding = sum(d["outstanding"] for d in acct["active_drawdowns"])
    return {**acct, "utilized_amount": outstanding, "available_limit": acct["approved_limit"] - outstanding,
            "illustrative": True, "disclaimer": DISCLAIMER}

@router.post("/buyer/{buyer_id}/simulate-draw")
def draw(buyer_id: str, req: DrawRequest):
    try:
        acct = get_or_create_account(buyer_id)
        draw_credit(acct, req.amount, req.transaction_id, req.draw_date, req.apr or .18)
        outstanding = sum(d["outstanding"] for d in acct["active_drawdowns"])
        return {**acct, "utilized_amount": outstanding, "available_limit": acct["approved_limit"] - outstanding,
                "illustrative": True, "disclaimer": DISCLAIMER}
    except ValueError as e:
        raise HTTPException(422, str(e))

@router.post("/buyer/{buyer_id}/simulate-repayment")
def repay(buyer_id: str, req: RepaymentRequest):
    try:
        acct = get_or_create_account(buyer_id)
        repay_credit(acct, req.amount, req.repayment_date)
        outstanding = sum(d["outstanding"] for d in acct["active_drawdowns"])
        return {**acct, "utilized_amount": outstanding, "available_limit": acct["approved_limit"] - outstanding,
                "illustrative": True, "disclaimer": DISCLAIMER}
    except ValueError as e:
        raise HTTPException(422, str(e))

@router.get("/model/metrics")
def model_metrics():
    return {"model_version": "demo-v1", "champion_model": "heuristic", "status": "no trained model",
            "note": "Heuristic scoring from transaction features. Train a proper model with scripts/train_credit_model.py"}

@router.get("/buyers")
def list_buyers():
    """List all known buyer IDs from the synthetic data."""
    csv_path = CREDIT_ROOT / "synthetic_transactions.csv"
    if not csv_path.exists():
        return {"buyers": []}
    df = pd.read_csv(csv_path)
    buyers = sorted(df["buyer_id"].unique().tolist())
    return {"buyers": buyers, "count": len(buyers)}
