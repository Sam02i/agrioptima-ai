"""
Central registry that classifies every data source used in recommendations.
Each source is labelled by class: live, cached, downloaded, demo, synthetic, or unavailable.
Satisfies PRD sections 33.7 and 28 (source-classification matrix).
"""

SOURCE_CLASSES = {
    "live": "Live public API data (real-time or near-real-time)",
    "cached": "Previously fetched live data, served from cache within TTL",
    "downloaded": "Official data downloaded from government portals (e.g., AGMARKNET CSV)",
    "demo": "Controlled demo/seed data — clearly labelled, not national feed",
    "synthetic": "Synthetic demonstration record — not real farmer data",
    "unavailable": "Data provider unreachable or no key configured; neutral fallback used",
    "farmer_provided": "Farmer-entered values from Soil Health Card, lab report, or manual entry",
}

# Labels that the UI must display (PRD section 33.7)
DISPLAY_LABELS = {
    "agmarknet_live": "AGMARKNET live market price",
    "agmarknet_downloaded": "AGMARKNET market-price sample — downloaded",
    "agmarknet_demo": "AGMARKNET market-price sample (demo fallback)",
    "open_meteo_live": "Live weather forecast (Open-Meteo)",
    "open_meteo_cached": "Cached weather from Open-Meteo",
    "open_meteo_unavailable": "Weather unavailable; neutral climate score used",
    "buyer_rfq_demo": "Platform RFQ/demo demand data",
    "buyer_rfq_none": "No matching active buyer RFQs; neutral demand score used",
    "soil_health_card": "Verified farmer soil values (Soil Health Card)",
    "lab_report": "Verified farmer soil values (Lab Report)",
    "manual_entry": "Farmer-entered soil values",
    "seasonal_climate_demo": "Seasonal climate scenario data",
    "synthetic_farmer": "Synthetic demonstration record",
    "nominatim_geocoded": "Location from OpenStreetMap Nominatim",
    "manual_coordinates": "Farmer-provided map coordinates",
}


def classify_source(provider: str, status: str) -> dict:
    """Return a labelled, auditable source record."""
    return {
        "provider": provider,
        "status": status,
        "class": SOURCE_CLASSES.get(status, SOURCE_CLASSES["unavailable"]),
        "display_label": DISPLAY_LABELS.get(
            f"{provider}_{status}", f"{provider} ({status})"
        ),
    }
