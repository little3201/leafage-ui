import type { Section, SectionData, SectionField } from '@/types'
import { api } from '@/boot/axios'
import { SERVER_URL } from '@/constants'

/**
 * Fetch row tree structure
 * @returns tree data
 */
export function retrieveSectionTree (ownerId: number, ownerType: string) {
  return api.get(`${SERVER_URL.SECTION}/${ownerId}/tree`, {
    params: { ownerType },
  })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export function fetchSection (id: number) {
  return api.get(`${SERVER_URL.SECTION}/${id}`)
}

/**
 * Get row fields
 * @param id Row ID
 * @returns Fields data
 */
export function retrieveSectionFields (id: number) {
  return api.get(`${SERVER_URL.SECTION}/${id}/fields`)
}

/**
 * Get row datas
 * @param id Row ID
 * @returns Datas data
 */
export function retrieveSectionDatas (id: number) {
  return api.get(`${SERVER_URL.SECTION}/${id}/datas`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createSection (row: Section) {
  return api.post(SERVER_URL.SECTION, row)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createSectionField (row: SectionField) {
  return api.post(`${SERVER_URL.SECTION}/fields`, row)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export function createSectionData (row: SectionData) {
  return api.post(`${SERVER_URL.SECTION}/datas`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifySection (id: number, row: Section) {
  return api.put(`${SERVER_URL.SECTION}/${id}`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifySectionField (id: number, row: SectionField) {
  return api.put(`${SERVER_URL.SECTION}/fields/${id}`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export function modifySectionData (id: number, row: SectionData) {
  return api.put(`${SERVER_URL.SECTION}/datas/${id}`, row)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeSection (id: number) {
  return api.delete(`${SERVER_URL.SECTION}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeSectionField (id: number) {
  return api.delete(`${SERVER_URL.SECTION}/fields/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export function removeSectionData (id: number) {
  return api.delete(`${SERVER_URL.SECTION}/datas/${id}`)
}
