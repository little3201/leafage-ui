import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Dictionary } from 'src/types'
import { applyFilters } from '../util'

const datas: Dictionary[] = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(item => {
  return {
    id: item,
    superiorId: null,
    name: 'name_' + item,
    enabled: true,
    description: 'This is region description about xxx',
    count: 1
  }
})

for (let i = 1; i < 28; i++) {
  const superiorId: number | null = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000][Math.floor(Math.random() * 10)] || null
  const row: Dictionary = {
    id: i,
    superiorId: superiorId,
    name: 'sub_name_' + i,
    enabled: true,
    description: 'This is region description about xxx'
  }
  datas.push(row)
}

export const dictionariesHandlers = [
  http.get(`/api${SERVER_URL.DICTIONARY}/subset`, ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (id) {
      return HttpResponse.json(datas.filter(item => item.superiorId === Number(id)))
    } else {
      return HttpResponse.json(datas.filter(item => item.superiorId === null))
    }
  }),
  http.get(`/api${SERVER_URL.DICTIONARY}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.filter(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.DICTIONARY}`, ({ request }) => {
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
  http.post(`/api${SERVER_URL.DICTIONARY}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.DICTIONARY}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Dictionary

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.DICTIONARY}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Dictionary

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.DICTIONARY}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete('/api/dictionaries/:id', ({ params }) => {
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

    // Delete the Dictionary from the "allDictionarys" map.
    datas.pop()

    // Respond with a "200 OK" response and the deleted Dictionary.
    return HttpResponse.json(deletedData)
  })
]
