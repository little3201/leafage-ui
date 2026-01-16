import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Module, ModuleSample, Sample } from 'src/types'

const datas: Module[] = []

for (let i = 1; i < 20; i++) {
  const row: Module = {
    id: i,
    name: 'name_' + i,
    description: 'this is description.',
    version: 1,
    enabled: true,
    lastModifiedDate: new Date()
  }
  datas.push(row)
}


const moduleSamples: ModuleSample[] = []
for (let i = 1; i < 6; i++) {
  const row: ModuleSample = {
    id: i,
    sampleId: i,
    moduleId: Math.floor(Math.random() * 6)
  }
  moduleSamples.push(row)
}


const previewSamples: Sample[] = [
  {
    id: 1,
    name: 'IndexPage',
    language: 'vue',
    module: '',
    type: 'UI',
    version: 1,
    enabled: true,
    body: '<template>\n  <div class="app-container">\n </div>\n</template>',
    lastModifiedDate: new Date()
  },
  {
    id: 2,
    name: 'users',
    language: 'ts',
    module: '',
    type: 'TS',
    version: 1,
    enabled: true,
    body: 'import { api } from \'boot/axios\'\nimport { SERVER_URL } from \'src/constants\'\nimport type { Pagination, User } from \'src/types\'\n\n/**\n * Retrieve rows\n * @param pagination Pagination and sort parameters\n * @param filters Optional filter or sort parameters\n * @returns Rows data\n */\nexport const retrieveUsers = (pagination: Pagination, filters?: object) => {\n  return api.get(SERVER_URL.USER, { params: { ...pagination, page: pagination.page - 1, ...filters } })\n}\n\n',
    lastModifiedDate: new Date()
  },
  {
    id: 3,
    name: 'entity',
    language: 'java',
    module: '',
    type: 'Model',
    version: 1,
    enabled: true,
    body: '// 数据对象 (Entity)\npackage com.example.demo.entity;\n\nimport javax.persistence.Entity;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.GenerationType;\nimport javax.persistence.Id;\nimport java.util.Date;\n\n@Entity\npublic class Page {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String language;\n    private String version;\n    private int type;\n    private boolean enabled;\n    private String body;\n    private Date lastModifiedDate;\n\n    // Getters and Setters\n}\n\n// Repository\n',
    lastModifiedDate: new Date()
  },
  {
    id: 4,
    name: 'repository',
    language: 'java',
    module: '',
    type: 'Repository',
    version: 1,
    enabled: true,
    body: '// 数据对象 (Entity)\npackage com.example.demo.entity;\n\nimport javax.persistence.Entity;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.GenerationType;\nimport javax.persistence.Id;\nimport java.util.Date;\n\n@Entity\npublic class Page {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String language;\n    private String version;\n    private int type;\n    private boolean enabled;\n    private String body;\n    private Date lastModifiedDate;\n\n    // Getters and Setters\n}\n\n// Repository\n',
    lastModifiedDate: new Date()
  },
  {
    id: 5,
    name: 'mapper',
    language: 'java',
    module: '',
    type: 'Repository',
    version: 1,
    enabled: true,
    body: '// 数据对象 (Entity)\npackage com.example.demo.entity;\n\nimport javax.persistence.Entity;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.GenerationType;\nimport javax.persistence.Id;\nimport java.util.Date;\n\n@Entity\npublic class Page {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String language;\n    private String version;\n    private int type;\n    private boolean enabled;\n    private String body;\n    private Date lastModifiedDate;\n\n    // Getters and Setters\n}\n\n// Repository\n',
    lastModifiedDate: new Date()
  },
  {
    id: 6,
    name: 'controller',
    language: 'java',
    module: '',
    type: 'Controller',
    version: 1,
    enabled: true,
    body: '// 数据对象 (Entity)\npackage com.example.demo.entity;\n\nimport javax.persistence.Entity;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.GenerationType;\nimport javax.persistence.Id;\nimport java.util.Date;\n\n@Entity\npublic class Page {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String language;\n    private String version;\n    private int type;\n    private boolean enabled;\n    private String body;\n    private Date lastModifiedDate;\n\n    // Getters and Setters\n}\n\n// Repository\n',
    lastModifiedDate: new Date()
  }
]


export const modulesHandlers = [
  http.get(`/api${SERVER_URL.MODULE}/:id/samples`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = moduleSamples.filter(item => item.moduleId === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.MODULE}/:id/preview`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(previewSamples)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.MODULE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const filtered = datas.find(item => item.id === Number(id))
      return HttpResponse.json(filtered)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.MODULE}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size)),
      page: {
        totalElements: datas.length
      }
    }

    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.MODULE}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.MODULE}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Module

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.MODULE}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Module

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.MODULE}/:id/samples`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    }
    return HttpResponse.error()
  }),
  http.patch(`/api${SERVER_URL.MODULE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.MODULE}/:id`, ({ params }) => {
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
