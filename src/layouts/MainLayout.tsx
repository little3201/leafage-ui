import React from 'react'
import { Outlet } from "react-router"
import { Button } from 'primereact/button'
import { Toolbar } from 'primereact/toolbar';
import { Avatar } from 'primereact/avatar'
import EssentialList from "components/EssentialList"
import { EssentialProvider } from 'src/components/context/EssentialContext'


function MainLayout() {
  const startContent = (
    <React.Fragment>
      <h1 className="text-xl">Leafage UI</h1>
    </React.Fragment>
  )
  const endContent = (
    <React.Fragment>
      <Button icon="pi pi-sun" rounded text aria-label="Mode" />
      <Button icon="pi pi-language" rounded text severity="secondary" aria-label="Language" />
      <Button icon="pi pi-question-circle" rounded text severity="success" aria-label="Question" />
      <div className="flex items-center gap-2">
        <Avatar image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" shape="circle" />
        <span className="font-bold text-bluegray-50">Amy Elsner</span>
      </div>
    </React.Fragment>
  )

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[50px]">
        <Toolbar start={startContent} end={endContent} className='!bg-transparent !py-0 !gap-0 !rounded-none' />
      </header>

      <aside className="w-64 fixed top-[50px]">
        <EssentialProvider>
          <EssentialList />
        </EssentialProvider>
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
