const API = "http://127.0.0.1:8000";

export type FarmerRecord = { farmer_id:string; name:string; village:string; district:string; state:string; preferred_language:string; profile_status:string; farm_count:number; listing_count:number; total_area_acres:number; crops:string[] };
export type FarmerDetail = { farmer:FarmerRecord; farms:Array<{farm_id:string;farm_name:string;area_acres:number;irrigation_type:string;water_availability:string;ph:number;nitrogen:number;phosphorus:number;potassium:number;previous_crop:string;current_crop:string}>; needs:{investment_budget:number;primary_goal:string;risk_preference:string}|null; listings:Array<{listing_id:string;crop_name:string;crop_variety:string;available_quantity_kg:number;price_per_kg:number;listing_status:string}> };

export async function getFarmerRecords(): Promise<FarmerRecord[]> {
  const response = await fetch(`${API}/marketplace/farmers`);
  if (!response.ok) throw new Error("Farmer records are unavailable");
  return (await response.json()).farmers;
}

export async function getFarmerDetail(id:string): Promise<FarmerDetail> {
  const response = await fetch(`${API}/marketplace/farmers/${id}`);
  if (!response.ok) throw new Error("Farmer profile is unavailable");
  return response.json();
}
