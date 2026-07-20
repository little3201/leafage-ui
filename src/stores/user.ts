import type { Userinfo, PrivilegeTreeNode } from "@/types";
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
  getters: {
    privilegeMap(state) {
      const map = new Map<string, Set<string>>();

      function traverse(nodes: PrivilegeTreeNode[]) {
        for (const node of nodes) {
          if (node.meta.path) {
            map.set(node.meta.path, new Set(node.meta.actions ?? []));
          }

          if (node.children?.length) {
            traverse(node.children);
          }
        }
      }

      traverse(state.privileges);
      return map;
    }
  },
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
