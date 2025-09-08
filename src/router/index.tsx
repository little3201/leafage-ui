import { lazy } from 'react'
import { createBrowserRouter } from "react-router"
import MainLayout from "../layouts/MainLayout"
import Login from "../pages/Login"

const Index = lazy(() => import('../pages/Index'))
const Users = lazy(() => import('../pages/system/users/Index'))

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: Index
      },
      {
        path: "system",
        children: [
          {
            path: "users",
            element: <Users />
          }
        ]
      }
    ]
  },
  {
    path: "/login",
    Component: Login
  }
])
