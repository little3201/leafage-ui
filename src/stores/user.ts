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
    setUserinfo(userinfo: Userinfo) {
      this.username = userinfo.username;
      this.fullName = userinfo.fullName;
      this.email = userinfo.email;
      this.accessToken = userinfo.accessToken;
      this.idToken = userinfo.idToken;
      this.privileges = userinfo.privileges;
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
