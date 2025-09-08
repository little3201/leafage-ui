import {http, HttpResponse } from 'msw'
import type { Group } from 'src/types'

const datas: Group[] = []

for (let i = 1; i < 28; i++) {
  const row: Group = {
    id: i,
    name: 'username' + i,
    description: ''
  }
  datas.push(row)
}


export const groupsHandlers = [
  http.get('/api/groups', ({ request }) => {
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