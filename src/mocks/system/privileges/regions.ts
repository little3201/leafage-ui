import type { Privilege, PrivilegeTreeNode } from '@/types'
import { randomInt } from '../../util'

export const root_regions: Privilege = {
  id: 12,
  superiorId: null,
  path: 'regions',
  component: 'regions',
  name: 'regions',
  actions: [
    'create',
    'modify',
    'remove',
    'import',
    'export',
    'enable',
    'disable',
  ],
  count: 0,
  enabled: randomInt(2) > 0,
}

export const nodes_regions: Privilege[] = []

export const tree_regions: PrivilegeTreeNode[] = [
  {
    id: 12,
    name: 'regions',
    meta: {
      path: 'regions',
      component: 'regions',
      actions: [
        'create',
        'modify',
        'remove',
        'import',
        'export',
        'enable',
        'disable',
      ],
    },
  },
]
