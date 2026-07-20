// 操作类型
export const actionTypes: {
  [key: string]:
    | "primary"
    | "secondary"
    | "positive"
    | "info"
    | "warning"
    | "negative";
} = {
  create: "primary",
  modify: "primary",
  upload: "primary",

  enable: "positive",
  search: "positive",
  retrieve: "positive",
  fetch: "positive",
  download: "positive",
  unlock: "positive",
  relation: "positive",
  authorize: "positive",
  config: "positive",
  field: "positive",
  section: "positive",

  import: "warning",
  export: "warning",
  execute: "warning",
  data: "warning",
  disable: "warning",

  remove: "negative",
  clear: "negative",

  signin: "info",
  signout: "info",
  sync: "info"
};

export const methodTypes: {
  [key: string]: "primary" | "positive" | "info" | "warning" | "negative";
} = {
  GET: "positive",
  POST: "warning",
  PUT: "primary",
  PATCH: "info",
  DELETE: "negative"
};

export const osTypes = [
  { label: "Linux", value: "LINUX", dictionary: 800 },
  { label: "Windows", value: "WINDOWS", dictionary: 900 },
  { label: "MacOS", value: "MACOS", dictionary: 1000 }
];

export const databaseType: { [key: string]: string } = {
  POSTGRESQL: "postgresql",
  MYSQL: "mysql"
};

export const sampleType: { [key: string]: "primary" | "positive" } = {
  SINGLE: "primary",
  COMBINE: "positive"
};

export const schemeScopeTypes = [
  { label: "All", value: "ALL" },
  { label: "Partial", value: "PARTIAL" }
];
