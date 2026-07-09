export const shceduleStatus: {
  [key: string]: "primary" | "positive" | "info" | "warning" | "negative";
} = {
  PENDING: "info",
  RUNNING: "primary",
  SUCCESS: "positive",
  FAILED: "negative",
  CANCELED: "warning"
};

export const userStatus: {
  [key: string]: "primary" | "positive" | "info" | "warning" | "negative";
} = {
  ACTIVE: "positive",
  LOCKED: "primary",
  EXPIRED: "info",
  CREDENTIALS_EXPIRED: "warning",
  DISABLED: "negative"
};

export const schemaStatus: { [key: string]: "primary" | "positive" | "info" } =
  {
    DRAFT: "primary",
    PUBLISHED: "positive",
    ARCHIVED: "info"
  };
