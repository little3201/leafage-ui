import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, Schema, Field } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveSchemas = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(SERVER_URL.SCHEMA, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Retrieve fields
 * @param id Row ID
 * @param tableName Table name
 * @returns Fields
 */
export const retrieveFields = (id: number, tableName: string) => {
  return api.get(`${SERVER_URL.SCHEMA}/${id}/fields`, { params: { tableName } })
}

/**
 * preview
 * @param id Row ID
 * @returns Rendered code
 */
export const previewSchema = (id: number) => {
  return api.get(`${SERVER_URL.SCHEMA}/${id}/preview`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchSchema = (id: number) => {
  return api.get(`${SERVER_URL.SCHEMA}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createSchema = (row: Schema) => {
  return api.post(SERVER_URL.SCHEMA, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifySchema = (id: number, row: Schema) => {
  return api.put(`${SERVER_URL.SCHEMA}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableSchema = (id: number) => {
  return api.patch(`${SERVER_URL.SCHEMA}/${id}`)
}

/**
 * Generate
 * @param id Row ID
 * @returns Created row
 */
export const executeSchema = (id: number) => {
  return api.get(`${SERVER_URL.SCHEMA}/${id}/execute`, { responseType: 'blob' })
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeSchema = (id: number) => {
  return api.delete(`${SERVER_URL.SCHEMA}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importSchemas = (file: File) => {
  return api.postForm(`${SERVER_URL.SCHEMA}/import`, { file: file })
}

/**
 * Exeucte a row
 * @param id Row ID
 * @returns Execute result
 */
export const syncFields = (id: number) => {
  return api.patch(`${SERVER_URL.SCHEMA}/${id}/sync`)
}

/**
 * Config rows
 * @param id Row ID
 * @param tableName Table name
 * @param rows  rows data
 * @returns
 */
export const configFields = (id: number, tableName: string, rows: Array<Field>) => {
  return api.patch(`${SERVER_URL.SCHEMA}/${id}/config/${tableName}`, rows)
}
