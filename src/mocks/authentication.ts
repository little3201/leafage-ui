import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'


export const authenticationHandlers = [
  http.get(`/api${SERVER_URL.USERINFO}`, () => {
    return HttpResponse.json({
      sub: 'admin'
    })
  }),

  http.get(`/api${SERVER_URL.AUTHORIZE}`, ({ request }) => {
    const url = new URL(request.url)
    const state = url.searchParams.get('state')
    const code = 'Y0n'

    return new HttpResponse(null, {
      status: 302,
      headers: {
        Location: `/callback?code=${code}&state=${state}`,
      },
    })
  }),

  http.post(`/api${SERVER_URL.TOKEN}`, () => {
    return HttpResponse.json({
      access_token: 'eyJraWQi',
      expires_in: 300,
      id_token: 'eyJraWQiOi',
      scope: 'openid profile',
      token_type: 'Bearer'
    })
  }),

  http.post(`/api${SERVER_URL.LOGOUT}`, () => {
    localStorage.setItem('logged_in', 'false')
    return new HttpResponse(null, {
      status: 302,
      headers: {
        Location: '/login',
      },
    })
  })
]
