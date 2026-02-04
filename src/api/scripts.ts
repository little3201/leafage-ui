import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Filters, Script, ScriptConfig } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param filter Optional filter parameters
 * @returns Rows data
 */
export const retrieveScripts = (filter?: Filters<Script>) => {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.SCRIPT, { params: { filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchScript = (id: number) => {
  return api.get(`${SERVER_URL.SCRIPT}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createScript = (row: Script) => {
  return api.post(SERVER_URL.SCRIPT, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyScript = (id: number, row: Script) => {
  return api.put(`${SERVER_URL.SCRIPT}/${id}`, row)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importScripts = (file: File) => {
  return api.postForm(`${SERVER_URL.SCRIPT}/import`, { file: file })
}

/**
 * Config
 * @param row Updated row data
 * @returns Modified row
 */
export const configScripts = (row: ScriptConfig) => {
  return api.patch(`${SERVER_URL.SCRIPT}/config`, row, { responseType: 'blob' })
}
