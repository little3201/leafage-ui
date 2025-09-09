import { useState, useEffect } from 'react'
import { Outlet } from "react-router"
import List from '@mui/material/List'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import EssentialList from "components/EssentialList"
import { retrievePrivilegeTree } from 'src/api/privileges'
import { DarkModeOutlined, TranslateOutlined, HelpOutline } from "@mui/icons-material"
import type { PrivilegeTreeNode } from 'src/types'


function MainLayout() {
  const [privileges, setPrivileges] = useState<PrivilegeTreeNode[]>([])

  useEffect(() => {
    retrievePrivilegeTree().then(res => {
      if (res) {
        setPrivileges(res);
      }
    })
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[50px] px-5 flex items-center gap-2">
        <h1 className="text-xl mr-auto">Leafage UI</h1>
        <div className="inline-flex items-center gap-2">
          <IconButton>
            <DarkModeOutlined />
          </IconButton>
          <IconButton>
            <TranslateOutlined />
          </IconButton>
          <IconButton>
            <HelpOutline />
          </IconButton>
          <div className="flex items-center gap-2">
            <Avatar sx={{ width: 28, height: 28 }}>AE</Avatar>
            <span className="font-bold text-bluegray-50">Amy Elsner</span>
          </div>
        </div>
      </header>

      <aside className="w-64 fixed top-[50px]">
        <List sx={{ width: '100%', maxWidth: 256 }} component="nav">
          {privileges.map((node) => (<EssentialList key={node.id} node={node} />))}
        </List>
      </aside>

      <main className="ml-64 mt-[50px] p-5 bg-gray-100">
        <Outlet />
      </main>

      <footer className="bg-[var(--secondry-color)] ml-64 h-14 p-5 text-center">
        <span>sssssssssss</span>
      </footer>
    </>
  )
}

export default MainLayout
