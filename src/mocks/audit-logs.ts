import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { AuditLog } from 'src/types'


const datas: AuditLog[] = []

for (let i = 1; i < 28; i++) {
  const row: AuditLog = {
    id: i,
    action: 'modify',
    resource: 'Settings',
    oldValue: '{"theme:"light"}',
    newValue: '{"theme:"dark"}',
    ip: '192.168.0.4',
    statusCode: 200,
    duration: 12121
  }
  datas.push(row)
}

export const auditLogsHandlers = [
  http.get(`/api${SERVER_URL.AUDIT_LOG}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.filter(item => item.id === Number(id))[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.AUDIT_LOG}`, ({ request }) => {
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
  http.delete(`/api${SERVER_URL.AUDIT_LOG}/:id`, ({ params }) => {
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

    // Remove the Row from the "allRow" map.
    datas.pop()

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json()
  })
]
