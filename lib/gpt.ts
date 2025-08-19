import OpenAI from 'openai';
import { generateBrandingPrompt, BrandingInput, BrandingOutput } from '../prompts/branding';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getBrandingOutput(input: BrandingInput): Promise<BrandingOutput> {
  try {
    const prompt = generateBrandingPrompt(input);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
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
      temperature: 0.8,
      max_tokens: 1000,
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
    throw new Error('Failed to generate branding output');
  }
}
