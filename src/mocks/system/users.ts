import type { Filter, User } from 'src/types'
import { http, HttpResponse } from 'msw'
import { SERVER_URL, userStatus } from 'src/constants'
import { applyFilters } from '../util'

const statusKeys = Object.keys(userStatus) as Array<keyof typeof userStatus>
const datas: User[] = []

for (let i = 1; i < 28; i++) {
  const row: User = {
    id: i,
    username: 'username' + i,
    fullName: 'name_' + i,
    email: 'usexxx' + '@test.com',
    status: (statusKeys[Math.floor(Math.random() * statusKeys.length)]) as string,
    enabled: i % 2 > 0,
  }
  datas.push(row)
}

export const usersHandlers = [
  http.get(`/api${SERVER_URL.USERINFO}`, () => {
    return HttpResponse.json({
      sub: 'username',
    })
  }),
  http.get(`/api${SERVER_URL.USER}/me`, () => {
    return HttpResponse.json({
      id: 1,
      enabled: true,
      lastModifiedDate: null,
      username: 'admin',
      fullname: '勒布朗 詹姆斯 雷蒙',
      avatar: '/svgs/logo.svg',
      email: 'test@test.com',
      accountExpiresAt: null,
      accountNonLocked: true,
      credentialsExpiresAt: null,
    })
  }),
  http.get(`/api${SERVER_URL.USER}/:id`, ({ params }) => {
    const { id } = params
    return id ? HttpResponse.json(datas.find(item => item.id === Number(id))) : HttpResponse.json()
  }),
  http.get(`/api${SERVER_URL.USER}`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page')
    const size = url.searchParams.get('size')

    const filtersStr = url.searchParams.get('filters')

    const filters = filtersStr
      ? JSON.parse(filtersStr) as Filter<User>
      : undefined

    const filtered = applyFilters(datas, filters)
    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      totalElements: filtered.length,
    }

    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.USER}/import`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return new HttpResponse('Missing document', { status: 400 })
    }

    if (!(file instanceof File)) {
      return new HttpResponse('Uploaded document is not a File', {
        status: 400,
      })
    }
    return HttpResponse.json()
  }),
  http.post(`/api${SERVER_URL.USER}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as User

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.USER}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as User

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return id && newData ? HttpResponse.json({ ...newData, id }, { status: 202 }) : HttpResponse.error()
  }),
  http.patch(`/api${SERVER_URL.USER}/:id`, ({ params }) => {
    const { id } = params
    return id ? HttpResponse.json() : HttpResponse.error()
  }),
  http.patch(`/api${SERVER_URL.USER}/privileges/:privilegeId`, async ({ params, request }) => {
    const data = await request.json()
    const { privilegeId } = params
    return privilegeId && data ? HttpResponse.json() : HttpResponse.error()
  }),
  http.delete(`/api${SERVER_URL.USER}/:username/privileges/:privilegeId`, ({ params }) => {
    const { username, privilegeId } = params
    return username && privilegeId ? HttpResponse.json() : HttpResponse.error()
  }),
  http.delete(`/api${SERVER_URL.USER}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params

    // Let's attempt to grab the Row by its ID.
    const deletedData = datas.filter(item => item.id === Number(id))

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!deletedData) {
      return new HttpResponse(null, { status: 404 })
    }

    // Delete the Row from the "allRow" map.
    datas.pop()

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json(deletedData)
  }),
]
