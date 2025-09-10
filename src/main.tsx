import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


// mock
import { worker } from 'boot/msw-browser'
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass'
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
