"""
Digital Produce Passport — ML-powered visual freshness assessment.
Adapted from: Engine1/
Supports: tomato 5-class freshness grading, multi-image shipment inspection.
"""
import shutil
import tempfile
from pathlib import Path
from typing import List, Dict
from dataclasses import dataclass
from enum import Enum

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

router = APIRouter(prefix="/freshness", tags=["Freshness Engine"])

# ── Schemas ──
class ReviewResponse(BaseModel):
    decision: str
    reasons: List[str]
    confidence: float
    margin: float
    confidence_threshold: float
    margin_threshold: float

class FreshnessPredictionResponse(BaseModel):
    freshness_level: int
    freshness_label: str
    confidence: float
    margin: float
    probabilities: Dict[int, float]
    review: ReviewResponse

class SingleImageResponse(BaseModel):
    image_name: str
    prediction: FreshnessPredictionResponse

class IndividualImagePrediction(BaseModel):
    image_name: str
    freshness_level: int
    freshness_label: str
    confidence: float
    margin: float
    decision: str

class MultiImageResponse(BaseModel):
    image_count: int
    individual_predictions: List[IndividualImagePrediction]
    aggregated_prediction: FreshnessPredictionResponse

# ── Review policy ──
class ReviewDecision(str, Enum):
    AUTO_ACCEPT = "AUTO_ACCEPT"
    MANUAL_REVIEW = "MANUAL_REVIEW"

class ReviewReason(str, Enum):
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    LOW_MARGIN = "LOW_MARGIN"

@dataclass
class ReviewResult:
    decision: ReviewDecision
    reasons: List[ReviewReason]
    confidence: float
    margin: float
    confidence_threshold: float
    margin_threshold: float

def evaluate_prediction(confidence, margin, confidence_threshold=0.70, margin_threshold=0.15):
    reasons = []
    if confidence < confidence_threshold: reasons.append(ReviewReason.LOW_CONFIDENCE)
    if margin < margin_threshold: reasons.append(ReviewReason.LOW_MARGIN)
    decision = ReviewDecision.MANUAL_REVIEW if reasons else ReviewDecision.AUTO_ACCEPT
    return ReviewResult(decision=decision, reasons=reasons, confidence=confidence, margin=margin,
                        confidence_threshold=confidence_threshold, margin_threshold=margin_threshold)

# ── 5-class interpretation ──
FIVE_CLASS_NAMES = {
    0: "VERY_FRESH",
    1: "FRESH",
    2: "MODERATE",
    3: "AGING",
    4: "ROTTEN_OR_NEAR_ROTTEN"
}

def interpret_5class_probabilities(probabilities, confidence_threshold=0.70, margin_threshold=0.15):
    import numpy as np
    probs = np.asarray(probabilities, dtype=np.float32)
    if probs.shape != (5,):
        raise ValueError(f"Expected 5 probabilities, received {probs.shape}")
    if np.any(probs < 0):
        raise ValueError("Probabilities cannot be negative")
    total = float(np.sum(probs))
    if not np.isclose(total, 1.0, atol=1e-3):
        raise ValueError(f"Probabilities must sum to ~1. Received {total}")
    predicted_index = int(np.argmax(probs))
    confidence = float(probs[predicted_index])
    sorted_probs = np.sort(probs)
    second_best = float(sorted_probs[-2])
    margin = confidence - second_best
    review = evaluate_prediction(confidence, margin, confidence_threshold, margin_threshold)

    class FiveClassResult:
        pass
    result = FiveClassResult()
    result.level = predicted_index + 1
    result.label = FIVE_CLASS_NAMES[predicted_index]
    result.confidence = confidence
    result.margin = margin
    result.probabilities = {i + 1: float(p) for i, p in enumerate(probs)}
    result.review = review
    return result

# ── Model loading (lazy, cached) ──
_tomato_model = None
MODEL_DIR = Path(__file__).resolve().parents[2] / "models" / "tomato_fgrade_5class"
MODEL_PATH = MODEL_DIR / "tomato_fgrade_5class.keras"

def get_tomato_model():
    global _tomato_model
    if _tomato_model is not None:
        return _tomato_model
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Tomato freshness model not found at {MODEL_PATH}. "
            "Place tomato_fgrade_5class.keras in backend/models/tomato_fgrade_5class/ "
            "from the Engine1/models/ directory."
        )
    import tensorflow as tf
    _tomato_model = tf.keras.models.load_model(str(MODEL_PATH), compile=False)
    return _tomato_model

def load_and_predict(image_path):
    """Load image, run through model, return 5-class probabilities."""
    import numpy as np
    from PIL import Image
    model = get_tomato_model()
    with Image.open(image_path) as img:
        img = img.convert("RGB")
        # Replicate the akay06 preprocessing: JPEG round-trip + resize
        from io import BytesIO
        buf = BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)
        img = Image.open(buf).convert("RGB")
        img = img.resize((224, 224))
        arr = np.asarray(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    pred = model.predict(arr, verbose=0)
    probs = np.asarray(pred).squeeze()
    # If model outputs 10 classes, group into 5
    if probs.shape == (10,):
        probs = np.array([
            probs[0] + probs[1],
            probs[2] + probs[3],
            probs[4] + probs[5],
            probs[6] + probs[7],
            probs[8] + probs[9]
        ], dtype=np.float32)
        probs = probs / np.sum(probs)
    return probs

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

def validate_image(image):
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail={
            "code": "INVALID_IMAGE_TYPE",
            "message": "Only JPEG, PNG and WEBP images are supported."
        })

def convert_result(result):
    return FreshnessPredictionResponse(
        freshness_level=result.level,
        freshness_label=result.label,
        confidence=result.confidence,
        margin=result.margin,
        probabilities=result.probabilities,
        review=ReviewResponse(
            decision=result.review.decision.value,
            reasons=[r.value for r in result.review.reasons],
            confidence=result.review.confidence,
            margin=result.review.margin,
            confidence_threshold=result.review.confidence_threshold,
            margin_threshold=result.review.margin_threshold
        )
    )

# ── Crop catalogue (from Engine1/crop_catalog.py) ──
CROP_CATALOGUE = {
    "apple": {"name": "Apple", "category": "Fruit"},
    "banana": {"name": "Banana", "category": "Fruit"},
    "bellpepper": {"name": "Bell Pepper", "category": "Vegetable", "aliases": ["bell pepper", "capsicum"]},
    "carrot": {"name": "Carrot", "category": "Vegetable"},
    "cucumber": {"name": "Cucumber", "category": "Vegetable"},
    "grape": {"name": "Grape", "category": "Fruit"},
    "guava": {"name": "Guava", "category": "Fruit"},
    "jujube": {"name": "Jujube", "category": "Fruit", "aliases": ["ber"]},
    "mango": {"name": "Mango", "category": "Fruit"},
    "orange": {"name": "Orange", "category": "Fruit"},
    "pomegranate": {"name": "Pomegranate", "category": "Fruit"},
    "potato": {"name": "Potato", "category": "Vegetable"},
    "strawberry": {"name": "Strawberry", "category": "Fruit"},
    "tomato": {"name": "Tomato", "category": "Fruit"},
}

# ── Fruit/Vegetable binary classifier (from akay06) ──
_healthy_rotten_model = None

def get_healthy_rotten_model():
    global _healthy_rotten_model
    if _healthy_rotten_model is not None:
        return _healthy_rotten_model
    akay_path = Path(__file__).resolve().parents[2] / "models" / "efficientnet.keras"
    if not akay_path.exists():
        raise FileNotFoundError(
            f"Fruit health model not found at {akay_path}. "
            "Place efficientnet.keras from akay06_source/App/models/ "
            "into backend/models/"
        )
    import tensorflow as tf
    _healthy_rotten_model = tf.keras.models.load_model(str(akay_path), compile=False)
    return _healthy_rotten_model

CLASS_NAMES_28 = [
    'Apple__Healthy', 'Apple__Rotten', 'Banana__Healthy', 'Banana__Rotten',
    'Bellpepper__Healthy', 'Bellpepper__Rotten', 'Carrot__Healthy', 'Carrot__Rotten',
    'Cucumber__Healthy', 'Cucumber__Rotten', 'Grape__Healthy', 'Grape__Rotten',
    'Guava__Healthy', 'Guava__Rotten', 'Jujube__Healthy', 'Jujube__Rotten',
    'Mango__Healthy', 'Mango__Rotten', 'Orange__Healthy', 'Orange__Rotten',
    'Pomegranate__Healthy', 'Pomegranate__Rotten', 'Potato__Healthy', 'Potato__Rotten',
    'Strawberry__Healthy', 'Strawberry__Rotten', 'Tomato__Healthy', 'Tomato__Rotten'
]

VEGETABLE_NAMES = {'Bellpepper', 'Carrot', 'Potato'}

# ── Endpoints ──
@router.get("/health")
def health():
    has_tomato = MODEL_PATH.exists()
    return {
        "status": "ok",
        "service": "freshness-engine",
        "tomato_model_available": has_tomato,
        "supported_crops": list(CROP_CATALOGUE.keys()),
    }

@router.get("/crops")
def list_crops():
    """List all crops supported by the freshness engine."""
    return {"crops": CROP_CATALOGUE, "total": len(CROP_CATALOGUE)}

@router.post("/tomato/predict", response_model=SingleImageResponse)
async def predict_tomato(image: UploadFile = File(...)):
    validate_image(image)
    suffix = Path(image.filename or ".jpg").suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        shutil.copyfileobj(image.file, temp_file)
        temp_path = Path(temp_file.name)
    try:
        probs = load_and_predict(temp_path)
        result = interpret_5class_probabilities(probs)
        return SingleImageResponse(
            image_name=image.filename or "uploaded_image",
            prediction=convert_result(result)
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail={"code": "MODEL_UNAVAILABLE", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "PREDICTION_FAILED", "message": str(e)})
    finally:
        temp_path.unlink(missing_ok=True)

@router.post("/tomato/inspect", response_model=MultiImageResponse)
async def inspect_tomatoes(images: List[UploadFile] = File(...)):
    if len(images) < 3:
        raise HTTPException(status_code=400, detail={
            "code": "INSUFFICIENT_IMAGES",
            "message": "At least 3 images are required for shipment inspection."
        })
    if len(images) > 5:
        raise HTTPException(status_code=400, detail={
            "code": "TOO_MANY_IMAGES",
            "message": "Maximum 5 images supported."
        })
    temporary_paths = []
    try:
        for image in images:
            validate_image(image)
            suffix = Path(image.filename or ".jpg").suffix
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                shutil.copyfileobj(image.file, temp_file)
                temporary_paths.append(Path(temp_file.name))

        import numpy as np
        individual = []
        all_probs = []
        for idx, (path, image) in enumerate(zip(temporary_paths, images)):
            probs = load_and_predict(path)
            all_probs.append(probs)
            result = interpret_5class_probabilities(probs)
            individual.append(IndividualImagePrediction(
                image_name=image.filename or f"image_{idx + 1}",
                freshness_level=result.level,
                freshness_label=result.label,
                confidence=result.confidence,
                margin=result.margin,
                decision=result.review.decision.value
            ))

        # Aggregate by mean probability
        mean_probs = np.mean(all_probs, axis=0)
        mean_probs = mean_probs / np.sum(mean_probs)
        agg_result = interpret_5class_probabilities(mean_probs)

        return MultiImageResponse(
            image_count=len(images),
            individual_predictions=individual,
            aggregated_prediction=convert_result(agg_result)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "INSPECTION_FAILED", "message": str(e)})
    finally:
        for path in temporary_paths:
            path.unlink(missing_ok=True)

@router.post("/classify")
async def classify_produce(image: UploadFile = File(...)):
    """
    Classify a produce image using the 28-class akay06 model.
    Returns: fruit name, type (fruit/vegetable), healthy/rotten, confidence.
    """
    validate_image(image)
    suffix = Path(image.filename or ".jpg").suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        shutil.copyfileobj(image.file, temp_file)
        temp_path = Path(temp_file.name)
    try:
        import numpy as np
        from PIL import Image
        from io import BytesIO
        model = get_healthy_rotten_model()
        with Image.open(temp_path) as img:
            img = img.convert("RGB")
            buf = BytesIO()
            img.save(buf, format="JPEG")
            buf.seek(0)
            img = Image.open(buf).convert("RGB")
            img = img.resize((224, 224))
            arr = np.asarray(img, dtype=np.float32)
        arr = np.expand_dims(arr, axis=0)
        pred = model.predict(arr, verbose=0)
        pred_idx = int(np.argmax(pred[0]))
        confidence = float(pred[0][pred_idx])
        if confidence < 0.5:
            return {"predicted_type": "Unknown", "predicted_name": "Unknown",
                    "confidence": confidence, "predicted_class": "Unknown"}
        pred_class = CLASS_NAMES_28[pred_idx]
        parts = pred_class.split("__")
        crop_name = parts[0]
        health_status = parts[1] if len(parts) > 1 else "Unknown"
        produce_type = "Vegetable" if crop_name in VEGETABLE_NAMES else "Fruit"
        return {
            "predicted_type": produce_type,
            "predicted_name": crop_name,
            "confidence": confidence,
            "predicted_class": health_status,
            "crop_info": CROP_CATALOGUE.get(crop_name.lower(), {})
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail={"code": "MODEL_UNAVAILABLE", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "CLASSIFICATION_FAILED", "message": str(e)})
    finally:
        temp_path.unlink(missing_ok=True)
