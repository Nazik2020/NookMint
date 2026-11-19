/**
 * Singlish NLP Preprocessor for Nooki (NookMint Chatbot)
 *
 * Responsibilities:
 * 1. Product Code Protection: Identifies and preserves exact product code patterns
 *    - Dropshipping codes: P\d+ (e.g., P07626, P00481)
 *    - Future NookMint-owned codes: NM-P\d+ (e.g., NM-P07626)
 * 2. Sinhala Unicode Preservation: Leaves native Sinhala script (\u0D80-\u0DFF) uncorrupted.
 * 3. Singlish Normalization: Standardizes common phonetically spelled Sinhala words
 *    into standard forms recognized by Dialogflow ES training phrases.
 * 4. Whitespace & Punctuation Cleanup.
 */

export interface PreprocessedMessage {
  original: string;
  normalized: string;
  detectedProductCodes: string[];
}

// Regex to capture product codes (case-insensitive in input, restored as canonical uppercase)
// Matches standalone codes like P07626, P00481, NM-P07626, or with trailing variant/hyphen
const PRODUCT_CODE_REGEX = /\b(NM-P\d+|P\d+)(?:-[A-Za-z0-9]+)?\b/gi;

// Singlish phonetic mappings to standard Dialogflow training phrases
// Sorted conceptually: Multi-word phrases checked before single words
const PHRASE_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string }> = [
  // Price inquiries
  { pattern: /\b(price\s*(eka)?\s*(keeyada|kiyada|keeyak|mokakda))\b/gi, replacement: 'price eka kiyada' },
  { pattern: /\b(gaana\s*(keeyada|kiyada|keeyak))\b/gi, replacement: 'price eka kiyada' },
  { pattern: /\b(mila\s*(keeyada|kiyada|keeyak))\b/gi, replacement: 'price eka kiyada' },
  { pattern: /\b(keeyada|keeyakda|keeyak|kiyadha)\b/gi, replacement: 'kiyada' },

  // Availability & Stock
  { pattern: /\b(stock\s*(thiyenawada|tiyenawada|thynwda|thiyeda|thiyenwda|thiyanawada))\b/gi, replacement: 'stock thiyenawada' },
  { pattern: /\b(available\s*da)\b/gi, replacement: 'thiyenawada' },
  { pattern: /\b(thynwda|tiyenawada|thiyenawadha|thiyeda|thiyenwda|thiyanawada|tiyenawadha)\b/gi, replacement: 'thiyenawada' },
  { pattern: /\b(thiyenawa|tiyenawa|thynwa)\b/gi, replacement: 'thiyenawa' },
  { pattern: /\b(naeda|nadda|neda)\b/gi, replacement: 'nadda' },

  // Showing / Catalog / Discovery
  { pattern: /\b(penwanna|penanna|pennanda|pennandako|balanna\s*ona)\b/gi, replacement: 'pennanna' },
  { pattern: /\b(thawa\s*monawada\s*thiyenne|wena\s*monawada\s*thiyenne)\b/gi, replacement: 'thawa monawada thiyenne' },

  // Negation Safety (must run BEFORE affirmative purchase/wanting rules)
  { pattern: /\b(ganna\s*(epa|epaa))\b/gi, replacement: 'ganna epa' },
  { pattern: /\b(ona\s*(na|naha|nehe|naha|neda))\b/gi, replacement: 'ona na' },
  { pattern: /\b(mata\s*epa|epa\s*mata)\b/gi, replacement: 'mata epa' },

  // Ordering & Checkout (Affirmative)
  { pattern: /\b(order\s*(karanna|karanne|karaganna)\s*(kohomada|kohomdha|khmda))\b/gi, replacement: 'order karanne kohomada' },
  { pattern: /\b(ganna\s*(ona|one|onee|oni))\b/gi, replacement: 'ganna ona' },
  { pattern: /\b(kohomdha|khmda|kohomada)\b/gi, replacement: 'kohomada' },

  // Cash on Delivery & Payment
  { pattern: /\b(cash\s*on\s*delivery\s*(puluwanda|thiyeda|thiyenawada)?)\s*(puluwanda)?\b/gi, replacement: 'cash on delivery puluwanda' },
  { pattern: /\b(cod\s*(puluwanda|thiyeda|thiyenawada)?)\s*(puluwanda)?\b/gi, replacement: 'cash on delivery puluwanda' },
  { pattern: /\b(badu\s*labunama\s*(gewanna)?)\s*(puluwanda)?\b/gi, replacement: 'cash on delivery puluwanda' },
  { pattern: /\b(parcel\s*eka\s*labunata\s*passe\s*(gewanna)?)\s*(puluwanda)?\b/gi, replacement: 'cash on delivery puluwanda' },

  // Delivery & Delivery Fee
  { pattern: /\b(delivery\s*(fee|charges?|cost|gana)\s*(keeyada|kiyada|keeyak))\b/gi, replacement: 'delivery fee eka kiyada' },
  { pattern: /\b(enna\s*kochchara\s*kal\s*(yanawada|yada))\b/gi, replacement: 'delivery time eka kohomada' },
  { pattern: /\b(kochchara\s*dawas\s*yanawada)\b/gi, replacement: 'delivery time eka kohomada' },

  // Support & Contact
  { pattern: /\b(customer\s*care|agent\s*kenek|human\s*support)\b/gi, replacement: 'customer support' },
  { pattern: /\b(katha\s*karanna\s*puluwanda|sambandha\s*karaganna\s*puluwanda)\b/gi, replacement: 'katha karanna puluwanda' },

  // Common Pronouns & Fillers
  { pattern: /\b(meeka|meyka)\b/gi, replacement: 'meka' },
  { pattern: /\b(oyalage|oyalagee)\b/gi, replacement: 'oyalage' },
  { pattern: /\b(mata|mta)\b/gi, replacement: 'mata' },
  { pattern: /\b(puluwanda|plwnda|puluwandha)\b/gi, replacement: 'puluwanda' },
];

/**
 * Normalizes customer input while protecting product codes and Sinhala script.
 */
export function preprocessCustomerMessage(rawText: string): PreprocessedMessage {
  if (!rawText || typeof rawText !== 'string') {
    return { original: '', normalized: '', detectedProductCodes: [] };
  }

  const original = rawText.trim();
  const detectedProductCodes: string[] = [];

  // Step 1: Detect and protect Product Codes with placeholder tokens
  // e.g. "p00481" -> "__PROD_CODE_0__", canonical code "P00481"
  let masked = original.replace(PRODUCT_CODE_REGEX, (match) => {
    const canonicalCode = match.toUpperCase();
    const tokenIndex = detectedProductCodes.length;
    detectedProductCodes.push(canonicalCode);
    return `__PROD_CODE_${tokenIndex}__`;
  });

  // Step 2: Conservative stretched-letter normalization
  // Only compress lowercase stretched vowels in conversational words (e.g., "keeeeyada" -> "keeyada", "oneee" -> "onee")
  // Uppercase brand names and acronyms (like "AAA" batteries) are preserved untouched.
  masked = masked.replace(/([aeiou])\1{2,}/g, '$1$1');

  // Step 3: Apply Singlish phrase standardizations
  for (const { pattern, replacement } of PHRASE_REPLACEMENTS) {
    masked = masked.replace(pattern, replacement);
  }

  // Step 4: Clean duplicate consecutive words (e.g. "puluwanda puluwanda" -> "puluwanda") and normalize multiple spaces
  masked = masked.replace(/\b([a-zA-Z]+)\s+\1\b/gi, '$1');
  masked = masked.replace(/\s+/g, ' ').trim();

  // Step 5: Restore protected Product Codes
  const normalized = masked.replace(/__PROD_CODE_(\d+)__/g, (_, idxStr) => {
    const idx = parseInt(idxStr, 10);
    return detectedProductCodes[idx] || '';
  });

  return {
    original,
    normalized,
    detectedProductCodes,
  };
}
