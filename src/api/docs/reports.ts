import type { Filter, Pagination, Report } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveReports (pagination: Pagination,
  filter?: Filter<Report>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.REPORT, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchReport (id: number) {
  return api.get(`${SERVER_URL.REPORT}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createReport (row: Report) {
  return api.post(SERVER_URL.REPORT, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyReport (id: number, row: Report) {
  return api.put(`${SERVER_URL.REPORT}/${id}`, row)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeReport (id: number) {
  return api.delete(`${SERVER_URL.REPORT}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export function importReports (file: File) {
  return api.postForm(`${SERVER_URL.REPORT}/import`, { file })
}
