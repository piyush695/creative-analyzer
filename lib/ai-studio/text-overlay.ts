/**
 * Text Overlay Engine — Sharp + SVG
 *
 * Composites perfectly-spelled text onto AI-generated visual-only images.
 * Solves the #1 quality problem: AI misspells text, duplicates words, renders garbled chars.
 *
 * Pipeline: Gemini generates VISUAL ONLY (no text) → Sharp composites all text via SVG
 */

import sharp from 'sharp';

// ─── Types ───

export interface TextOverlayConfig {
  headline?: string;
  subheadline?: string;
  price?: string;
  bullets?: string[];
  cta?: string;
  disclaimer?: string;
  attentionGrabber?: string;
  promoCode?: string;
  urgencyText?: string;
  layout: 'editorial' | 'cinematic' | 'data_native' | 'poster' | 'comparison' | 'storytelling' | 'minimal' | 'collage' | 'standard';
  darkBackground?: boolean;
  logoText?: string;
  tagline?: string;
}

// ─── Helpers ───

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > maxChars) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = (currentLine + ' ' + word).trim();
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());
  return lines;
}

// ─── Main Export ───

export async function applyTextOverlay(
  imageDataUri: string,
  config: TextOverlayConfig
): Promise<string> {
  try {
    console.log('[TextOverlay] Called with config:', JSON.stringify({
      headline: config.headline?.substring(0, 40),
      price: config.price,
      bulletsCount: Array.isArray(config.bullets) ? config.bullets.length : 0,
      bulletsRaw: Array.isArray(config.bullets) ? config.bullets.slice(0, 2) : 'NOT_ARRAY',
      cta: config.cta,
      layout: config.layout,
    }));

    // Decode data URI
    const commaIdx = imageDataUri.indexOf(',');
    if (commaIdx === -1) {
      console.warn('[TextOverlay] Invalid data URI (no comma)');
      return imageDataUri;
    }
    const base64 = imageDataUri.substring(commaIdx + 1);
    const imageBuffer = Buffer.from(base64, 'base64');

    // Get image dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1080;
    const height = metadata.height || 1920;
    console.log(`[TextOverlay] Image dimensions: ${width}x${height}`);

    // Calculate font sizes relative to image
    const headlineSize = Math.round(height * 0.04);
    const priceSize = Math.round(height * 0.08);
    const subheadSize = Math.round(height * 0.022);
    const bulletSize = Math.round(height * 0.022);
    const ctaSize = Math.round(height * 0.025);
    const disclaimerSize = Math.round(height * 0.01);
    const logoSize = Math.round(height * 0.018);
    const padding = Math.round(width * 0.06);
    const centerX = Math.round(width / 2);

    const svgParts: string[] = [];

    // Helper: create text with black stroke outline for readability (no filters — librsvg doesn't support feDropShadow)
    const txt = (x: number | string, y: number, text: string, size: number, opts: {
      weight?: string; fill?: string; anchor?: string; spacing?: number; opacity?: number; stroke?: boolean;
    } = {}) => {
      const { weight = '700', fill = '#FFFFFF', anchor = 'middle', spacing = 0, opacity = 1, stroke = true } = opts;
      const common = `x="${x}" y="${y}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}"`;
      let result = '';
      // Black outline for readability on any background
      if (stroke) {
        result += `<text ${common} fill="none" stroke="black" stroke-width="${Math.max(3, Math.round(size * 0.08))}" stroke-linejoin="round">${escapeXml(text)}</text>\n`;
      }
      result += `<text ${common} fill="${fill}">${escapeXml(text)}</text>`;
      return result;
    };

    // ── Logo (top-left) ──
    const logoText = config.logoText !== undefined ? config.logoText : 'hola prime';
    if (logoText) {
      svgParts.push(txt(padding, padding + logoSize, logoText, logoSize, { weight: '400', anchor: 'start' }));
    }

    // ── Tagline (top-right) ──
    const tagline = config.tagline !== undefined ? config.tagline : '#WeAreTraders';
    if (tagline) {
      svgParts.push(txt(width - padding, padding + logoSize, tagline, logoSize, { weight: '400', anchor: 'end' }));
    }

    // ── Attention Grabber ──
    let yPos = Math.round(height * 0.13);
    if (config.attentionGrabber) {
      svgParts.push(txt(centerX, yPos, config.attentionGrabber, subheadSize, { weight: '400', fill: '#C8CDD5' }));
      yPos += Math.round(subheadSize * 2);
    }

    // ── Headline (large, bold) ──
    if (config.headline) {
      const maxCharsPerLine = Math.floor((width - padding * 2) / (headlineSize * 0.55));
      const lines = wrapText(config.headline.toUpperCase(), maxCharsPerLine);
      for (const line of lines) {
        svgParts.push(txt(centerX, yPos, line, headlineSize, { weight: '900', spacing: 1 }));
        yPos += Math.round(headlineSize * 1.2);
      }
      yPos += Math.round(headlineSize * 0.4);
    }

    // ── Subheadline ──
    if (config.subheadline && config.subheadline.length < 80) {
      svgParts.push(txt(centerX, yPos, config.subheadline, subheadSize, { weight: '500', fill: '#E0E4EA' }));
      yPos += Math.round(subheadSize * 2);
    }

    // ── Price (HERO — oversized, centered) ──
    if (config.price) {
      const priceY = Math.max(yPos + priceSize, Math.round(height * 0.42));
      svgParts.push(txt(centerX, priceY, config.price, priceSize, { weight: '900' }));
      yPos = priceY + Math.round(priceSize * 0.7);
    }

    // ── Urgency / Discount text ──
    if (config.urgencyText) {
      yPos += Math.round(subheadSize * 0.5);
      const urgW = Math.round(config.urgencyText.length * subheadSize * 0.55 + 40);
      const urgH = Math.round(subheadSize * 1.8);
      svgParts.push(`<rect x="${centerX - urgW / 2}" y="${yPos - urgH * 0.65}" width="${urgW}" height="${urgH}" rx="${urgH / 2}" fill="#1a1a2e" stroke="#444" stroke-width="1"/>`);
      svgParts.push(txt(centerX, yPos, config.urgencyText, subheadSize, { weight: '600', stroke: false }));
      yPos += Math.round(urgH + subheadSize * 0.5);
    }

    // ── Promo Code ──
    if (config.promoCode) {
      const promoW = Math.round(config.promoCode.length * subheadSize * 0.55 + 40);
      const promoH = Math.round(subheadSize * 1.8);
      svgParts.push(`<rect x="${centerX - promoW / 2}" y="${yPos - promoH * 0.65}" width="${promoW}" height="${promoH}" rx="${promoH / 2}" fill="#1a2744" stroke="#2563EB" stroke-width="1"/>`);
      svgParts.push(txt(centerX, yPos, config.promoCode, Math.round(subheadSize * 0.9), { weight: '600', stroke: false }));
      yPos += Math.round(promoH + subheadSize * 0.5);
    }

    // ── Bullets ──
    const bullets = Array.isArray(config.bullets) ? config.bullets : [];
    if (bullets.length > 0) {
      yPos = Math.max(yPos, Math.round(height * 0.58));
      for (const bullet of bullets.slice(0, 5)) {
        const cleanBullet = bullet.replace(/^[•\-]\s*/, '');
        svgParts.push(txt(padding + 10, yPos, `•  ${cleanBullet}`, bulletSize, { weight: '400', fill: '#E0E4EA', anchor: 'start' }));
        yPos += Math.round(bulletSize * 1.7);
      }
    }

    // ── CTA Button ──
    if (config.cta) {
      const ctaY = Math.max(yPos + 20, Math.round(height * 0.80));
      const ctaWidth = Math.min(Math.round(width * 0.6), config.cta.length * ctaSize * 0.6 + 80);
      const ctaHeight = Math.round(ctaSize * 2.5);
      const ctaX = Math.round((width - ctaWidth) / 2);
      svgParts.push(`<rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="${ctaHeight / 2}" fill="#2563EB"/>`);
      svgParts.push(txt(centerX, ctaY + ctaHeight / 2 + ctaSize * 0.35, config.cta, ctaSize, { weight: '700', stroke: false }));
    }

    // ── Disclaimer (pinned to bottom) ──
    if (config.disclaimer) {
      const maxDiscChars = Math.floor((width - padding * 2) / (disclaimerSize * 0.52));
      const discLines = wrapText(config.disclaimer.toUpperCase(), maxDiscChars);
      let discY = height - padding - (discLines.length * disclaimerSize * 1.3);
      for (const line of discLines.slice(0, 4)) {
        svgParts.push(txt(centerX, discY, line, disclaimerSize, { weight: '300', fill: '#6B7280', stroke: false }));
        discY += Math.round(disclaimerSize * 1.3);
      }
    }

    // ── Build final SVG — NO FILTERS (librsvg doesn't support feDropShadow) ──
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${svgParts.join('\n')}
</svg>`;

    console.log(`[TextOverlay] SVG elements: ${svgParts.length}, SVG length: ${svg.length}`);

    // ── Composite SVG onto image ──
    const result = await sharp(imageBuffer)
      .composite([{
        input: Buffer.from(svg),
        top: 0,
        left: 0,
      }])
      .png()
      .toBuffer();

    const outputDataUri = `data:image/png;base64,${result.toString('base64')}`;
    console.log('[TextOverlay] ✓ Overlay applied successfully');
    return outputDataUri;

  } catch (err: any) {
    console.error('[TextOverlay] ✗ FAILED:', err.message, err.stack?.substring(0, 300));
    return imageDataUri; // Return original on failure
  }
}

/**
 * Extract text elements from a brief for overlay.
 */
export function extractOverlayConfig(brief: any, paradigmId: string): TextOverlayConfig {
  const copywriting = brief?.copywriting || {};
  const headline = copywriting.headline?.primary || '';
  const hookOrGrabber = copywriting.attentionGrabber || copywriting.hookText || '';

  // Extract price from various places
  const price = hookOrGrabber.match(/\$[\d,]+[KkMm]?/)?.[0]
    || headline.match(/\$[\d,]+[KkMm]?/)?.[0]
    || '';

  // Extract promo code
  const discountText = copywriting.discountText || '';
  const promoCode = discountText.match(/(?:USE CODE[:\s]*|CODE[:\s]*)(\S+)/i)?.[0]
    || discountText.match(/[A-Z]{3,}\d+/)?.[0]
    || '';

  return {
    headline,
    subheadline: copywriting.body?.primary || '',
    price,
    bullets: (copywriting.benefitBullets || []).map((b: string) => b.replace(/^[•\-]\s*/, '')),
    cta: copywriting.cta?.primary || 'Buy Challenge',
    disclaimer: copywriting.disclaimerText || 'HOLA PRIME PROVIDES DEMO ACCOUNTS WITH FICTITIOUS FUNDS FOR SIMULATED TRADING PURPOSES ONLY. CLIENTS MAY EARN MONETARY REWARDS BASED ON THEIR PERFORMANCE THROUGH SUCH DEMO HOLA PRIME ACCOUNTS.',
    attentionGrabber: hookOrGrabber.replace(/\$[\d,]+[KkMm]?/, '').trim() || '',
    promoCode,
    urgencyText: copywriting.urgencyText || '',
    layout: paradigmId.includes('editorial') ? 'editorial'
      : paradigmId.includes('cinematic') ? 'cinematic'
      : paradigmId.includes('data') ? 'data_native'
      : 'standard',
    darkBackground: true,
    logoText: 'hola prime',
    tagline: '#WeAreTraders',
  };
}
