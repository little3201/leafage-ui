import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination } from 'src/types'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveOperationLogs = (pagination: Pagination, filters?: object) => {
  return api.get(SERVER_URL.OPERATION_LOG, { params: { ...pagination, page: pagination.page - 1, ...filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchOperationLog = (id: number) => {
  return api.get(`${SERVER_URL.OPERATION_LOG}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeOperationLog = (id: number) => {
  return api.delete(`${SERVER_URL.OPERATION_LOG}/${id}`)
}

/**
 * Remove all rows
 * @returns Deletion status
 */
export const clearOperationLogs = () => {
  return api.delete(`${SERVER_URL.OPERATION_LOG}`)
}