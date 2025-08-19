-- DropshipAI Database Setup Script (Improved)
-- Run this in your Supabase SQL editor

-- First, ensure we're working in the public schema
SET search_path = public;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS outputs CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Create projects table with explicit column definitions
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  product_description TEXT,
  target_persona TEXT NOT NULL,
  locality TEXT NOT NULL,
  brand_tone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create outputs table
CREATE TABLE outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  brand_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  landing_page_copy TEXT NOT NULL,
  ad_headlines TEXT[] NOT NULL DEFAULT '{}',
  tiktok_scripts TEXT[] NOT NULL DEFAULT '{}',
  ad_platforms TEXT[] NOT NULL DEFAULT '{}',
  budget_strategy TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

DROP POLICY IF EXISTS "Users can view own outputs" ON outputs;
DROP POLICY IF EXISTS "Users can insert own outputs" ON outputs;
DROP POLICY IF EXISTS "Users can update own outputs" ON outputs;
DROP POLICY IF EXISTS "Users can delete own outputs" ON outputs;

-- Create policies for projects table
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for outputs table
CREATE POLICY "Users can view own outputs" ON outputs
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own outputs" ON outputs
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own outputs" ON outputs
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own outputs" ON outputs
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_outputs_project_id ON outputs(project_id);
CREATE INDEX IF NOT EXISTS idx_outputs_created_at ON outputs(created_at);

-- Grant necessary permissions
GRANT ALL ON projects TO authenticated;
GRANT ALL ON outputs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Refresh the schema cache to ensure PostgREST picks up the changes
NOTIFY pgrst, 'reload schema';

-- Verify the tables were created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('projects', 'outputs') 
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;