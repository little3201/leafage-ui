import { api } from "@/boot/axios";
import { SERVER_URL } from "@/constants";
import type { Filter, Pagination, MessageInbox } from "@/types";
import { dealFilters } from "@/utils";

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveMessageInbox = (
  pagination: Pagination,
  filter?: Filter<MessageInbox>
) => {
  const filters = dealFilters(filter);
  return api.get(SERVER_URL.MESSAGE_INBOX, {
    params: { ...pagination, page: pagination.page - 1, filters }
  });
};

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchMessageInbox = (id: number) => {
  return api.get(`${SERVER_URL.MESSAGE_INBOX}/${id}`);
};

/**
 * Modify an existing row
 * @param id Row ID
 * @returns Modified row
 */
export const readMessageInbox = (id: number) => {
  return api.patch(`${SERVER_URL.MESSAGE_INBOX}/${id}`);
};

/**
 * Modify an existing row
 * @returns Modified row
 */
export const readAllMessageInbox = () => {
  return api.patch(`${SERVER_URL.MESSAGE_INBOX}/read`);
};

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeMessageInbox = (id: number) => {
  return api.delete(`${SERVER_URL.MESSAGE_INBOX}/${id}`);
};

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const clearMessageInbox = (id: number) => {
  return api.delete(`${SERVER_URL.MESSAGE_INBOX}/${id}`);
};
