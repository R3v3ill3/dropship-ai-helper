import { NextRequest, NextResponse } from 'next/server';
import { getBrandingOutput } from '../../../lib/gpt';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const authorizationHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const accessToken = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.substring('Bearer '.length)
      : undefined;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized: missing access token' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await request.json();
    const { projectId } = body as { projectId?: string };
    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // Fetch the project to get input parameters, RLS ensures ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, product_name, target_persona, brand_tone, locality')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or inaccessible' }, { status: 404 });
    }

    const brandingOutput = await getBrandingOutput({
      product: project.product_name,
      persona: project.target_persona,
      tone: project.brand_tone || 'professional',
      location: project.locality,
    });

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
        budget_strategy: brandingOutput.budgetStrategy,
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

    return NextResponse.json({ success: true, output, branding: brandingOutput });
  } catch (error) {
    console.error('Error in regenerate-branding API:', error);
    const message = (error as Error)?.message || 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}

