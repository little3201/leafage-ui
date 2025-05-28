import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, Template } from 'src/types'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveTemplates = (pagination: Pagination, filters?: object) => {
  return api.get(SERVER_URL.MASTER_PLATE, { params: { ...pagination, page: pagination.page - 1, ...filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchTemplate = (id: number) => {
  return api.get(`${SERVER_URL.MASTER_PLATE}/${id}`)
}

/**
 * Check if a specific row exists by name
 * @param name Row name
 * @param id Row ID
 * @returns Row data
 */
export const checkTemplateExists = (name: string, suffix: string, version: string, id?: number) => {
  return api.get(`${SERVER_URL.MASTER_PLATE}/exists`, { params: { name, suffix, version, id } })
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createTemplate = (row: Template) => {
  return api.post(SERVER_URL.MASTER_PLATE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyTemplate = (id: number, row: Template) => {
  return api.put(`${SERVER_URL.MASTER_PLATE}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableTemplate = (id: number) => {
  return api.patch(`${SERVER_URL.MASTER_PLATE}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeTemplate = (id: number) => {
  return api.delete(`${SERVER_URL.MASTER_PLATE}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importTemplates = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`${SERVER_URL.MASTER_PLATE}/import`, formData)
}
