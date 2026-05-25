import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Template } from 'src/types'
import { applyFilters } from '../util'

const datas: Template[] = []

for (let i = 1; i < 28; i++) {
  const row: Template = {
    id: i,
    name: 'Name_' + i,
    type: (['WORD', 'EXCEL'] as const)[Math.floor(Math.random() * 2)] as 'WORD' | 'EXCEL',
    version: Math.floor(Math.random() * 3) + 1,
    status: ['DRAFT', 'PUBLISHED', 'ARCHIVED'][Math.floor(Math.random() * 3)] || 'unknown',
    description: 'this is description about xxx',
    lastModifiedDate: new Date()
  }
  datas.push(row)
}


export const schemasHandlers = [
  http.get(`/api${SERVER_URL.TEMPLATE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.find(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.TEMPLATE}`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page')
    const size = url.searchParams.get('size')

    const filtersStr = url.searchParams.get('filters')
    const filtered = applyFilters(datas, filtersStr)

    const data = {
      content: filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      page: {
        totalElements: filtered.length
      }
    }
    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.TEMPLATE}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.TEMPLATE}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Template

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.TEMPLATE}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Template

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.TEMPLATE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.TEMPLATE}/:id`, ({ params }) => {
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