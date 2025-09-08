import type { AppMenuItem } from 'src/types'

export const items: AppMenuItem[] = [
  {
    label: 'System',
    icon: 'pi pi-cloud',
    items: [
      {
        label: 'Users',
        icon: 'pi pi-cloud-upload',
        to: '/system/users'
      },
      {
        label: 'Groups',
        icon: 'pi pi-cloud-download',
        to: '/system/groups'
      }
    ]
  },
  {
    label: 'Devices',
    icon: 'pi pi-desktop',
    items: [
      {
        label: 'Phone',
        icon: 'pi pi-mobile',
        items: [
          {
            label: 'Desktop',
            icon: 'pi pi-desktop'
          },
          {
            label: 'Tablet',
            icon: 'pi pi-tablet'
          }
        ]
      }
    ]
  }
]