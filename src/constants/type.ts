import { DICT_KEY } from "./dictionary";

// 操作类型
export const actionTypes: {
  [key: string]: "primary" | "success" | "warning" | "danger" | "info";
} = {
  create: "primary",
  modify: "primary",
  upload: "primary",
  read: "primary",
  readAll: "primary",
  addPrivilege: "primary",
  addMembers: "primary",
  addRoles: "primary",

  tree: "success",
  enable: "success",
  search: "success",
  retrieve: "success",
  fetch: "success",
  subset: "success",
  statistics: "success",
  download: "success",
  unlock: "success",
  relation: "success",
  authorize: "success",
  config: "success",
  field: "success",
  section: "success",
  publish: "success",
  privileges: "success",
  members: "success",
  roles: "success",

  import: "warning",
  export: "warning",
  execute: "warning",
  data: "warning",
  disable: "warning",
  archive: "warning",
  revoke: "warning",

  remove: "danger",
  removePrivilege: "danger",
  removeMembers: "danger",
  removeRoles: "danger",
  clear: "danger",

  signin: "info",
  signout: "info",
  sync: "info"
};

export const templateTypes: { [key: string]: "primary" | "success" } = {
  WORD: "primary",
  EXCEL: "success"
};

export const scopeTypes: { [key: string]: "primary" | "success" } = {
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

export const fieldTypes = [
  { label: "string", value: "string" },
  { label: "number", value: "number" },
  { label: "boolean", value: "boolean" },
  { label: "date", value: "date" },
  { label: "datetime", value: "datetime" }
];

export const scriptTypes: { [key: string]: "Server" | "Docker" } = {
  SERVER: "Server",
  DOCKER: "Docker"
};

export const osTypes = [
  { label: "Linux", value: "LINUX", dictionary: DICT_KEY.LINUX },
  { label: "Windows", value: "WINDOWS", dictionary: DICT_KEY.WINDOWS },
  { label: "MacOS", value: "MACOS", dictionary: DICT_KEY.MACOS }
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

export const fileTypes: {
  [key: string]: "success" | "warning" | "info" | "primary";
} = {
  image: "success",
  video: "warning",
  document: "primary",
  other: "info"
};
