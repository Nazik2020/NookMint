import { IOrderRepository } from './IOrderRepository';
import { Order } from '@/core/entities/Order';
import { DatabaseClient } from '../database/DatabaseClient';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@/shared/types/common';

/**
 * SADP - Mock Order Repository
 * Persists orders into the central DatabaseClient singleton for demo and local execution.
 * Pre-populates realistic Sri Lankan boutique demo orders for the Customer Dashboard.
 */
export class MockOrderRepository implements IOrderRepository {
  private static readonly STORAGE_KEY = 'orders_store';
  private db: DatabaseClient;

  constructor() {
    this.db = DatabaseClient.getInstance();
    if (!this.db.has(MockOrderRepository.STORAGE_KEY)) {
      const initialMap = new Map<string, Order>();
      
      // Seed Demo Order 1: Delivered COD Order
      const seedOrder1: Order = {
        id: 'ord_demo_01',
        orderNumber: 'NM-2026-4821',
        items: [
          {
            product: {
              id: 'garden-01',
              title: 'Heavy-Duty Garden Hand Trowel & Cultivator Fork Set',
              slug: 'heavy-duty-garden-hand-trowel-cultivator-set',
              description: 'Premium rust-resistant stainless steel gardening hand tools with ergonomic soft-grip handles.',
              category: 'Home & Garden' as any,
              unit: 'set',
              mrp: 3500,
              sellingPrice: 2850,
              images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80'],
              variants: [{ size: '2-Piece Set', sku: 'GDN-TOOL-2PC', stock: 25 }],
              rating: 4.9,
              reviewCount: 38,
              isCodAvailable: true,
              isNewArrival: true,
            },
            quantity: 1,
            selectedSize: '2-Piece Set',
          },
        ],
        shippingAddress: {
          fullName: 'Dilani Perera',
          phone: '0771234567',
          alternatePhone: '0712345678',
          addressLine1: 'No. 28, Flower Road',
          addressLine2: 'Apt 4B, Green Court',
          city: 'Colombo 07',
          district: 'Colombo',
          state: 'Western Province',
          pincode: '00700',
        },
        paymentMethod: PaymentMethod.COD,
        paymentStatus: PaymentStatus.COD_COLLECTED,
        status: OrderStatus.DELIVERED,
        subtotal: 2850,
        discount: 0,
        shippingFee: 350,
        codFee: 0,
        grandTotal: 3200,
        isCodVerified: true,
        verificationNotes: 'Delivered by Prompt Xpress. Cash collected Rs. 3,200.',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        estimatedDeliveryDate: new Date(Date.now() - 2 * 86400000).toDateString(),
      };

      // Seed Demo Order 2: Ready for iSales Dropship Entry
      const seedOrder2: Order = {
        id: 'ord_demo_02',
        orderNumber: 'NM-2026-7294',
        items: [
          {
            product: {
              id: 'gadget-01',
              title: 'Pro Sound True Wireless Earbuds with ANC (Earpods)',
              slug: 'pro-sound-tws-wireless-earbuds-anc',
              description: 'Crystal-clear true wireless earbuds with Active Noise Cancellation.',
              category: 'Smart Gadgets & Audio' as any,
              unit: 'item',
              mrp: 6500,
              sellingPrice: 4950,
              images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'],
              variants: [{ size: 'Matte White', sku: 'EAR-ANC-WHT', stock: 40 }],
              rating: 4.9,
              reviewCount: 72,
              isCodAvailable: true,
              isNewArrival: true,
            },
            quantity: 1,
            selectedSize: 'Matte White',
          },
        ],
        shippingAddress: {
          fullName: 'Kavindu Senanayake',
          phone: '0719876543',
          alternatePhone: '0778899001',
          addressLine1: 'No. 15/A, Kandy Road',
          city: 'Kandy',
          district: 'Kandy',
          state: 'Central Province',
          pincode: '20000',
          landmark: 'Near clock tower',
        },
        paymentMethod: PaymentMethod.COD,
        paymentStatus: PaymentStatus.COD_PENDING,
        status: OrderStatus.PENDING_CONFIRMATION,
        subtotal: 4950,
        discount: 0,
        shippingFee: 450,
        codFee: 0,
        grandTotal: 5400,
        isCodVerified: true,
        verificationNotes: 'Ready for A to Z Traders (iSales) dropship order submission.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toDateString(),
      };

      initialMap.set(seedOrder1.id, seedOrder1);
      initialMap.set(seedOrder2.id, seedOrder2);

      this.db.set(MockOrderRepository.STORAGE_KEY, initialMap);
    }
  }

  private getStore(): Map<string, Order> {
    return this.db.get<Map<string, Order>>(MockOrderRepository.STORAGE_KEY)!;
  }

  public async save(order: Order): Promise<Order> {
    const store = this.getStore();
    store.set(order.id, order);
    return order;
  }

  public async update(order: Order): Promise<Order> {
    const store = this.getStore();
    store.set(order.id, order);
    return order;
  }

  public async findById(orderId: string): Promise<Order | null> {
    const store = this.getStore();
    return store.get(orderId) || null;
  }

  public async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const store = this.getStore();
    const cleanQuery = orderNumber.trim().toUpperCase().replace('#', '');
    for (const order of store.values()) {
      if (order.orderNumber.toUpperCase() === cleanQuery || order.id.toUpperCase() === cleanQuery) {
        return order;
      }
    }
    return null;
  }

  public async findByPhone(phone: string): Promise<Order[]> {
    const store = this.getStore();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const results: Order[] = [];
    for (const order of store.values()) {
      const orderPhone = order.shippingAddress.phone.replace(/[^0-9]/g, '');
      if (orderPhone.endsWith(cleanPhone) || cleanPhone.endsWith(orderPhone)) {
        results.push(order);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async findAll(): Promise<Order[]> {
    const store = this.getStore();
    return Array.from(store.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
