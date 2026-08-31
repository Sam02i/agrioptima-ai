// Typical soil characteristics by district/region in Maharashtra and surrounding states
// Based on Soil Health Card data and ICAR soil surveys

export type SoilEstimate = {
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
};

const REGION_SOIL: Record<string, SoilEstimate> = {
  // Maharashtra
  "nashik": { soil_ph: 6.8, nitrogen: 72, phosphorus: 48, potassium: 55 },
  "pune": { soil_ph: 6.5, nitrogen: 68, phosphorus: 42, potassium: 50 },
  "aurangabad": { soil_ph: 7.2, nitrogen: 55, phosphorus: 35, potassium: 45 },
  "jalna": { soil_ph: 7.1, nitrogen: 52, phosphorus: 33, potassium: 42 },
  "ahmednagar": { soil_ph: 6.9, nitrogen: 65, phosphorus: 40, potassium: 48 },
  "solapur": { soil_ph: 7.5, nitrogen: 45, phosphorus: 30, potassium: 40 },
  "sangli": { soil_ph: 6.8, nitrogen: 60, phosphorus: 38, potassium: 52 },
  "satara": { soil_ph: 6.2, nitrogen: 70, phosphorus: 45, potassium: 55 },
  "kolhapur": { soil_ph: 5.8, nitrogen: 78, phosphorus: 50, potassium: 60 },
  "ratnagiri": { soil_ph: 5.5, nitrogen: 55, phosphorus: 30, potassium: 40 },
  "sindhudurg": { soil_ph: 5.4, nitrogen: 52, phosphorus: 28, potassium: 38 },
  "thane": { soil_ph: 6.0, nitrogen: 60, phosphorus: 35, potassium: 45 },
  "mumbai suburban": { soil_ph: 7.0, nitrogen: 50, phosphorus: 30, potassium: 40 },
  "nagpur": { soil_ph: 7.3, nitrogen: 58, phosphorus: 32, potassium: 42 },
  "wardha": { soil_ph: 7.0, nitrogen: 55, phosphorus: 30, potassium: 40 },
  "chandrapur": { soil_ph: 6.5, nitrogen: 62, phosphorus: 35, potassium: 45 },
  "gondia": { soil_ph: 6.2, nitrogen: 60, phosphorus: 33, potassium: 43 },
  "bhandara": { soil_ph: 6.4, nitrogen: 58, phosphorus: 32, potassium: 42 },
  "amravati": { soil_ph: 7.1, nitrogen: 52, phosphorus: 30, potassium: 38 },
  "akola": { soil_ph: 7.2, nitrogen: 48, phosphorus: 28, potassium: 35 },
  "buldhana": { soil_ph: 7.4, nitrogen: 45, phosphorus: 27, potassium: 33 },
  "washim": { soil_ph: 7.3, nitrogen: 46, phosphorus: 28, potassium: 34 },
  "yeotmal": { soil_ph: 7.0, nitrogen: 50, phosphorus: 30, potassium: 38 },
  "beed": { soil_ph: 7.6, nitrogen: 42, phosphorus: 25, potassium: 32 },
  "parbhani": { soil_ph: 7.5, nitrogen: 44, phosphorus: 26, potassium: 33 },
  "hingoli": { soil_ph: 7.3, nitrogen: 46, phosphorus: 27, potassium: 34 },
  "nanded": { soil_ph: 7.4, nitrogen: 48, phosphorus: 28, potassium: 35 },
  "osmanabad": { soil_ph: 7.6, nitrogen: 40, phosphorus: 24, potassium: 30 },
  "latur": { soil_ph: 7.5, nitrogen: 43, phosphorus: 26, potassium: 32 },

  // Karnataka
  "bangalore": { soil_ph: 6.0, nitrogen: 65, phosphorus: 40, potassium: 50 },
  "mysore": { soil_ph: 5.8, nitrogen: 68, phosphorus: 42, potassium: 52 },
  "mandya": { soil_ph: 5.9, nitrogen: 70, phosphorus: 44, potassium: 54 },
  "hassan": { soil_ph: 5.6, nitrogen: 72, phosphorus: 45, potassium: 55 },
  "belgaum": { soil_ph: 6.2, nitrogen: 60, phosphorus: 38, potassium: 48 },
  "hubli": { soil_ph: 6.3, nitrogen: 58, phosphorus: 36, potassium: 46 },
  "gulbarga": { soil_ph: 7.8, nitrogen: 40, phosphorus: 25, potassium: 30 },
  "bidar": { soil_ph: 7.5, nitrogen: 42, phosphorus: 26, potassium: 32 },

  // Madhya Pradesh
  "indore": { soil_ph: 7.0, nitrogen: 55, phosphorus: 35, potassium: 45 },
  "bhopal": { soil_ph: 6.8, nitrogen: 58, phosphorus: 38, potassium: 48 },
  "jabalpur": { soil_ph: 6.5, nitrogen: 62, phosphorus: 40, potassium: 50 },
  "gwalior": { soil_ph: 7.2, nitrogen: 50, phosphorus: 32, potassium: 42 },
  "ujjain": { soil_ph: 7.1, nitrogen: 52, phosphorus: 34, potassium: 44 },

  // Gujarat
  "ahmedabad": { soil_ph: 7.5, nitrogen: 45, phosphorus: 28, potassium: 35 },
  "rajkot": { soil_ph: 7.8, nitrogen: 42, phosphorus: 25, potassium: 32 },
  "surat": { soil_ph: 7.2, nitrogen: 48, phosphorus: 30, potassium: 38 },
  "vadodara": { soil_ph: 7.0, nitrogen: 50, phosphorus: 32, potassium: 40 },

  // Rajasthan
  "jaipur": { soil_ph: 7.8, nitrogen: 38, phosphorus: 22, potassium: 28 },
  "jodhpur": { soil_ph: 8.0, nitrogen: 35, phosphorus: 20, potassium: 25 },
  "udaipur": { soil_ph: 6.5, nitrogen: 55, phosphorus: 35, potassium: 45 },

  // Telangana
  "hyderabad": { soil_ph: 7.2, nitrogen: 52, phosphorus: 32, potassium: 42 },
  "warangal": { soil_ph: 6.8, nitrogen: 58, phosphorus: 36, potassium: 46 },
  "nizamabad": { soil_ph: 7.0, nitrogen: 55, phosphorus: 34, potassium: 44 },

  // Andhra Pradesh
  "vijayawada": { soil_ph: 7.0, nitrogen: 55, phosphorus: 34, potassium: 44 },
  "visakhapatnam": { soil_ph: 6.0, nitrogen: 62, phosphorus: 38, potassium: 48 },
  "tirupati": { soil_ph: 6.5, nitrogen: 58, phosphorus: 36, potassium: 46 },

  // Tamil Nadu
  "chennai": { soil_ph: 6.8, nitrogen: 55, phosphorus: 32, potassium: 42 },
  "coimbatore": { soil_ph: 6.2, nitrogen: 62, phosphorus: 40, potassium: 50 },
  "madurai": { soil_ph: 7.0, nitrogen: 50, phosphorus: 30, potassium: 40 },

  // Punjab
  "ludhiana": { soil_ph: 7.5, nitrogen: 60, phosphorus: 35, potassium: 45 },
  "amritsar": { soil_ph: 7.3, nitrogen: 58, phosphorus: 33, potassium: 43 },
  "jalandhar": { soil_ph: 7.2, nitrogen: 56, phosphorus: 32, potassium: 42 },

  // Haryana
  "hisar": { soil_ph: 7.8, nitrogen: 48, phosphorus: 28, potassium: 35 },
  "karnal": { soil_ph: 7.5, nitrogen: 52, phosphorus: 30, potassium: 38 },
  "rohtak": { soil_ph: 7.6, nitrogen: 50, phosphorus: 29, potassium: 36 },

  // Uttar Pradesh
  "lucknow": { soil_ph: 7.2, nitrogen: 55, phosphorus: 32, potassium: 42 },
  "agra": { soil_ph: 7.5, nitrogen: 48, phosphorus: 28, potassium: 35 },
  "kanpur": { soil_ph: 7.0, nitrogen: 52, phosphorus: 30, potassium: 40 },
  "varanasi": { soil_ph: 6.8, nitrogen: 58, phosphorus: 35, potassium: 45 },

  // Bihar
  "patna": { soil_ph: 7.0, nitrogen: 55, phosphorus: 32, potassium: 42 },
  "gaya": { soil_ph: 7.2, nitrogen: 50, phosphorus: 30, potassium: 40 },

  // West Bengal
  "kolkata": { soil_ph: 6.0, nitrogen: 62, phosphorus: 38, potassium: 48 },
  "burdwan": { soil_ph: 5.8, nitrogen: 65, phosphorus: 40, potassium: 50 },

  // Odisha
  "bhubaneswar": { soil_ph: 6.2, nitrogen: 58, phosphorus: 35, potassium: 45 },
  "cuttack": { soil_ph: 6.0, nitrogen: 60, phosphorus: 36, potassium: 46 },

  // Chhattisgarh
  "raipur": { soil_ph: 6.5, nitrogen: 55, phosphorus: 33, potassium: 43 },
};

// Default values when district is not found
const DEFAULT_SOIL: SoilEstimate = {
  soil_ph: 6.5,
  nitrogen: 55,
  phosphorus: 35,
  potassium: 45,
};

export function getSoilForDistrict(district: string): SoilEstimate {
  const key = district.toLowerCase().trim();
  return REGION_SOIL[key] || DEFAULT_SOIL;
}

export function getAvailableDistricts(): string[] {
  return Object.keys(REGION_SOIL).map(d => d.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
}
