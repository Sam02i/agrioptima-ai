"""
AgriOptima AI — Farmer Transparency Display

Pure formatting layer over agrioptima.logistics.landed_cost's output.
Does NOT recalculate anything — takes the result of
calculate_procurement_plan_landed_cost() (already computed in main.py's
run_agrioptima_logistics()) and renders it as a farmer-facing screen.

Model confirmed by landed_cost.py: buyer bears ALL logistics cost
(transport + handling + wastage + risk). Farmers receive their full
price_per_kg with zero deductions — this matches the plan's recommended
default ("farmers see the exact guaranteed price before accepting").

Usage:
    from agrioptima.main import run_agrioptima_logistics
    from agrioptima.logistics.farmer_display import print_farmer_transparency_screen

    result = run_agrioptima_logistics(shipment)
    print_farmer_transparency_screen(result)
"""


def print_farmer_transparency_screen(pipeline_result: dict) -> None:
    """
    pipeline_result: the full dict returned by run_agrioptima_logistics().
    Renders the farmer-facing transparency screen from its landed_cost section.
    """
    recommended = pipeline_result["recommended_model"]
    landed = pipeline_result["landed_cost"]
    summary = pipeline_result["shipment_summary"]

    print("=" * 55)
    print("GROUP ORDER — FARMER TRANSPARENCY SCREEN")
    print("=" * 55)
    print(f"Crop: {summary['crop']}")
    print(f"Total quantity: {summary['total_quantity_kg']} kg")
    print(f"Recommended logistics model: {recommended.get('model_name', recommended.get('name', '—'))}")
    print(f"Logistics cost: Rs {recommended['cost_per_kg']}/kg (same for every farmer — shared truck/route)")
    print("-" * 55)
    print("NOTE: You receive your FULL agreed price below. The buyer")
    print("      separately covers all transport, handling, wastage")
    print("      and risk cost — nothing is deducted from your payment.")
    print("-" * 55)

    for f in landed["farmers"]:
        print(f"\n{f['farmer_id']}")
        print(f"  Quantity: {f['quantity_kg']} kg")
        print(f"  Your agreed price: Rs {f['price_per_kg']}/kg")
        print(f"  --> You receive: Rs {f['price_per_kg']}/kg "
              f"(Rs {f['breakdown']['purchase_cost']} total) — no deductions")
        print(f"  [Buyer-side cost for your lot, for reference only:]")
        print(f"    Transport (shared): Rs {f['breakdown']['transport_cost']}")
        print(f"    Handling: Rs {f['breakdown']['handling_cost']}")
        print(f"    Wastage reserve ({f['wastage_detail']['wastage_rate_pct']}%): "
              f"Rs {f['wastage_detail']['wastage_cost']}")
        print(f"    Risk penalty (reliability {f['risk_detail']['reliability_score']}): "
              f"Rs {f['risk_detail']['risk_penalty_cost']}")
        print(f"    Buyer's total landed cost for this lot: Rs {f['total_landed_cost']} "
              f"(Rs {f['landed_cost_per_kg']}/kg)")

    print("\n" + "-" * 55)
    print(f"Blended landed cost across whole shipment: "
          f"Rs {landed['blended_landed_cost_per_kg']}/kg")
    if "within_buyer_budget" in landed:
        status = "WITHIN budget" if landed["within_buyer_budget"] else "OVER budget"
        print(f"Buyer's max landed cost: Rs {landed['max_landed_cost_per_kg']}/kg -> {status}")
    print("=" * 55)


# ---------------------------------------------------------------------------
# DEMO — reuses main.py's exact worked example
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from agrioptima.main import run_agrioptima_logistics

    shipment = {
        "crop": "tomato",
        "farmer_price_per_kg": 25,
        "farmers": [
            {"name": "Farmer A", "quantity_kg": 3000, "latlon": [30.90, 75.85], "price_per_kg": 22, "reliability_score": 91},
            {"name": "Farmer B", "quantity_kg": 3000, "latlon": [30.95, 75.90], "price_per_kg": 24, "reliability_score": 88},
            {"name": "Farmer C", "quantity_kg": 4000, "latlon": [31.00, 75.95], "price_per_kg": 21, "reliability_score": 94},
        ],
        "buyer": {"name": "Azadpur Mandi", "latlon": [28.70, 77.16]},
        "collection_hub": {"name": "Example Collection Hub", "latlon": [30.80, 75.80]},
        "max_landed_cost_per_kg": 30,
    }

    result = run_agrioptima_logistics(shipment)
    print_farmer_transparency_screen(result)
