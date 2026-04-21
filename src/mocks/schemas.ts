import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Schema, SchemaSection } from 'src/types'

const datas: Schema[] = []

for (let i = 1; i < 28; i++) {
  const row: Schema = {
    id: i,
    name: 'Name_' + i,
    type: ['WORD', 'EXCEL'][Math.floor(Math.random() * 2)],
    version: Math.floor(Math.random() * 3) + 1,
    status: ['DRAFT', 'PUBLISHED', 'ARCHIVED'][Math.floor(Math.random() * 3)] || 'unknown',
    description: 'this is description about xxx',
    lastModifiedDate: new Date()
  }
  datas.push(row)
}

const sections: SchemaSection[] = []

for (let i = 1; i < 28; i++) {
  const row: SchemaSection = {
    id: i,
    name: 'Section_' + i,
    superiorId: Math.floor(Math.random() * 7) || null,
    type: ['HEADING', 'PARAGRAPH', 'TABLE', 'IMAGE'][Math.floor(Math.random() * 4)] || 'unknown',
    body: 'This is body of section ' + i,
    schemaId: Math.floor(Math.random() * 7) + 1
  }
  sections.push(row)
}


export const schemasHandlers = [
  http.get(`/api${SERVER_URL.SCHEMA}/:id/sections/subset`, ({ params, request }) => {
    const { id } = params
    const searchParams = new URL(request.url).searchParams
    const superiorId = searchParams.get('superiorId')
    if (id) {
      const filtered = sections.filter(item => item.schemaId === Number(id))
      if (superiorId) {
        return HttpResponse.json(filtered.filter(item => item.superiorId === Number(superiorId)))
      } else {
        return HttpResponse.json(filtered.filter(item => item.superiorId === null))
      }
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEMA}/:id/sections`, ({ params, request }) => {
    const { id } = params
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    const filters = searchParams.get('filters')

    let filtered = sections.filter(item => item.schemaId === Number(id))
    if (filters) {
      const filterPairs = filters.split('&')
      let superiorId: number | null = null
      filterPairs.forEach(pair => {
        const [key, operator, value] = pair.split(':')
        if (key === 'superiorId' && value) {
          superiorId = Number(value)
          if (operator == 'eq') {
            filtered = sections.filter(item => { return item.superiorId === superiorId })
          }
        }
      })
    }

    const data = {
      content: filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      page: {
        totalElements: filtered.length
      }
    }

    return HttpResponse.json(data)
  }),
  http.get(`/api${SERVER_URL.SCHEMA}/:id/sections/:sectionId`, ({ params }) => {
    const { id, sectionId } = params
    if (id) {
      return HttpResponse.json(sections.find(item => item.schemaId === Number(id) && item.id === Number(sectionId)))
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEMA}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.find(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEMA}`, ({ request }) => {
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
  http.post(`/api${SERVER_URL.SCHEMA}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.SCHEMA}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Schema

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.SCHEMA}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Schema

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.SCHEMA}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.SCHEMA}/:id`, ({ params }) => {
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
