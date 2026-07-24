import type { FileRecord, Filter, Pagination } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveFiles (pagination: Pagination,
  filter?: Filter<FileRecord>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.FILE, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchFile (id: number) {
  return api.get(`${SERVER_URL.FILE}/${id}`)
}

/**
 * Statistics
 * @param id Row ID
 * @returns Row data
 */
export function statisticsFile () {
  return api.get(`${SERVER_URL.FILE}/statistics`)
}

/**
 * Create directory
 * @param id Row ID
 * @returns Enable result
 */
export function createDirectory (superiorId: number | null, name: string) {
  return api.post(`${SERVER_URL.FILE}`, { superiorId, name })
}

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export function enableFile (id: number) {
  return api.patch(`${SERVER_URL.FILE}/${id}/enable`)
}

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export function disableFile (id: number) {
  return api.patch(`${SERVER_URL.FILE}/${id}/disable`)
}

/**
 * Upload
 * @param file file
 * @returns Uploaded row
 */
export function uploadFile (file: File, superiorId?: number | null) {
  return api.postForm(`${SERVER_URL.FILE}/upload`, { file, superiorId })
}

/**
 * Download
 * @param id Row ID
 * @returns data stream
 */
export function downloadFile (id: number) {
  return api.get(`${SERVER_URL.FILE}/${id}/download`, { responseType: 'blob' })
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeFile (id: number) {
  return api.delete(`${SERVER_URL.FILE}/${id}`)
}
