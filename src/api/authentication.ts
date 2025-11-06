import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'


export function signIn() {
  window.location.href = import.meta.env.VITE_BACKEND_URL
}

export function authorize() {
  if (window.location.pathname === '/oauth2/authorization/messaging-client-authorization-code') {
    return
  }
  window.location.href = import.meta.env.VITE_BACKEND_URL + '/oauth2/authorization/messaging-client-authorization-code'
}

export async function getUserInfo() {
  return api.get(SERVER_URL.USERINFO)
}

export async function signOut() {
  api.post(SERVER_URL.LOGOUT).then(res => {
    window.location.replace(res.request.responseURL)
  })
}