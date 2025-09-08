import { Outlet } from "react-router"
import EssentialList from "src/components/EssentialList"
import { items } from "../mocks/privileges"

function MainLayout() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[var(--primary-color)] h-14">
        <div className="flex items-center">
          <span className="py-3">Title</span>
        </div>
      </header>
      <aside className="w-64 fixed top-14">
        <EssentialList items={items} />
      </aside>
      <main className="ml-64 mt-14 p-5 bg-gray-100">
        <Outlet />
      </main>
      <footer className="bg-[var(--secondry-color)] ml-64 h-14 p-5 text-center">
        <span>sssssssssss</span>
      </footer>
    </>
  )
}

export default MainLayout
