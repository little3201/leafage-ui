import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Filters, Pagination, Section } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveSections = (pagination: Pagination, filter?: Filters<Section>) => {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.SECTION, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchSection = (id: number) => {
  return api.get(`${SERVER_URL.SECTION}/${id}`)
}

/**
 * Get row subset
 * @param id Row ID
 * @returns Subset data
 */
export const retrieveSectionSubset = (id: number) => {
  return api.get(`${SERVER_URL.SECTION}/${id}/subset`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createSection = (row: Section) => {
  return api.post(SERVER_URL.SECTION, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifySection = (id: number, row: Section) => {
  return api.put(`${SERVER_URL.SECTION}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableSection = (id: number) => {
  return api.patch(`${SERVER_URL.SECTION}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeSection = (id: number) => {
  return api.delete(`${SERVER_URL.SECTION}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importSections = (file: File) => {
  return api.postForm(`${SERVER_URL.SECTION}/import`, { file: file })
}
