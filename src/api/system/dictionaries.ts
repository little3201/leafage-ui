import type { Dictionary, Filter, Pagination } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveDictionaries (pagination: Pagination,
  filter?: Filter<Dictionary>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.DICTIONARY, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Get row subset
 * @param id Row ID
 * @returns Subset data
 */
export function retrieveDictionarySubset (id: number | null) {
  return api.get(`${SERVER_URL.DICTIONARY}/subset`, { params: { id } })
}

/**
 * Fetch row tree structure
 * @returns tree data
 */
export function retrieveDictionaryTree () {
  return api.get(`${SERVER_URL.DICTIONARY}/tree`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchDictionary (id: number) {
  return api.get(`${SERVER_URL.DICTIONARY}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createDictionary (row: Dictionary) {
  return api.post(SERVER_URL.DICTIONARY, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyDictionary (id: number, row: Dictionary) {
  return api.put(`${SERVER_URL.DICTIONARY}/${id}`, row)
}

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export function enableDictionary (id: number) {
  return api.patch(`${SERVER_URL.DICTIONARY}/${id}/enable`)
}

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export function disableDictionary (id: number) {
  return api.patch(`${SERVER_URL.DICTIONARY}/${id}/disable`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeDictionary (id: number) {
  return api.delete(`${SERVER_URL.DICTIONARY}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export function importDictionaries (file: File) {
  return api.postForm(`${SERVER_URL.DICTIONARY}/import`, { file })
}
