import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Filters, Pagination, Report } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveReports = (pagination: Pagination, filter?: Filters<Report>) => {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.REPORT, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchReport = (id: number) => {
  return api.get(`${SERVER_URL.REPORT}/${id}`)
}

/**
 * Preview a specific row
 * @param id Row ID
 * @returns Row data
 */
export const previewReport = (id: number) => {
  return api.get(`${SERVER_URL.REPORT}/${id}/preview`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createReport = (row: Report) => {
  return api.post(SERVER_URL.REPORT, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyReport = (id: number, row: Report) => {
  return api.put(`${SERVER_URL.REPORT}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableReport = (id: number) => {
  return api.patch(`${SERVER_URL.REPORT}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeReport = (id: number) => {
  return api.delete(`${SERVER_URL.REPORT}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importReports = (file: File) => {
  return api.postForm(`${SERVER_URL.REPORT}/import`, { file: file })
}
