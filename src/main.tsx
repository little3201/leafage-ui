import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router/dom"
import { PrimeReactProvider } from "primereact/api"
import { router } from './router'
// primreact css
import "primeicons/primeicons.css"

// mock
import { worker } from 'boot/msw-browser'
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass'
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider>
      <RouterProvider router={router} />
    </PrimeReactProvider>
  </StrictMode>,
)
