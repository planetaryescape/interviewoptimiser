import { ApiRepository } from "./apiRepository";
import { GenericRepository } from "./genericRepository";
import { createIndexedDBRepository } from "./indexedDBRepositoryFactory";
import { LocalStorageRepository } from "./localStorageRepository";

export async function getRepository<T extends { id?: number }>(
  storeName: string,
  useApi: boolean = true
): Promise<GenericRepository<T>> {
  if (useApi) {
    return new ApiRepository<T>(storeName);
  } else if (typeof window !== "undefined" && window.indexedDB) {
    return await createIndexedDBRepository<T>(storeName);
  } else {
    console.warn("IndexedDB is not supported. Falling back to LocalStorage.");
    return new LocalStorageRepository<T>(storeName);
  }
}
