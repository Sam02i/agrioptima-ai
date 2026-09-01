"""
Supplier Ranking Engine for farmer-to-buyer procurement.
Adapted from: sih_project/agrioptima-db/
This module provides deterministic ranking of crop lot suppliers against buyer RFQs.
Requires a separate PostgreSQL database with the ranking schema (RFQs, crop_lots, etc.)
Set RANKING_DATABASE_URL in .env to activate.
"""
import math
import os
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/ranking", tags=["Supplier Ranking"])

# ── Configuration ──
RANKING_DB_URL = os.environ.get("RANKING_DATABASE_URL")

# ── Schemas ──
class RFQRequest(BaseModel):
    crop_name: str
    crop_variety: Optional[str] = None
    required_quantity: float
    unit: str = "kg"
    minimum_quality_grade: Optional[str] = "B"
    destination: Optional[str] = None
    destination_latitude: Optional[float] = None
    destination_longitude: Optional[float] = None
    delivery_deadline: Optional[str] = None
    maximum_acceptable_price: Optional[float] = None

class SupplierMatchResult(BaseModel):
    farmer_name: str
    lot_id: str
    crop_name: str
    crop_variety: Optional[str]
    price_per_unit: float
    available_quantity: float
    quality_grade: Optional[str]
    distance_km: Optional[float]
    eligible: bool
    rejection_reason: Optional[str]
    scores: Dict[str, float]
    ranking_score: float
    explanation: List[str]

class RankingResponse(BaseModel):
    success: bool
    rfq_id: str
    total_matches: int
    results: List[Dict[str, Any]]

# ── Feature scoring functions ──
def grade_to_numeric(grade):
    if not grade: return 0
    return {'A': 3, 'B': 2, 'C': 1}.get(grade.upper(), 0)

def haversine_distance(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2): return None
    R = 6371.0
    phi1, phi2 = math.radians(float(lat1)), math.radians(float(lat2))
    dphi = math.radians(float(lat2) - float(lat1))
    dlam = math.radians(float(lon2) - float(lon1))
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def calculate_price_score(lot_price, min_candidate_price, max_candidate_price, mandi_modal_price=None):
    lot_price = float(lot_price)
    if max_candidate_price == min_candidate_price:
        base_score = 100.0
    else:
        base_score = 100.0 * (1.0 - (lot_price - min_candidate_price) / (max_candidate_price - min_candidate_price))
    if mandi_modal_price:
        if lot_price < 0.5 * float(mandi_modal_price):
            base_score = min(80.0, base_score)
    return max(0.0, min(100.0, base_score))

def calculate_quality_score(lot):
    grade = lot.get('quality_grade') or 'B'
    base = {'A': 100.0, 'B': 70.0, 'C': 40.0}.get(grade.upper(), 50.0)
    if lot.get('passport_id'):
        if lot.get('passport_confidence'): base *= float(lot['passport_confidence']) / 100.0
        if lot.get('visible_defects_pct'): base -= float(lot['visible_defects_pct'])
        if lot.get('passport_verification_status') == 'VERIFIED': base += 10.0
        else: base -= 15.0
    return max(0.0, min(100.0, base))

def calculate_distance_score(distance_km):
    if distance_km is None: return 50.0
    return max(0.0, min(100.0, 100.0 * math.exp(-float(distance_km) / 200.0)))

def calculate_quantity_score(available_qty, required_qty):
    if not required_qty: return 0.0
    coverage = float(available_qty) / float(required_qty)
    return max(0.0, min(100.0, 100.0 * coverage))

def calculate_reliability_score(farmer_id, db_reliability, transactions=None, performance=None):
    if not transactions and not performance:
        return float(db_reliability) if db_reliability is not None else 60.0
    if transactions:
        total_txs = len(transactions)
        if total_txs == 0:
            return float(db_reliability) if db_reliability is not None else 60.0
        completed_txs = [t for t in transactions if t.get('order_status') == 'DELIVERED']
        completion_rate = len(completed_txs) / total_txs
        on_time_count = sum(1 for t in completed_txs if t.get('on_time') is True)
        on_time_rate = on_time_count / len(completed_txs) if completed_txs else 1.0
        accepted_count = sum(1 for t in completed_txs if t.get('quality_acceptance_status') == 'ACCEPTED')
        quality_rate = accepted_count / len(completed_txs) if completed_txs else 1.0
        promised_vol = sum(float(t.get('ordered_quantity', 0)) for t in transactions)
        delivered_vol = sum(float(t.get('delivered_quantity', 0)) for t in completed_txs)
        fill_rate = (delivered_vol / promised_vol) if promised_vol > 0 else 1.0
        score = 100.0 * (0.3 * completion_rate + 0.3 * on_time_rate + 0.2 * quality_rate + 0.2 * fill_rate)
        score -= 20.0 * sum(1 for t in transactions if t.get('disputed'))
        score -= 20.0 * sum(1 for t in transactions if t.get('order_status') == 'CANCELLED')
        return max(0.0, min(100.0, score))
    if performance:
        completed = int(performance.get('orders_completed', 0))
        cancelled = int(performance.get('orders_cancelled', 0))
        total = completed + cancelled
        if total == 0: return float(db_reliability) if db_reliability else 60.0
        return max(0.0, min(100.0, 100.0 * completed / total))
    return float(db_reliability) if db_reliability is not None else 60.0

def calculate_freshness_score(harvest_date, crop_name):
    if not harvest_date: return 50.0
    if isinstance(harvest_date, str):
        try: harvest_date = datetime.strptime(harvest_date[:10], "%Y-%m-%d").date()
        except: return 50.0
    if isinstance(harvest_date, datetime): harvest_date = harvest_date.date()
    shelf_lives = {'tomato': 14.0, 'onion': 90.0, 'potato': 90.0, 'wheat': 365.0, 'rice': 365.0,
                   'mango': 7.0, 'banana': 5.0, 'grape': 14.0}
    shelf = shelf_lives.get(crop_name.lower(), 30.0)
    if harvest_date > date.today(): return 100.0
    age_days = (date.today() - harvest_date).days
    return max(0.0, min(100.0, 100.0 * (1.0 - age_days / shelf)))

def calculate_confidence(lot, transactions=None):
    score = 0.0
    explanation = []
    tx_count = len(transactions) if transactions else 0
    score += min(40.0, tx_count * 5.0)
    if tx_count >= 8: explanation.append(f"Strong historical proof base ({tx_count} transactions)")
    elif tx_count > 0: explanation.append(f"Limited historical base ({tx_count} transactions)")
    else: explanation.append("No transaction history available")
    if lot.get('passport_id'):
        score += 15.0
        if lot.get('passport_verification_status') == 'VERIFIED': score += 5.0
    if lot.get('farm_id'): score += 15.0
    if lot.get('lot_latitude') is not None: score += 15.0
    if lot.get('farmer_verification_status') == 'VERIFIED': score += 10.0
    final_score = max(0.0, min(100.0, score))
    level = "HIGH" if final_score >= 75 else "MEDIUM" if final_score >= 40 else "LOW"
    return {'score': final_score, 'level': level, 'explanation': ", ".join(explanation)}

def analyze_fair_price(lot_price, modal_price=None, min_price=None, max_price=None):
    lot_price = float(lot_price)
    if modal_price is None:
        return {'supplier_price': lot_price, 'reference_price': None, 'fair_min': None,
                'fair_max': None, 'difference': None, 'status': 'INSUFFICIENT_DATA'}
    modal_price = float(modal_price)
    min_p = float(min_price) if min_price else modal_price * 0.8
    max_p = float(max_price) if max_price else modal_price * 1.2
    diff = lot_price - modal_price
    if lot_price > max_p: status = 'ABOVE_MARKET'
    elif lot_price < min_p: status = 'BELOW_MARKET'
    else: status = 'FAIR'
    return {'supplier_price': lot_price, 'reference_price': modal_price, 'fair_min': min_p,
            'fair_max': max_p, 'difference': diff, 'status': status}

def generate_explanation(scores):
    explanations = []
    if scores.get('price', 0) >= 75: explanations.append("Competitive price compared to market candidates")
    elif scores.get('price', 0) <= 40: explanations.append("Higher asking price relative to competition")
    else: explanations.append("Moderate pricing structure")
    if scores.get('quality', 0) >= 80: explanations.append("High quality grade with low defect count")
    elif scores.get('quality', 0) <= 45: explanations.append("Standard lower grade or unverified quality")
    if scores.get('distance', 0) >= 80: explanations.append("Short delivery distance minimizing transit time")
    elif scores.get('distance', 0) <= 30: explanations.append("Long-distance logistics required for fulfillment")
    if scores.get('quantity', 0) >= 80: explanations.append("Excellent order quantity coverage capacity")
    if scores.get('reliability', 0) >= 85: explanations.append("Strong historical fulfillment record with no active disputes")
    if scores.get('freshness', 0) >= 80: explanations.append("Recently harvested fresh produce with optimal shelf life")
    return explanations

def filter_candidates(rfq, candidates):
    eligible, rejected = [], []
    for lot in candidates:
        lot_copy = dict(lot)
        if lot_copy['crop_name'].lower() != rfq['crop_name'].lower():
            lot_copy['rejection_reason'] = f"Crop mismatch: RFQ requires '{rfq['crop_name']}', Lot has '{lot_copy['crop_name']}'"
        elif lot_copy.get('available_quantity', 0) <= 0:
            lot_copy['rejection_reason'] = f"Unavailable stock: Available quantity is {lot_copy['available_quantity']}"
        elif rfq.get('crop_variety') and lot_copy.get('crop_variety') and rfq['crop_variety'].lower() != lot_copy['crop_variety'].lower():
            lot_copy['rejection_reason'] = f"Variety mismatch: RFQ requires '{rfq['crop_variety']}', Lot has '{lot_copy['crop_variety']}'"
        elif rfq.get('minimum_quality_grade') and grade_to_numeric(lot_copy.get('quality_grade')) < grade_to_numeric(rfq['minimum_quality_grade']):
            lot_copy['rejection_reason'] = f"Quality grade '{lot_copy.get('quality_grade')}' below buyer minimum '{rfq['minimum_quality_grade']}'"
        elif rfq.get('maximum_acceptable_price') and lot_copy.get('price_per_unit', 0) > rfq['maximum_acceptable_price']:
            lot_copy['rejection_reason'] = f"Price {lot_copy['price_per_unit']} exceeds buyer maximum {rfq['maximum_acceptable_price']}"
        else:
            lot_copy['eligible'] = True
            lot_copy['rejection_reason'] = None
            eligible.append(lot_copy)
            continue
        lot_copy['eligible'] = False
        rejected.append(lot_copy)
    return eligible, rejected

def calculate_final_score(scores, weights=None):
    if weights is None:
        weights = {'price': 0.30, 'quality': 0.20, 'distance': 0.15,
                   'quantity': 0.10, 'reliability': 0.15, 'freshness': 0.10}
    return max(0.0, min(100.0, sum(float(scores.get(k, 0.0)) * float(v) for k, v in weights.items())))

# ── Endpoints ──
@router.get("/health")
def health():
    return {
        "status": "ok" if RANKING_DB_URL else "standalone",
        "message": "Ranking engine active" if RANKING_DB_URL else "Running without database. Use /ranking/score for standalone scoring.",
        "has_database": bool(RANKING_DB_URL)
    }

@router.post("/score")
def score_standalone(rfq: RFQRequest, candidates: List[Dict[str, Any]]):
    """
    Score candidates against an RFQ without requiring a database.
    Pass candidate crop lots as JSON in the request body.
    """
    rfq_dict = rfq.model_dump()
    eligible, rejected = filter_candidates(rfq_dict, [{"eligible": True, **c} for c in candidates])

    prices = [float(lot['price_per_unit']) for lot in eligible] if eligible else [0]
    min_p, max_p = min(prices), max(prices)

    results = []
    for lot in eligible:
        dist = haversine_distance(
            lot.get('latitude', lot.get('lot_latitude')),
            lot.get('longitude', lot.get('lot_longitude')),
            rfq_dict.get('destination_latitude'),
            rfq_dict.get('destination_longitude')
        )
        scores = {
            'price': calculate_price_score(lot['price_per_unit'], min_p, max_p),
            'quality': calculate_quality_score(lot),
            'distance': calculate_distance_score(dist),
            'quantity': calculate_quantity_score(lot.get('available_quantity', lot.get('quantity', 0)), rfq_dict['required_quantity']),
            'reliability': float(lot.get('farmer_reliability', 60)),
            'freshness': calculate_freshness_score(lot.get('harvest_date'), rfq_dict['crop_name']),
        }
        ranking_score = calculate_final_score(scores)
        confidence = calculate_confidence(lot)
        fair_price = analyze_fair_price(lot['price_per_unit'], lot.get('modal_price'))
        results.append({
            'farmer_name': lot.get('farmer_name', 'Unknown'),
            'lot_id': lot.get('lot_id', 'unknown'),
            'crop_name': lot['crop_name'],
            'crop_variety': lot.get('crop_variety'),
            'price_per_unit': float(lot['price_per_unit']),
            'available_quantity': float(lot.get('available_quantity', lot.get('quantity', 0))),
            'quality_grade': lot.get('quality_grade'),
            'distance_km': dist,
            'eligible': True,
            'rejection_reason': None,
            'scores': scores,
            'ranking_score': ranking_score,
            'confidence': confidence,
            'fair_price': fair_price,
            'explanation': generate_explanation(scores)
        })

    for lot in rejected:
        results.append({
            'farmer_name': lot.get('farmer_name', 'Unknown'),
            'lot_id': lot.get('lot_id', 'unknown'),
            'crop_name': lot['crop_name'],
            'crop_variety': lot.get('crop_variety'),
            'price_per_unit': float(lot.get('price_per_unit', 0)),
            'available_quantity': float(lot.get('available_quantity', lot.get('quantity', 0))),
            'quality_grade': lot.get('quality_grade'),
            'distance_km': None,
            'eligible': False,
            'rejection_reason': lot.get('rejection_reason'),
            'scores': {},
            'ranking_score': 0.0,
            'confidence': {'score': 0.0, 'level': 'LOW', 'explanation': 'Candidate rejected during filtering'},
            'fair_price': {'status': 'INSUFFICIENT_DATA'},
            'explanation': [lot.get('rejection_reason', 'Rejected')]
        })

    results.sort(key=lambda x: (not x['eligible'], -x['ranking_score']))
    return {"success": True, "total_matches": len(results), "results": results}
