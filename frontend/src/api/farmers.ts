const API = "http://127.0.0.1:8000";

export type FarmerRecord = { farmer_id:string; name:string; village:string; district:string; state:string; preferred_language:string; profile_status:string; farm_count:number; listing_count:number; total_area_acres:number; crops:string[] };
export type FarmerDetail = { farmer:FarmerRecord; farms:Array<{farm_id:string;farm_name:string;latitude:number;longitude:number;area_acres:number;irrigation_type:string;water_availability:string;ph:number;nitrogen:number;phosphorus:number;potassium:number;previous_crop:string;current_crop:string}>; needs:{investment_budget:number;primary_goal:string;risk_preference:string}|null; listings:Array<{listing_id:string;crop_name:string;crop_variety:string;available_quantity_kg:number;price_per_kg:number;listing_status:string;image_data?:string}> };

export async function getFarmerRecords(): Promise<FarmerRecord[]> {
  const [marketplace,created] = await Promise.allSettled([fetch(`${API}/marketplace/farmers`).then((r)=>r.json()),fetch(`${API}/api/v1/farmers`).then((r)=>r.json())]);
  const imported:FarmerRecord[]=marketplace.status==="fulfilled"?(marketplace.value.farmers||[]):[];
  const saved:FarmerRecord[]=created.status==="fulfilled"&&Array.isArray(created.value)?created.value.map((item:any)=>({...item,preferred_language:"en",profile_status:"COMPLETE",listing_count:0,total_area_acres:0,crops:[]})):[];
  const seen=new Set(imported.map((item)=>item.farmer_id));
  return [...imported,...saved.filter((item)=>!seen.has(item.farmer_id))];
}

export async function getFarmerDetail(id:string): Promise<FarmerDetail> {
  const response = await fetch(`${API}/marketplace/farmers/${id}`);
  if (response.ok) return response.json();
  const saved=await fetch(`${API}/api/v1/farmers/${id}`);
  if(!saved.ok) throw new Error("Farmer profile is unavailable");
  const data=await saved.json();
  return {farmer:{...data,preferred_language:"en",profile_status:"COMPLETE",farm_count:data.farms?.length||0,listing_count:0,total_area_acres:data.farms?.reduce((sum:number,farm:any)=>sum+farm.area_acres,0)||0,crops:[]},farms:(data.farms||[]).map((farm:any)=>({...farm,farm_name:"My farm",irrigation_type:farm.irrigation,water_availability:farm.irrigation==="none"?"low":"medium",ph:farm.soil_ph,nitrogen:0,phosphorus:0,potassium:0,previous_crop:"",current_crop:""})),needs:null,listings:[]};
}

export async function createFarmerProfile(payload:{name:string;village:string;district:string;state:string;area_acres:number;soil_ph:number;investment_budget_rupees:number}) {
  const response=await fetch(`${API}/api/v1/farmers`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,season:"Kharif",irrigation:"limited",nitrogen:0,phosphorus:0,potassium:0,soil_source:"manual_entry",previous_crop:"Unknown",sowing_period:"June-July"})});
  if(!response.ok) throw new Error("Unable to create farmer profile");
  return response.json() as Promise<{farmer_id:string;farm_id:string}>;
}
