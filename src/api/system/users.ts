import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Filters, Pagination, User } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveUsers = (pagination: Pagination, filter?: Filters<User>) => {
  const filters = dealFilters(filter)
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
 * @returns Unlock result
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
 * Import rows
 * @param file file
 * @returns
 */
export const importUsers = (file: File) => {
  return api.postForm(`${SERVER_URL.USER}/import`, { file: file })
}
