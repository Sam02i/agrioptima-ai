"""
Buyer Cost Engine — configurable rates.

⚠️ These are demo/reference values (as specced in the team's Buyer Final
Cost Engine plan) — replace with verified, state-specific numbers before
using this for anything beyond a hackathon demo.
"""

from decimal import Decimal

# Platform fee: charged on Crop Cost. 1% in the demo.
PLATFORM_FEE_RATE = Decimal("0.01")

# Compliance rate: charged on Crop Cost. Flat demo rate; should later vary
# by state/crop (mandi cess, APMC charges, FSSAI, etc).
DEFAULT_COMPLIANCE_RATE = Decimal("0.005")  # 0.5%

# Spoilage rate bands: crop -> list of (max_eta_hours, spoilage_rate).
# Looked up by crop + ETA (ETA comes from the logistics module's output,
# reused here rather than recalculated — see integration contract).
SPOILAGE_BANDS = {
    "tomato": [(8, Decimal("0.015")), (16, Decimal("0.03")), (24, Decimal("0.05"))],
    "onion": [(8, Decimal("0.005")), (16, Decimal("0.01")), (24, Decimal("0.015"))],
    "potato": [(8, Decimal("0.004")), (16, Decimal("0.008")), (24, Decimal("0.012"))],
    "banana": [(8, Decimal("0.02")), (16, Decimal("0.035")), (24, Decimal("0.06"))],
    "mango": [(8, Decimal("0.02")), (16, Decimal("0.035")), (24, Decimal("0.06"))],
    "leafy_greens": [(2, Decimal("0.03")), (4, Decimal("0.06")), (8, Decimal("0.12"))],
    "default": [(8, Decimal("0.015")), (16, Decimal("0.03")), (24, Decimal("0.05"))],
}

# Beyond the last band's ETA hours, use this rate as a ceiling (prevents an
# undefined/uncapped spoilage rate for very long transit times).
SPOILAGE_RATE_BEYOND_MAX_ETA = Decimal("0.08")
