import type { Filter, Pagination, Privilege, PrivilegeAction } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrievePrivileges (pagination: Pagination,
  filter?: Filter<Privilege>) {
  const filters = dealFilters(filter)
  return api.get(`${SERVER_URL.PRIVILEGE}`, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Get row subset
 * @param id Row ID
 * @returns Subset data
 */
export function retrievePrivilegeSubset (id: number) {
  return api.get(`${SERVER_URL.PRIVILEGE}/${id}/subset`)
}

/**
 * Fetch row tree structure
 * @returns tree data
 */
export function retrievePrivilegeTree () {
  return api.get(`${SERVER_URL.PRIVILEGE}/tree`)
}

/**
 * Fetch row actions
 * @returns Row actions
 */
export function retrievePrivilegeActions (id: number) {
  return api.get(`${SERVER_URL.PRIVILEGE}/${id}/actions`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchPrivilege (id: number) {
  return api.get(`${SERVER_URL.PRIVILEGE}/${id}`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchPrivilegeAction (id: number, actionId: number) {
  return api.get(`${SERVER_URL.PRIVILEGE}/${id}/actions/${actionId}`)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function createPrivilegeAction (id: number, row: PrivilegeAction) {
  return api.post(`${SERVER_URL.PRIVILEGE}/${id}/actions`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyPrivilege (id: number, row: Privilege) {
  return api.put(`${SERVER_URL.PRIVILEGE}/${id}`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyPrivilegeAction (id: number, row: PrivilegeAction) {
  return api.put(`${SERVER_URL.PRIVILEGE}/${id}/actions/${row.id}`, row)
}

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export function enablePrivilege (id: number) {
  return api.patch(`${SERVER_URL.PRIVILEGE}/${id}/enable`)
}

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export function disablePrivilege (id: number) {
  return api.patch(`${SERVER_URL.PRIVILEGE}/${id}/disable`)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @param action Action to enable or disable
 * @returns Enable or Disable result
 */
export function enablePrivilegeAction (id: number, actionId: number) {
  return api.patch(`${SERVER_URL.PRIVILEGE}/${id}/actions/${actionId}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export function importPrivileges (file: File) {
  return api.postForm(`${SERVER_URL.PRIVILEGE}/import`, { file })
}
