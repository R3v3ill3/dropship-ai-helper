export interface MarketingPlanInput {
  brand: string;
  productOrService: string;
  pricePoint: string;
  objectives: string[];
  primaryKPIs: string[];
  timeframe: { start: string; end: string };
  totalBudget: number | null;
  geographyInput: {
    country: string;
    stateOrTerritory: string | null;
    city: string | null;
    suburb: string | null;
    postcode: string | null;
  };
  helixSegmentsSelected: string[];
  approvedChannels: string[] | null;
  disallowedChannels: string[] | null;
  crmAssets: {
    hashedEmailsAvailable: boolean | null;
    customerCount: number | null;
    pastPurchasersEligibleForSeed: boolean | null;
  };
  promotionsOffers: string[] | null;
  competitors: string[] | null;
  seasonalityNotes: string[] | null;
  constraints: string[] | null;
}

/**
 * Generates a comprehensive, location-aware Helix Persona marketing plan prompt.
 * This prompt:
 * - Expands the provided location into a micro/sub-region/region hierarchy
 * - Matches Helix segments to the geography
 * - Produces bespoke per-segment plans at micro and sub-region levels
 * - Provides a cross-segment best-fit plan
 * - Assumes localized lookalike audiences are purchasable
 * - Requests output: executive summary + strict JSON object matching the schema
 */
export function generateMarketingPlanPrompt(input: MarketingPlanInput): string {
  const jsonSchema = `{
    "inputs": {
      "brand": string,
      "productOrService": string,
      "pricePoint": string,
      "objectives": [string],
      "primaryKPIs": [string],
      "timeframe": { "start": string, "end": string },
      "totalBudget": number | null,
      "geographyInput": {
        "country": string,
        "stateOrTerritory": string | null,
        "city": string | null,
        "suburb": string | null,
        "postcode": string | null
      },
      "helixSegmentsSelected": [string],
      "approvedChannels": [string] | null,
      "disallowedChannels": [string] | null,
      "crmAssets": {
        "hashedEmailsAvailable": boolean | null,
        "customerCount": number | null,
        "pastPurchasersEligibleForSeed": boolean | null
      },
      "promotionsOffers": [string] | null,
      "competitors": [string] | null,
      "seasonalityNotes": [string] | null,
      "constraints": [string] | null
    },
    "geoHierarchy": {
      "micro": {
        "label": string,
        "postcodes": [string] | null,
        "notableHotspots": [string]
      },
      "subRegion": {
        "label": string,
        "suburbsIncluded": [string],
        "postcodesIncluded": [string]
      },
      "region": { "label": string }
    },
    "segments": [
      {
        "name": string,
        "fitScores": { "micro": number, "subRegion": number },
        "fitRationale": string,
        "audienceStrategy": {
          "crmSeed": { "available": boolean, "recommendedSize": number | null },
          "lookalike": { "percent": number, "geo": "micro" | "subRegion", "notes": string },
          "interestBehavioral": [string],
          "retargeting": [string]
        },
        "plans": {
          "micro": {
            "objectives": [string],
            "kpis": [string],
            "channels": [
              {
                "name": string,
                "budgetPercent": number,
                "budgetAmount": number | null,
                "geoTargeting": { "radiusKm": number | null, "postcodes": [string] | null, "hotspots": [string] | null },
                "biddingOptimization": string,
                "frequencyCap": string | null,
                "creative": {
                  "messages": [string],
                  "hooks": [string],
                  "formats": [string],
                  "examples": { "headline": [string], "primaryText": [string], "cta": [string] }
                },
                "landing": { "url": string | null, "modules": [string], "localProofPoints": [string] },
                "experiments": [string]
              }
            ],
            "flighting": { "phases": [string], "daypartingNotes": [string] | null },
            "measurement": { "tracking": [string], "incrementality": [string], "successGates": [string] }
          },
          "subRegion": {
            "objectives": [string],
            "kpis": [string],
            "channels": [/* same structure as micro */],
            "flighting": { "phases": [string], "daypartingNotes": [string] | null },
            "measurement": { "tracking": [string], "incrementality": [string], "successGates": [string] }
          }
        }
      }
    ],
    "crossSegmentBestFit": {
      "strategy": [string],
      "channelCore": [string],
      "geoPrioritization": [string],
      "budgetSummary": {
        "byChannelPercent": [{ "channel": string, "percent": number }],
        "byGeoPercent": [{ "geo": "micro" | "subRegion", "percent": number }]
      },
      "calendar": [{ "phase": string, "start": string, "end": string }],
      "measurement": { "sharedAudiences": [string], "reportingCadence": string, "upliftDesign": [string] },
      "risks": [{ "risk": string, "mitigation": string }]
    }
  }`;

  return `You are a senior marketing strategist specializing in Australian Helix Personas and localized, data-driven media planning. Create bespoke, geo-aware plans that align segment psychographics with sub-regional context. Think stepwise but output only concise rationales, not chain-of-thought. Follow the requested output format, include actionable geo-targeting parameters, and provide concrete, testable recommendations.

Method and constraints to follow:
1) Location expansion
- Given a location input (may be suburb, postcode, LGA, or city), infer a practical sub-regional “market area” for planning. Use common-sense Australian geography where applicable (e.g., suburbs cluster into SA2/SA3, tourism/commuter flows, coastal vs hinterland splits).
- Produce a 3-level geo hierarchy:
  a) Micro: suburb/postcode/local hotspots
  b) Sub-region: e.g., “Southern Gold Coast” (list core suburbs/postcodes)
  c) Region: e.g., “Gold Coast” / “SEQ” / “Greater Brisbane” as relevant
- If outside Australia, analogize to appropriate sub-regional groupings.

2) Segment–location fit
- For each selected Helix Persona segment, profile local behaviors and likely hotspots within the sub-region. Include a segment-location fit score (0–100) and brief rationale.
- Assume localized lookalike audiences (1–5%) are purchasable across major walled gardens and programmatic. Recommend seed size and LAL % by segment given local density.

3) Per-segment, per-geo plans
- For each segment and each geo level (micro, sub-region), produce a bespoke plan with:
  - Objectives and leading KPIs (with target benchmarks)
  - Channel mix with budget allocation (% and $, if budget given)
  - Geo-targeting parameters: radius, postcode list, SA2/SA3 hints, key hotspots
  - Audience build: retargeting, CRM match, LAL %, interest/behavioral targeting
  - Creative: key messages, hooks, CTAs, offers, format specs, 2–3 headline/primary text examples
  - Landing experience: page variants, content blocks, local proof points
  - Bidding/optimization: event priorities, bid strategies, frequency caps
  - Flighting: phases, dayparting (if relevant), seasonal timing
  - Experiments: 2–3 tests (creative, audience, geo-split, offer)
  - Measurement: tracking, incrementality, success gates to scale/kill

4) Cross-segment “best fit” plan
- Synthesize overlaps to propose a unifying plan: shared creative platforms, channel core, geo prioritization, frequency management, retargeting pools, and budget summary.
- Include a single calendar/timeline and a cross-geo allocation.

5) Risks and ops
- Note compliance, supply-side constraints, seasonality, tourist/commuter surges, brand safety, and mitigation.

6) Output
- Produce:
  A) Executive summary (bulleted, concise)
  B) A machine-readable JSON object strictly matching the schema below
- Keep explanations concise. No chain-of-thought.

JSON schema to follow exactly:
${jsonSchema}

Example: location expansion rule
- Input: Currumbin Waters, 4223
- Output within the plan:
  - Micro: label “Currumbin Waters (4223)”, postcodes ["4223"], hotspots ["Currumbin Beachfront", "Thrower Dr precinct", "Palm Beach Ave border"]
  - Sub-region: label “Southern Gold Coast”, suburbsIncluded ["Currumbin", "Currumbin Waters", "Tugun", "Palm Beach", "Elanora", "Bilinga", "Coolangatta"], postcodesIncluded ["4223","4221","4224","4225"]
  - Region: label “Gold Coast (SEQ)”

Use the following inputs to generate the plans. If a field is null or missing, infer sensible defaults and note assumptions explicitly.

- brand: ${input.brand}
- productOrService: ${input.productOrService}
- pricePoint: ${input.pricePoint}
- objectives: ${JSON.stringify(input.objectives)}
- primaryKPIs: ${JSON.stringify(input.primaryKPIs)}
- timeframe: ${input.timeframe.start} → ${input.timeframe.end}
- totalBudget: ${input.totalBudget === null ? 'null' : input.totalBudget}
- geographyInput:
  country: ${input.geographyInput.country}
  stateOrTerritory: ${input.geographyInput.stateOrTerritory}
  city: ${input.geographyInput.city}
  suburb: ${input.geographyInput.suburb}
  postcode: ${input.geographyInput.postcode}
- helixSegmentsSelected: ${JSON.stringify(input.helixSegmentsSelected)}
- approvedChannels: ${input.approvedChannels ? JSON.stringify(input.approvedChannels) : 'null'}
- disallowedChannels: ${input.disallowedChannels ? JSON.stringify(input.disallowedChannels) : 'null'}
- crmAssets:
  hashedEmailsAvailable: ${input.crmAssets.hashedEmailsAvailable}
  customerCount: ${input.crmAssets.customerCount}
  pastPurchasersEligibleForSeed: ${input.crmAssets.pastPurchasersEligibleForSeed}
- promotionsOffers: ${input.promotionsOffers ? JSON.stringify(input.promotionsOffers) : 'null'}
- competitors: ${input.competitors ? JSON.stringify(input.competitors) : 'null'}
- seasonalityNotes: ${input.seasonalityNotes ? JSON.stringify(input.seasonalityNotes) : 'null'}
- constraints: ${input.constraints ? JSON.stringify(input.constraints) : 'null'}

Deliver:
A) Executive summary bullets
B) JSON strictly matching the schema`;
}

