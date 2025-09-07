import {
  type Entity,
  type EntityList,
  formatEntity,
  formatEntityList,
} from "../utils/formatEntity";
import type { GenericRepository } from "./genericRepository";

export class LocalStorageRepository<T extends { id?: number }> implements GenericRepository<T> {
  constructor(private readonly storageKey: string) {}

  private getItems(): T[] {
    const items = localStorage.getItem(this.storageKey);
    return items ? JSON.parse(items) : [];
  }

  private setItems(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  async getAll(): Promise<EntityList<T>> {
    const items = this.getItems();
    return formatEntityList(items, this.storageKey as any);
  }

  async getById(id: string): Promise<Entity<T> | null> {
    const items = this.getItems();
    // For localStorage, we use simple string IDs without encoding
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return null;
    }
    const item = items.find((item) => item.id === numericId);
    return item ? formatEntity(item, this.storageKey as any) : null;
  }

  async create(item: Omit<T, "id">): Promise<Entity<T>> {
    const items = this.getItems();
    const newItem = {
      ...item,
      id: Date.now(),
    } as T;
    items.push(newItem);
    this.setItems(items);
    return formatEntity(newItem, this.storageKey as any);
  }

  async update(id: string, updatedItem: Partial<T>): Promise<Entity<T> | null> {
    const items = this.getItems();
    // For localStorage, we use simple string IDs without encoding
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return null;
    }
    const index = items.findIndex((item) => item.id === numericId);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updatedItem };
    this.setItems(items);
    return formatEntity(items[index], this.storageKey as any);
  }

  async delete(id: string): Promise<boolean> {
    const items = this.getItems();
    // For localStorage, we use simple string IDs without encoding
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return false;
    }
    const filteredItems = items.filter((item) => item.id !== numericId);
    if (filteredItems.length === items.length) return false;

    this.setItems(filteredItems);
    return true;
  }

  async count(): Promise<number> {
    const items = this.getItems();
    return items.length;
  }
}
