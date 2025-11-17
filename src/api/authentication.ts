import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

export function signIn() {
  window.location.href = BACKEND_URL
}

export function authorize() {
  window.location.href = BACKEND_URL + '/oauth2/authorization/web-client-authorization-code'
}

export async function getUserInfo() {
  return api.get(SERVER_URL.USERINFO)
}

export async function signOut() {
  return api.post(SERVER_URL.LOGOUT, null)
}