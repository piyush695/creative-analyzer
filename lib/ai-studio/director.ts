/**
 * Creative Director — Concept Diversity Engine
 *
 * Takes the raw brief from Claude and produces 3 COMPLETELY DIFFERENT
 * image generation prompts, one per visual paradigm.
 *
 * This solves the "all variants look the same" problem by having Claude
 * write 3 fundamentally different prompts instead of reusing one prompt
 * with different prefix modifiers.
 *
 * Flow:
 *   Brief (from prompts.ts) → Creative Director → 3 concept-diverse imagePrompts
 *   Each imagePrompt → Imagen → completely different visual output
 */

import Anthropic from '@anthropic-ai/sdk';
import { ConceptParadigm } from './brand';

let _client: Anthropic | null = null;
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const DIRECTOR_MODEL = 'claude-sonnet-4-20250514';

export interface ConceptPrompt {
  paradigm: string;
  visualApproach: string;
  keyDifference: string;
  imagePrompt: string;
}

export interface DirectorResult {
  concepts: ConceptPrompt[];
  textManifest: string;
}

/**
 * Run the Creative Director: takes a brief and 3 paradigms,
 * produces 3 concept-diverse image generation prompts.
 */
export async function runCreativeDirector(
  brief: any,
  paradigms: ConceptParadigm[],
  brandDirective: string,
): Promise<DirectorResult | null> {
  try {
    // Extract text content from the brief
    const headline = brief?.copywriting?.headline?.primary || '';
    const headlineVariations = brief?.copywriting?.headline?.variations || [];
    const body = brief?.copywriting?.body?.primary || '';
    const cta = brief?.copywriting?.cta?.primary || '';
    const bullets = brief?.copywriting?.benefitBullets || [];
    const urgency = brief?.copywriting?.urgencyText || '';
    const trust = brief?.copywriting?.trustText || '';
    const discount = brief?.copywriting?.discountText || '';
    const disclaimer = brief?.copywriting?.disclaimerText || '';
    const hookText = brief?.copywriting?.attentionGrabber || brief?.copywriting?.hookText || '';
    const concept = brief?.creativeConcept?.title || '';
    const rationale = brief?.creativeConcept?.rationale || '';
    const colors = brief?.visualDesign?.colorPalette || {};
    const dimensions = brief?.visualDesign?.dimensions || '1080x1920';

    const textManifest = `TEXT MANIFEST (use this exact text in all 3 concepts):
- Headline: "${headline}"
${headlineVariations.length ? `- Headline variations: ${headlineVariations.map((v: string) => `"${v}"`).join(', ')}` : ''}
- Attention-grabbing first line: "${hookText}"
- Body: "${body}"
- CTA: "${cta}"
- Bullets: ${JSON.stringify(bullets)}
${urgency ? `- Urgency: "${urgency}"` : ''}
${trust ? `- Trust: "${trust}"` : ''}
${discount ? `- Discount: "${discount}"` : ''}
- Disclaimer: "${disclaimer}"
- Dimensions: ${dimensions}`;

    const paradigmDescriptions = paradigms.map((p, i) => `
CONCEPT ${i + 1}: "${p.name}" PARADIGM
${p.imageDirective}

ANTI-PATTERNS (things that would RUIN this concept):
${p.antiPatterns}
`).join('\n---\n');

    const response = await getClient().messages.create({
      model: DIRECTOR_MODEL,
      max_tokens: 4000,
      system: `You are a world-class Creative Director at a top advertising agency. You are producing 3 COMPLETELY DIFFERENT ad creatives from the same brief. Each creative uses a fundamentally different visual paradigm — they must look like they came from 3 different agencies.

CRITICAL RULES:
- Each concept must have a DIFFERENT layout structure (asymmetric vs grid vs full-bleed vs centered vs split-screen)
- Each concept must have a DIFFERENT visual hierarchy and different visual subject matter
- Each concept must have a DIFFERENT emotional approach (intellectual vs dramatic vs technical vs bold vs minimal)
- If any two concepts share the same composition structure, you have FAILED
- Each imagePrompt must be 500+ words and describe the COMPLETE ad creative including all text elements
- Include ALL text from the text manifest with CORRECT SPELLING in each imagePrompt
- Describe exactly where text appears, how large it is, what style it uses

CRITICAL — CONCRETE VISUALS ONLY:
Your imagePrompt must describe a PHOTOGRAPH or RENDER that a camera could capture. NOT abstract concepts.

BAD: "A visual metaphor for financial growth with atmospheric lighting"
GOOD: "A dark navy studio background. In the center, a chrome-metallic trading terminal sits on a reflective black surface. Green candlestick chart patterns glow on its screens. Blue volumetric light from above creates a spotlight effect. The surrounding area fades to deep black."

BAD: "A comparison between two states of financial freedom"
GOOD: "Split composition. Left half: a cracked concrete wall with peeling paint, a dusty old calculator under harsh fluorescent light. Right half: a sleek glass desk with multiple trading monitors showing green charts, a modern laptop under warm ambient light. A sharp vertical divide separates the two halves."

Every noun must be a PHYSICAL OBJECT. Every adjective must describe a VISIBLE property (color, texture, material, size, position). No abstractions.

HOLA PRIME VISUAL PALETTE (use these as inspiration):
The visual should feel like a premium prop trading firm ad. Suitable visual subjects include:
- Trading terminals, monitors with candlestick charts (green/red candles)
- Chrome/metallic 3D objects on reflective dark surfaces
- Sleek devices (phones, tablets) showing trading dashboards
- Money stacks, coins, gold bars — wealth imagery
- Dramatic studio lighting (single spotlight, rim light, volumetric light beams)
- Dark backgrounds (navy, charcoal, near-black) with neon accent glows (green, blue, purple)
- Reflective surfaces, glass, chrome, brushed metal textures
DO NOT use: smiley faces, emojis, cartoon characters, food items, random unrelated objects, abstract blobs, nature scenes, animals. Keep it FINTECH.

TEXT IN THE IMAGE:
The imagePrompt must include ALL text from the text manifest. Describe:
- "hola prime" logo in white at top-left, "#WeAreTraders" at top-right
- Headline rendered large and bold
- Price rendered oversized with visual treatment (glow, 3D, chrome)
- CTA as a blue pill-shaped button with white text
- Small disclaimer text at the very bottom
- Spell every word correctly: "Withdrawals" "Challenge" "Limits" "Performance" "Fictitious" "Simulated"

Respond with ONLY valid JSON — no markdown, no preamble, no explanation.`,
      messages: [{
        role: 'user',
        content: `BRIEF:
Concept: ${concept}
Rationale: ${rationale}
Color palette: primary=${colors.primary}, secondary=${colors.secondary}, accent=${colors.accent}, background=${colors.background}

${textManifest}

${brandDirective}

---

PRODUCE 3 CONCEPT-DIVERSE IMAGE GENERATION PROMPTS:

${paradigmDescriptions}

Return this exact JSON structure:
{
  "concepts": [
    {
      "paradigm": "${paradigms[0]?.name || 'Concept 1'}",
      "visualApproach": "One sentence — what makes this concept visually unique",
      "keyDifference": "How this concept is COMPLETELY DIFFERENT from the other two",
      "imagePrompt": "500+ word detailed image generation prompt specifically designed for the ${paradigms[0]?.name || 'first'} paradigm. Describe: exact composition, element placement, typography treatment, color application, textures, lighting, atmosphere. This prompt must produce an image that looks NOTHING like the other two concepts. Include ALL text from the manifest spelled correctly."
    },
    {
      "paradigm": "${paradigms[1]?.name || 'Concept 2'}",
      "visualApproach": "One sentence — what makes this concept visually unique",
      "keyDifference": "How this concept is COMPLETELY DIFFERENT from the other two",
      "imagePrompt": "500+ word prompt for ${paradigms[1]?.name || 'second'} paradigm — must produce a COMPLETELY DIFFERENT visual than concept 1."
    },
    {
      "paradigm": "${paradigms[2]?.name || 'Concept 3'}",
      "visualApproach": "One sentence — what makes this concept visually unique",
      "keyDifference": "How this concept is COMPLETELY DIFFERENT from the other two",
      "imagePrompt": "500+ word prompt for ${paradigms[2]?.name || 'third'} paradigm — must produce a COMPLETELY DIFFERENT visual than concepts 1 and 2."
    }
  ]
}`
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
    const startIdx = cleaned.indexOf('{');
    if (startIdx === -1) {
      console.warn('[Director] No JSON found in response');
      return null;
    }
    cleaned = cleaned.substring(startIdx);

    const parsed = JSON.parse(cleaned);
    const concepts: ConceptPrompt[] = (parsed.concepts || []).map((c: any) => ({
      paradigm: c.paradigm || 'Unknown',
      visualApproach: c.visualApproach || '',
      keyDifference: c.keyDifference || '',
      imagePrompt: c.imagePrompt || '',
    }));

    console.log(`[Director] ✓ Analysis complete — ${concepts.length} concept-diverse prompts (${concepts.map(c => c.paradigm).join(', ')})`);

    return { concepts, textManifest };
  } catch (err: any) {
    console.error('[Director] Failed:', err.message);
    return null;
  }
}
