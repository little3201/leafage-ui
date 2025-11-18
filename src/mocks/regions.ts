import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Region } from 'src/types'

const datas: Region[] = []
const subDatas: Region[] = []

for (let i = 1; i < 34; i++) {
  const data: Region = {
    id: i,
    name: 'region_' + i,
    areaCode: Math.floor(Math.random() * 100),
    postalCode: Math.floor(Math.random() * 3000),
    enabled: i % 3 > 0,
    description: 'This is region description about xxx'
  }
  for (let j = 1; j < i; j++) {
    const subData: Region = {
      id: 100 + j,
      name: 'region_' + i + '_' + j,
      superiorId: i,
      areaCode: Math.floor(Math.random() * 1000),
      postalCode: Math.floor(Math.random() * 3000) + j * 100,
      enabled: j % 2 > 0,
      description: 'This is region description about xxx'
    }
    subDatas.push(subData)
  }
  datas.push(data)
}

export const regionsHandlers = [
  http.get(`/api${SERVER_URL.REGION}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      let res = datas.filter(item => item.id === Number(id))[0]
      if (!res) {
        res = subDatas.filter(item => item.id === Number(id))[0]
      }
      return HttpResponse.json(res)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.REGION}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    // Construct a JSON response with the list of all Row
    // as the response body.
    let filtered = []
    const superiorId = searchParams.get('superiorId')
    if (superiorId) {
      filtered = subDatas.filter(item => item.superiorId === Number(superiorId))
    } else {
      filtered = datas
    }
    const data = {
      content: Array.from(filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      page: {
        totalElements: datas.length
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
  http.patch(`/api${SERVER_URL.REGION}/:id`, async ({ params }) => {
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
