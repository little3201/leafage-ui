import type { AuditLog, Filter, Pagination } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveAuditLogs (pagination: Pagination,
  filter?: Filter<AuditLog>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.AUDIT_LOG, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchAuditLog (id: number) {
  return api.get(`${SERVER_URL.AUDIT_LOG}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeAuditLog (id: number) {
  return api.delete(`${SERVER_URL.AUDIT_LOG}/${id}`)
}
