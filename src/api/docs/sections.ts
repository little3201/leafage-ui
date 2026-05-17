import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import type { DynamicRow, Section, SectionField } from 'src/types'


/**
 * Fetch row tree structure
 * @returns tree data
 */
export const retrieveSectionTree = (ownerId: number, ownerType: string) => {
  return api.get(`${SERVER_URL.SECTION}/${ownerId}/tree`, { params: { ownerType } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchSection = (id: number) => {
  return api.get(`${SERVER_URL.SECTION}/${id}`)
}

/**
 * Get row fields
 * @param id Row ID
 * @returns Fields data
 */
export const retrieveSectionFields = (id: number) => {
  return api.get(`${SERVER_URL.SECTION}/${id}/fields`)
}

/**
 * Get row datas
 * @param id Row ID
 * @returns Datas data
 */
export const retrieveSectionDatas = (id: number) => {
  return api.get(`${SERVER_URL.SECTION}/${id}/datas`)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createSection = (row: Section) => {
  return api.post(SERVER_URL.SECTION, row)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createSectionField = (row: SectionField) => {
  return api.post(`${SERVER_URL.SECTION}/fields`, row)
}

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createSectionData = (row: DynamicRow) => {
  return api.post(`${SERVER_URL.SECTION}/datas`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifySection = (id: number, row: Section) => {
  return api.put(`${SERVER_URL.SECTION}/${id}`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifySectionField = (id: number, row: SectionField) => {
  return api.put(`${SERVER_URL.SECTION}/fields/${id}`, row)
}

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifySectionData = (id: number, row: DynamicRow) => {
  return api.put(`${SERVER_URL.SECTION}/datas/${id}`, row)
}

/**
 * Enable or Disable an existing row
 * @param id Row ID
 * @returns Enable or Disable result
 */
export const enableSection = (id: number) => {
  return api.patch(`${SERVER_URL.SECTION}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeSection = (id: number) => {
  return api.delete(`${SERVER_URL.SECTION}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeSectionField = (id: number) => {
  return api.delete(`${SERVER_URL.SECTION}/fields/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeSectionData = (id: number) => {
  return api.delete(`${SERVER_URL.SECTION}/datas/${id}`)
}
