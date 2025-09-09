import { Outlet } from "react-router"
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'
import EssentialList from "components/EssentialList"


function MainLayout() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[50px] px-5 flex items-center gap-2">
        <h1 className="text-xl mr-auto">Leafage UI</h1>
        <div className="inline-flex items-center gap-2">
          <Button icon="pi pi-moon" rounded text aria-label="Filter" />
          <Button icon="pi pi-language" rounded text severity="secondary" aria-label="Bookmark" />
          <Button icon="pi pi-question-circle" rounded text severity="success" aria-label="Search" />
          <div className="flex items-center gap-2">
            <Avatar label="AE" style={{ backgroundColor: '#9c27b0', color: '#ffffff' }} shape="circle" />
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
