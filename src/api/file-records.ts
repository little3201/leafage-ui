import { api } from "@/boot/axios";
import { SERVER_URL } from "@/constants";
import type { FileRecord, Filter, Pagination } from "@/types";
import { dealFilters } from "@/utils";

/**
 * Retrieve rows
 * @param pagination Pagination and sort parameters
 * @param filter Optional filter or sort parameters
 * @returns Rows data
 */
export const retrieveFiles = (
  pagination: Pagination,
  filter?: Filter<FileRecord>
) => {
  const filters = dealFilters(filter);
  return api.get(SERVER_URL.FILE, {
    params: { ...pagination, page: pagination.page - 1, filters }
  });
};

/**
 * Fetch a specific row
 * @param id Row ID
 * @returns Row data
 */
export const fetchFile = (id: number) => {
  return api.get(`${SERVER_URL.FILE}/${id}`);
};

/**
 * Statistics
 * @param id Row ID
 * @returns Row data
 */
export const statisticsFile = () => {
  return api.get(`${SERVER_URL.FILE}/statistics`);
};

/**
 * Enable an existing row
 * @param id Row ID
 * @returns Enable result
 */
export const enableFile = (id: number) => {
  return api.patch(`${SERVER_URL.FILE}/${id}/enable`);
};

/**
 * Disable an existing row
 * @param id Row ID
 * @returns Disable result
 */
export const disableFile = (id: number) => {
  return api.patch(`${SERVER_URL.FILE}/${id}/disable`);
};

/**
 * Upload
 * @param file file
 * @returns Uploaded row
 */
export const uploadFile = (file: File, superiorId?: number | null) => {
  return api.postForm(`${SERVER_URL.FILE}/upload`, { file, superiorId });
};

/**
 * Download
 * @param id Row ID
 * @returns data stream
 */
export const downloadFile = (id: number) => {
  return api.get(`${SERVER_URL.FILE}/${id}/download`, { responseType: "blob" });
};

/**
 * Remove a row
 * @param id Row ID
 * @returns Deletion status
 */
export const removeFile = (id: number) => {
  return api.delete(`${SERVER_URL.FILE}/${id}`);
};
