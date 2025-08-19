import { NextRequest, NextResponse } from 'next/server';
import { getBrandingOutput } from '../../../lib/gpt';
import { supabase } from '../../../lib/supabase';
import { BrandingInput } from '../../../prompts/branding';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, persona, tone, location, userId } = body;

    // Validate input
    if (!product || !persona || !tone || !location || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // Store project in database
    const { data: project, error: projectError } = await supabase
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

    if (projectError) {
      console.error('Error creating project:', projectError);
      return NextResponse.json(
        { error: 'Failed to save project' },
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
        { error: 'Failed to save output' },
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
