import { defineStore, acceptHMRUpdate } from 'pinia'
import type { PrivilegeTreeNode } from 'src/types'


export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    fullName: '',
    accessToken: '',
    idToken: '',
    privileges: [] as PrivilegeTreeNode[],
    routesAdded: false
  })
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}

