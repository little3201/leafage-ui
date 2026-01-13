import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import { generateCodeChallenge, generateVerifier } from 'src/utils'


const CLIENT_ID = process.env.CLIENT_ID || ''
const REDIRECT_URI = `${globalThis.location.origin}/callback`

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

  try {
    const res = await api.get(SERVER_URL.AUTHORIZE, { params })
    globalThis.location.replace(res.request.responseURL)
  } catch {
    globalThis.location.replace('/login')
  }

}

export async function handleCallback() {
  const searchParams = new URLSearchParams(globalThis.location.search)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = localStorage.getItem('state')

  if (code && state === storedState) {
    const codeVerifier = localStorage.getItem('code_verifier')

    try {
      const res = await api.post(SERVER_URL.TOKEN, new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code,
        code_verifier: codeVerifier || '',
        grant_type: 'authorization_code'
      }))

      return res
    } catch {
      globalThis.location.replace('/login')
    } finally {
      localStorage.removeItem('code_verifier')
      localStorage.removeItem('state')
    }
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
    post_logout_redirect_uri: `${globalThis.location.origin}`
  })

  try {
    const res = await api.post(SERVER_URL.LOGOUT, params)
    globalThis.location.replace(res.request.responseURL)
  } catch {
    globalThis.location.replace('/login')
  }
}