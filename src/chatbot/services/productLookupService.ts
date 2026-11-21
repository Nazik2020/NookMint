import { MockProductRepository } from '../../infrastructure/repositories/MockProductRepository';
import { Product, ProductVariant } from '../../core/entities/Product';
import { formatLKR } from '../../shared/utils/currency';

export interface ProductStockInfo {
  status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'INQUIRY_ONLY';
  totalUnits: number;
  variantBreakdown: Array<{
    name: string;
    stock: number;
    sku: string;
  }>;
}

export interface FormattedProductResult {
  product: Product;
  productCode: string;
  stockInfo: ProductStockInfo;
  canonicalUrl: string;
  formattedPrice: string;
}

/**
 * Resolves the active store base URL.
 * Automatically defaults to the live Vercel production deployment (https://nook-mint.vercel.app)
 * until custom domain DNS is pointed.
 */
const PRODUCT_CODE_IN_QUERY = /\b(NM-P\d+|P\d+)(?:-[A-Za-z0-9]+)?\b/gi;

const SINHALA_NUMBER_WORDS: Record<string, number> = {
  'එකක්': 1, 'එක': 1,
  'දෙකක්': 2, 'දෙක': 2,
  'තුනක්': 3, 'තුන': 3,
  'හතරක්': 4, 'හතර': 4,
  'පහක්': 5, 'පහ': 5,
  'හයක්': 6, 'හය': 6,
  'හතක්': 7, 'හත': 7,
  'අටක්': 8, 'අට': 8,
  'නවයක්': 9, 'නමය': 9, 'නමයක්': 9,
  'දහයක්': 10, 'දහය': 10,
  'පහළොවක්': 15, 'විස්සක්': 20, 'පනහක්': 50, 'සීයක්': 100,
};

function normalizeSinhalaDigits(text: string): string {
  const sinhalaDigits = ['෦', '෧', '෨', '෩', '෪', '෫', '෬', '෭', '෮', '෯'];
  let res = text;
  for (let i = 0; i < sinhalaDigits.length; i++) {
    res = res.replace(new RegExp(sinhalaDigits[i], 'g'), String(i));
  }
  return res;
}

/**
 * Reads a customer-requested quantity from a stock/availability question in English, Singlish, or Sinhala.
 * Product-code digits (e.g. P00481) are ignored so they are never treated as a quantity.
 */
export function extractRequestedQuantity(rawQuery: string): number | undefined {
  if (!rawQuery) return undefined;
  const normalized = normalizeSinhalaDigits(rawQuery);
  const stripped = normalized.replace(PRODUCT_CODE_IN_QUERY, ' ');

  // 1. Check digit with Sinhala suffix 'ක්' or 'ක' (e.g. "3ක්", "2ක්", "10ක්", "3 ක්")
  const sinhalaDigitMatch = stripped.match(/(\d+)\s*(?:ක්|ක)/);
  if (sinhalaDigitMatch) {
    const p = parseInt(sinhalaDigitMatch[1], 10);
    if (!isNaN(p) && p > 0 && p < 1000) return p;
  }

  // 2. Check Sinhala number words (e.g. "තුනක්", "දෙකක්", "පහක්")
  for (const [word, num] of Object.entries(SINHALA_NUMBER_WORDS)) {
    if (new RegExp('(^|[\\s,–—\\-_/()?!.,;:]+)' + word + '($|[\\s,–—\\-_/()?!.,;:]+)').test(stripped)) {
      return num;
    }
  }

  // 3. Check digit followed by Sinhala intent verbs (e.g. "3 ගන්න", "3 ඕන", "3 තියෙනවද")
  const sinhalaVerbMatch = stripped.match(/(\d+)\s*(?:ගන්න|ඕන|ඕනේ|තියෙනවද|තියෙනවාද|තියෙද|ලබාගන්න|ඇණවුම්|දාන්න)/);
  if (sinhalaVerbMatch) {
    const p = parseInt(sinhalaVerbMatch[1], 10);
    if (!isNaN(p) && p > 0 && p < 1000) return p;
  }

  // 4. Check Latin units / k / intent words (e.g. "3 units", "3k", "order 3", "3 ganna")
  const match =
    stripped.match(/\b(\d+)\s*(?:units?|items?|pieces?|packs?|k)\b/i) ||
    stripped.match(/\b(?:order|need|want|ganna|ona|one)\s+(\d+)\b/i) ||
    stripped.match(/\b(\d+)\s*(?:ganna|ona|one)\b/i);
  if (match) {
    const parsed = parseInt(match[1], 10);
    if (!isNaN(parsed) && parsed > 0 && parsed < 1000) return parsed;
  }

  return undefined;
}

export function getStoreBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && envUrl !== 'https://nookmint.com' && envUrl !== 'http://nookmint.com') {
    return envUrl.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'https://nook-mint.vercel.app';
}

/**
 * Fast Levenshtein distance for fuzzy spelling differences
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], row[j], prev) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

const CONVERSATIONAL_STOP_WORDS = new Set([
  'the', 'a', 'an', 'for', 'with', 'and', 'or', 'in', 'on', 'at', 'to', 'from',
  'is', 'it', 'its', 'this', 'that', 'these', 'those', 'are', 'was', 'were',
  'show', 'item', 'items', 'products', 'product', 'look', 'want', 'need', 'give',
  'tell', 'about', 'can', 'you', 'i', 'please', 'any', 'find', 'check', 'have',
  'do', 'get', 'see', 'buy', 'order',
  // Common Singlish fillers
  'eka', 'meka', 'oyalage', 'mata', 'thiyenawada', 'thiyenawa', 'thiyeda',
  'thynwda', 'tiyenawada', 'nadda', 'pennanna', 'ganna', 'ona', 'one',
  'puluwanda', 'kohomada', 'kiyada', 'keeyada', 'price', 'mila', 'gaana',
  'cost', 'fee', 'stock', 'available', 'karanne', 'karanna', 'karaganna',
  'badu', 'parcel'
]);

const CATEGORY_MAP: Record<string, string> = {
  'kitchen': 'Kitchen & Dining',
  'kitchenware': 'Kitchen & Dining',
  'dining': 'Kitchen & Dining',
  'cooking': 'Kitchen & Dining',
  'home': 'Home & Living',
  'living': 'Home & Living',
  'decor': 'Home & Living',
  'gadget': 'Smart Gadgets & Audio',
  'gadgets': 'Smart Gadgets & Audio',
  'audio': 'Smart Gadgets & Audio',
  'tech': 'Smart Gadgets & Audio',
  'earbuds': 'Smart Gadgets & Audio',
  'baby': 'Kids, Baby & Toys',
  'kids': 'Kids, Baby & Toys',
  'toys': 'Kids, Baby & Toys',
  'children': 'Kids, Baby & Toys',
  'beauty': 'Beauty & Personal Care',
  'makeup': 'Beauty & Personal Care',
  'cosmetics': 'Beauty & Personal Care',
};

/**
 * Service to query live products, verify stock, and format customer responses
 * Reuses NookMint's existing MockProductRepository (backed by Supabase PostgreSQL).
 */
export class ProductLookupService {
  private repository: MockProductRepository;
  private siteUrl: string;

  constructor() {
    this.repository = new MockProductRepository();
    this.siteUrl = getStoreBaseUrl();
  }

  /**
   * Calculates real-time stock using the website's exact inventory logic
   */
  public calculateStockInfo(product: Product): ProductStockInfo {
    if (product.inquiryOnly) {
      return {
        status: 'INQUIRY_ONLY',
        totalUnits: 0,
        variantBreakdown: [],
      };
    }

    const variants = product.variants && product.variants.length > 0
      ? product.variants
      : [{ size: 'Standard', stock: 0, sku: product.sku || product.id } as ProductVariant];

    const totalUnits = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const status = totalUnits > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';

    const variantBreakdown = variants.map((v) => ({
      name: v.size || 'Standard',
      stock: Number(v.stock) || 0,
      sku: v.sku || product.id,
    }));

    return {
      status,
      totalUnits,
      variantBreakdown,
    };
  }

  /**
   * Finds a product by exact code (dropship "P\d+" or NookMint "NM-P\d+")
   */
  public async findByProductCode(code: string): Promise<FormattedProductResult | null> {
    if (!code) return null;
    const cleanCode = code.trim().toLowerCase();

    const products = await this.repository.getAllProducts(false);

    const matched = products.find((p) => {
      // 1. Check root sku
      if (p.sku && p.sku.toLowerCase() === cleanCode) return true;
      // 2. Check product id
      if (p.id && p.id.toLowerCase() === cleanCode) return true;
      // 3. Check variant skus (e.g., P00481-1 or P00481)
      if (p.variants?.some((v) => v.sku && (v.sku.toLowerCase() === cleanCode || v.sku.toLowerCase().startsWith(`${cleanCode}-`)))) {
        return true;
      }
      return false;
    });

    if (!matched) return null;

    return this.buildResult(matched);
  }

  /**
   * Finds a product by its unique internal ID or slug
   */
  public async findById(id: string): Promise<FormattedProductResult | null> {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    const product = await this.repository.getProductById(cleanId) || await this.repository.getProductBySlug(cleanId);
    if (!product) return null;
    return this.buildResult(product);
  }

  /**
   * Identifies customer stock/availability inquiry phrasing (English, Singlish & Sinhala)
   */
  public isAvailabilityInquiry(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    return /\b(available|stock|in stock|thiyenawada|thiyeda|thiyenawa|thynwda|badu thiyeda|is it available|is this available|ganna puluwanda|ganna puluwan da|ganna puluwan|ganna ona|ganna one|order karanna puluwanda|order puluwanda|order karanna|can i order|can i get|how many|units? available)\b/i.test(lower) ||
      /(ගන්න පුළුවන්ද|ගන්න පුළුවන්|තියෙනවද|තියෙනවාද|තියෙද|ලබාගන්න|ඇණවුම්|ස්ටොක්|ඕන|ඕනේ)/i.test(lower);
  }

  /**
   * Identifies customer price inquiry phrasing (English & Singlish)
   */
  public isPriceInquiry(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    return /\b(price|how much|cost|kiyada|keeyada|gaana|mila|keeyak|price eka|how much is this|how much is it)\b/i.test(lower) ||
      /(මිල|ගණන|ගාන|කීයද|මිල කීයද)/i.test(lower);
  }

  /**
   * Identifies general conversational greetings or small talk
   */
  public isGeneralGreeting(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    return /^(hi|hello|hey|good\s*(morning|afternoon|evening)|suba\s*udasanak|suba\s*sandhawak|ayubowan|help|who\s*are\s*you|howdy)[\s!.,?]*$/i.test(lower);
  }

  /**
   * Identifies delivery / shipping fee inquiries specifically
   */
  public isDeliveryFeeInquiry(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    return /\b(delivery fee|delivery charge|delivery charges|delivery cost|shipping fee|shipping charge|shipping cost|how much is delivery|delivery kiyada|delivery keeyada|fee eka|charge eka)\b/i.test(lower) ||
      ((lower.includes('ගාස්තුව') || lower.includes('කීයද') || lower.includes('fee')) && (lower.includes('delivery') || lower.includes('ගෙනැවිත්')));
  }

  /**
   * Identifies delivery duration / timing inquiries specifically
   */
  public isDeliveryTimeInquiry(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    return /\b(how long|how many days|delivery time|delivery days|shipping time|enna kochchara|kochchara dawas|dawas kiyak|dawas keeyak|enna dawas|delivery duration)\b/i.test(lower) ||
      /(දින කීයක්|කාලය|දින|කවදාද)/i.test(lower);
  }

  /**
   * Identifies general delivery inquiries (excludes COD inquiries)
   */
  public isDeliveryInquiry(text: string): boolean {
    if (!text) return false;
    if (this.isCodInquiry(text)) return false;
    const lower = text.toLowerCase().trim();
    return /\b(delivery|deliver|shipping|courier|enna kochchara|kochchara dawas|dawas kiyak|bedaharina|delivery fee|delivery charge|delivery cost|delivery charges)\b/i.test(lower) ||
      /(බෙදාහැරීම|ගෙනැවිත්|delivery)/i.test(lower);
  }

  /**
   * Identifies Cash on Delivery (COD) inquiries
   */
  public isCodInquiry(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    return /\b(cod|cash on delivery|badu labunama|parcel eka labunata|athata gewanna|gewanna puluwanda)\b/i.test(lower) ||
      /(භාණ්ඩ ලැබුණු පසු|මුදල් ගෙවීම|cod)/i.test(lower);
  }

  /**
   * Identifies order instructions / "how to order" inquiries
   */
  public isOrderHowToInquiry(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    return /\b(how to order|order karanne kohomada|order karanna|place an order|order danne kohomada|order ekak danne|buy karanne kohomada|checkout)\b/i.test(lower) ||
      /(ඇණවුම් කරන්නේ කොහොමද|ඇණවුම් කරන්නේ|order කරන්නේ)/i.test(lower);
  }

  /**
   * Specific delivery fee response: explains fees without repeating COD or duration
   */
  public getDeliveryFeeResponse(): string {
    return [
      '🚚 Delivery charges across Sri Lanka are usually around LKR 400–500.',
      '📲 The exact delivery fee is confirmed in your official WhatsApp invoice after submitting your order.',
    ].join('\n');
  }

  /**
   * Specific delivery time response: explains 3–5 days without repeating fee or COD
   */
  public getDeliveryTimeResponse(): string {
    return [
      '📦 Estimated delivery time is 3–5 business days across Sri Lanka.',
      '🚚 Orders are dispatched promptly with tracking updates sent to your WhatsApp.',
    ].join('\n');
  }

  /**
   * Concise general delivery FAQ response
   */
  public getGeneralDeliveryResponse(): string {
    return [
      '🚚 Islandwide delivery across Sri Lanka (estimated 3–5 days)! 🇱🇰',
      '📦 Delivery fee is usually around LKR 400–500 (actual fee confirmed in your WhatsApp invoice).',
      '💵 Cash on Delivery (COD) is available on all eligible orders.',
    ].join('\n');
  }

  /**
   * Concise Cash on Delivery (COD) response: explains COD and doorstep payment process
   */
  public getCodFaqResponse(): string {
    return [
      '💵 Yes! Cash on Delivery (COD) is available across Sri Lanka.',
      '📦 You can inspect your sealed package and pay cash directly to the courier representative when delivered to your doorstep.',
      '🚚 No advance payment or bank deposit is required.',
    ].join('\n');
  }

  /**
   * Detailed two-path ordering instructions for customers who ask how to order
   */
  public getOrderHowToResponse(): string {
    return [
      '🛍️ Ordering from NookMint is simple! 💚',
      '',
      'You can place an order in two ways:',
      '',
      '⚡ Option 1 – Order Now (Fast Single Item)',
      '1. Open the product page.',
      '2. Click "Order Now".',
      '3. Enter your contact & delivery details.',
      '4. Click "Confirm Order".',
      '',
      '🛒 Option 2 – Add to Cart (Multiple Items)',
      '1. Click "Add to Cart" for each product you want.',
      '2. Open your Cart and click "Proceed to Checkout".',
      '3. Enter your contact & delivery details.',
      '4. Click "Confirm Order".',
      '',
      '📲 Once submitted, our team will send your invoice via WhatsApp confirming product price, delivery fee (usually LKR 400–500), and final total. Delivery takes 3–5 days islandwide with Cash on Delivery!',
    ].join('\n');
  }

  /**
   * Dynamic search supporting:
   * 1. Exact product code (e.g. "P00481", "P00109")
   * 2. Category intent search (e.g. "show kitchen items")
   * 3. Exact and partial title matching (e.g. "30 led solar", "solar wall light", "Boom Wash")
   * 4. Multi-token order independence (e.g. "solar 30 led")
   * 5. Fuzzy spelling tolerance (e.g. "solar lite", "soler light")
   * 6. Singlish search expressions (e.g. "30 led solar eka thiyenawada")
   */
  public async searchProducts(query: string, maxResults: number = 3): Promise<FormattedProductResult[]> {
    if (!query || !query.trim()) return [];
    // Sanitize query by stripping trailing punctuation (?, !, ., etc.)
    const cleanQuery = query.replace(/[?!.,;:]+$/g, '').trim().toLowerCase();

    // 1. Check if the query contains a product code
    const codeMatch = cleanQuery.match(/\b(NM-P\d+|P\d+)\b/i);
    if (codeMatch) {
      const byCode = await this.findByProductCode(codeMatch[1]);
      if (byCode) return [byCode];
    }

    // 2. Tokenize the query
    const rawTokens = cleanQuery
      .split(/[\s,–—\-_/()]+/)
      .map((w) => w.replace(/[^a-z0-9]/g, '').trim())
      .filter((w) => w.length > 0);

    // Filter out conversational stop words
    let searchTokens = rawTokens.filter((w) => !CONVERSATIONAL_STOP_WORDS.has(w));
    if (searchTokens.length === 0) {
      searchTokens = rawTokens; // preserve tokens if all were stop words (e.g. very short query)
    }

    // 3. Category search check (e.g. "show kitchen items", "kitchen products", "show gadgets")
    for (const token of searchTokens) {
      const matchedCat = CATEGORY_MAP[token];
      if (matchedCat) {
        const catProducts = await this.repository.filterProducts({
          category: matchedCat,
          includeHidden: false,
        });
        if (catProducts.length > 0) {
          // If the query was purely a category inquiry (e.g. "show kitchen items" or "kitchen"), return category products
          const otherTokens = searchTokens.filter((t) => t !== token && !CONVERSATIONAL_STOP_WORDS.has(t));
          if (otherTokens.length === 0) {
            return catProducts.slice(0, maxResults).map((p) => this.buildResult(p));
          }
        }
      }
    }

    // 4. Score all active products with weighted token, order-independent & fuzzy matching
    const allProducts = await this.repository.getAllProducts(false);
    const scoredProducts: Array<{ product: Product; score: number; matchedTitleCount: number }> = [];
    const minScoreThreshold = 35;

    for (const product of allProducts) {
      const titleLower = product.title.toLowerCase();
      const descLower = (product.description || '').toLowerCase();
      const catLower = (product.category || '').toLowerCase();
      const titleTokens = titleLower
        .split(/[\s,–—\-_/()]+/)
        .map((w) => w.replace(/[^a-z0-9]/g, ''))
        .filter(Boolean);

      let score = 0;
      let matchedTitleCount = 0;

      // Exact title match
      if (titleLower === cleanQuery) {
        score += 500;
      } else if (titleLower.includes(cleanQuery)) {
        // Direct phrase match in title (e.g. "30 led solar" in "30 led solar wall light...")
        score += 250;
      }

      // Check each search token
      for (const token of searchTokens) {
        let tokenMatchedInTitle = false;
        const isNumber = /^\d+$/.test(token);

        for (const tToken of titleTokens) {
          if (tToken === token) {
            score += isNumber ? 45 : 35;
            tokenMatchedInTitle = true;
            break;
          }
          // Prefix matching for words with len >= 4
          if (!isNumber && token.length >= 4 && tToken.length >= 4) {
            if (tToken.startsWith(token) || token.startsWith(tToken)) {
              score += 25;
              tokenMatchedInTitle = true;
              break;
            }
          }
          // Fuzzy spelling differences (Levenshtein)
          if (!isNumber && token.length >= 4 && tToken.length >= 4) {
            const maxDistance = token.length <= 5 ? 1 : 2;
            if (levenshteinDistance(token, tToken) <= maxDistance) {
              score += 20;
              tokenMatchedInTitle = true;
              break;
            }
          }
        }

        if (tokenMatchedInTitle) {
          matchedTitleCount++;
        } else {
          // If not in title, check category or description
          if (catLower.includes(token)) {
            score += 15;
          } else if (descLower.includes(token)) {
            score += 5;
          }
        }
      }

      // Bonus if all search tokens matched title
      if (searchTokens.length > 0 && matchedTitleCount === searchTokens.length) {
        score += 100;
      } else if (matchedTitleCount >= 2) {
        score += 30;
      }

      // Safe threshold: require minimum score and at least one title match or strong category match
      const minScoreThreshold = 35;
      if (score >= minScoreThreshold && (matchedTitleCount > 0 || score >= 50)) {
        scoredProducts.push({ product, score, matchedTitleCount });
      }
    }

    // Sort by score descending
    scoredProducts.sort((a, b) => b.score - a.score);

    if (scoredProducts.length === 0) return [];

    const topScore = scoredProducts[0].score;
    // If top match is dominant (e.g. matched all tokens, score is >= 150 and more than double the runner up)
    if (
      scoredProducts.length > 1 &&
      topScore >= 150 &&
      (scoredProducts[0].matchedTitleCount > scoredProducts[1].matchedTitleCount ||
        topScore >= scoredProducts[1].score * 2)
    ) {
      return [this.buildResult(scoredProducts[0].product)];
    }

    // Otherwise keep only plausible matches that have at least 50% of top score
    const plausible = scoredProducts.filter((p) => p.score >= Math.max(minScoreThreshold, topScore * 0.5));
    return plausible.slice(0, maxResults).map((item) => this.buildResult(item.product));
  }

  /**
   * Formats a single product into a customer-friendly Nooki chat response
   */
  public formatSingleProductResponse(result: FormattedProductResult, requestedQty?: number): string {
    const { product, productCode, stockInfo, canonicalUrl, formattedPrice } = result;

    let stockMessage = '';
    if (stockInfo.status === 'INQUIRY_ONLY') {
      stockMessage = '✨ Special quotation & delivery item (contact via WhatsApp)';
    } else if (stockInfo.status === 'OUT_OF_STOCK') {
      stockMessage = '❌ Currently Out of Stock';
    } else {
      if (requestedQty && requestedQty > 1) {
        if (requestedQty <= stockInfo.totalUnits) {
          stockMessage = `✓ ${requestedQty} units available in stock (${stockInfo.totalUnits} units total ready for dispatch)`;
        } else {
          stockMessage = `⚠️ Only ${stockInfo.totalUnits} units currently in stock`;
        }
      } else {
        stockMessage = `✓ In Stock (${stockInfo.totalUnits} units available for dispatch)`;
      }
    }

    // Color/Variant summary if multiple
    let variantLine = '';
    if (stockInfo.variantBreakdown.length > 1) {
      const optionsStr = stockInfo.variantBreakdown
        .map((v) => `${v.name}${v.stock > 0 ? '' : ' (out of stock)'}`)
        .join(', ');
      variantLine = `\n🎨 Options: ${optionsStr}`;
    }

    const codText = product.isCodAvailable ? '🚚 100% Cash on Delivery across Sri Lanka' : '';

    return [
      `🛍️ ${product.title}`,
      `🏷️ Code: ${productCode} | Category: ${product.category}`,
      `💰 Price: ${formattedPrice}`,
      `📦 Stock: ${stockMessage}${variantLine}`,
      codText,
      `👉 View details & order here:\n${canonicalUrl}`,
    ].filter(Boolean).join('\n');
  }

  /**
   * Formats a targeted price response for follow-up questions ("How much is this?")
   * Directly answers with product name, price, and product link (no repetitive COD/delivery info).
   */
  public formatPriceResponse(result: FormattedProductResult): string {
    const { product, formattedPrice, canonicalUrl } = result;
    return `💰 ${product.title} is currently ${formattedPrice}.\n👉 View & order here:\n${canonicalUrl}`;
  }

  /**
   * Formats a targeted stock response for follow-up questions ("Is it in stock?", "Meken 3k ganna puluwanda?", "මේකෙන් 3ක් ගන්න පුළුවන්ද?")
   * Distinguishes requested quantity from total available stock while keeping product name and code.
   * Does not repeat unrelated COD or delivery information.
   */
  public formatStockFollowupResponse(result: FormattedProductResult, requestedQty?: number): string {
    const { product, productCode, stockInfo, canonicalUrl } = result;
    const codeLabel = productCode ? ` (${productCode})` : '';

    if (stockInfo.status === 'INQUIRY_ONLY') {
      return `✨ ${product.title}${codeLabel} is a high-value item coordinated directly via WhatsApp quotation.\n👉 View details:\n${canonicalUrl}`;
    }
    if (stockInfo.status === 'OUT_OF_STOCK') {
      if (requestedQty && requestedQty > 0) {
        return [
          `❌ ${product.title}${codeLabel} is currently out of stock, so we cannot fulfil ${requestedQty} units right now.`,
          '',
          'This is only a stock check; no order has been placed.',
          '',
          `👉 View product:\n${canonicalUrl}`,
        ].join('\n');
      }
      return `❌ ${product.title}${codeLabel} is currently out of stock.\n👉 Check live updates:\n${canonicalUrl}`;
    }

    if (requestedQty && requestedQty > 0) {
      if (requestedQty <= stockInfo.totalUnits) {
        return [
          `✅ Yes! You can order ${requestedQty} units of ${product.title}${codeLabel}.`,
          '',
          `📦 Current available stock: ${stockInfo.totalUnits} units.`,
          '',
          'This is only a stock check; no order has been placed.',
          '',
          `👉 View product:\n${canonicalUrl}`,
        ].join('\n');
      }
      return [
        `⚠️ We cannot fulfil ${requestedQty} units of ${product.title}${codeLabel} right now.`,
        '',
        `📦 Current available stock: ${stockInfo.totalUnits} units.`,
        '',
        'This is only a stock check; no order has been placed.',
        '',
        `👉 View product:\n${canonicalUrl}`,
      ].join('\n');
    }

    return [
      `📦 Yes! ${product.title}${codeLabel} is in stock.`,
      `Current available stock: ${stockInfo.totalUnits} units ready for dispatch.`,
      `👉 View details & order here:\n${canonicalUrl}`,
    ].join('\n');
  }

  /**
   * Concise stock-only answer for product.availability (not the full product card).
   * Includes product name, code, live stock, optional variant breakdown, and canonical URL.
   */
  public formatAvailabilityResponse(result: FormattedProductResult, requestedQty?: number): string {
    const { product, productCode, stockInfo, canonicalUrl } = result;
    const identity = `${product.title} (${productCode})`;
    const urlLine = `👉 View details:\n${canonicalUrl}`;
    const variantLine = this.formatVariantStockLine(stockInfo);

    if (stockInfo.status === 'INQUIRY_ONLY') {
      return [
        `✨ ${identity} is a quotation-only item arranged via WhatsApp.`,
        'We cannot confirm a unit count for this product here.',
        urlLine,
      ].join('\n');
    }

    if (stockInfo.status === 'OUT_OF_STOCK') {
      if (requestedQty && requestedQty > 0) {
        return [
          `❌ ${identity} is currently out of stock, so we cannot fulfil ${requestedQty} units right now. This is only a stock check; no order has been placed.`,
          urlLine,
        ].join('\n');
      }
      return [`❌ ${identity} is currently out of stock.`, urlLine].join('\n');
    }

    if (requestedQty && requestedQty > 0) {
      if (requestedQty <= stockInfo.totalUnits) {
        return [
          `✅ Yes! You can order ${requestedQty} units of ${identity}. Current available stock: ${stockInfo.totalUnits} units. This is only a stock check; no order has been placed.`,
          variantLine,
          urlLine,
        ]
          .filter(Boolean)
          .join('\n');
      }
      return [
        `⚠️ We cannot fulfil ${requestedQty} units of ${identity} right now. Current available stock: ${stockInfo.totalUnits} units. This is only a stock check; no order has been placed.`,
        variantLine,
        urlLine,
      ]
        .filter(Boolean)
        .join('\n');
    }

    return [
      `📦 Yes — ${identity} is in stock.`,
      `📦 ${stockInfo.totalUnits} units currently available.`,
      variantLine,
      urlLine,
    ]
      .filter(Boolean)
      .join('\n');
  }

  /**
   * Lists actual variant stock only. Out-of-stock options are labelled, never promised.
   */
  private formatVariantStockLine(stockInfo: ProductStockInfo): string {
    if (stockInfo.variantBreakdown.length <= 1) return '';
    const parts = stockInfo.variantBreakdown.map((v) => {
      if (v.stock > 0) return `${v.name} (${v.stock} available)`;
      return `${v.name} (out of stock)`;
    });
    return `🎨 Options: ${parts.join(', ')}`;
  }

  /**
   * Formats a color/option response for follow-up questions ("What colors do you have?")
   */
  public formatColorsResponse(result: FormattedProductResult): string {
    const { product, canonicalUrl } = result;
    if (product.colors && product.colors.length > 0) {
      const colorList = product.colors.map((c) => c.name).join(', ');
      return `🎨 Available colors for ${product.title}: ${colorList}.\n👉 View color options:\n${canonicalUrl}`;
    }
    if (product.variants && product.variants.length > 1) {
      const variantList = product.variants
        .map((v) => `${v.size}${v.stock > 0 ? '' : ' (out of stock)'}`)
        .join(', ');
      return `🎨 Available options for ${product.title}: ${variantList}.\n👉 View options:\n${canonicalUrl}`;
    }
    return `ℹ️ ${product.title} is available in its standard option.\n👉 View details:\n${canonicalUrl}`;
  }

  /**
   * Formats a general product details response (features, specifications, variations)
   * Answers without unnecessary repeated promotional text.
   */
  public formatGeneralDetailsResponse(result: FormattedProductResult): string {
    const { product, productCode, formattedPrice, stockInfo, canonicalUrl } = result;
    const shortDesc = product.description ? product.description.split('\n')[0] : '';
    const stockText = stockInfo.totalUnits > 0 ? `${stockInfo.totalUnits} units in stock` : 'Out of stock';

    let variantLine = '';
    if (stockInfo.variantBreakdown.length > 1) {
      const parts = stockInfo.variantBreakdown.map((v) => `${v.name}${v.stock > 0 ? '' : ' (out of stock)'}`);
      variantLine = `\n🎨 Options: ${parts.join(', ')}`;
    }

    return [
      `🛍️ ${product.title} (${productCode})`,
      `💰 Price: ${formattedPrice}`,
      `📦 Stock: ${stockText}${variantLine}`,
      shortDesc ? `ℹ️ ${shortDesc}` : '',
      `👉 View full details & order here:\n${canonicalUrl}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  /**
   * Formats multiple matched products so customer can choose
   */
  public formatMultiProductResponse(results: FormattedProductResult[]): string {
    const list = results
      .map(
        (r, i) =>
          `${i + 1}. ${r.product.title}\n   Code: ${r.productCode} | Price: ${r.formattedPrice}\n   👉 ${r.canonicalUrl}`
      )
      .join('\n\n');

    return `🛍️ I found a few items that match your search:\n\n${list}\n\nType the product code or name to see more details!`;
  }

  /**
   * Helper to construct a standard formatted product result
   */
  private buildResult(product: Product): FormattedProductResult {
    const productCode = product.sku || product.variants?.[0]?.sku || product.id;
    const stockInfo = this.calculateStockInfo(product);
    const canonicalUrl = `${this.siteUrl}/products/${product.id}`;
    const formattedPrice = formatLKR(product.sellingPrice);

    return {
      product,
      productCode,
      stockInfo,
      canonicalUrl,
      formattedPrice,
    };
  }
}
