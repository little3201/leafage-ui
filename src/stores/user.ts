import { acceptHMRUpdate, defineStore } from "pinia";
import type { Userinfo, PrivilegeTreeNode } from "@/types";

export const useUserStore = defineStore("user", {
  state: (): Userinfo => ({
    username: "",
    fullName: "",
    email: "",
    privileges: [],
    routesAdded: false
  }),
  getters: {
    privilegeMap(state) {
      const map = new Map<string, Set<string>>();

      function traverse(nodes: PrivilegeTreeNode[]) {
        for (const node of nodes) {
          if (node.meta?.path) {
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

    setPrivileges(privileges: PrivilegeTreeNode[]) {
      this.privileges = privileges;
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
