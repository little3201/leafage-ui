import type { Filter, Pagination, User } from 'src/types'
import { SERVER_URL } from 'src/constants'
import { buildQuery } from 'src/utils'

/**
 * Retrieve rows
 */
export async function retrieveUsers (pagination: Pagination, filter?: Filter<User>) {
  const query = buildQuery({ ...pagination, page: pagination.page - 1, filters: JSON.stringify(filter) })
  const res = await fetch(`/api${SERVER_URL.USER}?${query}`)
  return res.json()
}

/**
 * Fetch a specific row
 */
export async function fetchUser (id: number) {
  const res = await fetch(`/api${SERVER_URL.USER}/${id}`)
  return res.json()
}

/**
 * Create a new row
 */
export async function createUser (row: User) {
  const res = await fetch(`/api${SERVER_URL.USER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
  })
  return res.json()
}

/**
 * Modify an existing row
 */
export async function modifyUser (id: number, row: User) {
  const res = await fetch(`/api${SERVER_URL.USER}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
  })
  return res.json()
}

/**
 * Enable or Disable an existing row
 */
export async function enableUser (id: number) {
  const res = await fetch(`/api${SERVER_URL.USER}/${id}`, { method: 'PATCH' })
  return res.json()
}

/**
 * Unlock an existing row
 */
export async function unlockUser (id: number) {
  const res = await fetch(`/api${SERVER_URL.USER}/${id}/unlock`, { method: 'PATCH' })
  return res.json()
}

/**
 * Remove a row
 */
export async function removeUser (id: number) {
  const res = await fetch(`/api${SERVER_URL.USER}/${id}`, { method: 'DELETE' })
  return res.json()
}

/**
 * Relation privileges for a specific row
 */
export async function relationUsersPrivileges (privilegeId: number, relations: { key: number | string, actions: string[] }[]) {
  const datas = relations.map(item => ({ username: item.key, actions: item.actions }))
  const res = await fetch(`/api${SERVER_URL.USER}/privileges/${privilegeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datas),
  })
  return res.json()
}

/**
 * Remove privileges for a specific row
 */
export async function removeUsersPrivileges (username: string, privilegeId: number, actions?: string[]) {
  let url = `/api${SERVER_URL.USER}/${username}/privileges/${privilegeId}`
  if (actions && actions.length > 0) {
    const query = buildQuery({ actions: actions.join(',') })
    url += `?${query}`
  }
  const res = await fetch(url, { method: 'DELETE' })
  return res.json()
}

/**
 * Import rows
 */
export async function importUsers (file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`/api${SERVER_URL.USER}/import`, {
    method: 'POST',
    body: formData,
  })
  return res.json()
}
