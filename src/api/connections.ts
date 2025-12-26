import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, Connection } from 'src/types'
import { dealFilters } from 'src/utils'


/**
 * Retrieve rows
 * @returns Rows data
 */
export const retrieveConnections = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(`${SERVER_URL.CONNECTIONS}`, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchConnection = (id: number) => {
  return api.get(`${SERVER_URL.CONNECTIONS}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createConnection = (row: Connection) => {
  return api.post(SERVER_URL.CONNECTIONS, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyConnection = (id: number, row: Connection) => {
  return api.put(`${SERVER_URL.CONNECTIONS}/${id}`, row)
}

/**
 * Retrieve rows
 * @returns Rows data
 */
export const retrieveTables = (id: number) => {
  return api.get(`${SERVER_URL.CONNECTIONS}/${id}/tables`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeConnection = (id: number) => {
  return api.delete(`${SERVER_URL.CONNECTIONS}/${id}`)
}
