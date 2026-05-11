/**
 * Helper to build query string
 */
export function buildQuery (params: Record<string, any>) {
  const query = new URLSearchParams()
  for (const key of Object.keys(params)) {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, params[key])
    }
  }
  return query.toString()
}
