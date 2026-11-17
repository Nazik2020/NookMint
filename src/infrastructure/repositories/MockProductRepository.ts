import fs from 'fs';
import path from 'path';
import { IProductRepository, ProductFilterOptions } from './IProductRepository';
import { Product } from '@/core/entities/Product';
import { DatabaseClient } from '../database/DatabaseClient';

/**
 * Product Repository (SADP Repository Pattern)
 * Clean, production-ready product store for NookMint.
 * Supports persistent local storage via data/products.json and in-memory cache.
 * When store starts, demo products are cleared so only real admin products are displayed.
 */
export class MockProductRepository implements IProductRepository {
  private static readonly STORAGE_KEY = 'products_store';
  private static readonly DATA_FILE_PATH = path.resolve(process.cwd(), 'data', 'products.json');
  private db: DatabaseClient;

  // Clean slate: all demo products removed for real merchant inventory
  private static readonly INITIAL_PRODUCTS: Product[] = [];

  constructor() {
    this.db = DatabaseClient.getInstance();
    if (!this.db.has(MockProductRepository.STORAGE_KEY)) {
      const fileProducts = this.loadFromFile();
      const initial = fileProducts !== null ? fileProducts : [...MockProductRepository.INITIAL_PRODUCTS];
      this.db.set(MockProductRepository.STORAGE_KEY, initial);
    }
  }

  private saveToFile(products: Product[]): void {
    try {
      const dir = path.dirname(MockProductRepository.DATA_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(MockProductRepository.DATA_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[MockProductRepository] Warning: Could not save products to file:', err);
    }
  }

  private loadFromFile(): Product[] | null {
    try {
      if (fs.existsSync(MockProductRepository.DATA_FILE_PATH)) {
        const raw = fs.readFileSync(MockProductRepository.DATA_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('[MockProductRepository] Warning: Could not read products from file:', err);
    }
    return null;
  }

  public static getPopularReferenceProducts(): Product[] {
    return [];
  }

  public static getNewArrivalsReferenceProducts(): Product[] {
    return [];
  }

  private getStore(): Product[] {
    let list = this.db.get<Product[]>(MockProductRepository.STORAGE_KEY);
    if (!list) {
      const fileProducts = this.loadFromFile();
      list = fileProducts !== null ? fileProducts : [...MockProductRepository.INITIAL_PRODUCTS];
      this.db.set(MockProductRepository.STORAGE_KEY, list);
    }
    return list;
  }

  public async getAllProducts(includeHidden: boolean = false): Promise<Product[]> {
    const products = this.getStore();
    if (includeHidden) {
      return products;
    }
    return products.filter((p) => !p.isHidden && p.status !== 'inactive');
  }

  public async getProductById(id: string): Promise<Product | null> {
    const products = this.getStore();
    return products.find((p) => p.id === id) || null;
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    const products = this.getStore();
    return products.find((p) => p.slug === slug) || null;
  }

  public async filterProducts(options: ProductFilterOptions): Promise<Product[]> {
    const products = this.getStore();

    let filtered = products.filter((product) => {
      // 0. Exclude hidden or inactive products for customer storefront
      if (!options.includeHidden && (product.isHidden === true || product.status === 'inactive')) {
        return false;
      }

      // 1. Category Matching (case-insensitive substring or exact)
      if (options.category && options.category !== 'All') {
        const catQuery = options.category.toLowerCase().trim();
        const prodCat = (product.category || '').toLowerCase();
        const prodSub = (product.subcategory || '').toLowerCase();

        // Specific category aliases
        if (catQuery === 'sale' || catQuery === 'offers') {
          return Boolean(product.offerPercentage && product.offerPercentage > 0);
        }

        const isMatch =
          prodCat === catQuery ||
          prodSub === catQuery ||
          prodCat.includes(catQuery) ||
          catQuery.includes(prodCat);

        if (!isMatch) return false;
      }

      // 2. Search Query (matches Title, Description, Brand, SKU)
      if (options.searchQuery && options.searchQuery.trim().length > 0) {
        const query = options.searchQuery.toLowerCase().trim();
        const titleMatch = product.title.toLowerCase().includes(query);
        const descMatch = product.description.toLowerCase().includes(query);
        const brandMatch = (product.brand || '').toLowerCase().includes(query);
        const skuMatch = product.variants.some((v) => v.sku.toLowerCase().includes(query));
        const catMatch = (product.category || '').toLowerCase().includes(query);

        if (!titleMatch && !descMatch && !brandMatch && !skuMatch && !catMatch) {
          return false;
        }
      }

      // 3. New Arrivals Filter
      if (options.isNewArrival && !product.isNewArrival) {
        return false;
      }

      // 4. On-Sale Only Filter
      if (options.onSaleOnly && (!product.offerPercentage || product.offerPercentage <= 0)) {
        return false;
      }

      // 5. Cash on Delivery (COD) Eligible Only Filter
      if (options.codOnly && !product.isCodAvailable) {
        return false;
      }

      // 6. Subcategory Filter
      if (options.subcategory && options.subcategory !== 'All') {
        if (product.subcategory?.toLowerCase() !== options.subcategory.toLowerCase()) {
          return false;
        }
      }

      // 7. Price Range Filter
      if (options.minPrice !== undefined && product.sellingPrice < options.minPrice) {
        return false;
      }
      if (options.maxPrice !== undefined && product.sellingPrice > options.maxPrice) {
        return false;
      }

      // 8. Size Filter
      if (options.size && options.size !== 'All') {
        const hasSize = product.variants.some((v) => v.size.toLowerCase() === options.size?.toLowerCase());
        if (!hasSize) return false;
      }

      return true;
    });

    // Sort order
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
          break;
        default:
          break;
      }
    }

    return filtered;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const products = this.getStore();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updates,
    };
    this.db.set(MockProductRepository.STORAGE_KEY, products);
    this.saveToFile(products);
    return products[index];
  }

  public async toggleStock(id: string, inStock: boolean): Promise<Product | null> {
    const products = this.getStore();
    const product = products.find((p) => p.id === id);
    if (!product) return null;

    product.variants = product.variants.map((v) => ({
      ...v,
      stock: inStock ? (v.stock > 0 ? v.stock : 25) : 0,
    }));

    this.db.set(MockProductRepository.STORAGE_KEY, products);
    this.saveToFile(products);
    return product;
  }

  public async createProduct(newProduct: Product): Promise<Product> {
    const products = this.getStore();
    products.unshift(newProduct);
    this.db.set(MockProductRepository.STORAGE_KEY, products);
    this.saveToFile(products);
    return newProduct;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const products = this.getStore();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length !== products.length) {
      this.db.set(MockProductRepository.STORAGE_KEY, filtered);
      this.saveToFile(filtered);
      return true;
    }
    return false;
  }

  /**
   * Validates and deducts stock for purchased cart items
   */
  public async deductStock(
    items: { product: { id: string; title: string }; selectedVariant?: { size: string }; quantity: number }[]
  ): Promise<{ success: boolean; message?: string }> {
    const products = this.getStore();

    for (const item of items) {
      const prod = products.find((p) => p.id === item.product.id);
      if (!prod) {
        return { success: false, message: `Product "${item.product.title}" is no longer available.` };
      }

      const reqSize = item.selectedVariant?.size;
      if (reqSize) {
        const variant = prod.variants.find((v) => v.size === reqSize);
        if (!variant || variant.stock < item.quantity) {
          const avail = variant?.stock ?? 0;
          return {
            success: false,
            message: `Only ${avail} unit(s) left in stock for "${prod.title}" (${reqSize}).`,
          };
        }
      } else {
        const totalStock = prod.variants.reduce((s, v) => s + v.stock, 0);
        if (totalStock < item.quantity) {
          return {
            success: false,
            message: `Insufficient stock for "${prod.title}". Only ${totalStock} available.`,
          };
        }
      }
    }

    for (const item of items) {
      const prod = products.find((p) => p.id === item.product.id);
      if (prod) {
        const reqSize = item.selectedVariant?.size;
        if (reqSize) {
          const variant = prod.variants.find((v) => v.size === reqSize);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
          }
        } else if (prod.variants.length > 0) {
          prod.variants[0].stock = Math.max(0, prod.variants[0].stock - item.quantity);
        }
      }
    }

    this.db.set(MockProductRepository.STORAGE_KEY, products);
    this.saveToFile(products);
    return { success: true };
  }

  /**
   * Restores stock when an order is cancelled
   */
  public async restoreStock(
    items: { product: { id: string }; selectedVariant?: { size: string }; quantity: number }[]
  ): Promise<void> {
    const products = this.getStore();
    for (const item of items) {
      const prod = products.find((p) => p.id === item.product.id);
      if (prod) {
        const reqSize = item.selectedVariant?.size;
        if (reqSize) {
          const variant = prod.variants.find((v) => v.size === reqSize);
          if (variant) {
            variant.stock += item.quantity;
          }
        } else if (prod.variants.length > 0) {
          prod.variants[0].stock += item.quantity;
        }
      }
    }
    this.db.set(MockProductRepository.STORAGE_KEY, products);
    this.saveToFile(products);
  }
}
