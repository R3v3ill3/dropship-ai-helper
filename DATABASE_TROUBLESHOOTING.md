# Database Troubleshooting Guide

## Issue: "Could not find the 'brand_tone' column of 'projects' in the schema cache"

This error (PGRST204) indicates that PostgREST (Supabase's API layer) cannot find the expected column in the database schema. Here's how to fix it:

### Step 1: Verify Database Schema

1. **Log into your Supabase dashboard**
2. **Go to the SQL Editor**
3. **Run the improved database setup script:**

```sql
-- Copy and paste the contents of database-setup-improved.sql
-- This will recreate the tables with the correct structure
```

### Step 2: Refresh Schema Cache

After running the setup script, the schema cache should automatically refresh. If it doesn't:

1. **In Supabase dashboard, go to Settings → API**
2. **Click "Restart API" to force a schema cache refresh**

### Step 3: Verify Environment Variables

Make sure these environment variables are set correctly in Railway:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NODE_VERSION=20.11.0
```

### Step 4: Test Database Connection

Run the verification script:

```bash
npm run verify-db
```

This will check if your database tables are accessible and properly configured.

### Step 5: Check Row Level Security (RLS)

Ensure RLS policies are correctly set up:

1. **Projects table should have policies for:**
   - SELECT: Users can view own projects
   - INSERT: Users can insert own projects
   - UPDATE: Users can update own projects
   - DELETE: Users can delete own projects

2. **Outputs table should have policies for:**
   - SELECT: Users can view outputs for their projects
   - INSERT: Users can insert outputs for their projects
   - UPDATE: Users can update outputs for their projects
   - DELETE: Users can delete outputs for their projects

### Common Issues and Solutions

#### Issue: "relation 'projects' does not exist"
**Solution:** Run the database setup script in Supabase SQL editor.

#### Issue: "permission denied for table projects"
**Solution:** Check RLS policies and ensure the user is authenticated.

#### Issue: "JWT expired" or authentication errors
**Solution:** Check that the authorization header is being passed correctly and the token is valid.

#### Issue: Node.js deprecation warnings
**Solution:** Ensure NODE_VERSION=20.11.0 is set in Railway environment variables.

### Manual Database Verification

You can manually verify the database structure by running this SQL in Supabase:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('projects', 'outputs');

-- Check projects table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if brand_tone column exists specifically
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND table_schema = 'public' 
  AND column_name = 'brand_tone';
```

### If All Else Fails

1. **Drop and recreate the tables** using the improved setup script
2. **Restart the Supabase API** from the dashboard
3. **Redeploy your Railway application** to ensure it picks up the latest changes
4. **Check Railway logs** for any additional error details

The improved database setup script includes explicit schema refresh commands and better error handling to prevent these issues in the future.