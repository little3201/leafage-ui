import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, Region } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveRegions = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(SERVER_URL.REGION, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchRegion = (id: number) => {
  return api.get(`${SERVER_URL.REGION}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createRegion = (row: Region) => {
  return api.post(SERVER_URL.REGION, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyRegion = (id: number, row: Region) => {
  return api.put(`${SERVER_URL.REGION}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableRegion = (id: number) => {
  return api.patch(`${SERVER_URL.REGION}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeRegion = (id: number) => {
  return api.delete(`${SERVER_URL.REGION}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importRegions = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`${SERVER_URL.REGION}/import`, formData)
}
