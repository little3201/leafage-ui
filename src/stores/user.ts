import { acceptHMRUpdate, defineStore } from "pinia";
import type { Userinfo } from "@/types";
import { SERVER_URL } from "@/constants";
import { api } from "@/boot/axios";

const BASE_URL = (import.meta.env.VITE_BASE_URL as string) || "";

export const useUserStore = defineStore("user", {
  state: (): Userinfo => ({
    username: "",
    fullName: "",
    email: "",
    privileges: [],
    routesAdded: false
  }),
  actions: {
    signIn() {
      globalThis.location.href = BASE_URL;
    },
    getUserInfo() {
      return api.get(SERVER_URL.USERINFO);
    },
    signOut() {
      globalThis.location.href = BASE_URL + SERVER_URL.LOGOUT;
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
