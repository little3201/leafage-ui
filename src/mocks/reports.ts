import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Report } from 'src/types'

const datas: Report[] = []

for (let i = 1; i < 28; i++) {
  const row: Report = {
    id: i,
    title: 'This is title_' + i,
    summary: 'This is summary_' + i,
    schemaId: Math.floor(Math.random() * 10) + 1,
    version: Math.floor(Math.random() * 10) + 1,
    status: ['DRAFT', 'PUBLISHED', 'ARCHIVED'][Math.floor(Math.random() * 3)] || 'unknown',
    lastModifiedDate: new Date()
  }
  datas.push(row)
}

export const reportsHandlers = [
  http.get(`/api${SERVER_URL.REPORT}/:id/preview`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.find(item => item.id === Number(id)))
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.REPORT}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.find(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.REPORT}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')

    const data = {
      content: datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      page: {
        totalElements: datas.length
      }
    }
    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.REPORT}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.REPORT}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Report

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.REPORT}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Report

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.REPORT}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.REPORT}/:id`, ({ params }) => {
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
