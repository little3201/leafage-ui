import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import { retrievePrivilegeTree } from 'src/api/privileges'
import type { PrivilegeTreeNode } from 'src/types'



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

  return (
    <MenuList>
      <MenuItem>
        <ListItemIcon>
          <ContentCut fontSize="small" />
        </ListItemIcon>
        <ListItemText>Cut</ListItemText>

      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <ContentCut fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy</ListItemText>

      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <ContentCut fontSize="small" />
        </ListItemIcon>
        <ListItemText>Paste</ListItemText>

      </MenuItem>
    </MenuList>
  )
}

export default EssentialList
