import type { Filter, Pagination, Region } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'
import { dealFilters } from '@/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export function retrieveRegions (pagination: Pagination,
  filter?: Filter<Region>) {
  const filters = dealFilters(filter)
  return api.get(SERVER_URL.REGION, {
    params: { ...pagination, page: pagination.page - 1, filters },
  })
}

/**
 * Get row subset
 * @param id Row ID
 * @returns Subset data
 */
export function retrieveRegionSubset (id: number | null) {
  return api.get(`${SERVER_URL.REGION}/subset`, { params: { id } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchRegion (id: number) {
  return api.get(`${SERVER_URL.REGION}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createRegion (row: Region) {
  return api.post(SERVER_URL.REGION, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifyRegion (id: number, row: Region) {
  return api.put(`${SERVER_URL.REGION}/${id}`, row)
}

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export function enableRegion (id: number) {
  return api.patch(`${SERVER_URL.REGION}/${id}/enable`)
}

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export function disableRegion (id: number) {
  return api.patch(`${SERVER_URL.REGION}/${id}/disable`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeRegion (id: number) {
  return api.delete(`${SERVER_URL.REGION}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export function importRegions (file: File) {
  return api.postForm(`${SERVER_URL.REGION}/import`, { file })
}
