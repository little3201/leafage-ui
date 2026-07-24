import type { Filter, OperationLog, Pagination } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveOperationLogs (pagination: Pagination,
  filter?: Filter<OperationLog>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.OPERATION_LOG, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchOperationLog (id: number) {
  return api.get(`${SERVER_URL.OPERATION_LOG}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeOperationLog (id: number) {
  return api.delete(`${SERVER_URL.OPERATION_LOG}/${id}`)
}

/**
 * Remove all rows
 * @returns Deletion status
 */
export function clearOperationLogs () {
  return api.delete(`${SERVER_URL.OPERATION_LOG}`)
}
