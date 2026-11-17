import fs from 'fs';
import path from 'path';
import { IOrderRepository } from './IOrderRepository';
import { Order } from '@/core/entities/Order';
import { DatabaseClient } from '../database/DatabaseClient';

/**
 * Order Repository (SADP Repository Pattern)
 * Clean, production-ready order store for NookMint.
 * Supports persistent file storage via data/orders.json and memory cache.
 * Started with a clean slate: 0 demo orders so only real customer orders are tracked.
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
    const store = this.getStore();
    store.set(order.id, order);
    this.saveToFile(Array.from(store.values()));
    return order;
  }

  public async update(order: Order): Promise<Order> {
    const store = this.getStore();
    store.set(order.id, order);
    this.saveToFile(Array.from(store.values()));
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
