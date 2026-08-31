from fastapi import APIRouter
from app.services.pincode_lookup import lookup

router = APIRouter(prefix="/api/v1/pincode", tags=["pincode"])


@router.get("/{pincode}")
def get_pincode_coords(pincode: str):
    """
    Return latitude and longitude for a 6-digit Indian pincode.
    Used by the frontend to auto-fill farm coordinates.
    """
    result = lookup(pincode)
    if result is None:
        return {"error": "Pincode not found", "pincode": pincode}
    return {
        "pincode": pincode,
        "latitude": result["latitude"],
        "longitude": result["longitude"],
    }
