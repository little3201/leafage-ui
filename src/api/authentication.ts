import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import { generateCodeChallenge, generateVerifier } from 'src/utils'


const CLIENT_ID = process.env.CLIENT_ID || ''
const REDIRECT_URI = `${window.location.origin}/callback`

export async function signIn() {
  const codeVerifier = generateVerifier()
  localStorage.setItem('code_verifier', codeVerifier)
  const state = Math.random().toString(36).substring(2)
  localStorage.setItem('state', state)

  const challenge = await generateCodeChallenge(codeVerifier)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: 'openid profile',
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256'
  })

  const res = await api.get(SERVER_URL.AUTHORIZE, { params })
  if (res && res.status === 200) {
    window.location.replace(res.request.responseURL)
  }
}

export async function handleCallback() {
  const searchParams = new URLSearchParams(window.location.search)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = localStorage.getItem('state')

  if (code && state === storedState) {
    const codeVerifier = localStorage.getItem('code_verifier')

    // Exchange authorization code for access token
    const res = await api.post(SERVER_URL.TOKEN, new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code: code,
      code_verifier: codeVerifier || '',
      grant_type: 'authorization_code'
    }))

    localStorage.removeItem('code_verifier')
    localStorage.removeItem('state')
    return res
  }
  return null
}

export function getUserInfo() {
  return api.get(SERVER_URL.USERINFO)
}

export async function signOut(idToken: string) {
  const params = new URLSearchParams({
    id_token_hint: idToken,
    client_id: CLIENT_ID,
    post_logout_redirect_uri: `${window.location.origin}`
  })

  const res = await api.post(SERVER_URL.LOGOUT, params)
  if (res && res.status === 200) {
    window.location.replace(res.request.responseURL)
  }
}