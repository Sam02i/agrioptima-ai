from pydantic import BaseModel


class ScoreBreakdown(BaseModel):
    soil_fit: int
    climate_fit: int
    water_fit: int
    buyer_demand: int
    market_score: int
    profitability: int
    saturation_score: int
    rotation_fit: int


class SourceStatus(BaseModel):
    soil: str
    weather: str
    price: str
    demand: str


class RecommendationItem(BaseModel):
    crop: str
    opportunity_score: int
    confidence: int
    soil_fit: int
    climate_fit: int
    water_fit: int
    yield_estimate_kg_per_acre: int
    expected_price_per_kg: int | None = None
    cultivation_cost_per_acre: int | None = None
    estimated_profit_per_acre: int | None = None
    buyer_demand_score: int
    saturation_risk: str
    saturation_risk_score: int
    rotation_fit: int
    reason_codes: list[str]
    data_sources: list[str]
    explanation: str
    details: dict


class RejectedCrop(BaseModel):
    crop: str
    rejection_codes: list[str]
    explanation: str


class DataQuality(BaseModel):
    overall_confidence: int
    soil_source: str
    market_source: str
    demand_source: str


class RecommendationResponse(BaseModel):
    farmer_id: str
    farm_id: str
    crop_recommendation_id: str
    season: str
    generated_at: str
    recommendations: list[RecommendationItem]
    rejected: list[RejectedCrop]
    data_quality: DataQuality
