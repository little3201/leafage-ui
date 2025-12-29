import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, Fragment } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveFragments = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(SERVER_URL.FRAGMENT, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchFragment = (id: number) => {
  return api.get(`${SERVER_URL.FRAGMENT}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createFragment = (row: Fragment) => {
  return api.post(SERVER_URL.FRAGMENT, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyFragment = (id: number, row: Fragment) => {
  return api.put(`${SERVER_URL.FRAGMENT}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableFragment = (id: number) => {
  return api.patch(`${SERVER_URL.FRAGMENT}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeFragment = (id: number) => {
  return api.delete(`${SERVER_URL.FRAGMENT}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importFragments = (file: File) => {
  return api.postForm(`${SERVER_URL.FRAGMENT}/import`, { file: file })
}
