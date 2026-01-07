import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Dictionary } from 'src/types'

const datas: Dictionary[] = [
  {
    'name': '操作按钮',
    'enabled': true,
    'id': 100
  },
  {
    'name': '属性类型',
    'enabled': true,
    'id': 200
  },
  {
    'name': '表单类型',
    'enabled': true,
    'id': 300
  },
  {
    'name': 'ts类型',
    'enabled': true,
    'id': 400
  },
  {
    'name': '文件类型',
    'enabled': true,
    'id': 500
  },
  {
    'name': '脚本类型',
    'enabled': true,
    'id': 600
  },
  {
    'name': '模板类别',
    'enabled': true,
    'id': 700
  }
]

const subDatas: Dictionary[] = [
  {
    'name': 'create',
    'superiorId': 100,
    'description': '新增',
    'enabled': true,
    'id': 101
  },
  {
    'name': 'modify',
    'superiorId': 100,
    'description': '修改',
    'enabled': true,
    'id': 102
  },
  {
    'name': 'remove',
    'superiorId': 100,
    'description': '删除',
    'enabled': true,
    'id': 103
  },
  {
    'name': 'import',
    'superiorId': 100,
    'description': '导入',
    'enabled': true,
    'id': 104
  },
  {
    'name': 'export',
    'superiorId': 100,
    'description': '导出',
    'enabled': true,
    'id': 105
  },
  {
    'name': 'upload',
    'superiorId': 100,
    'description': '上传',
    'enabled': true,
    'id': 106
  },
  {
    'name': 'download',
    'superiorId': 100,
    'description': '下载',
    'enabled': true,
    'id': 107
  },
  {
    'name': 'relation',
    'superiorId': 100,
    'description': '关联',
    'enabled': true,
    'id': 108
  },
  {
    'name': 'enable',
    'superiorId': 100,
    'description': '启用',
    'enabled': true,
    'id': 109
  },
  {
    'name': 'config',
    'superiorId': 100,
    'description': '配置',
    'enabled': true,
    'id': 110
  },
  {
    'name': 'execute',
    'superiorId': 100,
    'description': '执行',
    'enabled': true,
    'id': 111
  },
  {
    'name': 'clear',
    'superiorId': 100,
    'description': '清空',
    'enabled': true,
    'id': 112
  },
  {
    'name': 'unlock',
    'superiorId': 100,
    'description': '解锁',
    'enabled': true,
    'id': 113
  },
  {
    'name': 'authorize',
    'superiorId': 100,
    'description': '授权',
    'enabled': true,
    'id': 114
  },
  {
    'name': 'sync',
    'superiorId': 100,
    'description': '同步',
    'enabled': true,
    'id': 115
  },
  {
    'name': 'String',
    'superiorId': 200,
    'enabled': true,
    'id': 201
  },
  {
    'name': 'Long',
    'superiorId': 200,
    'enabled': true,
    'id': 202
  },
  {
    'name': 'Instant',
    'superiorId': 200,
    'enabled': true,
    'id': 203
  },
  {
    'name': 'Integer',
    'superiorId': 200,
    'enabled': true,
    'id': 204
  },
  {
    'name': 'boolean',
    'superiorId': 200,
    'enabled': true,
    'id': 205
  },
  {
    'name': 'BigDecimal',
    'superiorId': 200,
    'enabled': true,
    'id': 206
  },
  {
    'name': 'input',
    'superiorId': 300,
    'enabled': true,
    'id': 301
  },
  {
    'name': 'select',
    'superiorId': 300,
    'enabled': true,
    'id': 302
  },
  {
    'name': 'input-number',
    'superiorId': 300,
    'enabled': true,
    'id': 303
  },
  {
    'name': 'date-picker',
    'superiorId': 300,
    'enabled': true,
    'id': 304
  },
  {
    'name': 'number',
    'superiorId': 400,
    'enabled': true,
    'id': 401
  },
  {
    'name': 'string',
    'superiorId': 400,
    'enabled': true,
    'id': 402
  },
  {
    'name': 'boolean',
    'superiorId': 400,
    'enabled': true,
    'id': 403
  },
  {
    'name': '.java',
    'superiorId': 500,
    'description': '数据库',
    'enabled': true,
    'id': 501
  },
  {
    'name': '.ts',
    'superiorId': 500,
    'description': '中间件',
    'enabled': true,
    'id': 502
  },
  {
    'name': '.vue',
    'superiorId': 500,
    'description': '中间件',
    'enabled': true,
    'id': 503
  },
  {
    'name': 'Database',
    'superiorId': 600,
    'description': '数据库',
    'enabled': true,
    'id': 601
  },
  {
    'name': 'Middleware',
    'superiorId': 600,
    'description': '中间件',
    'enabled': true,
    'id': 602
  },
  {
    'name': 'frontend',
    'superiorId': 700,
    'enabled': false,
    'id': 710
  },
  {
    'name': 'backend',
    'superiorId': 700,
    'enabled': false,
    'id': 720
  },
  {
    'name': 'resources',
    'superiorId': 700,
    'enabled': false,
    'id': 730
  },
  {
    'name': 'api',
    'superiorId': 710,
    'enabled': true,
    'id': 711
  },
  {
    'name': 'types',
    'superiorId': 710,
    'enabled': true,
    'id': 712
  },
  {
    'name': 'service',
    'superiorId': 720,
    'enabled': true,
    'id': 721
  },
  {
    'name': 'repository',
    'superiorId': 720,
    'enabled': true,
    'id': 723
  },
  {
    'name': 'controller',
    'superiorId': 720,
    'enabled': true,
    'id': 723
  },
  {
    'name': 'model',
    'superiorId': 720,
    'enabled': true,
    'id': 724
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
  http.get(`/api${SERVER_URL.DICTIONARY}/:id/subset`, ({ params }) => {
    const { id } = params
    return HttpResponse.json(subDatas.filter(item => item.superiorId === Number(id)))
  }),
  http.get(`/api${SERVER_URL.DICTIONARY}`, ({ request }) => {
    const url = new URL(request.url)

    const page = url.searchParams.get('page')
    const size = url.searchParams.get('size')

    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: Array.from(datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      totalElements: datas.length
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
