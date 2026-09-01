"""Compliance Cost = Crop Cost x Applicable Compliance Rate."""

from decimal import Decimal
from .config import DEFAULT_COMPLIANCE_RATE


def calculate_compliance_cost(crop_cost: Decimal, rate: Decimal = None) -> Decimal:
    rate = rate if rate is not None else DEFAULT_COMPLIANCE_RATE
    return crop_cost * rate
