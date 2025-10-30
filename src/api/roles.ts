import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, Role } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveRoles = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(SERVER_URL.ROLE, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Retrieve members for a specific row
 * @returns tree data
 */
export const retrieveRoleMembers = (id: number) => {
  return api.get(`${SERVER_URL.ROLE}/${id}/members`)
}

/**
 * Retrieve privileges for a specific row
 * @param id Row ID
 * @returns Role privileges
 */
export const retrieveRolePrivileges = (id: number) => {
  return api.get(`${SERVER_URL.ROLE}/${id}/privileges`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchRole = (id: number) => {
  return api.get(`${SERVER_URL.ROLE}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createRole = (row: Role) => {
  return api.post(SERVER_URL.ROLE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyRole = (id: number, row: Role) => {
  return api.put(`${SERVER_URL.ROLE}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableRole = (id: number) => {
  return api.patch(`${SERVER_URL.ROLE}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeRole = (id: number) => {
  return api.delete(`${SERVER_URL.ROLE}/${id}`)
}

/**
 * Relation members for a specific row
 * @param id Row ID
 * @param usernames usernames
 */
export const relationRoleMembers = (id: number, usernames: string[]) => {
  return api.patch(`${SERVER_URL.ROLE}/${id}/members`, usernames)
}

/**
 * Remove members for a specific row
 * @param id Row ID
 * @param usernames usernames
 */
export const removeRoleMembers = (id: number, usernames: string[]) => {
  const params = usernames ? { usernames: usernames.join(',') } : {}
  return api.delete(`${SERVER_URL.ROLE}/${id}/members`, { params })
}

/**
 * Relation privileges for a specific row
 * @param id Row ID
 * @param privilegeId Privilege id
 * @param action Action
 */
export const relationRolePrivileges = (id: number, privilegeId: number, action?: string) => {
  return api.patch(`${SERVER_URL.ROLE}/${id}/privileges/${privilegeId}`, {}, { params: { action } })
}

/**
 * Remove privileges for a specific row
 * @param id Row ID
 * @param privilegeId Privilege id
 * @param action Action
 */
export const removeRolePrivileges = (id: number, privilegeId: number, action?: string) => {
  return api.delete(`${SERVER_URL.ROLE}/${id}/privileges/${privilegeId}`, { params: { action } })
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importRoles = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`${SERVER_URL.ROLE}/import`, formData)
}
