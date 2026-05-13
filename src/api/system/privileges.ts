import { SERVER_URL } from 'src/constants'
import type { Filter, Pagination, Privilege } from 'src/types'
import { buildQuery, dealFilters } from 'src/utils'

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filters Optional filter or sort parameters
 * @returns Rows data
 */
export async function retrievePrivileges(pagination: Pagination, filter?: Filter<Privilege>) {
  const filters = dealFilters(filter)
  const query = buildQuery({ ...pagination, page: pagination.page - 1, filters })
  const res = await fetch(`/api${SERVER_URL.USER}?${query}`)
  return res.json()
}

/**
 * Get row subset
 * @param id Row ID
 * @returns Subset data
 */
export async function retrievePrivilegeSubset(id: number) {
  const res = await fetch(`/api${SERVER_URL.PRIVILEGE}/${id}/subset`)
  return res.json()
}

/**
 * Fetch row tree structure
 * @returns tree data
 */
export async function retrievePrivilegeTree () {
  const res = await fetch(`/api${SERVER_URL.PRIVILEGE}/tree`)
  return res.json()
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export async function fetchPrivilege(id: number) {
  const res = await fetch(`/api${SERVER_URL.PRIVILEGE}/${id}`)
  return res.json()
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export async function modifyPrivilege(id: number, row: Privilege) {
  const res = await fetch(`/api${SERVER_URL.PRIVILEGE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
  })
  return res.json()
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export async function enablePrivilege(id: number) {
  const res = await fetch(`/api${SERVER_URL.PRIVILEGE}/${id}`, { method: 'PATCH' })
  return res.text()
}

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importPrivileges = async (file: File) => {
  const res = await fetch(`/api${SERVER_URL.PRIVILEGE}/import`, {
    method: 'POST',
    body: JSON.stringify({ file: file }),
  })
  return res.json()
}