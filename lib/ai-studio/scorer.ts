/**
 * Creative Quality Scorer — Claude Vision (Enhanced 11-Dimension)
 *
 * After image generation, sends each variant to Claude Vision for objective scoring.
 * Scores on 11 dimensions covering content, design, color, and impact.
 * Returns a score object that gets attached to each variant.
 *
 * Scoring Dimensions:
 * CONTENT:  textAccuracy, messageClarity
 * DESIGN:   gridAlignment, typographyPairing, visualBalance, whitespaceUsage, layoutQuality
 * COLOR:    colorHarmony, brandCompliance
 * IMPACT:   psychologyScore, creativityScore
 */

import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;
function getClient() { if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); return _client; }

const SCORER_MODEL = 'claude-sonnet-4-20250514';

export interface CreativeScore {
  overall: number;              // 1-10 (weighted average)
  // Content (23%)
  textAccuracy: number;         // 1-10: spelling, no duplicates, correct content
  messageClarity: number;       // 1-10: single message discipline, direct communication
  // Design (38%)
  layoutQuality: number;        // 1-10: spacing, alignment, hierarchy
  gridAlignment: number;        // 1-10: elements align to invisible grid, consistent spacing
  typographyPairing: number;    // 1-10: font hierarchy, weight contrast, readability
  visualBalance: number;        // 1-10: weight distribution, symmetry/asymmetry intent
  whitespaceUsage: number;      // 1-10: breathing room, margins, no overcrowding
  // Color (16%)
  colorHarmony: number;         // 1-10: complementary/analogous/triadic adherence, 60-30-10
  brandCompliance: number;      // 1-10: Hola Prime brand consistency
  // Impact (20%)
  psychologyScore: number;      // 1-10: behavioral science application effectiveness
  creativityScore: number;      // 1-10: originality, unexpected elements, memorability
  innovativeness: number;       // 1-10: does it look like something NEVER seen in prop firm ads? 1=generic template, 10=award-winning originality
  // Meta
  predictedCtr: string;         // "1.2-1.8%" estimated range
  strengths: string[];          // Top 3 things working well
  weaknesses: string[];         // Top 3 things to fix
  verdict: string;              // One-line summary
}

/**
 * Score a single generated creative image.
 * Returns null if scoring fails (non-blocking — generation still succeeds).
 */
export async function scoreCreative(
  imageDataUri: string,
  brief: any,
  variantId: string
): Promise<CreativeScore | null> {
  if (!imageDataUri || !imageDataUri.startsWith('data:')) {
    return null;
  }

  try {
    const commaIdx = imageDataUri.indexOf(',');
    const meta = imageDataUri.substring(0, commaIdx);
    const base64Data = imageDataUri.substring(commaIdx + 1);
    const mimeType = meta.split(':')[1]?.split(';')[0] || 'image/png';

    const headline = brief?.copywriting?.headline?.primary || '';
    const cta = brief?.copywriting?.cta?.primary || '';
    const bullets = brief?.copywriting?.benefitBullets || [];
    const concept = brief?.creativeConcept?.title || '';

    const response = await getClient().messages.create({
      model: SCORER_MODEL,
      max_tokens: 1500,
      system: 'You are an elite creative quality auditor with expertise in graphic design, typography, color theory, and advertising psychology. Score the ad creative image objectively across 12 dimensions. You have a STRONG bias toward innovation — generic templates that look like every other prop firm ad score LOW on innovativeness. Creatives that break the mold with unique compositions, unexpected visual paradigms, and fresh approaches score HIGH. Respond with ONLY valid JSON — no markdown, no preamble.',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType as any, data: base64Data }
          },
          {
            type: 'text',
            text: `Score this ad creative for Hola Prime (prop trading firm). Variant: "${variantId}".

The brief requested:
- Headline: "${headline}"
- CTA: "${cta}"
- Bullets: ${JSON.stringify(bullets)}
- Concept: "${concept}"

Score on 12 dimensions using these rubrics:

CONTENT QUALITY (21%):
- textAccuracy (13%): Are all words spelled correctly? Any duplicated text? Any garbled/cut-off text? Disclaimer readable?
- messageClarity (8%): Is there ONE clear message? Can a viewer understand the offer in 2 seconds? Or are there competing messages?

DESIGN MASTERY (35%):
- layoutQuality (9%): Clean spacing? Clear visual hierarchy? Nothing cramped or cut off? Does the layout feel UNIQUE or is it the same generic template?
- gridAlignment (8%): Do elements align to an invisible grid? Consistent margins? Or randomly scattered/misaligned?
- typographyPairing (8%): Clear font hierarchy (hero text >> body text)? Max 2 font styles? Readable at mobile size?
- visualBalance (5%): Is visual weight distributed intentionally? Does it feel stable or lopsided? Is there a clear focal point?
- whitespaceUsage (5%): Adequate breathing room? Generous margins? Or overcrowded with elements touching edges?

COLOR & BRAND (16%):
- colorHarmony (8%): Do colors work together (complementary/analogous/triadic)? Max 3-4 colors? 60-30-10 balance?
- brandCompliance (8%): Does it feel like a premium Hola Prime ad? Dark/professional aesthetic? Brand presence?

IMPACT & INNOVATION (28%):
- psychologyScore (8%): Does the visual design apply behavioral science effectively? Does layout guide emotions?
- creativityScore (10%): Is it original/memorable? Any unexpected elements that make it stand out? Or generic/template-feeling?
- innovativeness (10%): CRITICAL — Does this creative look like something you've NEVER seen before in prop firm advertising? Does it break the mold? Score 1 = generic dark-bg + big-number + bullets + CTA template that every prop firm uses. Score 5 = decent but familiar. Score 8 = genuinely fresh approach. Score 10 = award-winning, would stop a creative director in their tracks. Ask: "Have I seen this exact layout in 100 other prop firm ads?" If yes, score LOW.

Compute overall as the weighted average using the percentages above.

Return JSON:
{
  "overall": <1-10 weighted average>,
  "textAccuracy": <1-10>,
  "messageClarity": <1-10>,
  "layoutQuality": <1-10>,
  "gridAlignment": <1-10>,
  "typographyPairing": <1-10>,
  "visualBalance": <1-10>,
  "whitespaceUsage": <1-10>,
  "colorHarmony": <1-10>,
  "brandCompliance": <1-10>,
  "psychologyScore": <1-10>,
  "creativityScore": <1-10>,
  "innovativeness": <1-10>,
  "predictedCtr": "<X.X-X.X%>",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "verdict": "One sentence summary"
}`
          }
        ]
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    let cleaned = text.trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
    const startIdx = cleaned.indexOf('{');
    if (startIdx === -1) return null;
    cleaned = cleaned.substring(startIdx);

    const parsed = JSON.parse(cleaned);

    console.log(`[Scorer] Variant "${variantId}": ${parsed.overall}/10 — ${parsed.verdict}`);
    return parsed as CreativeScore;

  } catch (err: any) {
    console.warn(`[Scorer] Failed to score variant "${variantId}":`, err.message);
    return null;
  }
}

/**
 * Score multiple variants in parallel.
 * Non-blocking — returns partial results if some fail.
 */
export async function scoreVariants(
  variants: any[],
  brief: any
): Promise<Map<string, CreativeScore>> {
  const scores = new Map<string, CreativeScore>();

  const scorableVariants = variants.filter(v => v?.imageUrl?.startsWith('data:'));

  if (scorableVariants.length === 0) {
    console.log('[Scorer] No scorable variants (no data URI images)');
    return scores;
  }

  console.log(`[Scorer] Scoring ${scorableVariants.length} variants (11 dimensions)...`);

  const results = await Promise.allSettled(
    scorableVariants.map(v => scoreCreative(v.imageUrl, brief, v.id))
  );

  results.forEach((result, idx) => {
    if (result.status === 'fulfilled' && result.value) {
      scores.set(scorableVariants[idx].id, result.value);
    }
  });

  console.log(`[Scorer] ${scores.size}/${scorableVariants.length} variants scored successfully`);
  return scores;
}
