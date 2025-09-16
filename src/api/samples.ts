import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, MasterPlate } from 'src/types'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveMasterPlates = (pagination: Pagination, filters?: object) => {
  return api.get(SERVER_URL.SAMPLE, { params: { ...pagination, page: pagination.page - 1, ...filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchMasterPlate = (id: number) => {
  return api.get(`${SERVER_URL.SAMPLE}/${id}`)
}

/**
 * Check if a specific row exists by name
 * @param name Row name
 * @param id Row ID
 * @returns Row data
 */
export const checkMasterPlateExists = (name: string, suffix: string, version: string, id?: number) => {
  return api.get(`${SERVER_URL.SAMPLE}/exists`, { params: { name, suffix, version, id } })
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createMasterPlate = (row: MasterPlate) => {
  return api.post(SERVER_URL.SAMPLE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyMasterPlate = (id: number, row: MasterPlate) => {
  return api.put(`${SERVER_URL.SAMPLE}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableMasterPlate = (id: number) => {
  return api.patch(`${SERVER_URL.SAMPLE}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeMasterPlate = (id: number) => {
  return api.delete(`${SERVER_URL.SAMPLE}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importMasterPlates = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`${SERVER_URL.SAMPLE}/import`, formData)
}
