import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Schema, Field, SampleNode, SampleTreeNode } from 'src/types'

const datas: Schema[] = [
]

for (let i = 1; i < 6; i++) {
  const row: Schema = {
    id: i,
    name: 'table_name' + i,
    connectionId: 1,
    prefix: i > 4 ? 'sys_' : '',
    packageName: 'com.example',
    enabled: i > 2,
    samples: i > 3 ? [1, 2, 3, 4, 5] : []
  }
  datas.push(row)
}

const fields: Field[] = []

for (let i = 1; i < 28; i++) {
  const field: Field = {
    id: i,
    name: 'column_name' + i,
    dataType: 'varchar',
    length: 255,
    fieldType: 'String',
    formType: 'input',
    nullable: i % 3 > 0,
    queryable: i < 2,
    queryType: undefined,
    editable: i > 2,
    sortable: i > 3,
    description: 'this is description for this row'
  }
  fields.push(field)
}
const backend: SampleTreeNode[] = [
  {
    id: 1111,
    name: 'domain',
    children: [
      {
        id: 11111,
        name: 'User',
        suffix: '.java',
        content: '// 数据对象 (Entity)\npackage com.example.demo.entity;\n\nimport javax.persistence.Entity;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.GenerationType;\nimport javax.persistence.Id;\nimport java.util.Date;\n\n@Entity\npublic class Page {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String suffix;\n    private String version;\n    private int type;\n    private boolean enabled;\n    private String content;\n    private Date lastModifiedDate;\n\n    // Getters and Setters\n}\n\n// Repository\n',
        children: []
      }
    ]
  },
  {
    id: 1112,
    name: 'controller',
    children: [
      {
        id: 11121,
        name: 'UserController',
        suffix: '.java',
        content: '/*\n * Copyright (c) 2024-2025.  little3201.\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *       https://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\npackage io.leafage.basic.hypervisor.controller;\n\nimport io.leafage.basic.hypervisor.dto.UserDTO;\nimport io.leafage.basic.hypervisor.service.UserService;\nimport io.leafage.basic.hypervisor.vo.UserVO;\nimport jakarta.validation.Valid;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\nimport org.springframework.data.domain.Page;\nimport org.springframework.http.HttpStatus;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.security.access.prepost.PreAuthorize;\nimport org.springframework.web.bind.annotation.*;\n\nimport java.security.Principal;\n\n/**\n * user controller.\n *\n * @author wq li\n */\n@RestController\n@RequestMapping("/users")\npublic class UserController {\n\n    private final Logger logger = LoggerFactory.getLogger(UserController.class);\n\n    private final UserService userService;\n\n    /**\n     * <p>Constructor for UserController.</p>\n     *\n     * @param userService a {@link io.leafage.basic.hypervisor.service.UserService} object\n     */\n    public UserController(UserService userService) {\n        this.userService = userService;\n    }\n\n    /**\n     * 分页查询\n     *\n     * @param page       页码\n     * @param size       大小\n     * @param sortBy     排序字段\n     * @param descending 排序方向\n     * @param username   username\n     * @return 如果查询到数据，返回查询到的分页后的信息列表，否则返回空\n     */\n    @PreAuthorize("hasRole(\'ADMIN\') || hasAuthority(\'SCOPE_users:read\')")\n    @GetMapping\n    public ResponseEntity<Page<UserVO>> retrieve(@RequestParam int page, @RequestParam int size,\n                                                 String sortBy, boolean descending, String username) {\n        Page<UserVO> voPage;\n        try {\n            voPage = userService.retrieve(page, size, sortBy, descending, username);\n        } catch (Exception e) {\n            logger.info("Retrieve user error: ", e);\n            return ResponseEntity.noContent().build();\n        }\n        return ResponseEntity.ok(voPage);\n    }\n\n    /**\n     * 查询信息\n     *\n     * @param id 主键\n     * @return 如果查询到数据，返回查询到的信息，否则返回204状态码\n     */\n    @PreAuthorize("hasRole(\'ADMIN\') || hasAuthority(\'SCOPE_users:read\')")\n    @GetMapping("/{id}")\n    public ResponseEntity<UserVO> fetch(@PathVariable Long id) {\n        UserVO vo;\n        try {\n            vo = userService.fetch(id);\n        } catch (Exception e) {\n            logger.info("Fetch user error: ", e);\n            return ResponseEntity.noContent().build();\n        }\n        return ResponseEntity.ok(vo);\n    }\n\n    /**\n     * 是否存在\n     *\n     * @param username 名称\n     * @param id       主键\n     * @return 如果查询到数据，返回查询到的信息，否则返回204状态码\n     */\n    @GetMapping("/exists")\n    public ResponseEntity<Boolean> exists(@RequestParam String username, Long id) {\n        boolean exists;\n        try {\n            exists = userService.exists(username, id);\n        } catch (Exception e) {\n            logger.info("Check user exists error: ", e);\n            return ResponseEntity.noContent().build();\n        }\n        return ResponseEntity.ok(exists);\n    }\n\n    /**\n     * 查询当前用户\n     *\n     * @param principal 当前用户\n     * @return 如果查询到数据，返回查询到的信息，否则返回204状态码\n     */\n    @GetMapping("/me")\n    public ResponseEntity<UserVO> fetchMe(Principal principal) {\n        UserVO vo;\n        try {\n            vo = userService.findByUsername(principal.getName());\n        } catch (Exception e) {\n            logger.info("Fetch me error: ", e);\n            return ResponseEntity.noContent().build();\n        }\n        return ResponseEntity.ok(vo);\n    }\n\n    /**\n     * 添加信息.\n     *\n     * @param dto 要修改的数据\n     * @return 如果添加数据成功，返回添加后的信息，否则返回417状态码\n     */\n    @PostMapping\n    public ResponseEntity<UserVO> create(@RequestBody @Valid UserDTO dto) {\n        UserVO vo;\n        try {\n            vo = userService.create(dto);\n        } catch (Exception e) {\n            logger.error("Create user error: ", e);\n            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).build();\n        }\n        return ResponseEntity.status(HttpStatus.CREATED).body(vo);\n    }\n\n    /**\n     * 修改信息.\n     *\n     * @param id  主键\n     * @param dto 要修改的数据\n     * @return 如果修改数据成功，返回修改后的信息，否则返回304状态码\n     */\n    @PutMapping("/{id}")\n    public ResponseEntity<UserVO> modify(@PathVariable Long id,\n                                         @RequestBody @Valid UserDTO dto) {\n        UserVO vo;\n        try {\n            vo = userService.modify(id, dto);\n        } catch (Exception e) {\n            logger.error("Modify user error: ", e);\n            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();\n        }\n        return ResponseEntity.accepted().body(vo);\n    }\n\n}\n',
        children: []
      }
    ]
  }
]

const frontend: SampleTreeNode[] = [
  {
    id: 21,
    name: 'api',
    children: [
      {
        id: 211,
        name: 'users',
        suffix: '.ts',
        content: 'import { api } from \'boot/axios\'\nimport { SERVER_URL } from \'src/constants\'\nimport type { Pagination, User } from \'src/types\'\n\n/**\n * Retrieve rows\n * @param pagination Pagination and sort parameters\n * @param filters Optional filter or sort parameters\n * @returns Rows data\n */\nexport const retrieveUsers = (pagination: Pagination, filters?: object) => {\n  return api.get(SERVER_URL.USER, { params: { ...pagination, page: pagination.page - 1, ...filters } })\n}\n\n/**\n * Fetch a specific row\n * @param id Row ID\n * @returns Row data\n */\nexport const fetchUser = (id: number) => {\n  return api.get(`${SERVER_URL.USER}/${id}`)\n}\n\n/**\n * Fetch me\n * @returns Row data\n */\nexport const fetchMe = () => {\n  return api.get(`${SERVER_URL.USER}/me`)\n}\n\n/**\n * Check if a specific row exists by username\n * @param username Row username\n * @param id Row ID\n * @returns Row data\n */\nexport const checkUserExists = (username: string, id?: number) => {\n  return api.get(`${SERVER_URL.USER}/exists`, { params: { username, id } })\n}\n\n/**\n * Create a new row\n * @param row Row data\n * @returns Created row\n */\nexport const createUser = (row: User) => {\n  return api.post(SERVER_URL.USER, row)\n}\n\n/**\n * Modify an existing row\n * @param id Row ID\n * @param row Updated row data\n * @returns Modified row\n */\nexport const modifyUser = (id: number, row: User) => {\n  return api.put(`${SERVER_URL.USER}/${id}`, row)\n}\n\n/**\n * Enable or Disable an existing row\n * @param id Row ID\n * @returns Enable or Disable result\n */\nexport const enableUser = (id: number) => {\n  return api.patch(`${SERVER_URL.USER}/${id}`)\n}\n\n/**\n * Remove a row\n * @param id Row ID\n * @returns Deletion status\n */\nexport const removeUser = (id: number) => {\n  return api.delete(`${SERVER_URL.USER}/${id}`)\n}\n\n/**\n * Relation privileges for a specific row\n * @param ids Row IDs\n * @param privilegeIds Privilege id\n * @param actions Actions\n */\nexport const relationUsersPrivileges = (privilegeId: number, relations: { key: number | string, actions: string[] }[]) => {\n  const datas = relations.map(item => { return { username: item.key, actions: item.actions } })\n  return api.patch(`${SERVER_URL.USER}/privileges/${privilegeId}`, datas)\n}\n\n/**\n * Remove privileges for a specific row\n * @param username Row username\n * @param privilegeIds Privilege id\n * @param actions Actions\n */\nexport const removeUsersPrivileges = (username: string, privilegeId: number, actions?: string[]) => {\n  if (actions && actions.length > 0) {\n    const params = { actions: actions.join(\',\') }\n    return api.delete(`${SERVER_URL.USER}/${username}/privileges/${privilegeId}`, { params })\n  } else {\n    return api.delete(`${SERVER_URL.USER}/${username}/privileges/${privilegeId}`)\n  }\n}\n\n/**\n * Import rows\n * @param file file\n * @returns\n */\nexport const importUsers = (file: File) => {\n  const formData = new FormData()\n  formData.append(\'file\', file)\n  return api.post(`${SERVER_URL.USER}/import`, formData)\n}\n',
        children: []
      },
    ]
  },
  {
    id: 22,
    name: 'pages',
    children: [
      {
        id: 221,
        name: 'users',
        children: [
          {
            id: 2211,
            name: 'IndexPage',
            suffix: '.vue',
            content: '<script setup lang=\\"ts\\">\nimport { ref, reactive, onMounted } from \'vue\'\nimport type { TableInstance, FormInstance, FormRules, UploadInstance, UploadRequestOptions, CheckboxValueType } from \'element-plus\'\nimport { dayjs } from \'element-plus\'\nimport draggable from \'vuedraggable\'\nimport { useI18n } from \'vue-i18n\'\nimport { useUserStore } from \'stores/user-store\'\nimport DialogView from \'components/DialogView.vue\'\nimport {\n  retrieveUsers, fetchUser, createUser, modifyUser, removeUser, enableUser, checkUserExists, importUsers\n} from \'src/api/users\'\nimport type { Pagination, User } from \'src/types\'\nimport { Icon } from \'@iconify/vue\'\nimport { calculate, hasAction } from \'src/utils\'\n\n\nconst { t, locale } = useI18n()\nconst userStore = useUserStore()\n\nconst loading = ref<boolean>(false)\nconst datas = ref<Array<User>>([])\nconst total = ref<number>(0)\n\nconst tableRef = ref<TableInstance>()\nconst pagination = reactive<Pagination>({\n  page: 1,\n  size: 10\n})\n\nconst checkAll = ref<boolean>(true)\nconst isIndeterminate = ref<boolean>(false)\nconst checkedColumns = ref<Array<string>>([\'name\', \'enabled\', \'description\'])\nconst columns = ref<Array<string>>([\'name\', \'enabled\', \'description\'])\n\nconst saveLoading = ref<boolean>(false)\nconst visible = ref<boolean>(false)\n\nconst importVisible = ref<boolean>(false)\nconst importLoading = ref<boolean>(false)\nconst exportLoading = ref<boolean>(false)\nconst importRef = ref<UploadInstance>()\n\nconst filters = ref({\n  username: null\n})\n\nconst formRef = ref<FormInstance>()\nconst initialValues: User = {\n  id: undefined,\n  username: \'\',\n  firstname: \'\',\n  lastname: \'\',\n  email: \'\'\n}\nconst form = ref<User>({ ...initialValues })\n\nconst rules = reactive<FormRules<typeof form>>({\n  username: [\n    { required: true, message: t(\'inputText\', { field: t(\'username\') }), trigger: \'blur\' },\n    { validator: checkNameExistsence, trigger: \'blur\' }\n  ],\n  firstname: [\n    { required: true, message: t(\'inputText\', { field: t(\'firstname\') }), trigger: \'blur\' }\n  ],\n  lastname: [\n    { required: true, message: t(\'inputText\', { field: t(\'lastname\') }), trigger: \'blur\' }\n  ],\n  email: [\n    { required: true, message: t(\'inputText\', { field: t(\'email\') }), trigger: \'blur\' }\n  ]\n})\n\nfunction checkNameExistsence(rule: unknown, value: string, callback: (error?: string | Error) => void) {\n  checkUserExists(value, form.value.id).then(res => {\n    if (res.data) {\n      callback(new Error(t(\'alreadyExists\', { field: t(\'username\') })))\n    } else {\n      callback()\n    }\n  })\n}\n\n/**\n * 分页变化\n * @param currentPage 当前页码\n * @param pageSize 分页大小\n */\nfunction pageChange(currentPage: number, pageSize: number) {\n  pagination.page = currentPage\n  pagination.size = pageSize\n  load()\n}\n\n/**\n * 加载列表\n */\nasync function load() {\n  loading.value = true\n  retrieveUsers(pagination, filters.value).then(res => {\n    datas.value = res.data.content\n    total.value = res.data.page.totalElements\n  }).finally(() => { loading.value = false })\n}\n\n/**\n * reset\n */\nfunction reset() {\n  filters.value = {\n    username: null\n  }\n  load()\n}\n\nonMounted(() => {\n  load()\n})\n\n/**\n * 导入\n */\nfunction importRows() {\n  importVisible.value = true\n}\n\n/**\n * 导出\n */\nfunction exportRows() {\n  exportLoading.value = true\n\n  const selectedRows = tableRef.value?.getSelectionRows()\n  if (selectedRows) {\n    console.log(\'selectedRows: \', selectedRows)\n  }\n}\n\n/**\n * 弹出框\n * @param id 主键\n */\nfunction saveRow(id?: number) {\n  form.value = { ...initialValues }\n  if (id) {\n    loadOne(id)\n  }\n  visible.value = true\n}\n\n/**\n * 加载\n * @param id 主键\n */\nasync function loadOne(id: number) {\n  fetchUser(id).then(res => {\n    form.value = res.data\n  })\n}\n\n/**\n * 启用、停用\n * @param id 主键\n */\nasync function enableChange(id: number) {\n  enableUser(id).then(() => { load() })\n}\n\n/**\n * 表单提交\n */\nfunction onSubmit(formEl: FormInstance | undefined) {\n  if (!formEl) return\n\n  formEl.validate((valid) => {\n    if (valid) {\n      saveLoading.value = true\n      if (form.value.id) {\n        modifyUser(form.value.id, form.value).then(() => {\n          load()\n          visible.value = false\n        }).finally(() => { saveLoading.value = false })\n      } else {\n        createUser(form.value).then(() => {\n          load()\n          visible.value = false\n        }).finally(() => { saveLoading.value = false })\n      }\n    }\n  })\n}\n\n/**\n * 导入提交\n */\nasync function onImportSubmit(importEl: UploadInstance | undefined) {\n  if (!importEl) return\n  importLoading.value = true\n\n  importEl.submit()\n\n  importLoading.value = false\n  importVisible.value = false\n}\n\nfunction onUpload(options: UploadRequestOptions) {\n  return importUsers(options.file)\n}\n\n/**\n * 删除\n * @param id 主键\n */\nfunction removeRow(id: number) {\n  removeUser(id).then(() => load())\n}\n\n/**\n * 确认\n * @param id 主键\n */\nfunction confirmEvent(id: number) {\n  if (id) {\n    removeRow(id)\n  }\n}\n\n/**\n * 解锁/上锁\n * @param row 数据\n */\nfunction lockRow(row: User) {\n  row.accountNonLocked = !row.accountNonLocked\n}\n\n/**\n * 全选操作\n * @param val 是否全选\n */\nfunction handleCheckAllChange(val: CheckboxValueType) {\n  checkedColumns.value = val ? columns.value : []\n  isIndeterminate.value = false\n}\n\n/**\n * 选中操作\n * @param value 选中的值\n */\nfunction handleCheckedChange(value: CheckboxValueType[]) {\n  const checkedCount = value.length\n  checkAll.value = checkedCount === columns.value.length\n  isIndeterminate.value = checkedCount > 0 && checkedCount < columns.value.length\n}\n</script>\n\n<template>\n  <ElSpace size=\\"large\\" fill>\n    <ElCard shadow=\\"never\\">\n      <ElForm inline :model=\\"filters\\" @submit.prevent>\n        <ElFormItem :label=\\"$t(\'username\')\\" prop=\\"username\\">\n          <ElInput v-model=\\"filters.username\\" :placeholder=\\"$t(\'inputText\', { field: $t(\'username\') })\\" />\n        </ElFormItem>\n        <ElFormItem>\n          <ElButton title=\\"search\\" type=\\"primary\\" @click=\\"load\\">\n            <Icon icon=\\"material-symbols:search-rounded\\" width=\\"18\\" height=\\"18\\" />{{ $t(\'search\') }}\n          </ElButton>\n          <ElButton title=\\"reset\\" @click=\\"reset\\">\n            <Icon icon=\\"material-symbols:replay-rounded\\" width=\\"18\\" height=\\"18\\" />{{ $t(\'reset\') }}\n          </ElButton>\n        </ElFormItem>\n      </ElForm>\n    </ElCard>\n\n    <ElCard shadow=\\"never\\">\n      <ElRow :gutter=\\"20\\" justify=\\"space-between\\" class=\\"mb-4\\">\n        <ElCol :span=\\"16\\" class=\\"text-left\\">\n          <ElButton v-if=\\"hasAction($route.name, \'create\')\\" title=\\" create\\" type=\\"primary\\" @click=\\"saveRow()\\">\n            <Icon icon=\\"material-symbols:add-rounded\\" width=\\"18\\" height=\\"18\\" />{{ $t(\'create\') }}\n          </ElButton>\n          <ElButton v-if=\\"hasAction($route.name, \'import\')\\" title=\\" import\\" type=\\"warning\\" plain @click=\\"importRows\\">\n            <Icon icon=\\"material-symbols:database-upload-outline-rounded\\" width=\\"18\\" height=\\"18\\" />{{ $t(\'import\') }}\n          </ElButton>\n          <ElButton v-if=\\"hasAction($route.name, \'export\')\\" title=\\" export\\" type=\\"success\\" plain @click=\\"exportRows\\"\n            :loading=\\"exportLoading\\">\n            <Icon icon=\\"material-symbols:file-export-outline-rounded\\" width=\\"18\\" height=\\"18\\" />{{ $t(\'export\') }}\n          </ElButton>\n        </ElCol>\n\n        <ElCol :span=\\"8\\" class=\\"text-right\\">\n          <ElTooltip effect=\\"dark\\" :content=\\"$t(\'refresh\')\\" placement=\\"top\\">\n            <ElButton title=\\"refresh\\" type=\\"primary\\" plain circle @click=\\"load\\">\n              <Icon icon=\\"material-symbols:refresh-rounded\\" width=\\"18\\" height=\\"18\\" />\n            </ElButton>\n          </ElTooltip>\n\n          <ElTooltip :content=\\"$t(\'column\') + $t(\'settings\')\\" placement=\\"top\\">\n            <ElPopover :width=\\"200\\" trigger=\\"click\\">\n              <template #reference>\n                <ElButton title=\\"settings\\" type=\\"success\\" plain circle>\n                  <Icon icon=\\"material-symbols:format-list-bulleted\\" width=\\"18\\" height=\\"18\\" />\n                </ElButton>\n              </template>\n              <div>\n                <ElCheckbox v-model=\\"checkAll\\" :indeterminate=\\"isIndeterminate\\" @change=\\"handleCheckAllChange\\">\n                  {{ $t(\'all\') }}\n                </ElCheckbox>\n                <ElDivider />\n                <ElCheckboxGroup v-model=\\"checkedColumns\\" @change=\\"handleCheckedChange\\">\n                  <draggable v-model=\\"columns\\" item-key=\\"simple\\">\n                    <template #item=\\"{ element }\\">\n                      <div class=\\"flex items-center space-x-2\\">\n                        <Icon icon=\\"material-symbols:drag-indicator\\" width=\\"18\\" height=\\"18\\" class=\\"hover:cursor-move\\" />\n                        <ElCheckbox :label=\\"element\\" :value=\\"element\\" :disabled=\\"element === columns[0]\\">\n                          <div class=\\"inline-flex items-center space-x-4\\">\n                            {{ $t(element) }}\n                          </div>\n                        </ElCheckbox>\n                      </div>\n                    </template>\n                  </draggable>\n                </ElCheckboxGroup>\n              </div>\n            </ElPopover>\n          </ElTooltip>\n        </ElCol>\n      </ElRow>\n\n      <ElTable ref=\\"tableRef\\" v-loading=\\"loading\\" :data=\\"datas\\" row-key=\\"id\\" stripe table-layout=\\"auto\\">\n        <ElTableColumn type=\\"selection\\" width=\\"55\\" />\n        <ElTableColumn type=\\"index\\" :label=\\"$t(\'no\')\\" width=\\"55\\" />\n        <ElTableColumn prop=\\"username\\" :label=\\"$t(\'username\')\\">\n          <template #default=\\"scope\\">\n            <div class=\\"flex items-center\\">\n              <ElAvatar alt=\\"avatar\\" :size=\\"30\\" :src=\\"scope.row.avatar\\" />\n              <div class=\\"ml-2 inline-flex flex-col\\">\n                <span v-if=\\"locale === \'en-US\' || scope.row.middleName\\" class=\\"text-sm\\">\n                  {{ scope.row.firstname }} {{ scope.row.middleName }} {{ scope.row.lastname }}\n                </span>\n                <span v-else class=\\"text-sm\\">\n                  {{ scope.row.lastname }}{{ scope.row.firstname }}\n                </span>\n                <span class=\\"text-xs text-[var(--el-text-color-secondary)]\\">{{ scope.row.username }}</span>\n              </div>\n            </div>\n          </template>\n        </ElTableColumn>\n        <ElTableColumn show-overflow-tooltip prop=\\"email\\" :label=\\"$t(\'email\')\\" />\n        <ElTableColumn prop=\\"phoneNumber\\" :label=\\"$t(\'phoneNumber\')\\"></ElTableColumn>\n        <ElTableColumn prop=\\"accountNonLocked\\" :label=\\"$t(\'accountNonLocked\')\\">\n          <template #default=\\"scope\\">\n            <ElButton title=\\"unlock\\" :type=\\"scope.row.accountNonLocked ? \'success\' : \'warning\'\\" link\n              @click=\\"lockRow(scope.row)\\" :disabled=\\"!hasAction($route.name, \'unlock\')\\">\n              <Icon\n                :icon=\\"`material-symbols:${scope.row.accountNonLocked ? \'lock-open-right-outline-rounded\' : \'lock-outline\'}`\\"\n                width=\\"18\\" height=\\"18\\" />\n            </ElButton>\n          </template>\n        </ElTableColumn>\n        <ElTableColumn prop=\\"enabled\\" :label=\\"$t(\'enabled\')\\">\n          <template #default=\\"scope\\">\n            <ElSwitch size=\\"small\\" v-model=\\"scope.row.enabled\\" @change=\\"enableChange(scope.row.id)\\"\n              style=\\"--el-switch-on-color: var(--el-color-success);\\" :disabled=\\"!hasAction($route.name, \'enable\')\\" />\n          </template>\n        </ElTableColumn>\n        <ElTableColumn prop=\\"accountExpiresAt\\" :label=\\"$t(\'accountExpiresAt\')\\">\n          <template #default=\\"scope\\">\n            <ElBadge v-if=\\"scope.row.accountExpiresAt\\" is-dot :type=\\"calculate(scope.row.accountExpiresAt)\\"\n              class=\\"mr-1\\" />\n            {{ scope.row.accountExpiresAt ? dayjs(scope.row.accountExpiresAt).format(\'YYYY-MM-DD HH:mm\') : \'-\' }}\n          </template>\n        </ElTableColumn>\n        <ElTableColumn prop=\\"credentialsExpiresAt\\" :label=\\"$t(\'credentialsExpiresAt\')\\">\n          <template #default=\\"scope\\">\n            <ElBadge v-if=\\"scope.row.credentialsExpiresAt\\" is-dot :type=\\"calculate(scope.row.credentialsExpiresAt)\\"\n              class=\\"mr-1\\" />\n            {{ scope.row.credentialsExpiresAt ? dayjs(scope.row.credentialsExpiresAt).format(\'YYYY-MM-DD HH:mm\') :\n              \'-\'\n            }}\n          </template>\n        </ElTableColumn>\n        <ElTableColumn :label=\\"$t(\'actions\')\\">\n          <template #default=\\"scope\\">\n            <ElButton v-if=\\"hasAction($route.name, \'modify\')\\" title=\\" modify\\" size=\\"small\\" type=\\"primary\\" link\n              @click=\\"saveRow(scope.row.id)\\">\n              <Icon icon=\\"material-symbols:edit-outline-rounded\\" width=\\"16\\" height=\\"16\\" />{{ $t(\'modify\') }}\n            </ElButton>\n            <ElPopconfirm :title=\\"$t(\'removeConfirm\')\\" :width=\\"240\\" @confirm=\\"confirmEvent(scope.row.id)\\">\n              <template #reference>\n                <ElButton v-if=\\"hasAction($route.name, \'remove\')\\" title=\\" remove\\" size=\\"small\\" type=\\"danger\\" link>\n                  <Icon icon=\\"material-symbols:delete-outline-rounded\\" width=\\"16\\" height=\\"16\\" />{{ $t(\'remove\') }}\n                </ElButton>\n              </template>\n            </ElPopconfirm>\n          </template>\n        </ElTableColumn>\n      </ElTable>\n      <ElPagination layout=\\"prev, pager, next, sizes, jumper, ->, total\\" @change=\\"pageChange\\" :total=\\"total\\" />\n    </ElCard>\n  </ElSpace>\n\n  <DialogView v-model=\\"visible\\" :title=\\"$t(\'users\')\\" width=\\"36%\\">\n    <ElForm ref=\\"formRef\\" :model=\\"form\\" :rules=\\"rules\\" label-position=\\"top\\">\n      <ElRow :gutter=\\"20\\" class=\\"w-full !mx-0\\">\n        <ElCol :span=\\"8\\">\n          <ElFormItem :label=\\"$t(\'firstname\')\\" prop=\\"firstname\\">\n            <ElInput type=\\"email\\" v-model=\\"form.firstname\\" :placeholder=\\"$t(\'inputText\', { field: $t(\'firstname\') })\\"\n              :maxLength=\\"50\\" />\n          </ElFormItem>\n        </ElCol>\n        <ElCol :span=\\"8\\">\n          <ElFormItem :label=\\"$t(\'middleName\')\\" prop=\\"middleName\\">\n            <ElInput type=\\"email\\" v-model=\\"form.middleName\\" :placeholder=\\"$t(\'inputText\', { field: $t(\'middleName\') })\\"\n              :maxLength=\\"50\\" />\n          </ElFormItem>\n        </ElCol>\n        <ElCol :span=\\"8\\">\n          <ElFormItem :label=\\"$t(\'lastname\')\\" prop=\\"lastname\\">\n            <ElInput v-model=\\"form.lastname\\" :placeholder=\\"$t(\'inputText\', { field: $t(\'lastname\') })\\"\n              :maxLength=\\"50\\" />\n          </ElFormItem>\n        </ElCol>\n      </ElRow>\n      <ElRow :gutter=\\"20\\" class=\\"w-full !mx-0\\">\n        <ElCol :span=\\"12\\">\n          <ElFormItem :label=\\"$t(\'username\')\\" prop=\\"username\\">\n            <ElInput v-model=\\"form.username\\" :placeholder=\\"$t(\'inputText\', { field: $t(\'username\') })\\" :maxLength=\\"50\\"\n              :disabled=\\"!!form.id\\" />\n          </ElFormItem>\n        </ElCol>\n        <ElCol :span=\\"12\\">\n          <ElFormItem :label=\\"$t(\'phoneNumber\')\\" prop=\\"phoneNumber\\">\n            <ElInput type=\\"tel\\" v-model=\\"form.phoneNumber\\" :placeholder=\\"$t(\'inputText\', { field: $t(\'phoneNumber\') })\\"\n              :maxLength=\\"20\\" :disabled=\\"!!form.id\\" />\n          </ElFormItem>\n        </ElCol>\n      </ElRow>\n      <ElRow :gutter=\\"20\\" class=\\"w-full !mx-0\\">\n        <ElCol :span=\\"24\\">\n          <ElFormItem :label=\\"$t(\'email\')\\" prop=\\"email\\">\n            <ElInput type=\\"email\\" v-model=\\"form.email\\" :placeholder=\\"$t(\'inputText\', { field: $t(\'email\') })\\"\n              :maxLength=\\"50\\" :disabled=\\"!!form.id\\" />\n          </ElFormItem>\n        </ElCol>\n      </ElRow>\n      <ElRow :gutter=\\"20\\" class=\\"w-full !mx-0\\">\n        <ElCol :span=\\"12\\">\n          <ElFormItem :label=\\"$t(\'accountExpiresAt\')\\" prop=\\"accountExpiresAt\\">\n            <ElDatePicker v-model=\\"form.accountExpiresAt\\" type=\\"datetime\\" :placeholder=\\"$t(\'selectText\')\\" />\n          </ElFormItem>\n        </ElCol>\n        <ElCol :span=\\"12\\">\n          <ElFormItem :label=\\"$t(\'credentialsExpiresAt\')\\" prop=\\"credentialsExpiresAt\\">\n            <ElDatePicker v-model=\\"form.credentialsExpiresAt\\" type=\\"datetime\\" :placeholder=\\"$t(\'selectText\')\\" />\n          </ElFormItem>\n        </ElCol>\n      </ElRow>\n    </ElForm>\n    <template #footer>\n      <ElButton title=\\"cancel\\" @click=\\"visible = false\\">\n        <Icon icon=\\"material-symbols:close\\" width=\\"18\\" height=\\"18\\" />{{ $t(\'cancel\') }}\n      </ElButton>\n      <ElButton title=\\"submit\\" type=\\"primary\\" :loading=\\"saveLoading\\" @click=\\"onSubmit(formRef)\\">\n        <Icon icon=\\"material-symbols:check-circle-outline-rounded\\" width=\\"18\\" height=\\"18\\" /> {{ $t(\'submit\') }}\n      </ElButton>\n    </template>\n  </DialogView>\n\n  <!-- import -->\n  <DialogView v-model=\\"importVisible\\" :title=\\"$t(\'import\')\\" width=\\"36%\\">\n    <p>{{ $t(\'samples\') + \' \' + $t(\'download\') }}：\n      <a :href=\\"`samples/users.xlsx`\\" :download=\\"$t(\'users\') + \'.xlsx\'\\">\n        {{ $t(\'users\') }}.xlsx\n      </a>\n    </p>\n    <ElUpload ref=\\"importRef\\" :limit=\\"1\\" drag :auto-upload=\\"false\\" :http-request=\\"onUpload\\" :on-success=\\"load\\"\n      accept=\\".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel\\"\n      :headers=\\"{ Authorization: `Bearer ${userStore.accessToken}` }\\">\n      <div class=\\"el-icon--upload inline-flex justify-center\\">\n        <Icon icon=\\"material-symbols:upload-rounded\\" width=\\"48\\" height=\\"48\\" />\n      </div>\n      <div class=\\"el-upload__text\\">\n        {{ $t(\'drop2Here\') }}<em>{{ $t(\'click2Upload\') }}</em>\n      </div>\n      <template #tip>\n        <div class=\\"el-upload__tip\\">\n          {{ $t(\'fileSizeLimit\', { size: \'50MB\' }) }}\n        </div>\n      </template>\n    </ElUpload>\n    <p class=\\"text-red\\">xxxx</p>\n    <template #footer>\n      <ElButton title=\\"cancel\\" @click=\\"importVisible = false\\">\n        <Icon icon=\\"material-symbols:close\\" width=\\"18\\" height=\\"18\\" />{{ $t(\'cancel\') }}\n      </ElButton>\n      <ElButton title=\\"submit\\" type=\\"primary\\" :loading=\\"importLoading\\" @click=\\"onImportSubmit(importRef)\\">\n        <Icon icon=\\"material-symbols:check-circle-outline-rounded\\" width=\\"18\\" height=\\"18\\" /> {{ $t(\'submit\') }}\n      </ElButton>\n    </template>\n  </DialogView>\n</template>\n\n<style lang=\\"scss\\" scoped>\n.el-badge {\n  display: inline-flex;\n  vertical-align: baseline;\n}\n</style>\n',
            children: []
          }
        ]
      },
      {
        id: 222,
        name: 'groups',
        children: [
          {
            id: 2221,
            name: 'IndexPage',
            content: '',
            suffix: '.vue',
            children: []
          }
        ]
      }
    ]
  }
]

const resources = [
  {
    id: 23,
    name: 'application',
    suffix: '.yaml',
    content: 'server.port: 8080'
  },
]

const sampleNodes: SampleNode = {
  frontend: frontend,
  backend: backend,
  resources: resources
}

export const schemasHandlers = [
  http.get(`/api${SERVER_URL.SCHEMA}/:id/preview`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(sampleNodes)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEMA}/:id/fields`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(fields)
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEMA}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.filter(item => item.id === Number(id))[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCHEMA}/:id/exists`, ({ params }) => {
    const { id, name } = params
    let filtered = datas.filter(item => item.name === name)
    if (id) {
      filtered = datas.filter(item => item.name === name && item.id !== Number(id))
    }
    return HttpResponse.json(filtered.length > 0)
  }),
  http.get(`/api${SERVER_URL.SCHEMA}`, ({ request }) => {
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
  http.post(`/api${SERVER_URL.SCHEMA}/:id/download`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
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
  http.patch(`/api${SERVER_URL.SCHEMA}/:id`, async ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.SCHEMA}/sync`, async ({ request }) => {
    const data = await request.json()
    if (data) {
      return HttpResponse.json()
    }
    return HttpResponse.error()
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
    return HttpResponse.json(deletedData)
  })
]
