import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'

/**
 * Retrieve rows
 * @param month the month
 * @returns Rows data
 */
export const retrieveCalendarEvents = (month: number) => {
  return api.get(SERVER_URL.CALENDAR_EVENT, { params: { month } })
}

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchCalendarEvent = (id: number) => {
  return api.get(`${SERVER_URL.CALENDAR_EVENT}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const createCalendarEvent = (id: number) => {
  return api.post(`${SERVER_URL.CALENDAR_EVENT}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const modifyCalendarEvent = (id: number) => {
  return api.put(`${SERVER_URL.CALENDAR_EVENT}/${id}`)
}

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeCalendarEvent = (id: number) => {
  return api.delete(`${SERVER_URL.CALENDAR_EVENT}/${id}`)
}
