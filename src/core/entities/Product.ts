import { AgeGroup, ClothingCategory, Gender } from '@/shared/types/common';

/**
 * SADP - Product Entity
 * Multi-Category E-Commerce & Online Ordering Platform (Innovative Consultants)
 * Supports Groceries, Household items, Clothing, and future categories (e.g. EVs).
 * Fully configurable attributes and multi-variant specifications.
 */
export interface ProductVariant {
  size: string; // Generic variant descriptor e.g. "1 kg", "500g", "2 Litres", "M", "XL", "Standard"
  sku: string;
  stock: number;
  price?: number; // Optional variant specific price
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ClothingCategory | string;
  subcategory?: string;
  brand?: string;
  unit?: string; // e.g. "kg", "g", "L", "item", "pack"
  mrp: number; // Maximum Retail Price / Previous Price in LKR
  sellingPrice: number; // Selling Price in LKR
  images: string[];
  videoUrl?: string; // Optional direct MP4 or video URL
  variants: ProductVariant[];
  colors?: ProductColor[];
  rating: number;
  reviewCount: number;
  isCodAvailable: boolean; // Flag to indicate COD eligibility
  status?: 'active' | 'inactive';
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  offerPercentage?: number; // Discount percentage
  inquiryOnly?: boolean; // For EVs and high-value quotation workflow

  // Inventory & Sourcing Model
  sourceType?: 'dropship' | 'own'; // 'dropship' = A to Z Traders iSales, 'own' = Merchant In-House Inventory
  sku?: string;
  costPrice?: number;

  // Dynamic Category-Specific Attributes (e.g. expiry, storage, material, battery, range)
  attributes?: Record<string, string>;
  specifications?: ProductSpecification[];

  // Apparel & Legacy compatibility fields
  ageGroup?: AgeGroup;
  gender?: Gender;
  fabric?: string;
  washCare?: string;
  sizeChartType?: 'baby' | 'toddler' | 'junior' | 'custom' | 'none';
  sizeChartImage?: string;
  sizeNotes?: string;
  deliveryFeeType?: 'default' | 'free' | 'custom';
  customDeliveryFee?: number;
}
