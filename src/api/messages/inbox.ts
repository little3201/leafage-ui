import type { Filter, MessageInbox, Pagination } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveMessageInbox (pagination: Pagination,
  filter?: Filter<MessageInbox>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.MESSAGE_INBOX, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchMessageInbox (id: number) {
  return api.get(`${SERVER_URL.MESSAGE_INBOX}/${id}`)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @returns Modified row
 */
export function readMessageInbox (id: number) {
  return api.patch(`${SERVER_URL.MESSAGE_INBOX}/${id}`)
}

/**
 * Modify an existing row
 * @returns Modified row
 */
export function readAllMessageInbox () {
  return api.patch(`${SERVER_URL.MESSAGE_INBOX}/read`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeMessageInbox (id: number) {
  return api.delete(`${SERVER_URL.MESSAGE_INBOX}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function clearMessageInbox (id: number) {
  return api.delete(`${SERVER_URL.MESSAGE_INBOX}/${id}`)
}
