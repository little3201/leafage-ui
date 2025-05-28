import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'


export const authenticationHandlers = [
  http.get(`/api${SERVER_URL.USERINFO}`, () => {
    return HttpResponse.json({
      sub: 'admin'
    })
  }),

  http.get(`/api${SERVER_URL.AUTHORIZE}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const state = searchParams.get('state')
    const code = 'Y0nE-MYHtJ2qwAV0oOCrqAP9AGCxRyEjfjtJUgZB1odj18MpIG1LjvC9la5wrr1DV5GlvEHYqpBkr2igSJJWrGx_9pOiddOzeM8D4Lmkk0IQIrvnsf-U14I3e_IRAs8T'

    return new HttpResponse(null, {
      status: 302,
      headers: {
        Location: `/callback?code=${code}&state=${state}`,
      },
    })
  }),

  http.post(`/api${SERVER_URL.TOKEN}`, () => {
    return HttpResponse.json({
      access_token: 'eyJraWQiOiI5MGQ4ZWNhYy1iOGNhLTRiNTItYjc4Zi1lZjEzOWQ0ZTQyMzQiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZFlMSJ9.bUGGupnt_1qYJxEseovj6KjA',
      expires_in: 300,
      id_token: 'eyJraWQiOiI5MGQ4ZWNhYy1iOGNhLTRiNTItYjc4Zi1lZjEzOWQ0ZTQyMzQiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZFlMSJ9.bUGGupnt_1qYJxEseovj6KjA',
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
