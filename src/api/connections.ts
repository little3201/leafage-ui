import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, Connection } from 'src/types'


/**
 * Retrieve rows
 * @returns Rows data
 */
export const retrieveConnections = (pagination: Pagination, filters?: object) => {
  return api.get(`${SERVER_URL.CONNECTION}`, { params: { ...pagination, page: pagination.page - 1, ...filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchConnection = (id: number) => {
  return api.get(`${SERVER_URL.CONNECTION}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createConnection = (row: Connection) => {
  return api.post(SERVER_URL.CONNECTION, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyConnection = (id: number, row: Connection) => {
  return api.put(`${SERVER_URL.CONNECTION}/${id}`, row)
}

/**
 * Retrieve rows
 * @returns Rows data
 */
export const retrieveTables = (id: number) => {
  return api.get(`${SERVER_URL.CONNECTION}/${id}/tables`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeConnection = (id: number) => {
  return api.delete(`${SERVER_URL.CONNECTION}/${id}`)
}

/**
 * Exeucte a row
 * @param id Row ID
 * @returns Execute result
 */
export const executeConnection = (id: number) => {
  return api.get(`${SERVER_URL.CONNECTION}/${id}/execute`)
}