import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { SchedulerLog } from 'src/types'


const datas: SchedulerLog[] = [
]

for (let i = 1; i < 28; i++) {
  const row: SchedulerLog = {
    id: i,
    name: 'DailyBackup',
    startTime: new Date(),
    executedTimes: i % 3 > 0 ? undefined : Math.floor(Math.random() * 1000),
    nextExecuteTime: new Date(),
    status: i % 2 > 0 ? 'PENDING' : (i % 3 > 0 ? 'RUNNING' : i % 3 > 1 ? 'SUCCESS' : (i % 3 > 2 ? 'FAILED' : 'CANCELED')),
    record: i % 3 > 0 ? '' : '执行完成，无错误',
  }
  datas.push(row)
}


export const schedulerLogsHandlers = [
  http.get(`/api${SERVER_URL.SCHEDULER_LOG}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.filter(item => item.id === Number(id))[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEDULER_LOG}`, ({ request }) => {
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
    return HttpResponse.json()
  })
]
