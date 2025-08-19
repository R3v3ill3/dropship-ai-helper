import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  product_name: string;
  product_description: string;
  target_persona: string;
  locality: string;
  brand_tone: string;
  created_at: string;
}

export interface Output {
  id: string;
  project_id: string;
  brand_name: string;
  tagline: string;
  landing_page_copy: string;
  ad_headlines: string[];
  tiktok_scripts: string[];
  ad_platforms: string[];
  budget_strategy: string;
  created_at: string;
}
