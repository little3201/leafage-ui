import type { Filter, Group, Pagination } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveGroups (pagination: Pagination,
  filter?: Filter<Group>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.GROUP, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch row tree structure
 * @returns tree data
 */
export function retrieveGroupTree () {
  return api.get(`${SERVER_URL.GROUP}/tree`)
}

/**
 * Retrieve members for a specific row
 * @returns realtion data
 */
export function retrieveGroupMembers (id: number) {
  return api.get(`${SERVER_URL.GROUP}/${id}/members`)
}

/**
 * Retrieve privileges for a specific row
 * @returns realtion data
 */
export function retrieveGroupRoles (id: number) {
  return api.get(`${SERVER_URL.GROUP}/${id}/roles`)
}

/**
 * Retrieve privileges for a specific row
 * @returns realtion data
 */
export function retrieveGroupPrivileges (id: number) {
  return api.get(`${SERVER_URL.GROUP}/${id}/privileges`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchGroup (id: number) {
  return api.get(`${SERVER_URL.GROUP}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createGroup (row: Group) {
  return api.post(SERVER_URL.GROUP, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyGroup (id: number, row: Group) {
  return api.put(`${SERVER_URL.GROUP}/${id}`, row)
}

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export function enableGroup (id: number) {
  return api.patch(`${SERVER_URL.GROUP}/${id}/enable`)
}

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export function disableGroup (id: number) {
  return api.patch(`${SERVER_URL.GROUP}/${id}/disable`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeGroup (id: number) {
  return api.delete(`${SERVER_URL.GROUP}/${id}`)
}

/**
 * Relation members for a specific row
 * @param id Row ID
 * @param usernames usernames
 */
export function addMembers (id: number, usernames: string[]) {
  return api.patch(`${SERVER_URL.GROUP}/${id}/members`, usernames)
}

/**
 * Remove members for a specific row
 * @param id Row ID
 * @param usernames usernames
 */
export function removeMembers (id: number, usernames: string[]) {
  const params = usernames ? { usernames: usernames.join(',') } : {}
  return api.delete(`${SERVER_URL.GROUP}/${id}/members`, { params })
}

/**
 * Relation roles for a specific row
 * @param id Row ID
 * @param roleIds Role ids
 */
export function addRoles (id: number, roleIds: number[]) {
  return api.patch(`${SERVER_URL.GROUP}/${id}/roles`, roleIds)
}

/**
 * Remove members for a specific row
 * @param id Row ID
 * @param roleIds Role ids
 */
export function removeRoles (id: number, roleIds: number[]) {
  const params = roleIds ? { roleIds: roleIds.join(',') } : {}
  return api.delete(`${SERVER_URL.GROUP}/${id}/roles`, { params })
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
    `${SERVER_URL.GROUP}/${id}/privileges/${privilegeId}`,
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
  return api.delete(`${SERVER_URL.GROUP}/${id}/privileges/${privilegeId}`, {
    params: { action },
  })
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export function importGroups (file: File) {
  return api.postForm(`${SERVER_URL.GROUP}/import`, { file })
}
