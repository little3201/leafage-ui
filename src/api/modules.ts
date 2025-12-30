import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { Pagination, Module } from 'src/types'
import { dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveModules = (pagination: Pagination, filters?: object | string) => {
  if (filters) {
    filters = dealFilters(filters)
  }
  return api.get(SERVER_URL.MODULE, { params: { ...pagination, page: pagination.page - 1, filters } })
}

/**
 * Retrieve fragments for a specific row
 * @param id Row ID
 * @returns Module fragments
 */
export const retrieveModuleFragments = (id: number) => {
  return api.get(`${SERVER_URL.MODULE}/${id}/fragments`)
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchModule = (id: number) => {
  return api.get(`${SERVER_URL.MODULE}/${id}`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createModule = (row: Module) => {
  return api.post(SERVER_URL.MODULE, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyModule = (id: number, row: Module) => {
  return api.put(`${SERVER_URL.MODULE}/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableModule = (id: number) => {
  return api.patch(`${SERVER_URL.MODULE}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeModule = (id: number) => {
  return api.delete(`${SERVER_URL.MODULE}/${id}`)
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importModules = (file: File) => {
  return api.postForm(`${SERVER_URL.MODULE}/import`, { file: file })
}

/**
 * Relation fragments for a specific row
 * @param id Row ID
 * @param relations relations
 */
export const relationFragments = (id: number, relations: Array<string>) => {
  return api.post(`${SERVER_URL.MODULE}/${id}/fragments`, { relations })
}

/**
 * Remove fragments for a specific row
 * @param id Row ID
 * @param relations relations
 */
export const removeModuleFragments = (id: number, relations: Array<string>) => {
  const params = relations ? { relations: relations.join(',') } : {}
  return api.delete(`${SERVER_URL.MODULE}/${id}/fragments`, { params })
}