import { api } from "@/boot/axios";
import { SERVER_URL } from "@/constants";
import type { Filter, Pagination, Role, PrivilegeActions } from "@/types";
import { dealFilters } from "@/utils";

/**
 * Retrieve rows
 * @param pagination Pagination
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveRoles = (
  pagination: Pagination,
  filter?: Filter<Role>
) => {
  const filters = dealFilters(filter);
  return api.get(SERVER_URL.ROLE, {
    params: { ...pagination, page: pagination.page - 1, filters }
  });
};

/**
 * Retrieve privileges for a specific row
 * @param id Row ID
 * @returns Role privileges
 */
export const retrieveRolePrivileges = (id: number) => {
  return api.get(`${SERVER_URL.ROLE}/${id}/privileges`);
};

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchRole = (id: number) => {
  return api.get(`${SERVER_URL.ROLE}/${id}`);
};

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createRole = (row: Role) => {
  return api.post(SERVER_URL.ROLE, row);
};

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyRole = (id: number, row: Role) => {
  return api.put(`${SERVER_URL.ROLE}/${id}`, row);
};

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export const enableRole = (id: number) => {
  return api.patch(`${SERVER_URL.ROLE}/${id}/enable`);
};

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export const disableRole = (id: number) => {
  return api.patch(`${SERVER_URL.ROLE}/${id}/disable`);
};

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeRole = (id: number) => {
  return api.delete(`${SERVER_URL.ROLE}/${id}`);
};

/**
 * Authorize
 * @param id Row ID
 * @param authorities PrivilegeActions
 */
export const authorize = (id: number, authorities: PrivilegeActions[]) => {
  return api.patch(`${SERVER_URL.ROLE}/${id}/privileges`, authorities);
};

/**
 * Import rows
 * @param file file
 * @returns
 */
export const importRoles = (file: File) => {
  return api.patchForm(`${SERVER_URL.ROLE}/import`, { file: file });
};
