export interface SegmentRecommendationPromptInput {
	websiteText: string;
	helixSegments: string[];
	locale: string; // e.g., 'Australia'
	topN: number;   // e.g., 3
}

export function generateSegmentRecommendationPrompt(input: SegmentRecommendationPromptInput): string {
	const segmentList = input.helixSegments && input.helixSegments.length > 0
		? input.helixSegments.join(', ')
		: 'Socially Aware Urbanites, Rural Traditionalists, Affluent and Ambitious, Family-Focused Suburbanites, Young Professional Urbanites, Retirement-Age Traditionalists, Creative and Alternative, Health and Wellness Enthusiasts, Tech-Savvy Early Adopters, Value-Conscious Pragmatists';

	return `You are a market segmentation specialist familiar with Helix persona segments in ${input.locale}.

Analyze the following dropshipping website content and recommend the top ${input.topN} Helix persona segments to target. Pick ONLY from this list of allowed segment labels: ${segmentList}.

Website content (truncated):
"""
${input.websiteText}
"""

Output strictly valid JSON with the following shape:
{
  "recommendedSegments": ["Segment Label 1", "Segment Label 2", "Segment Label 3"],
  "reasoningSummary": "2-3 sentences explaining why these segments are a fit based on product, message, tone, and value props.",
  "productName": "Concise product title extracted from the page (leave empty if not clearly a single product page)",
  "productDescription": "2-4 sentence summary of the product features/benefits in plain language (leave empty if not applicable)"
}

Rules:
- Use only labels from the provided list; do not invent new Helix segment names.
- Base your choices on audience signals (needs, lifestyle, price sensitivity, interests) inferred from the website content.
- If the page appears to be a generic homepage or collection page with multiple products, still provide recommended segments but leave productName and productDescription empty.
- If uncertain, choose the closest matches and optimize for practical media buying.
`;
}