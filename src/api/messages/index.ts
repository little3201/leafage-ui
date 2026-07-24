import type { Filter, Message, Pagination } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveMessages (pagination: Pagination,
  filter?: Filter<Message>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.MESSAGE, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchMessage (id: number) {
  return api.get(`${SERVER_URL.MESSAGE}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createMessage (row: Message) {
  return api.post(SERVER_URL.MESSAGE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyMessage (id: number, row: Message) {
  return api.put(`${SERVER_URL.MESSAGE}/${id}`, row)
}

/**
 * Publish
 * @param id Row ID
 * @returns Publish status
 */
export function publishMessage (id: number) {
  return api.patch(`${SERVER_URL.MESSAGE}/${id}/publish`)
}

/**
 * Revoke
 * @param id Row ID
 * @returns Revoke status
 */
export function revokeMessage (id: number) {
  return api.patch(`${SERVER_URL.MESSAGE}/${id}/revoke`)
}

/**
 * Read an existing row
 * @param id Row ID
 * @returns Read status
 */
export function readMessage (id: number) {
  return api.patch(`${SERVER_URL.MESSAGE}/${id}`)
}

/**
 * Read all
 * @returns Read status
 */
export function readMessages () {
  return api.patch(`${SERVER_URL.MESSAGE}/read`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeMessage (id: number) {
  return api.delete(`${SERVER_URL.MESSAGE}/${id}`)
}
