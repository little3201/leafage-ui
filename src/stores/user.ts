import { acceptHMRUpdate, defineStore } from "pinia";
import type { User, PrivilegeTreeNode } from "@/types";

interface UserState {
  user: User | null;
  privileges: PrivilegeTreeNode[];
  routesAdded: boolean;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    user: null,
    privileges: [],
    routesAdded: false
  }),
  getters: {
    privilegeMap(state) {
      const map = new Map<string, Set<string>>();

      function traverse(nodes: PrivilegeTreeNode[]) {
        for (const node of nodes) {
          if (node.name) {
            map.set(node.name, new Set(node.meta.actions ?? []));
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
    setUser(user: User) {
      this.user = user;
    },

    setPrivileges(privileges: PrivilegeTreeNode[]) {
      this.privileges = privileges;
    },

    setRoutesAdded(value: boolean) {
      this.routesAdded = value;
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
