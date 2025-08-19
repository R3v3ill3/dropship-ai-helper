-- DropshipAI Database Setup Script
-- Run this in your Supabase SQL editor

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_description TEXT,
  target_persona TEXT NOT NULL,
  locality TEXT NOT NULL,
  brand_tone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outputs table
CREATE TABLE IF NOT EXISTS outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  landing_page_copy TEXT NOT NULL,
  ad_headlines TEXT[] NOT NULL,
  tiktok_scripts TEXT[] NOT NULL,
  ad_platforms TEXT[] NOT NULL,
  budget_strategy TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for outputs table
DROP POLICY IF EXISTS "Users can view own outputs" ON outputs;
CREATE POLICY "Users can view own outputs" ON outputs
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own outputs" ON outputs;
CREATE POLICY "Users can insert own outputs" ON outputs
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own outputs" ON outputs;
CREATE POLICY "Users can update own outputs" ON outputs
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own outputs" ON outputs;
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
