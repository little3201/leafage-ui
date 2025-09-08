import { lazy } from 'react'
import { createBrowserRouter } from "react-router"
import MainLayout from "../layouts/MainLayout"
import Login from "../pages/Login"

const Index = lazy(() => import('../pages/Index'))
const User = lazy(() => import('../pages/system/users/Index'))
const Group = lazy(() => import('../pages/system/groups/Index'))

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
            element: <User />
          },
          {
            path: "groups",
            element: <Group />
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
