import type { Pagination } from 'src/types'

export const retrieveUsers = async (pagination: Pagination, filters?: object) => {
  try {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      size: pagination.size.toString(),
      ...filters
    })
    const response = await fetch(`/api/users?${params.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    // 解析响应 JSON 数据，并确保类型匹配
    return await response.json()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}