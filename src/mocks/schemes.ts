import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Field, Module, Sample, Scheme } from 'src/types'

const datas: Scheme[] = [
]

for (let i = 1; i < 16; i++) {
  const row: Scheme = {
    id: i,
    module: 'module_name' + i,
    connectionId: 1,
    packageName: 'com.example',
    scope: 'PARTIAL',
    tables: ['messages', 'users', 'roles'],
    enabled: i > 2
  }
  datas.push(row)
}

const modules: Module[] = []
for (let i = 1; i < 16; i++) {
  const row: Module = {
    id: i,
    name: 'module_name' + i,
    description: 'this is description.',
    enabled: i > 2
  }
  modules.push(row)
}

const fields: Field[] = []

for (let i = 1; i < 8; i++) {
  const field: Field = {
    id: i,
    schemeId: Math.floor(Math.random() * 5) + 1,
    tableName: 'table_name' + i,
    name: 'column_name' + i,
    comment: 'comment',
    dataType: 'varchar',
    length: 255,
    fieldType: 'String',
    formType: 'input',
    tsType: 'string',
    nullable: i % 3 > 0,
    unique: i % 3 > 0,
    queryable: i < 2,
    queryType: undefined,
    editable: i > 2,
    sortable: i > 3,
    description: 'this is description for this row'
  }
  fields.push(field)
}

const treeData: Sample.Rendered[] = [
  {
    name: 'User',
    language: 'JAVA',
    filePath: 'src/main/java/domain',
    body: '// 数据对象 (Entity)\npackage com.example.demo.entity;\n\nimport javax.persistence.Entity;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.GenerationType;\nimport javax.persistence.Id;\nimport java.util.Date;\n\n@Entity\npublic class Page {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String suffix;\n    private String version;\n    private int type;\n    private boolean enabled;\n    private String body;\n    private Date lastModifiedDate;\n\n    // Getters and Setters\n}\n\n// Repository\n',
  },
  {
    name: 'UserController',
    language: 'JAVA',
    filePath: 'src/main/java/controller',
    body: '/*\n * Copyright (c) 2024-2025.  little3201.\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *       https://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\npackage io.leafage.basic.hypervisor.controller;\n\nimport io.leafage.basic.hypervisor.dto.UserDTO;\nimport io.leafage.basic.hypervisor.service.UserService;\nimport io.leafage.basic.hypervisor.vo.UserVO;\nimport jakarta.validation.Valid;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\nimport org.springframework.data.domain.Page;\nimport org.springframework.http.HttpStatus;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.security.access.prepost.PreAuthorize;\nimport org.springframework.web.bind.annotation.*;\n\nimport java.security.Principal;\n\n/**\n * user controller.\n *\n * @author wq li\n */\n@RestController\n@RequestMapping("/users")\npublic class UserController {\n\n    private final Logger logger = LoggerFactory.getLogger(UserController.class);\n\n    private final UserService userService;\n\n    /**\n     * <p>Constructor for UserController.</p>\n     *\n     * @param userService a {@link io.leafage.basic.hypervisor.service.UserService} object\n     */\n    public UserController(UserService userService) {\n        this.userService = userService;\n    }\n\n    /**\n     * 分页查询\n     *\n     * @param page       页码\n     * @param size       大小\n     * @param sortBy     排序字段\n     * @param descending 排序方向\n     * @param username   username\n     * @return 如果查询到数据，返回查询到的分页后的信息列表，否则返回空\n     */\n    @PreAuthorize("hasRole(\'ADMIN\') || hasAuthority(\'SCOPE_users:read\')")\n    @GetMapping\n    public ResponseEntity<Page<UserVO>> retrieve(@RequestParam int page, @RequestParam int size,\n                                                 String sortBy, boolean descending, String username) {\n        Page<UserVO> voPage;\n        try {\n            voPage = userService.retrieve(page, size, sortBy, descending, username);\n        } catch (Exception e) {\n            logger.info("Retrieve user error: ", e);\n            return ResponseEntity.noContent().build();\n        }\n        return ResponseEntity.ok(voPage);\n    }\n\n    /**\n     * 查询信息\n     *\n     * @param id 主键\n     * @return 如果查询到数据，返回查询到的信息，否则返回204状态码\n     */\n    @PreAuthorize("hasRole(\'ADMIN\') || hasAuthority(\'SCOPE_users:read\')")\n    @GetMapping("/{id}")\n    public ResponseEntity<UserVO> fetch(@PathVariable Long id) {\n        UserVO vo;\n        try {\n            vo = userService.fetch(id);\n        } catch (Exception e) {\n            logger.info("Fetch user error: ", e);\n            return ResponseEntity.noContent().build();\n        }\n        return ResponseEntity.ok(vo);\n    }\n\n    /**\n     * 是否存在\n     *\n     * @param username 名称\n     * @param id       主键\n     * @return 如果查询到数据，返回查询到的信息，否则返回204状态码\n     */\n    @GetMapping("/exists")\n    public ResponseEntity<Boolean> exists(@RequestParam String username, Long id) {\n        boolean exists;\n        try {\n            exists = userService.exists(username, id);\n        } catch (Exception e) {\n            logger.info("Check user exists error: ", e);\n            return ResponseEntity.noContent().build();\n        }\n        return ResponseEntity.ok(exists);\n    }\n\n    /**\n     * 查询当前用户\n     *\n     * @param principal 当前用户\n     * @return 如果查询到数据，返回查询到的信息，否则返回204状态码\n     */\n    @GetMapping("/me")\n    public ResponseEntity<UserVO> fetchMe(Principal principal) {\n        UserVO vo;\n        try {\n            vo = userService.findByUsername(principal.getName());\n        } catch (Exception e) {\n            logger.info("Fetch me error: ", e);\n            return ResponseEntity.noContent().build();\n        }\n        return ResponseEntity.ok(vo);\n    }\n\n    /**\n     * 添加信息.\n     *\n     * @param dto 要修改的数据\n     * @return 如果添加数据成功，返回添加后的信息，否则返回417状态码\n     */\n    @PostMapping\n    public ResponseEntity<UserVO> create(@RequestBody @Valid UserDTO dto) {\n        UserVO vo;\n        try {\n            vo = userService.create(dto);\n        } catch (Exception e) {\n            logger.error("Create user error: ", e);\n            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).build();\n        }\n        return ResponseEntity.status(HttpStatus.CREATED).body(vo);\n    }\n\n    /**\n     * 修改信息.\n     *\n     * @param id  主键\n     * @param dto 要修改的数据\n     * @return 如果修改数据成功，返回修改后的信息，否则返回304状态码\n     */\n    @PutMapping("/{id}")\n    public ResponseEntity<UserVO> modify(@PathVariable Long id,\n                                         @RequestBody @Valid UserDTO dto) {\n        UserVO vo;\n        try {\n            vo = userService.modify(id, dto);\n        } catch (Exception e) {\n            logger.error("Modify user error: ", e);\n            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();\n        }\n        return ResponseEntity.accepted().body(vo);\n    }\n\n}\n'
  }
]

export const schemesHandlers = [
  http.get(`/api${SERVER_URL.SCHEME}/:id/modules`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(modules)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEME}/:id/preview`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(treeData)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEME}/:id/fields`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(fields)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEME}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.filter(item => item.id === Number(id))[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEME}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: Array.from(datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      totalElements: datas.length
    }

    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.SCHEME}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.SCHEME}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Scheme

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.post(`/api${SERVER_URL.SCHEME}/:id/execute`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.put(`/api${SERVER_URL.SCHEME}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Scheme

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.SCHEME}/:id/sync`, ({ params }) => {
    const id = params
    if (id) {
      return HttpResponse.json()
    }
    return HttpResponse.error()
  }),
  http.patch(`/api${SERVER_URL.SCHEME}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.SCHEME}/:id`, ({ params }) => {
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
