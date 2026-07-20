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

export const schemaStatus: { [key: string]: "primary" | "success" | "info" } = {
  DRAFT: "primary",
  PUBLISHED: "success",
  ARCHIVED: "info"
};

export const messageStatus: {
  [key: string]: "primary" | "success" | "warning";
} = {
  DRAFT: "primary",
  PUBLISHED: "success",
  REVOKED: "warning"
};
