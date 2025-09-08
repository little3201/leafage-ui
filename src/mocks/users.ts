import {http, HttpResponse } from 'msw'
import type { User } from 'src/types'

const datas: User[] = []

for (let i = 1; i < 28; i++) {
  const row: User = {
    id: i,
    username: 'username' + i,
    fullname: '张三' + i,
    avatar: '',
    email: 'use***' + '@**t.com',
    accountNonLocked: i % 2 > 0,
    enabled: i % 2 > 0,
    accountExpiresAt: new Date(),
    credentialsExpiresAt: new Date()
  }
  datas.push(row)
}


export const usersHandlers = [
  http.get('/api/users', ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: Array.from(datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      page: {
        totalElements: datas.length
      }
    }

    return HttpResponse.json(data)
  }),
]