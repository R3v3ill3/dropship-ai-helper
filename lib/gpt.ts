import OpenAI from 'openai';
import { generateBrandingPrompt, BrandingInput, BrandingOutput } from '../prompts/branding';

export async function getBrandingOutput(input: BrandingInput): Promise<BrandingOutput> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }
    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const temperature = process.env.OPENAI_TEMPERATURE ? Number(process.env.OPENAI_TEMPERATURE) : 0.7;
    const maxTokens = process.env.OPENAI_MAX_TOKENS ? Number(process.env.OPENAI_MAX_TOKENS) : 1200;
    const prompt = generateBrandingPrompt(input);
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a creative branding strategist. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(response);
      
      // Validate the response structure
      const requiredFields = [
        'brandName', 'tagline', 'landingPageCopy', 
        'adHeadlines', 'tiktokScripts', 'adPlatforms', 'budgetStrategy'
      ];
      
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return parsed as BrandingOutput;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response);
      throw new Error('Invalid response format from AI');
    }
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    const message = (error as Error)?.message || 'Unknown error';
    throw new Error(`Failed to generate branding output: ${message}`);
  }
}

