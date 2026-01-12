import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Field, Pagination, Scheme } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveSchemes = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(SERVER_URL.SCHEME, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Retrieve fields
 * @param id Row ID
 * @param tableName Table name
 * @returns Fields
 */
export const retrieveFields = (id: number, tableName: string) => {
  return api.get(`${SERVER_URL.SCHEME}/${id}/fields`, { params: { tableName } })
}

/**
 * Retrieve modules for a specific row
 * @param id Row ID
 * @returns Scheme modules
 */
export const retrieveSchemeModules = (id: number) => {
  return api.get(`${SERVER_URL.SCHEME}/${id}/modules`)
}

/**
 * preview
 * @param id Row ID
 * @returns Rendered code
 */
export const previewScheme = (id: number) => {
  return api.get(`${SERVER_URL.SCHEME}/${id}/preview`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchScheme = (id: number) => {
  return api.get(`${SERVER_URL.SCHEME}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createScheme = (row: Scheme) => {
  return api.post(SERVER_URL.SCHEME, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyScheme = (id: number, row: Scheme) => {
  return api.put(`${SERVER_URL.SCHEME}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableScheme = (id: number) => {
  return api.patch(`${SERVER_URL.SCHEME}/${id}`)
}

/**
 * Generate
 * @param id Row ID
 * @returns Created row
 */
export const executeScheme = (id: number) => {
  return api.get(`${SERVER_URL.SCHEME}/${id}/execute`, { responseType: 'blob' })
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeScheme = (id: number) => {
  return api.delete(`${SERVER_URL.SCHEME}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importSchemes = (file: File) => {
  return api.postForm(`${SERVER_URL.SCHEME}/import`, { file: file })
}

/**
 * Exeucte a row
 * @param id Row ID
 * @returns Execute result
 */
export const syncFields = (id: number) => {
  return api.patch(`${SERVER_URL.SCHEME}/${id}/sync`)
}

/**
 * Config rows
 * @param id Row ID
 * @param tableName Table name
 * @param rows  rows data
 * @returns
 */
export const configFields = (id: number, tableName: string, rows: Array<Field>) => {
  return api.patch(`${SERVER_URL.SCHEME}/${id}/config/${tableName}`, rows)
}

/**
 * Relation modules for a specific row
 * @param id Row ID
 * @param moduleIds relations
 */
export const relationModules = (id: number, moduleIds: number[]) => {
  return api.patch(`${SERVER_URL.SCHEME}/${id}/modules`, moduleIds)
}

/**
 * Remove modules for a specific row
 * @param id Row ID
 * @param moduleIds relations
 */
export const removeSchemeModules = (id: number, moduleIds: number[]) => {
  const params = moduleIds ? { moduleIds: moduleIds.join(',') } : {}
  return api.delete(`${SERVER_URL.SCHEME}/${id}/modules`, { params })
}