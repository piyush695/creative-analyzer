/**
 * Brand Visual Paradigms — Concept Diversity Engine
 *
 * Defines fundamentally different visual approaches for creative generation.
 * Each paradigm produces a COMPLETELY DIFFERENT composition — not just color variations.
 * The variant system picks 3 different paradigms per generation for maximum diversity.
 */

export interface ConceptParadigm {
  id: string;
  name: string;
  description: string;
  /** Detailed composition and visual approach — injected into the image prompt */
  imageDirective: string;
  /** What this paradigm should NEVER do */
  antiPatterns: string;
  /** Reference aesthetic (for human understanding) */
  references: string[];
}

export const CONCEPT_PARADIGMS: ConceptParadigm[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine/editorial layout — typography-driven, asymmetric, maximum negative space',
    imageDirective: `VISUAL PARADIGM: EDITORIAL / MAGAZINE LAYOUT
Composition: Asymmetric layout inspired by high-end magazine advertising (Vogue, Bloomberg Businessweek, WSJ).
- ONE oversized typographic element dominates 50%+ of the canvas — this is the hero. It can be a price, a single word, or a number rendered at extreme scale.
- Text IS the design. Minimal imagery. The beauty comes from typography, spacing, and restraint.
- Rule of thirds placement — hero element OFF-CENTER (left-heavy or right-heavy, never dead center).
- 40-50% of canvas is EMPTY negative space (black). This emptiness IS the design. Do not fill it.
- Supporting text is small, elegant, positioned with intentional asymmetry.
- CTA is understated — small pill button or simple text link, NOT a massive full-width bar.
- If imagery exists, it's a single small element — a subtle gradient wash, a thin line, or a geometric accent.
- Typography hierarchy: ONE weight/size dominates everything. Secondary text is 4-5x smaller.
- Feels: sophisticated, restrained, institutional, luxury. Like a perfume ad meets a Bloomberg terminal.
- Eye-tracking: L-shaped or diagonal scan path, NOT the standard top-to-bottom waterfall.`,
    antiPatterns: 'NO centered symmetric layouts, NO full-width CTA buttons, NO bullet point lists, NO rounded containers, NO 3-zone stacking, NO multiple competing focal points, NO busy backgrounds, NO gradients behind text, NO 3D effects',
    references: ['Apple product ads', 'Stripe marketing pages', 'Goldman Sachs institutional ads', 'Acne Studios fashion ads'],
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Movie poster / trailer aesthetic — dramatic lighting, atmospheric depth, story-driven',
    imageDirective: `VISUAL PARADIGM: CINEMATIC / MOVIE POSTER
Composition: Full-bleed atmospheric visual that tells a STORY, inspired by movie key art and Nike campaigns.
- Full background is a dramatic scene/atmosphere — deep shadows, volumetric light, atmospheric haze or particles.
- Single dramatic light source creating contrast (top-down spotlight, side-lit, backlit rim light).
- THREE depth layers: foreground element (blur/dark) → midground hero content → background atmosphere (distant, faded).
- Text overlaid on the visual using contrast treatments — glow, drop shadow, or placed in naturally dark areas.
- Hero text treatment: cinematic title card style — wide letter-spacing, elegant serif or ultra-thin sans-serif.
- The MOOD is the message — the visual atmosphere conveys the emotion before the viewer reads any text.
- Color grading: film-like color grade (teal-orange, blue-gold, or monochromatic with one accent).
- Motion implied — light streaks, particle trails, directional blur suggesting speed or transformation.
- CTA feels like a movie "Now Playing" tagline — subtle, integrated into the composition, not a separate block.
- Feels: epic, aspirational, transformative. The viewer should feel like they're about to embark on something big.`,
    antiPatterns: 'NO flat backgrounds, NO clinical/sterile layouts, NO bullet lists, NO dashboard aesthetics, NO symmetric grids, NO multiple text blocks competing, NO corporate/institutional feel, NO bright even lighting',
    references: ['Netflix key art', 'Nike "Just Do It" campaigns', 'Movie posters (Blade Runner, Tenet)', 'Dior Sauvage ads'],
  },
  {
    id: 'data_native',
    name: 'Data-Native',
    description: 'Trading terminal / infographic aesthetic — dashboard feel, data as visual elements',
    imageDirective: `VISUAL PARADIGM: DATA-NATIVE / TRADING TERMINAL
Composition: The ad looks like it belongs ON a Bloomberg Terminal or TradingView — data visualization IS the design.
- Dark background (#0A0A14) with subtle grid lines or scan lines (like a CRT monitor or trading screen).
- Numbers, metrics, and data points ARE the visual elements — not decoration, but the core design.
- Candlestick chart patterns, sparklines, or mini data grids as background/accent elements.
- Green/red color coding from trading culture (green = profit/up, red = loss/down).
- Monospace or tabular font for numbers. Clean sans-serif for labels.
- Layout inspired by dashboard cards — clear data hierarchy with labels, values, and status indicators.
- Glowing accent lines (neon green, cyan) separating data zones — like HUD/heads-up-display elements.
- The hero number/price is displayed like a live ticker — pulsing glow, real-time data feel.
- Supporting info in compact data rows or badge-style metadata tags.
- CTA styled as a terminal command button or action card — looks like clicking "EXECUTE TRADE".
- Feels: technical, credible, insider. Like the viewer is looking at their own trading dashboard.`,
    antiPatterns: 'NO editorial minimalism, NO cinematic atmosphere, NO lifestyle imagery, NO magazine layouts, NO large empty space, NO serif fonts, NO organic shapes, NO film grain, NO soft gradients',
    references: ['Bloomberg Terminal UI', 'TradingView interface', 'Robinhood marketing', 'Binance trading ads'],
  },
  {
    id: 'poster',
    name: 'Impact Poster',
    description: 'Single powerful image, minimal text, maximum visual impact — poster-style',
    imageDirective: `VISUAL PARADIGM: IMPACT POSTER
Composition: ONE powerful visual element fills 70%+ of the canvas. Text is minimal and secondary.
- A single striking image, illustration, or 3D render IS the ad — the visual communicates before any text is read.
- Text is limited to: one headline (max 5 words), price/offer, and CTA. Nothing else.
- The visual element is bold, unexpected, attention-grabbing — something that makes you stop scrolling.
- Could be: an oversized 3D object (giant coin, chrome number), a surreal scene, a bold illustration, or a dramatic close-up.
- Text wraps around or integrates with the visual — not layered on top in a separate zone.
- Color palette: 2-3 colors maximum. High contrast. Bold and graphic.
- The composition is BOLD and GRAPHIC — think street poster, not corporate brochure.
- Scale contrast: one element is MASSIVE, everything else is tiny. This creates visual drama.
- Feels: bold, arresting, iconic. You remember the IMAGE, not the text.`,
    antiPatterns: 'NO long copy, NO bullet lists, NO data grids, NO multiple text blocks, NO balanced layouts, NO dashboard elements, NO even distribution of elements, NO small careful typography',
    references: ['Absolut Vodka ads', 'Supreme posters', 'Spotify Wrapped', 'WWF poster campaigns'],
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Split-screen / before-after / side-by-side — visual contrast tells the story',
    imageDirective: `VISUAL PARADIGM: COMPARISON / SPLIT-SCREEN
Composition: The canvas is DIVIDED into two (or more) contrasting zones that tell a story through difference.
- Clear visual split — left/right, top/bottom, or diagonal. Each side represents a different state.
- One side is the "WITHOUT" / "BEFORE" / "OTHER FIRMS" — desaturated, cramped, dim, negative.
- Other side is the "WITH HOLA PRIME" / "AFTER" / "YOUR FUTURE" — vibrant, spacious, bright, positive.
- The CONTRAST between sides IS the persuasion. The viewer's eye naturally prefers the better side.
- Dividing element: clean line, gradient transition, lightning bolt, or organic shape.
- Text on each side is minimal — just a label or stat that reinforces the contrast.
- Hero element (price, offer) bridges BOTH sides or sits at the intersection point.
- Color psychology: negative side uses cool/muted tones, positive side uses warm/vibrant tones.
- CTA anchored to the positive/aspirational side.
- Feels: clear, persuasive, immediate understanding. The story is told in one glance.`,
    antiPatterns: 'NO single-composition layouts, NO centered symmetric designs, NO full-bleed single images, NO minimalist approaches, NO data grids, NO editorial spacing',
    references: ['Apple Mac vs PC ads', 'Fitness before/after ads', 'Slack marketing comparisons', 'Insurance comparison ads'],
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Sequential narrative / journey / transformation arc across the canvas',
    imageDirective: `VISUAL PARADIGM: STORYTELLING / JOURNEY
Composition: The ad tells a VISUAL STORY — a sequence or journey that the eye follows from start to finish.
- The layout has a clear BEGINNING → MIDDLE → END reading flow (top→bottom or left→right).
- Beginning: the hook/problem/starting point — small, constrained, questioning.
- Middle: the transformation/process/bridge — movement, arrows, progression indicators.
- End: the destination/result/reward — large, vibrant, aspirational, expanded.
- Visual metaphors for progression: staircase, path, timeline, growth chart, expanding elements.
- Elements grow in SIZE and VIBRANCY as the eye moves through the story — from small/dim to large/bright.
- The viewer should feel pulled through the composition — each element leads to the next.
- CTA is the final chapter — the natural conclusion of the story ("Start YOUR journey").
- Feels: motivational, progressive, journey-like. The viewer sees themselves in the transformation.`,
    antiPatterns: 'NO static single-image compositions, NO dashboard grids, NO editorial minimalism, NO symmetric balance, NO same-size elements, NO flat hierarchy',
    references: ['Peloton journey ads', 'Headspace progression visuals', 'Duolingo streaks marketing', 'Investment growth visualizations'],
  },
  {
    id: 'minimal',
    name: 'Ultra-Minimal',
    description: 'Near-empty canvas, one element, maximum restraint and sophistication',
    imageDirective: `VISUAL PARADIGM: ULTRA-MINIMAL
Composition: RADICAL restraint — the less you show, the more powerful it becomes.
- 70-80% of the canvas is EMPTY (solid dark). This is intentional. This IS the design.
- ONE single element in the remaining space — a price, a word, a number, or a tiny visual accent.
- That single element is perfectly crafted — flawless typography, precise positioning, immaculate detail.
- Supporting text (if any) is whisper-small — 8-10pt equivalent, positioned at an edge or corner.
- CTA is text-only — no button, no background. Just a clean line of text.
- The emptiness creates TENSION and FOCUS. The viewer's eye has nowhere to go except the one element.
- Color: essentially monochromatic — dark background with white/single-accent-color text.
- Feels: premium, confident, powerful through restraint. Like the brand doesn't NEED to shout.
- This is the hardest paradigm to execute well — the single element must be PERFECT.`,
    antiPatterns: 'NO multiple elements, NO bullet lists, NO containers/cards, NO busy backgrounds, NO gradients, NO 3D effects, NO multiple colors, NO large CTA buttons, NO competing text blocks',
    references: ['Apple "Shot on iPhone"', 'Cartier minimal ads', 'Tesla marketing', 'Braun product design'],
  },
  {
    id: 'collage',
    name: 'Dynamic Collage',
    description: 'Multiple visual elements composed together — energetic, layered, magazine-cutout feel',
    imageDirective: `VISUAL PARADIGM: DYNAMIC COLLAGE
Composition: Multiple visual elements LAYERED together creating energy, depth, and visual richness.
- 3-5 distinct visual elements overlapping at angles — tilted screenshots, floating UI cards, angled text blocks.
- Elements at different ROTATIONS (slight tilts, 5-15°) creating dynamic tension.
- Mix of element types: flat text, 3D objects, UI screenshots, geometric shapes, texture patches.
- Depth through overlapping — elements cast subtle shadows on each other.
- Background peeks through gaps between elements — the dark base is visible.
- Color variety: each element can have its own color treatment, unified by a shared accent.
- The overall feeling is ENERGY and MOVEMENT — like a mood board or magazine spread.
- Hero element (price/offer) is the LARGEST piece in the collage, other elements support it.
- CTA can be a separate "sticker" or "badge" element within the collage.
- Feels: dynamic, youthful, energetic, modern. Like a Gen-Z mood board meets trading culture.`,
    antiPatterns: 'NO clean grid layouts, NO minimal approaches, NO single focal point, NO editorial restraint, NO symmetric balance, NO corporate/institutional feel, NO sterile compositions',
    references: ['Instagram mood boards', 'Spotify genre playlists', 'Vice magazine layouts', 'Depop marketing'],
  },
];

/**
 * Pick N random paradigms from the pool, ensuring diversity.
 * Never picks the same paradigm twice.
 */
export function pickDiverseParadigms(count: number = 3, exclude: string[] = []): ConceptParadigm[] {
  const available = CONCEPT_PARADIGMS.filter(p => !exclude.includes(p.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get a specific paradigm by ID.
 */
export function getParadigm(id: string): ConceptParadigm | undefined {
  return CONCEPT_PARADIGMS.find(p => p.id === id);
}
