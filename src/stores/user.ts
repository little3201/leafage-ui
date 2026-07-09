import type { PrivilegeTreeNode } from "@/types";
import type { Userinfo } from "@/types";
import { acceptHMRUpdate, defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: (): Userinfo => ({
    username: "",
    fullName: "",
    email: "",
    accessToken: "",
    idToken: "",
    privileges: [] as PrivilegeTreeNode[],
    routesAdded: false
  }),
  actions: {
    setUserinfo(username: string, fullName: string, email: string) {
      this.username = username;
      this.fullName = fullName;
      this.email = email;
    },

    setAccessToken(token: string) {
      this.accessToken = token;
    },

    setIdToken(token: string) {
      this.idToken = token;
    },

    setPrivileges(privileges: PrivilegeTreeNode[]) {
      this.privileges = privileges;
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
