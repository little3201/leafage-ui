import { api } from "@/boot/axios";
import { SERVER_URL } from "@/constants";
import type { Filter, Pagination, Scheduler } from "@/types";
import { dealFilters } from "@/utils";

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveSchedulers = (
  pagination: Pagination,
  filter?: Filter<Scheduler>
) => {
  const filters = dealFilters(filter);
  return api.get(SERVER_URL.SCHEDULER, {
    params: { ...pagination, page: pagination.page - 1, filters }
  });
};

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchScheduler = (id: number) => {
  return api.get(`${SERVER_URL.SCHEDULER}/${id}`);
};

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createScheduler = (row: Scheduler) => {
  return api.post(SERVER_URL.SCHEDULER, row);
};

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyScheduler = (id: number, row: Scheduler) => {
  return api.put(`${SERVER_URL.SCHEDULER}/${id}`, row);
};

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export const enableScheduler = (id: number) => {
  return api.patch(`${SERVER_URL.SCHEDULER}/${id}/enable`);
};

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export const disableScheduler = (id: number) => {
  return api.patch(`${SERVER_URL.SCHEDULER}/${id}/disable`);
};

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeScheduler = (id: number) => {
  return api.delete(`${SERVER_URL.SCHEDULER}/${id}`);
};
