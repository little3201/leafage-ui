import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Filters, Pagination, Schema, Section } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveSchemas = (pagination: Pagination, filter?: Filters<Schema>) => {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.SCHEMA, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveSchemaSectionTree = (id: number) => {
  return api.get(`${SERVER_URL.SCHEMA}/${id}/sections`)
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
 * Fetch a specific row
 * @param id Row ID
 * @param sectionId Section ID
 * @returns Row data
 */
export const fetchSchemaSection = (sectionId: number) => {
  return api.get(`${SERVER_URL.SCHEMA}/sections/${sectionId}`)
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
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createSchemaSection = (id: number, row: Section) => {
  return api.post(`${SERVER_URL.SCHEMA}/${id}/sections`, row)
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
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeSchema = (id: number) => {
  return api.delete(`${SERVER_URL.SCHEMA}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @param sectionId Section ID
 * @returns Deletion status
 */
export const removeSchemaSection = (id: number, sectionId: number) => {
  return api.delete(`${SERVER_URL.SCHEMA}/${id}/sections/${sectionId}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importSchemas = (file: File) => {
  return api.postForm(`${SERVER_URL.SCHEMA}/import`, { file: file })
}
