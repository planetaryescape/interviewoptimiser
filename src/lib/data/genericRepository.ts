import type { Entity, EntityList } from "../utils/formatEntity";

export interface GenericRepository<T> {
  getAll(): Promise<EntityList<T>>;
  getById(id: string): Promise<Entity<T> | null>;
  create(item: Omit<T, "id">): Promise<Entity<T>>;
  update(id: string, item: Partial<T>): Promise<Entity<T> | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
