import fs from 'fs';
import path from 'path';
import { IOrderRepository } from './IOrderRepository';
import { Order } from '@/core/entities/Order';
import { DatabaseClient } from '../database/DatabaseClient';
import { getServiceSupabase } from '../database/supabaseClient';

/**
 * Order Repository (SADP Repository Pattern)
 * Clean, production-ready order store for NookMint.
 * Supports synchronized cloud persistence via Supabase Storage ('store/orders.json')
 * and local file cache (data/orders.json) so all Vercel serverless instances,
 * admin sessions, and customer storefronts share live orders in real time.
 */
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
    try {
      const supabase = getServiceSupabase();
      const { data, error } = await supabase.storage.from('products').download('store/orders.json');
      if (data && !error) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          const map = new Map<string, Order>();
          for (const order of parsed) {
            if (order && order.id) {
              map.set(order.id, order);
            }
          }
          this.db.set(MockOrderRepository.STORAGE_KEY, map);
          this.saveToFile(parsed);
          return parsed;
        }
      }
    } catch {
      // Fallback to local store
    }
    return Array.from(this.getStore().values());
  }

  private async saveToCloud(orders: Order[]): Promise<void> {
    try {
      const supabase = getServiceSupabase();
      const buffer = Buffer.from(JSON.stringify(orders, null, 2), 'utf-8');
      await supabase.storage.from('products').upload('store/orders.json', buffer, {
        upsert: true,
        contentType: 'application/json',
      });
    } catch (err) {
      console.warn('[MockOrderRepository] Cloud save warning:', err);
    }
  }

  private getStore(): Map<string, Order> {
    const fileOrders = this.loadFromFile();
    if (fileOrders !== null && Array.isArray(fileOrders)) {
      const store = new Map<string, Order>();
      for (const order of fileOrders) {
        if (order && order.id) {
          store.set(order.id, order);
        }
      }
      this.db.set(MockOrderRepository.STORAGE_KEY, store);
      return store;
    }
    let store = this.db.get<Map<string, Order>>(MockOrderRepository.STORAGE_KEY);
    if (!store) {
      store = new Map<string, Order>();
      this.db.set(MockOrderRepository.STORAGE_KEY, store);
    }
    return store;
  }

  public async save(order: Order): Promise<Order> {
    await this.syncWithCloud();
    const store = this.getStore();
    store.set(order.id, order);
    const all = Array.from(store.values());
    this.saveToFile(all);
    await this.saveToCloud(all);
    return order;
  }

  public async update(order: Order): Promise<Order> {
    await this.syncWithCloud();
    const store = this.getStore();
    store.set(order.id, order);
    const all = Array.from(store.values());
    this.saveToFile(all);
    await this.saveToCloud(all);
    return order;
  }

  public async findById(orderId: string): Promise<Order | null> {
    await this.syncWithCloud();
    const store = this.getStore();
    return store.get(orderId) || null;
  }

  public async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    await this.syncWithCloud();
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
    await this.syncWithCloud();
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
    await this.syncWithCloud();
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
