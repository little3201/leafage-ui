export const shceduleStatus: {
  [key: string]: "primary" | "success" | "info" | "warning" | "danger";
} = {
  PENDING: "info",
  RUNNING: "primary",
  SUCCEED: "success",
  FAILED: "danger",
  CANCELED: "warning"
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
