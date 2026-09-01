"""
AgriOptima AI — Vehicle Rate Card (data only)

Pulled verbatim from the original transport_cost_mvp.py VEHICLE_TABLE.
Kept as pure data so logistics/vehicles.py (the logic layer) can be
swapped or extended without touching these numbers, and so the numbers
can be replaced with real transporter rates without touching any logic.

⚠️ Planning benchmarks — replace with real transporter rates when available.
"""

from dataclasses import dataclass


@dataclass
class Vehicle:
    name: str
    max_payload_kg: float
    max_volume_m3: float
    rate_per_km: float   # all-inclusive Rs/km


VEHICLE_TABLE = [
    Vehicle("Tata Ace",          1000,  5,  30),
    Vehicle("Pickup / Bolero",   2500,  10, 35),
    Vehicle("Tata 407",          3500,  16, 40),
    Vehicle("14 ft Truck",       5000,  25, 45),
    Vehicle("17 ft Truck",       7000,  35, 50),
    Vehicle("19 ft Truck",       9000,  45, 55),
    Vehicle("22 ft Truck",       12000, 60, 65),
    Vehicle("32 ft Truck",       18000, 90, 95),
]
