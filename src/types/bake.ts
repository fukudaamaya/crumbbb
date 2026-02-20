export interface Flour {
  type: string;
  grams: number;
}

export interface Bake {
  id: string;
  name: string;
  date: string; // ISO date string YYYY-MM-DD
  loaf_count: number;
  loaf_weight_g: number;
  flours: Flour[];
  // Water, starter, leaven in grams
  water_g: number;
  starter_g: number;
  leaven_g: number;
  // Calculated percentages
  hydration_pct: number;
  starter_pct: number;
  leaven_pct: number;
  proofing_time_mins: number;
  bake_temp_c: number;
  bake_time_mins: number;
  photo_base64: string;
  crumb_photo_base64: string;
  notes: string;
  rating: number; // 1-5
  is_favourite: boolean;
  created_at: string; // ISO timestamp
}

export const STORAGE_KEY = 'crumb_bakes';
