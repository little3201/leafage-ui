import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Fragment } from 'src/types'
import { dealFilters } from 'src/utils'

const datas: Fragment[] = []

for (let i = 1; i < 29; i++) {
  const row: Fragment = {
    id: i,
    name: 'name_' + i,
    language: ['java', 'vue', 'ts'][Math.floor(Math.random() * 3)] || '',
    body: 'body',
    version: 1,
    enabled: true,
    lastModifiedDate: new Date()
  }
  datas.push(row)
}

export const fragmentsHandlers = [
  http.get(`/api${SERVER_URL.FRAGMENT}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.filter(item => item.id === Number(id))[0]
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.FRAGMENT}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    const filters = searchParams.get('filters')
    // Construct a JSON response with the list of all Row
    // as the response body.
    let language: string | null = null
    let filtered = datas
    if (filters) {
      const filter = dealFilters(filters) as { language?: string } | null
      // 更好的类型检查方式
      if (filter?.language) {
        language = filter.language
        filtered = datas.filter(item => item.language === language?.substring(language.lastIndexOf(':') + 1))
      }
    }
    const data = {
      content: filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      page: {
        totalElements: filtered.length
      }
    }

    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.FRAGMENT}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.FRAGMENT}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Fragment

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.FRAGMENT}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Fragment

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.FRAGMENT}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.FRAGMENT}/:id`, ({ params }) => {
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
