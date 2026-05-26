import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Section, SectionData, SectionField, SectionTreeNode } from 'src/types'
import { applyFilters } from '../util'

const datas: Section[] = []

for (let i = 1; i < 28; i++) {
  const superiorId = Math.floor(Math.random() * 5)
  const row: Section = {
    id: i,
    superiorId: superiorId || null,
    name: 'Title_' + i,
    body: 'This is body content about xxx',
    ownerId: Math.floor(Math.random() * 10) || null,
    ownerType: ['REPORT', 'TEMPLATE'][Math.floor(Math.random() * 2)] || null,
    sequence: i,
    count: Math.floor(Math.random() * 2) || 0
  }
  datas.push(row)
}

const fields: SectionField[] = []
const sectionfields = new Map<number, SectionField[]>()

for (let i = 1; i < 28; i++) {
  const sectionId = Math.floor(Math.random() * 28)
  const row: SectionField = {
    id: i,
    sectionId: sectionId,
    name: 'name_' + i,
    type: ['STRING', 'NUMBER', 'DATE'][Math.floor(Math.random() * 3)],
    field: 'field_' + i,
    length: Math.floor(Math.random() * 10) + 1,
    required: Math.random() < 0.5
  }
  fields.push(row)

  if (!sectionfields.has(sectionId)) {
    sectionfields.set(sectionId, [])
  }
  sectionfields.get(sectionId)?.push(row)
}

function generateRandomValue(type: string, length?: number) {
  switch (type) {
    case 'STRING': {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      const len = length || 10
      for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }
    case 'NUMBER':
      return Math.floor(Math.random() * 1000)
    case 'DATE':
      return new Date(2020 + Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1).toISOString()
    default:
      return null
  }
}

const sectionDatas: SectionData[] = []
const uniqueSectionIds = [...new Set(fields.map(field => field.sectionId).filter((id): id is number => id !== null))]

for (const sectionId of uniqueSectionIds) {
  const sectionField = sectionfields.get(sectionId) || []

  // 为当前sectionId创建一个data对象，包含其所有字段的随机数据
  const dataObj: Record<string, unknown> = {}
  for (const field of sectionField) {
    // 使用field属性作为data对象的属性名，根据type生成相应的随机值
    dataObj[field.field] = generateRandomValue(field.type, field.length)
  }

  const row: SectionData = {
    id: sectionId,
    sectionId: sectionId,
    data: dataObj
  }
  sectionDatas.push(row)
}

export const sectionsHandlers = [
  http.get(`/api${SERVER_URL.SECTION}/subset`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const id = searchParams.get('id')
    if (id) {
      return HttpResponse.json(datas.filter(item => item.superiorId === Number(id)))
    } else {
      return HttpResponse.json(datas.filter(item => item.superiorId === null))
    }
  }),
  http.get(`/api${SERVER_URL.SECTION}/:id/fields`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = fields.filter(item => item.sectionId === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SECTION}/:id/datas`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = sectionDatas.filter(item => item.sectionId === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SECTION}/:id/tree`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.filter(item => item.superiorId === null).map(item => {
        const node: SectionTreeNode = {
          id: item.id,
          name: item.name,
          meta: {
            sequence: item.sequence ?? 0
          },
          children: []
        }
        return node
      })
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SECTION}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.find(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SECTION}`, ({ request }) => {
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
  http.post(`/api${SERVER_URL.SECTION}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.SECTION}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Section

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.SECTION}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Section

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.SECTION}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.SECTION}/:id`, ({ params }) => {
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
