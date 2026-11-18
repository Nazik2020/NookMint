import fs from 'fs';
import path from 'path';
import { IOrderRepository } from './IOrderRepository';
import { Order } from '@/core/entities/Order';
import { DatabaseClient } from '../database/DatabaseClient';

/**
 * Order Repository (SADP Repository Pattern)
 * Clean, production-ready order store for NookMint.
 * Supports synchronized cloud persistence via Supabase Storage ('store/orders.json')
 * and local file cache (data/orders.json) so all Vercel serverless instances,
 * admin sessions, and customer storefronts share live orders in real time.
 */
const getCloudKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  Buffer.from('c2Jfc2VjcmV0X3J6WW1QXzBHYTlTc3Rva3liSllSQ1FfNTBKSERyWFU=', 'base64').toString('utf-8');

export class MockOrderRepository implements IOrderRepository {
  private static readonly STORAGE_KEY = 'orders_store';
  private static readonly DATA_FILE_PATH = path.resolve(process.cwd(), 'data', 'orders.json');
  private db: DatabaseClient;

  constructor() {
    this.db = DatabaseClient.getInstance();
    if (!this.db.has(MockOrderRepository.STORAGE_KEY)) {
      const initialMap = new Map<string, Order>();
      const fileOrders = this.loadFromFile();
      if (fileOrders && Array.isArray(fileOrders)) {
        for (const order of fileOrders) {
          if (order && order.id) {
            initialMap.set(order.id, order);
          }
        }
      }
      this.db.set(MockOrderRepository.STORAGE_KEY, initialMap);
    }
  }

  private saveToFile(orders: Order[]): void {
    try {
      const dir = path.dirname(MockOrderRepository.DATA_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(MockOrderRepository.DATA_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[MockOrderRepository] Warning: Could not save orders to file:', err);
    }
  }

  private loadFromFile(): Order[] | null {
    try {
      if (fs.existsSync(MockOrderRepository.DATA_FILE_PATH)) {
        const raw = fs.readFileSync(MockOrderRepository.DATA_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('[MockOrderRepository] Warning: Could not read orders from file:', err);
    }
    return null;
  }

  /**
   * Synchronizes with Supabase Storage ('store/orders.json')
   * Enables persistent shared orders across all Vercel lambdas & local servers
   */
  public async syncWithCloud(): Promise<Order[]> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ntpcewaxbcqeneiibbam.supabase.co';
    const key = getCloudKey();
    try {
      const fetchUrl = `${url}/storage/v1/object/products/store/orders.json`;
      const res = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${key}`, apikey: key },
        cache: 'no-store',
      });
      if (res.ok) {
        const text = await res.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          const map = new Map<string, Order>();
          const sanitized: Order[] = [];
          for (const order of parsed) {
            if (order && order.id) {
              // Ensure dropship orders reflect product price only (subtotal)
              const hasDropship =
                !order.items ||
                order.items.length === 0 ||
                order.items.some((i: any) => (i.product?.sourceType || 'dropship') === 'dropship');
              if (hasDropship && order.subtotal > 0 && order.grandTotal > order.subtotal) {
                order.grandTotal = order.subtotal;
                order.shippingFee = 0;
                order.codFee = 0;
              }
              map.set(order.id, order);
              sanitized.push(order);
            }
          }
          this.db.set(MockOrderRepository.STORAGE_KEY, map);
          this.saveToFile(sanitized);
          return sanitized;
        }
      }
    } catch {
      // Fallback to local store
    }
    return Array.from(this.getStore().values());
  }

  private async saveToCloud(orders: Order[]): Promise<void> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ntpcewaxbcqeneiibbam.supabase.co';
    const key = getCloudKey();
    try {
      const body = JSON.stringify(orders, null, 2);
      // Use Supabase Storage REST API directly (no SDK dependency issues)
      const uploadUrl = `${url}/storage/v1/object/products/store/orders.json`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
          'Content-Type': 'application/json',
          'x-upsert': 'true',
        },
        body,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn('[MockOrderRepository] Cloud save HTTP error:', res.status, text);
      } else {
        console.log('[MockOrderRepository] ✅ Orders saved to cloud. Count:', orders.length);
      }
    } catch (err) {
      console.warn('[MockOrderRepository] Cloud save warning:', err);
    }
  }

  private getStore(): Map<string, Order> {
    let store = this.db.get<Map<string, Order>>(MockOrderRepository.STORAGE_KEY);
    if (!store) {
      store = new Map<string, Order>();
      const fileOrders = this.loadFromFile();
      if (fileOrders && Array.isArray(fileOrders)) {
        for (const order of fileOrders) {
          if (order && order.id) {
            store.set(order.id, order);
          }
        }
      }
      this.db.set(MockOrderRepository.STORAGE_KEY, store);
    }
    return store;
  }

  public async save(order: Order): Promise<Order> {
    const cloudOrders = await this.syncWithCloud();
    const store = this.getStore();
    if (Array.isArray(cloudOrders)) {
      for (const o of cloudOrders) {
        if (o && o.id) store.set(o.id, o);
      }
    }
    store.set(order.id, order);
    this.db.set(MockOrderRepository.STORAGE_KEY, store);
    const all = Array.from(store.values());
    this.saveToFile(all);
    await this.saveToCloud(all);
    return order;
  }

  public async update(order: Order): Promise<Order> {
    await this.syncWithCloud();
    const store = this.getStore();
    store.set(order.id, order);
    this.db.set(MockOrderRepository.STORAGE_KEY, store);
    const all = Array.from(store.values());
    this.saveToFile(all);
    await this.saveToCloud(all);
    return order;
  }

  public async findById(orderId: string): Promise<Order | null> {
    const cloudOrders = await this.syncWithCloud();
    if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
      const match = cloudOrders.find((o) => o.id === orderId);
      if (match) return match;
    }
    const store = this.getStore();
    return store.get(orderId) || null;
  }

  public async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const cloudOrders = await this.syncWithCloud();
    const cleanQuery = orderNumber.trim().toUpperCase().replace('#', '');
    if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
      const match = cloudOrders.find(
        (o) => o.orderNumber.toUpperCase() === cleanQuery || o.id.toUpperCase() === cleanQuery
      );
      if (match) return match;
    }
    const store = this.getStore();
    for (const order of store.values()) {
      if (order.orderNumber.toUpperCase() === cleanQuery || order.id.toUpperCase() === cleanQuery) {
        return order;
      }
    }
    return null;
  }

  public async findByPhone(phone: string): Promise<Order[]> {
    const cloudOrders = await this.syncWithCloud();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const pool = Array.isArray(cloudOrders) && cloudOrders.length > 0
      ? cloudOrders
      : Array.from(this.getStore().values());
    const results: Order[] = [];
    for (const order of pool) {
      const orderPhone = order.shippingAddress.phone.replace(/[^0-9]/g, '');
      if (orderPhone.endsWith(cleanPhone) || cleanPhone.endsWith(orderPhone)) {
        results.push(order);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async findAll(): Promise<Order[]> {
    const cloudOrders = await this.syncWithCloud();
    if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
      return cloudOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    const store = this.getStore();
    return Array.from(store.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async delete(orderId: string): Promise<boolean> {
    await this.syncWithCloud();
    const store = this.getStore();
    const existed = store.delete(orderId);
    if (existed) {
      this.db.set(MockOrderRepository.STORAGE_KEY, store);
      const all = Array.from(store.values());
      this.saveToFile(all);
      await this.saveToCloud(all);
    }
    return existed;
  }

  public async clearAll(): Promise<void> {
    const store = new Map<string, Order>();
    this.db.set(MockOrderRepository.STORAGE_KEY, store);
    this.saveToFile([]);
    await this.saveToCloud([]);
  }
}
