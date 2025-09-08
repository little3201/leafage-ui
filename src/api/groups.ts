import type { Pagination } from 'src/types'


/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveGroups = async (pagination: Pagination, filters?: object) => {
  try {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      size: pagination.size.toString(),
      ...filters
    })
    const response = await fetch(`/api/groups?${params.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to retrieve data')
    }
    // 解析响应 JSON 数据，并确保类型匹配
    return await response.json()
  } catch (error) {
    console.error('Error retrieve data:', error)
  }
}