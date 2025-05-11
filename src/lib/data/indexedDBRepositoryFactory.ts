import type { GenericRepository } from "./genericRepository";
import { IndexedDBRepository } from "./indexedDBRepository";

export async function createIndexedDBRepository<T extends { id?: number }>(
  storeName: string
): Promise<GenericRepository<T>> {
  const repository = new IndexedDBRepository<T>(storeName);
  await repository.initDB();
  return repository;
}
