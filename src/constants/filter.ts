// 查询匹配方式
export const queryTypes: { [key: string]: string } = {
  "=": "eq",
  "<>": "neq",
  ">": "gt",
  ">=": "egt",
  "<": "lt",
  "<=": "elt",
  LIKE: "like",
  IN: "in",
  "NOT IN": "notIn",
  BETWEEN: "between",
  "NOT BETWEEN": "notBetween",
  "IS NULL": "isNull",
  "IS NOT NULL": "isNotNull"
};
