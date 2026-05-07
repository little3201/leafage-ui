import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Filters, Pagination, Privilege, PrivilegeAction } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrievePrivileges = (pagination: Pagination, filter?: Filters<Privilege>) => {
  const filters = dealFilters(filter)
  return api.get(`${SERVER_URL.PRIVILEGE}`, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Get row subset
 * @param id Row ID
 * @returns Subset data
 */
export const retrievePrivilegeSubset = (id: number) => {
  return api.get(`${SERVER_URL.PRIVILEGE}/${id}/subset`)
}

/**
 * Fetch row tree structure
 * @returns tree data
 */
export const retrievePrivilegeTree = () => {
  return api.get(`${SERVER_URL.PRIVILEGE}/tree`)
}

/**
 * Fetch row actions
 * @returns Row actions
 */
export const retrievePrivilegeActions = (id: number) => {
  return api.get(`${SERVER_URL.PRIVILEGE}/${id}/actions`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchPrivilege = (id: number) => {
  return api.get(`${SERVER_URL.PRIVILEGE}/${id}`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchPrivilegeAction = (id: number, actionId: number) => {
  return api.get(`${SERVER_URL.PRIVILEGE}/${id}/actions/${actionId}`)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const createPrivilegeAction = (id: number, row: PrivilegeAction) => {
  return api.post(`${SERVER_URL.PRIVILEGE}/${id}/actions`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyPrivilege = (id: number, row: Privilege) => {
  return api.put(`${SERVER_URL.PRIVILEGE}/${id}`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyPrivilegeAction = (id: number, row: PrivilegeAction) => {
  return api.put(`${SERVER_URL.PRIVILEGE}/${id}/actions/${row.id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enablePrivilege = (id: number) => {
  return api.patch(`${SERVER_URL.PRIVILEGE}/${id}`)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @param action Action to enable or disable
 * @returns Enable or Disable result
 */
export const enablePrivilegeAction = (id: number, actionId: number) => {
  return api.patch(`${SERVER_URL.PRIVILEGE}/${id}/actions/${actionId}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importPrivileges = (file: File) => {
  return api.postForm(`${SERVER_URL.PRIVILEGE}/import`, { file: file })
}
