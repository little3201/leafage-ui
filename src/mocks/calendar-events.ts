import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Schedule } from 'src/types'

const datas: Record<string, Schedule[]> = {}

const today = new Date()
for (let i = 1; i < Math.floor(Math.random() * 30); i++) {
  const day = new Date(today.getTime() + i * 86400000)

  const schedules: Schedule[] = []
  for (let j = 1; j < Math.floor(Math.random() * 5); j++) {
    const event: Schedule = {
      id: j,
      title: ['公司年会', '部门团建', '产品发布', '法定节假日', '双十一大促', '系统维护'][Math.floor(Math.random() * 6)] || '今日事件',
      startDate: day.toISOString().split('T')[0] || '',
      endDate: new Date(today.getTime() + Math.random() * 7 * 86400000).toISOString().split('T')[0] || '',
      type: ['primary', 'success', 'warning', 'danger'][Math.floor(Math.random() * 4)] || 'primary',
    }
    schedules.push(event)
  }

  datas[day.getDate()] = schedules
}

export const calendarEventHandlers = [
  http.get(`/api${SERVER_URL.CALENDAR_EVENT}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const res = {
        title: '法定假期',
        startDate: new Date().toISOString().split('T')[0] || '',
        endDate: new Date(Date.now() + Math.random() * 7 * 86400000).toISOString().split('T')[0] || '',
        type: 'primary'
      }
      return HttpResponse.json(res)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.CALENDAR_EVENT}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const month = searchParams.get('month')
    if (!month) {
      return HttpResponse.json([])
    }
    // Construct a JSON response with the list of all Row
    // as the response body.

    return HttpResponse.json(datas)
  }),
  http.post(`/api${SERVER_URL.CALENDAR_EVENT}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Schedule

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.CALENDAR_EVENT}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Schedule

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.delete(`/api${SERVER_URL.CALENDAR_EVENT}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!id) {
      return new HttpResponse(null, { status: 404 })
    }

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json()
  })
]
