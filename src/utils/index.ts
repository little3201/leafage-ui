export * from "./action";
export * from "./file";
export * from "./pkce";
export * from "./request";
export * from "./format";

export function visibleArray<T>(array: T[], count: number): T[] {
  if (array && array.length) {
    return array.length > count ? array.slice(0, count) : array;
  }
  return [];
}

/**
 * 数据分组
 * @param array 分组数据
 * @param typeKey 分组依据
 * @returns 分组后的数据
 */
export function groupByKey<T>(
  array: T[],
  typeKey: keyof T
): { [key: string]: T[] } {
  return array.reduce(
    (acc: { [key: string]: T[] }, curr: T) => {
      const typeValue = curr[typeKey] as string | number; // 允许 `string` 或 `number` 类型
      if (!typeValue) {
        return acc;
      }
      const groupKey = String(typeValue); // 确保转换为字符串，以便作为对象键

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(curr);

      return acc;
    },
    {} as { [key: string]: T[] }
  );
}
