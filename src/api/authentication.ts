import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'


const BASE_URL = import.meta.env.VITE_BASE_URL || ''

export function signIn() {
  window.location.href = BASE_URL
}

export function authorize() {
  window.location.href = BASE_URL + '/oauth2/authorization/web-client-authorization-code'
}

export async function getUserInfo() {
  return api.get(SERVER_URL.USERINFO)
}

export async function signOut() {
  return api.post(SERVER_URL.LOGOUT, null)
}