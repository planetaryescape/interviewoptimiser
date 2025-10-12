export type EntityType =
  | "questions"
  | "empty"
  | "chat"
  | "candidateDetails"
  | "question-analysis"
  | "jobDescription"
  | "job-candidate"
  | "report"
  | "organization-member"
  | "statistics"
  | "sections-order"
  | "page-settings"
  | "changelog"
  | "invitation"
  | "cover-letter"
  | "generic"
  | "feature-request"
  | "review"
  | "user"
  | "cv"
  | "interview"
  | "error"
  | "customisation"
  | "subscription"
  | "countries"
  | "organization"
  | "job";

export type StatusType = "success" | "error";

export type Entity<T = unknown> = {
  status: StatusType;
  sys: {
    id?: number | string;
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

export const formatEntity = <T = unknown>(
  data: T,
  entity: EntityType,
  status: StatusType = "success"
): Entity<T> => {
  const dataObj = data as Record<string, unknown>;
  // Encode numeric IDs on the server side
  let encodedId: number | string | undefined = dataObj?.id as number | string | undefined;
  if (typeof window === "undefined" && dataObj?.id && typeof dataObj.id === "number") {
    // We're on the server and have a numeric ID - encode it
    try {
      const { idHandler } = require("./idHandler");
      encodedId = idHandler.encode(dataObj.id as number);
    } catch {
      // If encoding fails, keep the original ID
      encodedId = dataObj.id as number;
    }
  }

  return {
    status,
    sys: {
      id: encodedId,
      entity,
    },
    data,
  };
};

export const formatEntityList = <T = unknown>(
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
