import { api } from "@/boot/axios";
import { SERVER_URL } from "@/constants";
import type { SafetyPatrol, Filter, Pagination } from "@/types";
import { dealFilters } from "@/utils";

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveSafetyPatrols = (
  pagination: Pagination,
  filter?: Filter<SafetyPatrol>
) => {
  const filters = dealFilters(filter);
  return api.get(SERVER_URL.AUDIT_PATROL, {
    params: { ...pagination, page: pagination.page - 1, filters }
  });
};

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchSafetyPatrol = (id: number) => {
  return api.get(`${SERVER_URL.AUDIT_PATROL}/${id}`);
};

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createSafetyPatrol = (row: SafetyPatrol) => {
  return api.post(SERVER_URL.AUDIT_PATROL, row);
};

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifySafetyPatrol = (id: number, row: SafetyPatrol) => {
  return api.put(`${SERVER_URL.AUDIT_PATROL}/${id}`, row);
};

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export const enableSafetyPatrol = (id: number) => {
  return api.patch(`${SERVER_URL.AUDIT_PATROL}/${id}/enable`);
};

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export const disableSafetyPatrol = (id: number) => {
  return api.patch(`${SERVER_URL.AUDIT_PATROL}/${id}/disable`);
};

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeSafetyPatrol = (id: number) => {
  return api.delete(`${SERVER_URL.AUDIT_PATROL}/${id}`);
};
