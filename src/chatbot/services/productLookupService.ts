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
 * Service to query live products, verify stock, and format customer responses
 * Reuses NookMint's existing MockProductRepository (backed by Supabase PostgreSQL).
 */
export class ProductLookupService {
  private repository: MockProductRepository;
  private siteUrl: string;

  constructor() {
    this.repository = new MockProductRepository();
    this.siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nookmint.com';
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
   * Dynamic search by code, title, or keywords
   */
  public async searchProducts(query: string, maxResults: number = 3): Promise<FormattedProductResult[]> {
    if (!query || !query.trim()) return [];
    // Sanitize query by stripping trailing punctuation (?, !, ., etc.)
    const cleanQuery = query.replace(/[?!.,;:]+$/g, '').trim();

    // 1. Check if the query looks like a product code
    const codeMatch = cleanQuery.match(/\b(NM-P\d+|P\d+)\b/i);
    if (codeMatch) {
      const byCode = await this.findByProductCode(codeMatch[1]);
      if (byCode) return [byCode];
    }

    // 2. Query products using MockProductRepository filter
    const products = await this.repository.filterProducts({
      searchQuery: cleanQuery,
      includeHidden: false,
    });

    return products.slice(0, maxResults).map((p) => this.buildResult(p));
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
   */
  public formatPriceResponse(result: FormattedProductResult): string {
    const { product, formattedPrice, canonicalUrl } = result;
    const codNote = product.isCodAvailable ? ' Cash on Delivery is available across Sri Lanka.' : '';
    return `💰 ${product.title} is currently ${formattedPrice}.${codNote}\n👉 View & order here:\n${canonicalUrl}`;
  }

  /**
   * Formats a targeted stock response for follow-up questions ("Is it in stock?")
   */
  public formatStockFollowupResponse(result: FormattedProductResult, requestedQty?: number): string {
    const { product, stockInfo, canonicalUrl } = result;
    if (stockInfo.status === 'INQUIRY_ONLY') {
      return `✨ ${product.title} is a high-value item coordinated directly via WhatsApp quotation.\n👉 View details:\n${canonicalUrl}`;
    }
    if (stockInfo.status === 'OUT_OF_STOCK') {
      return `❌ ${product.title} is currently out of stock.\n👉 Check live updates:\n${canonicalUrl}`;
    }
    if (requestedQty && requestedQty > 1) {
      if (requestedQty <= stockInfo.totalUnits) {
        return `✓ Yes! We have ${requestedQty} units of ${product.title} available in stock (total ${stockInfo.totalUnits} units ready for dispatch).\n👉 Order here:\n${canonicalUrl}`;
      }
      return `⚠️ We currently only have ${stockInfo.totalUnits} units of ${product.title} in stock.\n👉 Order here:\n${canonicalUrl}`;
    }
    return `📦 Yes! ${product.title} is in stock with ${stockInfo.totalUnits} units available for dispatch.\n👉 View & order here:\n${canonicalUrl}`;
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
   * Formats a general product details response
   */
  public formatGeneralDetailsResponse(result: FormattedProductResult): string {
    const { product, formattedPrice, stockInfo, canonicalUrl } = result;
    const shortDesc = product.description ? product.description.split('\n')[0] : '';
    const stockText = stockInfo.totalUnits > 0 ? `${stockInfo.totalUnits} units in stock` : 'Out of stock';
    return `🛍️ ${product.title}\n💰 Price: ${formattedPrice}\n📦 Stock: ${stockText}\nℹ️ ${shortDesc}\n👉 Full details & order here:\n${canonicalUrl}`;
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
