import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Archive, Section } from 'src/types'
import { applyFilters } from '../util'

const datas: Archive[] = []

for (let i = 1; i < 28; i++) {
  const row: Archive = {
    id: i,
    title: 'Title_' + i,
    owner: 'Owner_Name_' + i,
    schemaId: Math.floor(Math.random() * 10) + 1,
    version: Math.floor(Math.random() * 3) + 1,
    lastModifiedDate: new Date()
  }
  datas.push(row)
}

const sections: Section[] = []

for (let i = 1; i < 28; i++) {
  const row: Section = {
    id: i,
    name: 'Section_' + i,
    superiorId: Math.floor(Math.random() * 27) + 1,
    ownerType: 'ARCHIVE',
    body: {
      'dataStream': '这里写的是内容，你知道吗？\n' + '这是第' + i + '行内容\r\n',
      'textRuns': [],
      'customBlocks': [],
      'tables': [],
      'paragraphs': [
        {
          'startIndex': 8,
          'paragraphStyle': {
            'spaceAbove': {
              'v': 5
            },
            'lineSpacing': 1,
            'spaceBelow': {
              'v': 0
            }
          }
        }
      ],
      'sectionBreaks': [
        {
          'startIndex': 9
        }
      ],
      'customRanges': [],
      'customDecorations': []
    },
    ownerId: Math.floor(Math.random() * 27) + 1
  }
  sections.push(row)
}

export const archivesHandlers = [
  http.get(`/api${SERVER_URL.ARCHIVE}/:id/sections`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(sections.filter(item => item.ownerId === Number(id)))
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.ARCHIVE}/:id/sections/:sectionId`, ({ params }) => {
    const { id, sectionId } = params
    if (id) {
      return HttpResponse.json(sections.find(item => item.ownerId === Number(id) && item.id === Number(sectionId)))
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.ARCHIVE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.find(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.ARCHIVE}`, ({ request }) => {
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
  http.post(`/api${SERVER_URL.ARCHIVE}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.ARCHIVE}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Archive

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.ARCHIVE}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Archive

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.ARCHIVE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.ARCHIVE}/:id`, ({ params }) => {
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
