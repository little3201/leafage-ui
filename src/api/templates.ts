import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Filters, Pagination, Template } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveTemplates = (pagination: Pagination, filter?: Filters<Template>) => {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.TEMPLATE, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchTemplate = (id: number) => {
  return api.get(`${SERVER_URL.TEMPLATE}/${id}`)
}

/**
 * Preview a specific row
 * @param id Row ID
 * @returns Row data
 */
export const previewTemplate = (id: number) => {
  return api.get(`${SERVER_URL.TEMPLATE}/${id}/preview`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createTemplate = (row: Template) => {
  return api.post(SERVER_URL.TEMPLATE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyTemplate = (id: number, row: Template) => {
  return api.put(`${SERVER_URL.TEMPLATE}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableTemplate = (id: number) => {
  return api.patch(`${SERVER_URL.TEMPLATE}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeTemplate = (id: number) => {
  return api.delete(`${SERVER_URL.TEMPLATE}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importTemplates = (file: File) => {
  return api.postForm(`${SERVER_URL.TEMPLATE}/import`, { file: file })
}
