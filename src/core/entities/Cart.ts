import { Product, ProductVariant } from './Product';

/**
 * SADP - Cart Item and Cart Entities
 */
export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface CartSummary {
  itemsCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  codFee: number;
  grandTotal: number;
  isEligibleForFreeShipping: boolean;
  freeShippingGap: number;
}
