import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, Sample } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveSamples = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(SERVER_URL.SAMPLE, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchSample = (id: number) => {
  return api.get(`${SERVER_URL.SAMPLE}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createSample = (row: Sample) => {
  return api.post(SERVER_URL.SAMPLE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifySample = (id: number, row: Sample) => {
  return api.put(`${SERVER_URL.SAMPLE}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableSample = (id: number) => {
  return api.patch(`${SERVER_URL.SAMPLE}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeSample = (id: number) => {
  return api.delete(`${SERVER_URL.SAMPLE}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importSamples = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`${SERVER_URL.SAMPLE}/import`, formData)
}
