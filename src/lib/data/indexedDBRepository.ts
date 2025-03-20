import { config } from "../../../config";
import {
  type Entity,
  type EntityList,
  formatEntity,
  formatEntityList,
} from "../utils/formatEntity";
import type { GenericRepository } from "./genericRepository";

export class IndexedDBRepository<T extends { id?: number }> implements GenericRepository<T> {
  private readonly dbName = `${config.projectName}-db`;
  private db: IDBDatabase | null = null;

  constructor(private readonly storeName: string) {
    this.storeName = storeName;
  }

  private async getLatestVersion(): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = () => {
        const version = request.result.version;
        request.result.close();
        resolve(version);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    const latestVersion = await this.getLatestVersion();

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, latestVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStore(db);
      };
    });
  }

  private createObjectStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      db.createObjectStore(this.storeName, {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  }

  private async ensureObjectStore(): Promise<void> {
    const db = await this.openDB();
    if (!db.objectStoreNames.contains(this.storeName)) {
      const version = db.version + 1;
      db.close();
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, version);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          this.createObjectStore(db);
        };
      });
    }
  }

  private async performTransaction<R>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<R>
  ): Promise<R> {
    await this.ensureObjectStore();
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, mode);
      const store = transaction.objectStore(this.storeName);
      const request = operation(store);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll(): Promise<EntityList<T>> {
    const items = await this.performTransaction("readonly", (store) => store.getAll());
    return formatEntityList(items, this.storeName as any);
  }

  async getById(id: string): Promise<Entity<T> | null> {
    const item = await this.performTransaction("readonly", (store) => store.get(id));
    return item ? formatEntity(item, this.storeName as any) : null;
  }

  async create(item: Omit<T, "id">): Promise<Entity<T>> {
    const newItem = {
      ...item,
      id: Date.now(),
    } as T;
    await this.performTransaction("readwrite", (store) => store.add(newItem));
    return formatEntity(newItem, this.storeName as any);
  }

  async update(id: string, updatedItem: Partial<T>): Promise<Entity<T> | null> {
    const existingItem = await this.getById(id);
    if (!existingItem) return null;

    const updatedFullItem = { ...existingItem.data, ...updatedItem } as T;
    await this.performTransaction("readwrite", (store) => store.put(updatedFullItem));
    return formatEntity(updatedFullItem, this.storeName as any);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.performTransaction("readwrite", (store) => store.delete(id));
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${this.storeName}:`, error);
      return false;
    }
  }

  async initDB(): Promise<void> {
    await this.ensureObjectStore();
  }

  async count(): Promise<number> {
    return this.performTransaction("readonly", (store) => store.count());
  }
}
