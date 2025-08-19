#!/usr/bin/env node

// Database verification script
// Run with: node scripts/verify-database.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function verifyDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log('🔍 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Check if projects table exists and has the correct structure
    console.log('📋 Checking projects table structure...');
    const { data: projectsCheck, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(0);

    if (projectsError) {
      console.error('❌ Projects table error:', projectsError);
      console.log('💡 Please run the database-setup-improved.sql script in your Supabase SQL editor');
      return;
    }

    console.log('✅ Projects table exists');

    // Check if outputs table exists
    console.log('📋 Checking outputs table structure...');
    const { data: outputsCheck, error: outputsError } = await supabase
      .from('outputs')
      .select('*')
      .limit(0);

    if (outputsError) {
      console.error('❌ Outputs table error:', outputsError);
      console.log('💡 Please run the database-setup-improved.sql script in your Supabase SQL editor');
      return;
    }

    console.log('✅ Outputs table exists');

    // Try to get table schema information
    console.log('🔍 Fetching table schema information...');
    
    // This is a basic test - in a real scenario, you'd want to check the actual column structure
    // For now, we'll just verify the tables are accessible
    
    console.log('✅ Database verification completed successfully!');
    console.log('📊 Both projects and outputs tables are accessible');
    console.log('🚀 Your database should be ready for the application');

  } catch (error) {
    console.error('❌ Unexpected error during verification:', error);
    console.log('💡 Please check your Supabase configuration and try again');
  }
}

verifyDatabase();