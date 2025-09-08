/**
 * Fetch row tree structure
 * @returns tree data
 */
export const retrievePrivilegeTree  = async () => {
  try {
    const response = await fetch('/api/privileges/tree')
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    // 解析响应 JSON 数据，并确保类型匹配
    return await response.json()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}