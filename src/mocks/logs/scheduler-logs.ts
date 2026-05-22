import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { SchedulerLog } from 'src/types'
import { applyFilters } from '../util'

const datas: SchedulerLog[] = [
]

for (let i = 1; i < 28; i++) {
  const row: SchedulerLog = {
    id: i,
    name: 'DailyBackup',
    startTime: new Date(),
    nextExecuteTime: new Date(),
    status: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED'][Math.floor(Math.random() * 5)] || '',
  }
  datas.push(row)
}

export const schedulerLogsHandlers = [
  http.get(`/api${SERVER_URL.SCHEDULER_LOG}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.find(item => item.id === Number(id)))
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEDULER_LOG}`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page')
    const size = url.searchParams.get('size')

    const filtersStr = url.searchParams.get('filters')
    const filtered = applyFilters(datas, filtersStr)

    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      totalElements: filtered.length
    }

    return HttpResponse.json(data)
  }),
  http.delete(`/api${SERVER_URL.SCHEDULER_LOG}/:id`, ({ params }) => {
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
  })
]
