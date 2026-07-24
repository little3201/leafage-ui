import type { AccessLog, Filter, Pagination } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveAccessLogs (pagination: Pagination,
  filter?: Filter<AccessLog>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.ACCESS_LOG, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchAccessLog (id: number) {
  return api.get(`${SERVER_URL.ACCESS_LOG}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeAccessLog (id: number) {
  return api.delete(`${SERVER_URL.ACCESS_LOG}/${id}`)
}

/**
 * Remove all rows
 * @returns Deletion status
 */
export function clearAccessLogs () {
  return api.delete(`${SERVER_URL.ACCESS_LOG}`)
}
