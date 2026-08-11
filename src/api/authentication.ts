import { SERVER_URL } from "@/constants";

const BASE_URL = (import.meta.env.VITE_BASE_URL as string) || "";

export function signIn() {
  window.location.href = BASE_URL;
}

export function signOut() {
  window.location.href = BASE_URL + SERVER_URL.LOGOUT;
}
