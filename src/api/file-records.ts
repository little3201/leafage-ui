import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveFiles = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(SERVER_URL.FILE, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchFile = (id: number) => {
  return api.get(`${SERVER_URL.FILE}/${id}`)
}

/**
 * Upload
 * @param file file
 * @returns Uploaded row
 */
export const uploadFile = (file: File) => {
  return api.postForm(`${SERVER_URL.FILE}`, {file: file})
}

/**
 * Download
 * @param id Row ID
 * @returns data stream
 */
export const downloadFile = (id: number) => {
  return api.get(`${SERVER_URL.FILE}/${id}/download`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeFile = (id: number) => {
  return api.delete(`${SERVER_URL.FILE}/${id}`)
}
