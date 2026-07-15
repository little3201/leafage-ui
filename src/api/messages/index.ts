import { api } from "@/boot/axios";
import { SERVER_URL } from "@/constants";
import type { Filter, Pagination, Message } from "@/types";
import { dealFilters } from "@/utils";

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveMessages = (
  pagination: Pagination,
  filter?: Filter<Message>
) => {
  const filters = dealFilters(filter);
  return api.get(SERVER_URL.MESSAGE, {
    params: { ...pagination, page: pagination.page - 1, filters }
  });
};

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchMessage = (id: number) => {
  return api.get(`${SERVER_URL.MESSAGE}/${id}`);
};

/**
 * Create a new row
 * @param row Row data
 * @returns Created row
 */
export const createMessage = (row: Message) => {
  return api.post(SERVER_URL.MESSAGE, row);
};

/**
 * Modify an existing row
 * @param id Row ID
 * @param row Updated row data
 * @returns Modified row
 */
export const modifyMessage = (id: number, row: Message) => {
  return api.put(`${SERVER_URL.MESSAGE}/${id}`, row);
};

/**
 * Modify an existing row
 * @param id Row ID
 * @returns Modified row
 */
export const readMessage = (id: number) => {
  return api.patch(`${SERVER_URL.MESSAGE}/${id}`);
};

/**
 * Modify an existing row
 * @returns Modified row
 */
export const readMessages = () => {
  return api.patch(`${SERVER_URL.MESSAGE}/read`);
};

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeMessage = (id: number) => {
  return api.delete(`${SERVER_URL.MESSAGE}/${id}`);
};
