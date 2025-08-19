import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
  }
  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

// Database types

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

