import { NextRequest, NextResponse } from 'next/server';
import { getBrandingOutput } from '../../../lib/gpt';
import { createClient } from '@supabase/supabase-js';
import { BrandingInput } from '../../../prompts/branding';

export async function POST(request: NextRequest) {
  try {
    // Extract bearer token from Authorization header
    const authorizationHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const accessToken = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.substring('Bearer '.length)
      : undefined;

    // Quick env sanity checks to surface configuration issues early
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('Missing environment variable: OPENAI_API_KEY');
      return NextResponse.json({ error: 'Server misconfiguration: missing OPENAI_API_KEY' }, { status: 500 });
    }

    // Create a per-request Supabase client bound to the user's access token for RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const { product, persona, tone, location, userId } = body;

    // Validate input
    if (!product || !persona || !tone || !location || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure we have a user token to satisfy RLS on inserts
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized: missing access token' },
        { status: 401 }
      );
    }

    // Generate branding using GPT
    const brandingInput: BrandingInput = {
      product,
      persona,
      tone,
      location
    };

    const brandingOutput = await getBrandingOutput(brandingInput);

    // First, let's verify the table structure exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('projects')
      .select('*')
      .limit(0);

    if (tableError) {
      console.error('Error checking projects table structure:', tableError);
      return NextResponse.json(
        { error: 'Database schema issue', details: tableError.message, code: tableError.code },
        { status: 500 }
      );
    }

    // Store project in database with fallback logic
    console.log('Attempting to insert project with data:', {
      user_id: userId,
      product_name: product,
      product_description: product,
      target_persona: persona,
      locality: location,
      brand_tone: tone
    });

    // First try with brand_tone column
    let project, projectError;
    
    try {
      const result = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          product_name: product,
          product_description: product, // Using product as description for now
          target_persona: persona,
          locality: location,
          brand_tone: tone
        })
        .select()
        .single();
      
      project = result.data;
      projectError = result.error;
    } catch (error) {
      // If brand_tone column doesn't exist, try without it
      if (error && (error as any).code === 'PGRST204') {
        console.log('brand_tone column not found, inserting without it');
        const fallbackResult = await supabase
          .from('projects')
          .insert({
            user_id: userId,
            product_name: product,
            product_description: product,
            target_persona: persona,
            locality: location
          })
          .select()
          .single();
        
        project = fallbackResult.data;
        projectError = fallbackResult.error;
      } else {
        throw error;
      }
    }

    if (projectError) {
      console.error('Error creating project:', {
        message: projectError.message,
        details: projectError.details,
        hint: projectError.hint,
        code: projectError.code
      });
      return NextResponse.json(
        { 
          error: 'Failed to save project', 
          details: projectError.message,
          code: projectError.code,
          hint: projectError.hint
        },
        { status: 500 }
      );
    }

    // Store output in database
    const { data: output, error: outputError } = await supabase
      .from('outputs')
      .insert({
        project_id: project.id,
        brand_name: brandingOutput.brandName,
        tagline: brandingOutput.tagline,
        landing_page_copy: brandingOutput.landingPageCopy,
        ad_headlines: brandingOutput.adHeadlines,
        tiktok_scripts: brandingOutput.tiktokScripts,
        ad_platforms: brandingOutput.adPlatforms,
        budget_strategy: brandingOutput.budgetStrategy
      })
      .select()
      .single();

    if (outputError) {
      console.error('Error creating output:', outputError);
      return NextResponse.json(
        { error: 'Failed to save output', details: outputError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: project,
      output: output,
      branding: brandingOutput
    });

  } catch (error) {
    console.error('Error in generate-branding API:', error);
    const message = (error as Error)?.message || 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}

