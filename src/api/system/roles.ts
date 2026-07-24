import type { Filter, Pagination, Role } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveRoles (pagination: Pagination,
  filter?: Filter<Role>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.ROLE, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Retrieve members for a specific row
 * @returns tree data
 */
export function retrieveRoleMembers (id: number) {
  return api.get(`${SERVER_URL.ROLE}/${id}/members`)
}

/**
 * Retrieve privileges for a specific row
 * @param id Row ID
 * @returns Role privileges
 */
export function retrieveRolePrivileges (id: number) {
  return api.get(`${SERVER_URL.ROLE}/${id}/privileges`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchRole (id: number) {
  return api.get(`${SERVER_URL.ROLE}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createRole (row: Role) {
  return api.post(SERVER_URL.ROLE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyRole (id: number, row: Role) {
  return api.put(`${SERVER_URL.ROLE}/${id}`, row)
}

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export function enableRole (id: number) {
  return api.patch(`${SERVER_URL.ROLE}/${id}/enable`)
}

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export function disableRole (id: number) {
  return api.patch(`${SERVER_URL.ROLE}/${id}/disable`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeRole (id: number) {
  return api.delete(`${SERVER_URL.ROLE}/${id}`)
}

/**
 * Relation members for a specific row
 * @param id Row ID
 * @param usernames usernames
 */
export function addMembers (id: number, usernames: string[]) {
  return api.patch(`${SERVER_URL.ROLE}/${id}/members`, usernames)
}

/**
 * Remove members for a specific row
 * @param id Row ID
 * @param usernames usernames
 */
export function removeMembers (id: number, usernames: string[]) {
  const params = usernames ? { usernames: usernames.join(',') } : {}
  return api.delete(`${SERVER_URL.ROLE}/${id}/members`, { params })
}

/**
 * Relation privileges for a specific row
 * @param id Row ID
 * @param privilegeId Privilege id
 * @param action Action
 */
export function addPrivilege (id: number,
  privilegeId: number,
  action?: string) {
  return api.patch(
    `${SERVER_URL.ROLE}/${id}/privileges/${privilegeId}`,
    {},
    { params: { action } },
  )
}

/**
 * Remove privileges for a specific row
 * @param id Row ID
 * @param privilegeId Privilege id
 * @param action Action
 */
export function removePrivilege (id: number,
  privilegeId: number,
  action?: string) {
  return api.delete(`${SERVER_URL.ROLE}/${id}/privileges/${privilegeId}`, {
    params: { action },
  })
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export function importRoles (file: File) {
  return api.patchForm(`${SERVER_URL.ROLE}/import`, { file })
}
