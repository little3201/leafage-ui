import type { PrivilegeTreeNode, Userinfo } from '@/types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, reactive, toRefs } from 'vue'

export const useUserStore = defineStore('user', () => {
  const state = reactive<Userinfo>({
    username: '',
    fullName: '',
    email: '',
    privileges: [],
    routesAdded: false,
  })

  const privilegeMap = computed(() => {
    const map = new Map<string, Set<string>>()

    function traverse (nodes: PrivilegeTreeNode[]) {
      for (const node of nodes) {
        if (node.name) {
          map.set(node.name, new Set(node.meta.actions))
        }

        if (node.children?.length) {
          traverse(node.children)
        }
      }
    }

    traverse(state.privileges)
    return map
  })

  function setUserinfo (username: string, fullName: string, email: string) {
    state.username = username
    state.fullName = fullName
    state.email = email
  }

  function setPrivileges (privileges: PrivilegeTreeNode[]) {
    state.privileges = privileges
  }

  return {
    ...toRefs(state),
    privilegeMap,
    setUserinfo,
    setPrivileges,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
