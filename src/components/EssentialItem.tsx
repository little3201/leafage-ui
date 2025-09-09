import { useState } from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import Icon from '@mui/material/Icon'
import ExpandLessOutlined from '@mui/icons-material/ExpandLess'
import ExpandMoreOutlined from '@mui/icons-material/ExpandMore'
import type { PrivilegeTreeNode } from 'src/types'


function EssentialItem({ node }: { node: PrivilegeTreeNode }) {
  const { name, meta, children } = node

  const [open, setOpen] = useState(false)

  return (
    <>
      <ListItemButton onClick={() => children && setOpen(!open)} sx={{ pl: 4 }}>
        <ListItemIcon>
          <Icon baseClassName='material-icons-outlined'>{meta.icon}</Icon>
        </ListItemIcon>
        <ListItemText primary={name} />
        {children?.length ? (open ? <ExpandLessOutlined /> : <ExpandMoreOutlined />) : null}
      </ListItemButton>
      {children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((child) => (<EssentialItem key={child.id} node={child} />))}
          </List>
        </Collapse>
      )}
    </>
  )
}

export default EssentialItem