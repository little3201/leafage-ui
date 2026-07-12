/**
 * Format a duration given in milliseconds into a human-readable string
 * @param {number} milliseconds - The duration in milliseconds
 * @returns {string} - The formatted duration
 */
export function formatDuration(ms: number): string {
  if (ms === 0) return "0ms";

  const sign = ms < 0 ? "-" : "";
  const abs = Math.abs(ms);

  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const s = (abs % 60000) / 1000;
  const msPart = abs % 1000;

  const parts: string[] = [];

  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}min`);

  // 只有当秒 >= 1 时才显示秒
  if (s >= 1) {
    let secStr: string;
    if (s >= 10) {
      secStr = s.toFixed(1).replace(/\.0$/, "");
    } else {
      secStr = s.toFixed(2).replace(/\.?0+$/, "");
    }
    parts.push(`${secStr}s`);
  }
  // 小于 1 秒且前面没有更高单位，才显示毫秒
  else if (parts.length === 0) {
    if (msPart === 0) return "0ms";
    const msStr =
      msPart < 10
        ? msPart.toFixed(1).replace(/\.0$/, "")
        : Math.round(msPart).toString();
    parts.push(`${msStr}ms`);
  }

  return sign + (parts.length > 0 ? parts.join("") : "0ms");
}
