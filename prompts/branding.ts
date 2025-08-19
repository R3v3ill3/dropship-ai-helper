export interface BrandingInput {
  product: string;
  persona: string;
  tone: string;
  location: string;
}

export interface BrandingOutput {
  brandName: string;
  tagline: string;
  landingPageCopy: string;
  adHeadlines: string[];
  tiktokScripts: string[];
  adPlatforms: string[];
  budgetStrategy: string;
}

export function generateBrandingPrompt(input: BrandingInput): string {
  return `You are a creative branding strategist specializing in dropshipping businesses. A dropshipper wants help crafting a compelling brand identity and marketing strategy.

Their product is: ${input.product}
Their target audience matches the ${input.persona} segment in Australia
The brand should feel: ${input.tone}
They are based in: ${input.location}

Please provide a complete branding package in the following JSON format:

{
  "brandName": "A catchy, memorable brand name that fits the tone and target audience",
  "tagline": "A compelling tagline that captures the brand essence",
  "landingPageCopy": "A 2-sentence pitch for the landing page that hooks visitors",
  "adHeadlines": [
    "3 short, punchy ad headlines for Facebook/Google ads",
    "Each should be under 40 characters and action-oriented",
    "Focus on benefits and urgency"
  ],
  "tiktokScripts": [
    "2 TikTok ad scripts (15-30 seconds each)",
    "Include hooks, pain points, and clear CTAs",
    "Make them engaging and platform-appropriate"
  ],
  "adPlatforms": [
    "3-4 recommended ad platforms based on the target persona",
    "Consider Facebook, Instagram, TikTok, Google, YouTube, etc."
  ],
  "budgetStrategy": "A brief budget allocation strategy (e.g., 'Start with $50/day on Facebook, $30/day on Google, test TikTok with $20/day')"
}

Make sure the brand name, tagline, and copy are:
- Relevant to the Australian market and location
- Appropriate for the target Helix persona
- Consistent with the chosen brand tone
- Optimized for conversion and memorability

Return only valid JSON, no additional text.`;
}

