import type { Entity, EntityList } from "../utils/formatEntity";
import { secureFetch } from "../utils/secure-fetch";
import type { GenericRepository } from "./genericRepository";

export class ApiRepository<T extends { id?: number }> implements GenericRepository<T> {
  private baseUrl: string;

  constructor(private storeName: string) {
    this.baseUrl = `/api/${storeName}`;
  }

  private async fetchWithErrorHandling(url: string, options?: RequestInit): Promise<any> {
    const response = await secureFetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "An error occurred");
    }
    return response.json();
  }

  async getAll(): Promise<EntityList<T>> {
    return await this.fetchWithErrorHandling(`/api/${this.storeName}`);
  }

  async getById(id: string): Promise<Entity<T> | null> {
    return await this.fetchWithErrorHandling(`${this.baseUrl}/${id}`);
  }

  async create(item: Omit<T, "id">): Promise<Entity<T>> {
    return this.fetchWithErrorHandling(`${this.baseUrl}`, {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async update(id: string, item: Partial<T>): Promise<Entity<T> | null> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.fetchWithErrorHandling(`/api/${this.storeName}/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.fetchWithErrorHandling(`/api/public/${this.storeName}/count`);
    return response.count;
  }
}
