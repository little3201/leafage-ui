import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Archive, Filter, Pagination } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveArchives = (pagination: Pagination, filter?: Filter<Archive>) => {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.ARCHIVE, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchArchive = (id: number) => {
  return api.get(`${SERVER_URL.ARCHIVE}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createArchive = (row: Archive) => {
  return api.post(SERVER_URL.ARCHIVE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyArchive = (id: number, row: Archive) => {
  return api.put(`${SERVER_URL.ARCHIVE}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableArchive = (id: number) => {
  return api.patch(`${SERVER_URL.ARCHIVE}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeArchive = (id: number) => {
  return api.delete(`${SERVER_URL.ARCHIVE}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importArchives = (file: File) => {
  return api.postForm(`${SERVER_URL.ARCHIVE}/import`, { file: file })
}