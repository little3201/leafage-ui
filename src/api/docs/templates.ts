import type { Filter, Pagination, Template } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveTemplates (pagination: Pagination,
  filter?: Filter<Template>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.TEMPLATE, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchTemplate (id: number) {
  return api.get(`${SERVER_URL.TEMPLATE}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createTemplate (row: Template) {
  return api.post(SERVER_URL.TEMPLATE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyTemplate (id: number, row: Template) {
  return api.put(`${SERVER_URL.TEMPLATE}/${id}`, row)
}

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export function enableTemplate (id: number) {
  return api.patch(`${SERVER_URL.TEMPLATE}/${id}/enable`)
}

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export function disableTemplate (id: number) {
  return api.patch(`${SERVER_URL.TEMPLATE}/${id}/disable`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeTemplate (id: number) {
  return api.delete(`${SERVER_URL.TEMPLATE}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export function importTemplates (file: File) {
  return api.postForm(`${SERVER_URL.TEMPLATE}/import`, { file })
}
