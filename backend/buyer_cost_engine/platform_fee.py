"""Platform Fee = Crop Cost x Platform Fee Rate."""

from decimal import Decimal
from .config import PLATFORM_FEE_RATE


def calculate_platform_fee(crop_cost: Decimal, rate: Decimal = None) -> Decimal:
    rate = rate if rate is not None else PLATFORM_FEE_RATE
    return crop_cost * rate
