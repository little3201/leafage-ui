import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Filter, Pagination, SchedulerLog } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveSchedulerLogs = (pagination: Pagination, filter?: Filter<SchedulerLog>) => {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.SCHEDULER_LOG, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchSchedulerLog = (id: number) => {
  return api.get(`${SERVER_URL.SCHEDULER_LOG}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeSchedulerLog = (id: number) => {
  return api.delete(`${SERVER_URL.SCHEDULER_LOG}/${id}`)
}

/**
 * Remove all rows
 * @returns Deletion status
 */
export const clearSchedulerLogs = () => {
  return api.delete(`${SERVER_URL.SCHEDULER_LOG}`)
}