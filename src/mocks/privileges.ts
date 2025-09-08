import { http, HttpResponse } from 'msw'
import type { PrivilegeTreeNode } from 'src/types'


export const treeNodes: PrivilegeTreeNode[] = [
  {
    id: 1,
    name: 'system',
    meta: {
      path: 'system',
      component: '#',
      redirect: 'users',
      icon: 'cog'
    },
    children: [
      {
        id: 2,
        name: 'groups',
        meta: {
          path: 'groups',
          component: 'system/groups',
          icon: 'users',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'authorize', 'enable']
        }
      },
      {
        id: 3,
        name: 'users',
        meta: {
          path: 'users',
          component: 'system/users',
          icon: 'user',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable', 'unlock']
        }
      },
      {
        id: 4,
        name: 'roles',
        meta: {
          path: 'roles',
          component: 'system/roles',
          icon: 'shield-user',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'authorize', 'enable']
        }
      },
      {
        id: 5,
        name: 'dictionaries',
        meta: {
          path: 'dictionaries',
          component: 'system/dictionaries',
          icon: 'book-3-outline',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 6,
        name: 'privileges',
        meta: {
          path: 'privileges',
          component: 'system/privileges',
          icon: 'admin-panel-settings-outline',
          actions: ['modify', 'import', 'export', 'enable']
        }
      }
    ]
  },
  {
    id: 7,
    name: 'logs',
    meta: {
      path: 'logs',
      component: '#',
      redirect: 'operation',
      icon: 'lab-profile-outline'
    },
    children: [
      {
        id: 8,
        name: 'operation_logs',
        meta: {
          path: 'operation',
          component: 'logs/operation',
          icon: 'clinical-notes-outline',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 9,
        name: 'access_logs',
        meta: {
          path: 'access',
          component: 'logs/access',
          icon: 'sticky-note-2-outline',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 10,
        name: 'audit_logs',
        meta: {
          path: 'audit',
          component: 'logs/audit',
          icon: 'note-alt-outline',
          actions: ['remove', 'export']
        }
      },
      {
        id: 11,
        name: 'scheduler_logs',
        meta: {
          path: 'scheduler',
          component: 'logs/scheduler',
          icon: 'event-note-outline',
          actions: ['clear', 'remove', 'export']
        }
      }
    ]
  },
  {
    id: 12,
    name: 'regions',
    meta: {
      path: 'regions',
      component: 'regions',
      icon: 'location-on-outline',
      actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
    }
  },
  {
    id: 13,
    name: 'files',
    meta: {
      path: 'files',
      component: 'files',
      icon: 'folder-open-outline',
      actions: ['download', 'upload', 'remove']
    }
  },
  {
    id: 14,
    name: 'exploiters',
    meta: {
      path: 'exploiters',
      component: '#',
      redirect: 'schemas',
      icon: 'build-outline'
    },
    children: [
      {
        id: 15,
        name: 'schemas',
        meta: {
          path: 'schemas',
          component: 'exploiters/schemas',
          icon: 'genetics',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'sync', 'config', 'execute', 'enable']
        }
      },
      {
        id: 16,
        name: 'scripts',
        meta: {
          path: 'scripts',
          component: 'exploiters/scripts',
          icon: 'terminal',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 17,
        name: 'samples',
        meta: {
          path: 'samples',
          component: 'exploiters/samples',
          icon: 'code',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      }
    ]
  }
]

export const privilegesHandlers = [
  http.get(`/api/privileges/tree`, () => {
    return HttpResponse.json(treeNodes)
  }),
]