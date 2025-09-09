import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { PanelMenu } from 'primereact/panelmenu'
import { retrievePrivilegeTree } from 'src/api/privileges'
import { pathResolve } from 'src/utils'
import type { PrivilegeTreeNode } from 'src/types'
import type { MenuItem } from 'primereact/menuitem'



const recursion = (nodes: PrivilegeTreeNode[], navigate: Function, parentPath: string = "/"): MenuItem[] => {
  return nodes.map(node => {
    const menuItem: MenuItem = {
      label: node.name,
      icon: `pi pi-${node.meta.icon}`,
      items: node.children ? recursion(node.children, navigate, pathResolve(parentPath, node.meta.path)) : undefined,
      // template: itemRenderer
    }
    if (!node.children || node.children.length === 0) {
      menuItem.command = () => { navigate(pathResolve(parentPath, node.meta.path)); };
    }

    return menuItem
  })
}

function EssentialList() {
  const navigate = useNavigate()
  const [privileges, setPrivileges] = useState<PrivilegeTreeNode[]>([])

  useEffect(() => {
    retrievePrivilegeTree().then(res => {
      if (res) {
        setPrivileges(res);
      }
    })
  }, [])

  const items = recursion(privileges, navigate)

  return (
    <PanelMenu model={items} />
  )
}

export default EssentialList
