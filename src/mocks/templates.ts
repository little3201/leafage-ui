import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { MasterPlate } from 'src/types'

const datas: MasterPlate[] = [
  {
    id: 1,
    name: 'IndexPage',
    suffix: '.vue',
    version: '1.0.0',
    type: 56,
    enabled: true,
    content: '<template>\n  <div class="app-container">\n </div>\n</template>',
    lastModifiedDate: new Date()
  },
  {
    id: 2,
    name: 'Model',
    suffix: '.java',
    version: '1.0.0',
    type: 57,
    enabled: true,
    content: '// 数据对象 (Entity)\npackage com.example.demo.entity;\n\nimport javax.persistence.Entity;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.GenerationType;\nimport javax.persistence.Id;\nimport java.util.Date;\n\n@Entity\npublic class Page {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String suffix;\n    private String version;\n    private int type;\n    private boolean enabled;\n    private String content;\n    private Date lastModifiedDate;\n\n    // Getters and Setters\n}\n\n// Repository\npackage com.example.demo.repository;\n\nimport com.example.demo.entity.Page;\nimport org.springframework.data.jpa.repository.JpaRepository;\n\npublic interface PageRepository extends JpaRepository<Page, Long> {\n}\n\n// Service\npackage com.example.demo.service;\n\nimport com.example.demo.entity.Page;\nimport com.example.demo.repository.PageRepository;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.stereotype.Service;\n\nimport java.util.List;\nimport java.util.Optional;\n\n@Service\npublic class PageService {\n\n    @Autowired\n    private PageRepository pageRepository;\n\n    public List<Page> findAll() {\n        return pageRepository.findAll();\n    }\n\n    public Optional<Page> findById(Long id) {\n        return pageRepository.findById(id);\n    }\n\n    public Page save(Page page) {\n        return pageRepository.save(page);\n    }\n\n    public void deleteById(Long id) {\n        pageRepository.deleteById(id);\n    }\n}\n\n// Controller\npackage com.example.demo.controller;\n\nimport com.example.demo.entity.Page;\nimport com.example.demo.service.PageService;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.web.bind.annotation.*;\n\nimport java.util.List;\nimport java.util.Optional;\n\n@RestController\n@RequestMapping("/pages")\npublic class PageController {\n\n    @Autowired\n    private PageService pageService;\n\n    @GetMapping\n    public List<Page> getAllPages() {\n        return pageService.findAll();\n    }\n\n    @GetMapping("/{id}")\n    public Optional<Page> getPageById(@PathVariable Long id) {\n        return pageService.findById(id);\n    }\n\n    @PostMapping\n    public Page createPage(@RequestBody Page page) {\n        return pageService.save(page);\n    }\n\n    @DeleteMapping("/{id}")\n    public void deletePage(@PathVariable Long id) {\n        pageService.deleteById(id);\n    }\n}\n',
    lastModifiedDate: new Date()
  },
  {
    id: 3,
    name: 'Entity',
    suffix: '.java',
    version: '1.0.0',
    type: 57,
    enabled: true,
    content: '// 数据对象 (Entity)\npackage com.example.demo.entity;\n\nimport javax.persistence.Entity;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.GenerationType;\nimport javax.persistence.Id;\nimport java.util.Date;\n\n@Entity\npublic class Page {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String suffix;\n    private String version;\n    private int type;\n    private boolean enabled;\n    private String content;\n    private Date lastModifiedDate;\n\n    // Getters and Setters\n}\n\n// Repository\npackage com.example.demo.repository;\n\nimport com.example.demo.entity.Page;\nimport org.springframework.data.jpa.repository.JpaRepository;\n\npublic interface PageRepository extends JpaRepository<Page, Long> {\n}\n\n// Service\npackage com.example.demo.service;\n\nimport com.example.demo.entity.Page;\nimport com.example.demo.repository.PageRepository;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.stereotype.Service;\n\nimport java.util.List;\nimport java.util.Optional;\n\n@Service\npublic class PageService {\n\n    @Autowired\n    private PageRepository pageRepository;\n\n    public List<Page> findAll() {\n        return pageRepository.findAll();\n    }\n\n    public Optional<Page> findById(Long id) {\n        return pageRepository.findById(id);\n    }\n\n    public Page save(Page page) {\n        return pageRepository.save(page);\n    }\n\n    public void deleteById(Long id) {\n        pageRepository.deleteById(id);\n    }\n}\n\n// Controller\npackage com.example.demo.controller;\n\nimport com.example.demo.entity.Page;\nimport com.example.demo.service.PageService;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.web.bind.annotation.*;\n\nimport java.util.List;\nimport java.util.Optional;\n\n@RestController\n@RequestMapping("/pages")\npublic class PageController {\n\n    @Autowired\n    private PageService pageService;\n\n    @GetMapping\n    public List<Page> getAllPages() {\n        return pageService.findAll();\n    }\n\n    @GetMapping("/{id}")\n    public Optional<Page> getPageById(@PathVariable Long id) {\n        return pageService.findById(id);\n    }\n\n    @PostMapping\n    public Page createPage(@RequestBody Page page) {\n        return pageService.save(page);\n    }\n\n    @DeleteMapping("/{id}")\n    public void deletePage(@PathVariable Long id) {\n        pageService.deleteById(id);\n    }\n}\n',
    lastModifiedDate: new Date()
  }
]

export const templatesHandlers = [
  http.get(`/api${SERVER_URL.TEMPLATE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.filter(item => item.id === Number(id))[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.TEMPLATE}/:id/exists`, ({ params }) => {
    const { id, name } = params
    let filtered = datas.filter(item => item.name === name)
    if (id) {
      filtered = datas.filter(item => item.name === name && item.id !== Number(id))
    }
    return HttpResponse.json(filtered.length > 0)
  }),
  http.get(`/api${SERVER_URL.TEMPLATE}`, ({ request }) => {
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
  http.post(`/api${SERVER_URL.TEMPLATE}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.TEMPLATE}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as MasterPlate

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.TEMPLATE}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as MasterPlate

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.TEMPLATE}/:id`, async ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.TEMPLATE}/:id`, ({ params }) => {
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
    return HttpResponse.json(deletedData)
  })
]
