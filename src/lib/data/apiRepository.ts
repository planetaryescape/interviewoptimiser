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
    try {
      return await this.fetchWithErrorHandling(`/api/${this.storeName}`);
    } catch (error) {
      console.error(`Error fetching all ${this.storeName}:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<Entity<T> | null> {
    try {
      return await this.fetchWithErrorHandling(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error fetching ${this.storeName} by id:`, error);
      throw error;
    }
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
      console.error(`Error deleting ${this.storeName}:`, error);
      return false;
    }
  }

  async count(): Promise<number> {
    try {
      const response = await this.fetchWithErrorHandling(`/api/public/${this.storeName}/count`);
      return response.count;
    } catch (error) {
      console.error(`Error counting ${this.storeName}:`, error);
      throw error;
    }
  }
}
