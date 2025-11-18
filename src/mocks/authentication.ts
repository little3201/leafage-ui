import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'


export const authenticationHandlers = [
  http.get(`/api${SERVER_URL.USERINFO}`, () => {
    return HttpResponse.json({
      sub: 'admin',
      name: 'Administrator'
    })
  }),

  http.post(`/api${SERVER_URL.LOGIN}`, () => {
    return HttpResponse.json()
  }),

  http.post(`/api${SERVER_URL.LOGOUT}`, () => {
    return new HttpResponse()
  })
]
