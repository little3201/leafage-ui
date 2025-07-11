import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import { getRandomString, generateVerifier, computeChallenge } from 'src/utils'


const client_id = process.env.CLIENT_ID

export async function signIn() {
  const state = getRandomString(16)
  const codeVerifier = generateVerifier()
  // 存储code_verifier
  localStorage.setItem('code_verifier', codeVerifier)
  const codeChallenge = await computeChallenge(codeVerifier)

  const params = new URLSearchParams({
    client_id: `${client_id}`,
    redirect_uri: `${window.location.origin}/callback`,
    state: state,
    scope: 'openid profile',
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })

  api.get(SERVER_URL.AUTHORIZE, { params }).then(res => {
    window.location.replace(res.request.responseURL)
  }).catch(error => {
    if (error) {
      window.location.replace('/login')
    }
  })
}

export function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  if (!code) {
    signIn()
    throw Error('cannot get code!')
  }
  const state = urlParams.get('state')
  if (!state) {
    throw Error('cannot get state!')
  }

  const codeVerifier = localStorage.getItem('code_verifier')
  if (!codeVerifier) {
    signIn()
    throw Error('code_verifier not getted!')
  }

  const params = new URLSearchParams({
    client_id: `${client_id}`,
    redirect_uri: `${window.location.origin}/callback`,
    state: state,
    code: code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code'
  })
  // Exchange authorization code for access token
  return api.post(SERVER_URL.TOKEN, params)
}

export function getSub() {
  return api.get(SERVER_URL.USERINFO)
}

export function signOut(idToken: string) {
  const params = new URLSearchParams({
    id_token_hint: idToken,
    client_id: `${client_id}`,
    post_logout_redirect_uri: `${window.location.origin}`
  })

  api.post(SERVER_URL.LOGOUT, params).then(res => {
    window.location.replace(res.request.responseURL)
  })
}