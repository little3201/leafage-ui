import { api } from "@/boot/axios";
import { SERVER_URL } from "@/constants";

const BASE_URL = (import.meta.env.VITE_BASE_URL as string) || "";

export function signIn() {
  globalThis.location.href = BASE_URL;
}

export function getUserInfo() {
  return api.get(SERVER_URL.USERINFO);
}

export function signOut() {
  globalThis.location.href = BASE_URL + SERVER_URL.LOGOUT;
}
