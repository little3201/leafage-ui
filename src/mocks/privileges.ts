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
      icon: 'settings'
    },
    children: [
      {
        id: 2,
        name: 'groups',
        meta: {
          path: 'groups',
          component: 'system/groups',
          icon: 'group',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'relation', 'enable']
        }
      },
      {
        id: 3,
        name: 'users',
        meta: {
          path: 'users',
          component: 'system/users',
          icon: 'person',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 4,
        name: 'privileges',
        meta: {
          path: 'privileges',
          component: 'system/privileges',
          icon: 'admin_panel_settings',
          actions: ['modify', 'authorize', 'import', 'export', 'enable']
        }
      },
      {
        id: 6,
        name: 'dictionaries',
        meta: {
          path: 'dictionaries',
          component: 'system/dictionaries',
          icon: 'book_3',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
    ]
  },
  {
    id: 7,
    name: 'logs',
    meta: {
      path: 'logs',
      component: '#',
      redirect: 'operation',
      icon: 'library_books',
      actions: ['clear', 'remove', 'export']
    },
    children: [
      {
        id: 8,
        name: 'operation_logs',
        meta: {
          path: 'operation',
          component: 'logs/operation',
          icon: 'article',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 9,
        name: 'access_logs',
        meta: {
          path: 'access',
          component: 'logs/access',
          icon: 'sticky_note_2',
          actions: ['clear', 'remove', 'export']
        }
      },
      {
        id: 10,
        name: 'audit_logs',
        meta: {
          path: 'audit',
          component: 'logs/audit',
          icon: 'note_alt',
          actions: ['remove', 'export']
        }
      },
      {
        id: 11,
        name: 'scheduler_logs',
        meta: {
          path: 'scheduler',
          component: 'logs/scheduler',
          icon: 'event_note',
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
      icon: 'location_on',
      actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
    }
  },
  {
    id: 14,
    name: 'files',
    meta: {
      path: 'files',
      component: 'files',
      icon: 'folder_open',
      actions: ['download', 'upload', 'remove']
    }
  },
  {
    id: 16,
    name: 'exploiters',
    meta: {
      path: 'exploiters',
      component: '#',
      redirect: 'schemas',
      icon: 'build'
    },
    children: [
      {
        id: 17,
        name: 'schemas',
        meta: {
          path: 'schemas',
          component: 'exploiters/schemas',
          icon: 'genetics',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'sync', 'config', 'execute', 'enable']
        }
      },
      {
        id: 18,
        name: 'scripts',
        meta: {
          path: 'scripts',
          component: 'exploiters/scripts',
          icon: 'terminal',
          actions: ['create', 'modify', 'remove', 'import', 'export', 'enable']
        }
      },
      {
        id: 19,
        name: 'master_plates',
        meta: {
          path: 'master-plates',
          component: 'exploiters/master-plates',
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