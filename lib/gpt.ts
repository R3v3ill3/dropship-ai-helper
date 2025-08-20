import OpenAI from 'openai';
import { generateBrandingPrompt, BrandingInput, BrandingOutput } from '../prompts/branding';
import { generateSegmentRecommendationPrompt } from '../prompts/recommendSegments';

export async function getBrandingOutput(input: BrandingInput): Promise<BrandingOutput> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }
    const openai = new OpenAI({ apiKey });
    const envModel = (process.env.OPENAI_MODEL || '').trim();
    // Whitelist of supported models for this endpoint
    const supportedModels = new Set<string>([
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4.1-mini',
      'gpt-4.1'
    ]);
    const model = supportedModels.has(envModel) ? envModel : 'gpt-4o';
    if (envModel && !supportedModels.has(envModel)) {
      // Do not throw; just warn and fall back to a known-good model
      console.warn(`Unsupported OPENAI_MODEL value '${envModel}'. Falling back to '${model}'.`);
    }
    const temperature = process.env.OPENAI_TEMPERATURE ? Number(process.env.OPENAI_TEMPERATURE) : 0.7;
    const maxTokens = process.env.OPENAI_MAX_TOKENS ? Number(process.env.OPENAI_MAX_TOKENS) : 2000;
    const prompt = generateBrandingPrompt(input);
    
    let response: string | null = null;
    try {
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
        // JSON mode is supported by 'gpt-4o-mini' and related models
        response_format: { type: 'json_object' }
      });
      response = completion.choices[0]?.message?.content ?? null;
    } catch (jsonModeError: any) {
      const msg = jsonModeError?.response?.data?.error?.message || jsonModeError?.message || '';
      const indicatesUnsupported = /response_format|json(\s|-)?mode|not supported|Unsupported/i.test(msg);
      if (!indicatesUnsupported) {
        throw jsonModeError;
      }
      // Retry without JSON mode
      console.warn('JSON mode not supported by model; retrying without response_format.');
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
        max_tokens: maxTokens
      });
      response = completion.choices[0]?.message?.content ?? null;
    }
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    try {
      // First attempt: direct parse
      let parsed: any;
      try {
        parsed = JSON.parse(response);
      } catch (e) {
        // Fallback: extract JSON object substring heuristically
        const firstBrace = response.indexOf('{');
        const lastBrace = response.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          const maybeJson = response.slice(firstBrace, lastBrace + 1);
          parsed = JSON.parse(maybeJson);
        } else {
          throw e;
        }
      }
      
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

      // Normalize array fields in case the model returned strings
      const normalizeToStringArray = (value: unknown): string[] => {
        if (Array.isArray(value)) {
          return value.map((v) => String(v).trim()).filter(Boolean);
        }
        if (typeof value === 'string') {
          const split = value
            .split(/\n+|\r+|\u2022|\-|\d+\.|\*/)
            .map((v) => v.trim())
            .filter(Boolean);
          return split.length > 0 ? split : [value];
        }
        return [];
      };

      const branding: BrandingOutput = {
        brandName: String(parsed.brandName),
        tagline: String(parsed.tagline),
        landingPageCopy: String(parsed.landingPageCopy),
        adHeadlines: normalizeToStringArray(parsed.adHeadlines),
        tiktokScripts: normalizeToStringArray(parsed.tiktokScripts),
        adPlatforms: normalizeToStringArray(parsed.adPlatforms),
        budgetStrategy: String(parsed.budgetStrategy)
      };

      return branding;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response);
      throw new Error('Invalid response format from AI');
    }
    
  } catch (error: any) {
    // Surface richer details, including API error payload when available
    const apiErrorMessage =
      error?.response?.data?.error?.message ||
      error?.error?.message ||
      error?.message ||
      'Unknown error';
    console.error('Error calling OpenAI:', apiErrorMessage);
    throw new Error(`Failed to generate branding output: ${apiErrorMessage}`);
  }
}

export interface SegmentRecommendationResult {
  recommendedSegments: string[];
  reasoningSummary?: string;
  productName?: string;
  productDescription?: string;
}

export async function recommendSegmentsFromWebsite(params: {
  websiteText: string;
  availableSegments: string[];
  locale?: string;
  topN?: number;
}): Promise<SegmentRecommendationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OpenAI API key');
  }
  const openai = new OpenAI({ apiKey });
  const envModel = (process.env.OPENAI_MODEL || '').trim();
  const supportedModels = new Set<string>([
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4.1-mini',
    'gpt-4.1'
  ]);
  const model = supportedModels.has(envModel) ? envModel : 'gpt-4o';
  const temperature = process.env.OPENAI_TEMPERATURE ? Number(process.env.OPENAI_TEMPERATURE) : 0.3;
  const maxTokens = process.env.OPENAI_MAX_TOKENS ? Number(process.env.OPENAI_MAX_TOKENS) : 1200;

  const prompt = generateSegmentRecommendationPrompt({
    websiteText: params.websiteText,
    helixSegments: params.availableSegments,
    locale: params.locale ?? 'Australia',
    topN: params.topN ?? 3
  });

  let response: string | null = null;
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a market segmentation expert. Output strictly valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    });
    response = completion.choices[0]?.message?.content ?? null;
  } catch (jsonModeError: any) {
    const msg = jsonModeError?.response?.data?.error?.message || jsonModeError?.message || '';
    const indicatesUnsupported = /response_format|json(\s|-)?mode|not supported|Unsupported/i.test(msg);
    if (!indicatesUnsupported) {
      throw jsonModeError;
    }
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a market segmentation expert. Output strictly valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens
    });
    response = completion.choices[0]?.message?.content ?? null;
  }

  if (!response) {
    throw new Error('No response from OpenAI');
  }

  try {
    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (e) {
      const firstBrace = response.indexOf('{');
      const lastBrace = response.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        parsed = JSON.parse(response.slice(firstBrace, lastBrace + 1));
      } else {
        throw e;
      }
    }
    const rec = Array.isArray(parsed.recommendedSegments) ? parsed.recommendedSegments.map((s: any) => String(s).trim()).filter(Boolean) : [];
    const reasoning = typeof parsed.reasoningSummary === 'string' ? parsed.reasoningSummary : undefined;
    const name = typeof parsed.productName === 'string' ? parsed.productName.trim() : '';
    const desc = typeof parsed.productDescription === 'string' ? parsed.productDescription.trim() : '';
    const productName = name.length > 0 ? name : undefined;
    const productDescription = desc.length > 0 ? desc : undefined;
    return { recommendedSegments: rec, reasoningSummary: reasoning, productName, productDescription };
  } catch (e) {
    console.error('Failed to parse segment recommendation:', response);
    throw new Error('Invalid response format from AI');
  }
}

