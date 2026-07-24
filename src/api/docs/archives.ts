import type { Archive, Filter, Pagination } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveArchives (pagination: Pagination,
  filter?: Filter<Archive>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.ARCHIVE, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchArchive (id: number) {
  return api.get(`${SERVER_URL.ARCHIVE}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createArchive (row: Archive) {
  return api.post(SERVER_URL.ARCHIVE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyArchive (id: number, row: Archive) {
  return api.put(`${SERVER_URL.ARCHIVE}/${id}`, row)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeArchive (id: number) {
  return api.delete(`${SERVER_URL.ARCHIVE}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export function importArchives (file: File) {
  return api.postForm(`${SERVER_URL.ARCHIVE}/import`, { file })
}
