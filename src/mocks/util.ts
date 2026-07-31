/**
 * 解析 DSL 字符串为数组，方便 Mock 或测试使用
 * "name:eq:Tom;age:gt:18" => [{ field: 'name', op: 'eq', value: 'Tom' }, ...]
 */
export function parseFilterString(
  dsl?: string
): Array<{ field: string; op: string; value: string }> {
  if (!dsl) return [];

  return dsl.split(";").map(item => {
    const [field, op, ...rest] = item.split(":");
    if (!field || !op) {
      throw new Error(`Invalid filter DSL: ${item}`);
    }
    return {
      field,
      op,
      value: decodeURIComponent(rest.join(":"))
    };
  });
}

/**
 * 在 Mock 数据中应用过滤
 */
export function applyFilters<T>(datas: T[], filtersDsl?: string | null): T[] {
  if (!filtersDsl) {
    return datas;
  }

  const filters = parseFilterString(filtersDsl);
  if (filters.length === 0) {
    return datas;
  }

  return datas.filter(item => {
    return filters.every(f => {
      const fieldValue = item[f.field as keyof T];

      let cmpValue: string | number | boolean;

      if (fieldValue instanceof Date) {
        cmpValue = fieldValue.toISOString();
      } else if (
        typeof fieldValue === "string" ||
        typeof fieldValue === "number" ||
        typeof fieldValue === "boolean"
      ) {
        cmpValue = fieldValue;
      } else if (fieldValue == null) {
        cmpValue = "";
      } else {
        return true;
      }

      // 根据字段实际类型转换过滤值
      const val = convertFilterValue(f.value, fieldValue);

      switch (f.op) {
        case "eq":
          return cmpValue === val;

        case "neq":
          return cmpValue !== val;

        case "like":
        case "ilike":
          if (typeof cmpValue !== "string") {
            return false;
          }
          return cmpValue.toLowerCase().includes(String(val).toLowerCase());

        case "gt":
          return Number(cmpValue) > Number(val);

        case "gte":
          return Number(cmpValue) >= Number(val);

        case "lt":
          return Number(cmpValue) < Number(val);

        case "lte":
          return Number(cmpValue) <= Number(val);

        case "in":
          return f.value.split(",").includes(String(cmpValue));

        case "notIn":
          return !f.value.split(",").includes(String(cmpValue));

        case "between": {
          const [start, end] = f.value.split(",");
          return (
            Number(cmpValue) >= Number(start) && Number(cmpValue) <= Number(end)
          );
        }

        case "notBetween": {
          const [start, end] = f.value.split(",");
          return (
            Number(cmpValue) < Number(start) || Number(cmpValue) > Number(end)
          );
        }

        case "null":
          return fieldValue == null;

        case "nonnull":
          return fieldValue != null;

        default:
          return true;
      }
    });
  });
}

function convertFilterValue(
  value: string,
  fieldValue: unknown
): string | number | boolean {
  if (typeof fieldValue === "boolean") {
    return value === "true";
  }

  if (typeof fieldValue === "number") {
    return Number(value);
  }

  return value;
}

export function randomInt(max: number): number {
  if (max <= 0) {
    throw new Error("max must be greater than 0");
  }

  const array = new Uint32Array(1);
  crypto.getRandomValues(array);

  return (array[0] ?? 0) % max;
}
