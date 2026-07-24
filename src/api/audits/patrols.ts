import type { Filter, Pagination, SafetyPatrol } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveSafetyPatrols (pagination: Pagination,
  filter?: Filter<SafetyPatrol>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.AUDIT_PATROL, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchSafetyPatrol (id: number) {
  return api.get(`${SERVER_URL.AUDIT_PATROL}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createSafetyPatrol (row: SafetyPatrol) {
  return api.post(SERVER_URL.AUDIT_PATROL, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifySafetyPatrol (id: number, row: SafetyPatrol) {
  return api.put(`${SERVER_URL.AUDIT_PATROL}/${id}`, row)
}

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export function enableSafetyPatrol (id: number) {
  return api.patch(`${SERVER_URL.AUDIT_PATROL}/${id}/enable`)
}

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export function disableSafetyPatrol (id: number) {
  return api.patch(`${SERVER_URL.AUDIT_PATROL}/${id}/disable`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeSafetyPatrol (id: number) {
  return api.delete(`${SERVER_URL.AUDIT_PATROL}/${id}`)
}
