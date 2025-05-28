import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Dictionary } from 'src/types'

const datas: Dictionary[] = [
  {
    name: '文件后缀',
    id: 29,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: '属性类型',
    description: 'Java属性类型',
    id: 1,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: '表单组件',
    description: 'Form表单组件',
    id: 13,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: '模板类型',
    description: '代码生成模板类型',
    id: 25,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: '操作按钮',
    id: 42,
    enabled: true
  }
]

const subDatas: Dictionary[] = [
  {
    name: 'Service',
    superiorId: 25,
    description: '包括Service和Service Implementation，用于业务逻辑处理。',
    id: 27,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'Controller',
    superiorId: 25,
    description: '定义API接口。',
    id: 59,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'Model',
    superiorId: 25,
    description: '包括Entity、DTO、BO和VO，用于定义数据模型。',
    id: 58,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'Repository',
    superiorId: 25,
    description: '包括Repository和Mapper，用于操作ORM和数据访问。',
    id: 26,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'UI',
    superiorId: 25,
    description: '用户界面。',
    id: 56,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'TS',
    superiorId: 25,
    description: 'TypeScript文件。',
    id: 57,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'create',
    superiorId: 42,
    id: 43,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'modify',
    superiorId: 42,
    id: 44,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'remove',
    superiorId: 42,
    id: 45,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'import',
    superiorId: 42,
    id: 50,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'export',
    superiorId: 42,
    id: 51,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'upload',
    superiorId: 42,
    id: 46,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'download',
    superiorId: 42,
    id: 47,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'config',
    superiorId: 42,
    id: 52,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'execute',
    superiorId: 42,
    id: 53,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'clear',
    superiorId: 42,
    id: 54,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'relation',
    superiorId: 42,
    description: '数据关联',
    id: 55,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'authorize',
    superiorId: 42,
    description: '授权',
    id: 56,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'Database',
    superiorId: 68,
    description: '数据库',
    id: 57,
    enabled: true,
    lastModifiedDate: new Date()
  },
  {
    name: 'Mmiddleware',
    superiorId: 68,
    description: '中间件',
    id: 58,
    enabled: true,
    lastModifiedDate: new Date()
  }
]

export const dictionariesHandlers = [
  http.get(`/api${SERVER_URL.DICTIONARY}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      let array = datas.filter(item => item.id === Number(id))
      if (array.length === 0) {
        array = subDatas.filter(item => item.id === Number(id))
      }
      return HttpResponse.json(array[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.DICTIONARY}/:id/exists`, ({ params }) => {
    const { id, name } = params
    let filtered = datas.filter(item => item.name === name)
    if (id) {
      filtered = datas.filter(item => item.name === name && item.id !== Number(id))
    }
    return HttpResponse.json(filtered.length > 0)
  }),
  http.get(`/api${SERVER_URL.DICTIONARY}/:id/subset`, ({ params }) => {
    const { id } = params
    return HttpResponse.json(subDatas.filter(item => item.superiorId === Number(id)))
  }),
  http.get(`/api${SERVER_URL.DICTIONARY}`, ({ request }) => {
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
  http.patch(`/api${SERVER_URL.DICTIONARY}/:id`, async ({ params }) => {
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
