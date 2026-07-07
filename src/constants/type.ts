// 操作类型
export const actionTypes: {
  [key: string]: "primary" | "success" | "warning" | "danger" | "info";
} = {
  create: "primary",
  modify: "primary",
  upload: "primary",

  enable: "success",
  search: "success",
  retrieve: "success",
  fetch: "success",
  download: "success",
  unlock: "success",
  relation: "success",
  authorize: "success",
  config: "success",
  field: "success",
  section: "success",

  import: "warning",
  export: "warning",
  execute: "warning",
  data: "warning",
  disable: "warning",

  remove: "danger",
  clear: "danger",

  signin: "info",
  signout: "info",
  sync: "info"
};

export const templateTypes: { [key: string]: "primary" | "success" } = {
  WORD: "primary",
  EXCEL: "success"
};

export const schemeScopeTypes: { [key: string]: "primary" | "success" } = {
  ALL: "success",
  PARTIAL: "primary"
};

export const sectionTypes: {
  [key: string]: "primary" | "success" | "info" | "warning";
} = {
  HEADING: "primary",
  PARAGRAPH: "success",
  TABLE: "info",
  IMAGE: "warning"
};

export const fieldTypes: { [key: string]: string } = {
  STRING: "String",
  NUMBER: "Number",
  BOOLEAN: "Boolean",
  DATE: "Date",
  DATETIME: "Datetime"
};

export const scriptTypes: { [key: string]: "Server" | "Docker" } = {
  SERVER: "Server",
  DOCKER: "Docker"
};

export const osTypes = [
  { label: "Linux", value: "LINUX", dictionary: 800 },
  { label: "Windows", value: "WINDOWS", dictionary: 900 },
  { label: "MacOS", value: "MACOS", dictionary: 1000 }
];

export const databaseType: { [key: string]: string } = {
  POSTGRESQL: "PostgreSQL",
  MYSQL: "MySQL"
};

export const sampleTypes: { [key: string]: "primary" | "success" } = {
  SINGLE: "primary",
  COMBINE: "success"
};

export const httpTypes: {
  [key: string]: "success" | "warning" | "info" | "primary" | "danger";
} = {
  GET: "success",
  POST: "warning",
  PUT: "primary",
  PATCH: "info",
  DELETE: "danger"
};
