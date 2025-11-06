import { defineStore } from 'pinia'
import type { PrivilegeTreeNode } from 'src/types'


export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    name: '',
    email: '',
    privileges: [] as PrivilegeTreeNode[]
  })
})
