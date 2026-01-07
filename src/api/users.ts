import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import { dealFilters } from 'src/utils'
import type { Pagination, User } from 'src/types'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveUsers = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(SERVER_URL.USER, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchUser = (id: number) => {
  return api.get(`${SERVER_URL.USER}/${id}`)
}

/**
 * Fetch me
 * @returns Row data
 */
export const fetchMe = () => {
  return api.get(`${SERVER_URL.USER}/me`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createUser = (row: User) => {
  return api.post(SERVER_URL.USER, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyUser = (id: number, row: User) => {
  return api.put(`${SERVER_URL.USER}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableUser = (id: number) => {
  return api.patch(`${SERVER_URL.USER}/${id}`)
}

/**
 * Unlock an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const unlockUser = (id: number) => {
  return api.patch(`${SERVER_URL.USER}/${id}/unlock`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeUser = (id: number) => {
  return api.delete(`${SERVER_URL.USER}/${id}`)
}

/**
 * Relation privileges for a specific row
 * @param ids Row IDs
 * @param privilegeIds Privilege id
 * @param actions Actions
 */
export const relationUsersPrivileges = (privilegeId: number, relations: { key: number | string, actions: string[] }[]) => {
  const datas = relations.map(item => { return { username: item.key, actions: item.actions } })
  return api.patch(`${SERVER_URL.USER}/privileges/${privilegeId}`, datas)
}

/**
 * Remove privileges for a specific row
 * @param username Row username
 * @param privilegeIds Privilege id
 * @param actions Actions
 */
export const removeUsersPrivileges = (username: string, privilegeId: number, actions?: string[]) => {
  if (actions && actions.length > 0) {
    const params = { actions: actions.join(',') }
    return api.delete(`${SERVER_URL.USER}/${username}/privileges/${privilegeId}`, { params })
  } else {
    return api.delete(`${SERVER_URL.USER}/${username}/privileges/${privilegeId}`)
  }
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importUsers = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`${SERVER_URL.USER}/import`, formData)
}
