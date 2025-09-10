import { Outlet } from "react-router"
import IconButton from '@mui/material/IconButton'
import AlarmIcon from '@mui/icons-material/Alarm'
import Avatar from '@mui/material/Avatar'
import EssentialList from "components/EssentialList"
import { deepPurple } from '@mui/material/colors'


function MainLayout() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[50px] px-5 flex items-center gap-2">
        <h1 className="text-xl mr-auto">Leafage UI</h1>
        <div className="inline-flex items-center gap-2">
          <IconButton aria-label="delete">
            <AlarmIcon />
          </IconButton>
          <div className="flex items-center gap-2">
            <Avatar sx={{ bgcolor: deepPurple[500] }}>AE</Avatar>
            <span className="font-bold text-bluegray-50">Amy Elsner</span>
          </div>
        </div>
      </header>

      <aside className="w-64 fixed top-[50px]">
        <EssentialList />
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
