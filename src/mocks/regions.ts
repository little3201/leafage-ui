import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Region } from 'src/types'

const datas: Region[] = []

for (let i = 1; i < 99; i++) {
  const superiorId = Math.floor(Math.random() * 34) || null
  const data: Region = {
    id: i,
    superiorId: i > 33 ? superiorId : null,
    name: 'Region_' + i,
    areaCode: Math.floor(Math.random() * 100),
    postalCode: Math.floor(Math.random() * 3000),
    enabled: i % 3 > 0,
    count: i > 33 ? 0 : Math.floor(Math.random() * 5) + 1,
    description: 'This is region description about xxx'
  }
  datas.push(data)
}

export const regionsHandlers = [
  http.get(`/api${SERVER_URL.REGION}/subset`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const id = searchParams.get('id')
    if (id) {
      return HttpResponse.json(datas.filter(item => item.superiorId === Number(id)))
    } else {
      return HttpResponse.json(datas.filter(item => item.superiorId === null))
    }
  }),
  http.get(`/api${SERVER_URL.REGION}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.find(item => item.id === Number(id)))
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.REGION}`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page')
    const size = url.searchParams.get('size')
    // Construct a JSON response with the list of all Row
    // as the response body.
    let filtered: Region[] = []
    const filter = searchParams.get('filters')
    if (filter) {
      const filterPairs = filter.split('&')
      let superiorId: string | null = null
      filterPairs.forEach(pair => {
        const [key, operator, value] = pair.split(':')
        if (key === 'superiorId' && value) {
          superiorId = value
          if (operator == 'eq') {
            filtered = datas.filter(item => item.superiorId === Number(superiorId))
          }
        }
      })
    } else {
      filtered = datas
    }
    const data = {
      content: Array.from(filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      page: {
        totalElements: filtered.length
      }
    }

    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.REGION}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.REGION}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Region

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.REGION}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Region

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.REGION}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.REGION}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params

    // Let's attempt to grab the Dictionary by its ID.
    const deletedData = datas.filter(item => item.id === Number(id))

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!deletedData) {
      return new HttpResponse(null, { status: 404 })
    }

    // Delete the Dictionary from the "allRow" map.
    datas.pop()

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json()
  })
]
