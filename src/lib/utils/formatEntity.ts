export type EntityType =
  | "empty"
  | "sections-order"
  | "page-settings"
  | "changelog"
  | "cover-letter"
  | "generic"
  | "feature-request"
  | "user"
  | "cv"
  | "optimization"
  | "error"
  | "customisation"
  | "subscription"
  | "countries";

export type StatusType = "success" | "error";

export type Entity<T = unknown> = {
  status: StatusType;
  sys: {
    id?: number;
    entity: EntityType;
    createdAt?: string;
    updatedAt?: string;
  };
  data: T;
};

export type EmptyEntity = {
  status: "success";
  sys: {
    entity: "empty";
  };
};

export type ErrorEntity = {
  status: "error";
  sys: {
    entity: "error";
  };
  error: unknown;
};

export type JournalerResponse<T> = Entity<T> | ErrorEntity;
export type JournalerListResponse<T> = EntityList<T> | ErrorEntity;

export type EntityList<T = unknown> = {
  status: StatusType;
  sys: {
    entity: "list";
    createdAt?: string;
    updatedAt?: string;
  };
  data: Omit<Entity<T>, "success">[];
};

export const formatEntity = <
  T extends { id?: number; [key: string]: any } | undefined
>(
  data: T,
  entity: EntityType,
  status: StatusType = "success"
): Entity<T> => {
  return {
    status,
    sys: {
      id: data?.id,
      entity,
    },
    data,
  };
};

export const formatEntityList = <T extends { id?: number; [key: string]: any }>(
  data: T[],
  entity: EntityType,
  status: StatusType = "success"
): EntityList<T> => {
  return {
    status,
    sys: {
      entity: "list",
    },
    data: data.map((d) => formatEntity(d, entity)),
  };
};

export const formatErrorEntity = <T = unknown>(error: T): ErrorEntity => {
  return {
    status: "error",
    sys: {
      entity: "error",
    },
    error,
  };
};

export const formatEmptyEntity = (): EmptyEntity => {
  return {
    status: "success",
    sys: {
      entity: "empty",
    },
  };
};
