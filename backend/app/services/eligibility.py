from dataclasses import dataclass

# ? Setting up global dictionaries to convert text values into numbers so the code can compare which one is higher or lower.

IRRIGATION_RANK = {"none" : 0,"limited" : 2,"adequate" : 3}
WATER_RANK = {"low":1, "medium":2,"high":3}

#? instead of manually writing an initializer and a string representation we are using dataclass
@dataclass
class Rejection:
    crop : str
    codes : list[str]
    explanation : str

#! For one Farm and one crop we are checking 5 rules one at a time
# will return either a Rejection object or None
def evaluate_eligibility(profile: dict , crop: dict) -> Rejection|None:
    codes : list[str] = []
    messages : list[str] = []

    if profile['season'] not in crop['seasons']:
        codes.append("SEASON_NOT_SUPPORTED")
        message.append(f"{crop['crop']} is not configured for the selected {profile['season']} season")

# If the list has codes → crop is rejected, returns a Rejection object explaining it
# If the list is empty → crop is eligible, returns None (nothing to reject)

    if not crop['min_ph'] <= profile["soil_ph"] <= crop['max_ph']:
        codes.append("SOIL_PH_OUT_OF_RANGE")
        messages.append(f"Soil Ph {profile['soil_ph']:.1f} is outside the {crop['min_ph']:.1f}- {crop['max_ph']:.1f} crop-profile range")

    if IRRIGATION_RANK[profile['irrigation']] < WATER_RANK[crop['water_requirement']]:
        codes.append("INSUFFICIENT_IRRIGATION")
        messages.append(f"{crop['crop']} requires {crop['water_requirement']} water availability" 
        f"This farm is recorded as {profile['irrigation']} irrigation")

    budget_per_acre = profile['investment_budget_rupees']/ profile['area_acres']
    if budget_per_acre < crop['minimum_investment_rupees_per_acre']:
        codes.append("BUDGET_INSUFFICIENT")
        messages.append(f"Estimated minimum investment is ₹{crop['minimum_investment_rupees_per_acre']:,} per acre, "
        "above the declared available amount per acre.")

    if profile['previous_crop'].casefold() == crop["crop"].casefold():
        codes.append("BASIC_ROTATION_RULE")
        messages.append(f"{crop['crop']} matches the previous crop and is excluded by the prototype rotation rule.")

    return Rejection(crop["crop"], codes, " ".join(messages)) if codes else None

    

