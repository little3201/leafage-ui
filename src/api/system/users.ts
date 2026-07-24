import type { Filter, Pagination, User } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveUsers (pagination: Pagination,
  filter?: Filter<User>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.USER, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchUser (id: number) {
  return api.get(`${SERVER_URL.USER}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createUser (row: User) {
  return api.post(SERVER_URL.USER, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyUser (id: number, row: User) {
  return api.put(`${SERVER_URL.USER}/${id}`, row)
}

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export function enableUser (id: number) {
  return api.patch(`${SERVER_URL.USER}/${id}/enable`)
}

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export function disableUser (id: number) {
  return api.patch(`${SERVER_URL.USER}/${id}/disable`)
}

/**
 * Unlock an existing row
 * @param id Row ID
 * @returns Unlock result
 */
export function unlockUser (id: number) {
  return api.patch(`${SERVER_URL.USER}/${id}/unlock`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeUser (id: number) {
  return api.delete(`${SERVER_URL.USER}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export function importUsers (file: File) {
  return api.postForm(`${SERVER_URL.USER}/import`, { file })
}
