import { lazy } from 'react'
import { createBrowserRouter } from "react-router"
import MainLayout from "../layouts/MainLayout"
import Login from "../pages/Login"



export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: lazy(() => import('../pages/Index'))
      },
      {
        path: "system",
        children: [
          {
            path: "users",
            Component: lazy(() => import('../pages/system/users/Index'))
          },
          {
            path: "groups",
            Component: lazy(() => import('../pages/system/groups/Index'))
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
