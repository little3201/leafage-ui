<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import type { TableInstance, FormInstance, FormRules, TreeInstance, UploadInstance, UploadRequestOptions, CheckboxValueType, TransferDirection, TransferKey } from 'element-plus'
import draggable from 'vuedraggable'
import { useI18n } from 'vue-i18n'
import { useUserStore } from 'stores/user-store'
import DialogView from 'components/DialogView.vue'
import {
  retrieveGroups, createGroup, modifyGroup, removeGroup, enableGroup, checkGroupExists, fetchGroup, importGroups,
  retrieveGroupMembers, retrieveGroupTree, relationGroupMembers, removeGroupMembers, retrieveGroupPrivileges, relationGroupPrivileges
} from 'src/api/groups'
import { retrieveUsers } from 'src/api/users'
import type { Pagination, Group, TreeNode, GroupMembers, User, GroupPrivileges } from 'src/types'
import { Icon } from '@iconify/vue'
import { hasAction, exportToCSV } from 'src/utils'
import { actions } from 'src/constants'


const { t, locale } = useI18n()
const userStore = useUserStore()

const loading = ref<boolean>(false)
const datas = ref<Array<Group>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const checkAll = ref<boolean>(true)
const isIndeterminate = ref<boolean>(false)
const checkedColumns = ref<Array<string>>(['name', 'enabled', 'description'])
const columns = ref<Array<string>>(['name', 'enabled', 'description'])

const treeEl = ref<TreeInstance>()
const treeLoading = ref<boolean>(false)
const currentNodeKey = ref<number>()
const currentNode = ref('')

const groupTree = ref<TreeNode[]>([])
const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const view = ref<'table' | 'tree'>('table')

const relationVisible = ref<boolean>(false)
const relations = ref<Array<string>>([])
const members = ref([])

const authorizeVisible = ref<boolean>(false)
const authorizeLoading = ref<boolean>(false)
const authorities = ref<Array<{
  privilegeId: number,
  actions: string[]
}>>([])


const importVisible = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const importRef = ref<UploadInstance>()

const filters = ref({
  superiorId: null as number | null,
  name: null
})

const formRef = ref<FormInstance>()
const initialValues: Group = {
  id: undefined,
  name: ''
}
const form = ref<Group>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, message: t('inputText', { field: t('name') }), trigger: 'blur' },
    { validator: checkNameExistsence, trigger: 'blur' }
  ]
})

function checkNameExistsence(rule: unknown, value: string, callback: (error?: string | Error) => void) {
  checkGroupExists(value, form.value.id).then(res => {
    if (res.data) {
      callback(new Error(t('alreadyExists', { field: t('name') })))
    } else {
      callback()
    }
  })
}

/**
 * tree过滤
 */
const filterNode = (value: string, data: { [key: string]: string }) => {
  if (!value) return true
  return data.name!.includes(value)
}

/**
 * node 变化
 * @param data node节点
 */
function currentChange(data: TreeNode) {
  if (currentNodeKey.value === data.id) {
    return
  }
  currentNodeKey.value = data.id as number
  pagination.page = 1
  load()
}

async function loadUsers() {
  retrieveUsers({ page: 1, size: 99 }).then(res => {
    members.value = res.data.content.map((item: User) => ({
      ...item,
      fullName: (locale.value === 'en-US' || item.middleName) ? `${item.firstname} ${item.middleName} ${item.lastname}` : `${item.lastname}${item.firstname}`
    }))
  })
}

async function loadGroupUsers(id: number) {
  retrieveGroupMembers(id).then(res => { relations.value = res.data.map((item: GroupMembers) => item.username) })
}

/**
 * 加载tree
 */
async function loadTree() {
  treeLoading.value = true
  retrieveGroupTree().then(res => {
    groupTree.value = res.data
    if (!currentNodeKey.value) {
      currentNodeKey.value = (res.data[0] && res.data[0]?.id) || ''
    }

    treeEl.value!.setCurrentKey(currentNodeKey.value)

    load()
  }).finally(() => { treeLoading.value = false })
}

/**
 * 分页变化
 * @param currentPage 当前页码
 * @param pageSize 分页大小
 */
function pageChange(currentPage: number, pageSize: number) {
  pagination.page = currentPage
  pagination.size = pageSize
  load()
}

/**
 * 加载列表
 */
async function load() {
  loading.value = true
  filters.value.superiorId = currentNodeKey.value ?? null
  retrieveGroups(pagination, filters.value).then(res => {
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  }).finally(() => { loading.value = false })
}

/**
 * reset
 */
function reset() {
  filters.value.name = null
  load()
}

/**
 * 监听tree
 */
watch(
  () => currentNode.value,
  (val) => {
    treeEl.value!.filter(val)
  }
)

onMounted(() => {
  loadTree()
})

function onViewChange() {
  view.value = view.value === 'table' ? 'tree' : 'table'
}

/**
 * 导入
 */
function importRows() {
  importVisible.value = true
}

/**
 * 导出
 */
function exportRows() {
  exportLoading.value = true

  const selectedRows = tableRef.value?.getSelectionRows()
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, 'groups')
  }
  exportLoading.value = false
}

/**
 * 关联弹出框
 * @param id 主键
 */
function relationRow(id: number) {
  relationVisible.value = true
  loadUsers()
  if (id) {
    form.value.id = id
    loadGroupUsers(id)
  }
}

async function authorizeRow(id: number) {
  authorities.value = []
  retrieveGroupPrivileges(id).then(res => {
    authorities.value = res.data.map((row: GroupPrivileges) => ({ privilegeId: row.privilegeId, actions: row.actions }))
  })
  authorizeVisible.value = true
}

/**
 * 新增、编辑弹出框
 * @param id 主键
 */
function saveRow(id?: number) {
  form.value = { ...initialValues }
  if (id) {
    loadOne(id)
  }
  visible.value = true
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  fetchGroup(id).then(res => {
    form.value = res.data
  })
}

/**
 * 启用、停用
 * @param id 主键
 */
async function enableChange(id: number) {
  enableGroup(id).then(() => { load() })
}

/**
 * 表单提交
 */
function onSubmit(formEl: FormInstance | undefined) {
  if (!formEl) return

  formEl.validate((valid) => {
    if (valid) {
      saveLoading.value = true
      if (form.value.id) {
        modifyGroup(form.value.id, form.value).then(() => {
          load()
          loadTree()
          visible.value = false
        }).finally(() => { saveLoading.value = false })
      } else {
        form.value.superiorId = currentNodeKey.value
        createGroup(form.value).then(() => {
          load()
          loadTree()
          visible.value = false
        }).finally(() => { saveLoading.value = false })
      }
    }
  })
}

async function onAuthorizeSubmit() {
  authorizeLoading.value = true
  if (form.value.id) {
    relationGroupPrivileges(form.value.id, authorities.value)
  }
}

/**
 * 导入提交
 */
async function onImportSubmit(importEl: UploadInstance | undefined) {
  if (!importEl) return
  importLoading.value = true

  importEl.submit()

  importLoading.value = false
  importVisible.value = false
}

function onUpload(options: UploadRequestOptions) {
  return importGroups(options.file)
}

/**
 * 删除
 * @param id 主键
 */
function removeRow(id: number) {
  removeGroup(id).then(() => {
    load()
    loadTree()
  })
}

/**
 * 确认
 * @param id 主键
 */
function confirmEvent(id: number) {
  if (id) {
    removeRow(id)
  }
}

/**
 * 全选操作
 * @param val 是否全选
 */
function handleCheckAllChange(val: CheckboxValueType) {
  checkedColumns.value = val ? columns.value : []
  isIndeterminate.value = false
}

/**
 * 选中操作
 * @param value 选中的值
 */
function handleCheckedChange(value: CheckboxValueType[]) {
  const checkedCount = value.length
  checkAll.value = checkedCount === columns.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < columns.value.length
}

function handleTransferChange(value: TransferKey[], direction: TransferDirection) {
  if (form.value.id) {
    if (direction === 'right') {
      relationGroupMembers(form.value.id, value as string[])
    } else {
      removeGroupMembers(form.value.id, value as string[])
    }
  }
}

function handleActionCheck(privilegeId: number, item: string) {
  // 查找对应 privilegeId 的对象
  const keyIndex = authorities.value.findIndex(a => a.privilegeId === privilegeId)

  if (keyIndex >= 0) {
    // 如果已存在该 key，更新 actions
    const existingAction = authorities.value[keyIndex]
    if (existingAction) {
      const itemIndex = existingAction.actions.indexOf(item)

      if (itemIndex >= 0) {
        // 如果 actions 中已有该 item，则移除
        existingAction.actions.splice(itemIndex, 1)

        // 如果 actions 为空数组，则删除整个对象
        if (existingAction.actions.length === 0) {
          authorities.value.splice(keyIndex, 1)
        }
      } else {
        existingAction.actions.push(item)
      }
    }
  } else {
    authorities.value.push({
      privilegeId,
      actions: [item]
    })
  }
}
</script>

<template>
  <ElSpace size="large" alignment="flex-start">
    <ElCard class="w-64" shadow="never">
      <ElFormItem prop="currentNode">
        <ElInput v-model="currentNode" :placeholder="$t('search')" clearable>
          <template #prefix>
            <Icon icon="material-symbols:search-rounded" width="18" height="18" />
          </template>
        </ElInput>
      </ElFormItem>
      <ElDivider />
      <ElTree ref="treeEl" v-loading="treeLoading" :data="groupTree" default-expand-all :expand-on-click-node="false"
        node-key="id" :current-node-key="currentNodeKey" :props="{ label: 'name' }" :filter-node-method="filterNode"
        @current-change="currentChange">
      </ElTree>
    </ElCard>

    <ElSpace size="large" fill>
      <ElCard shadow="never">
        <ElForm inline :model="filters" @submit.prevent>
          <ElFormItem :label="$t('name')" prop="name">
            <ElInput v-model="filters.name" :placeholder="$t('inputText', { field: $t('name') })" />
          </ElFormItem>
          <ElFormItem>
            <ElButton title="search" type="primary" @click="load">
              <Icon icon="material-symbols:search-rounded" width="18" height="18" />{{ $t('search') }}
            </ElButton>
            <ElButton title="reset" @click="reset">
              <Icon icon="material-symbols:replay-rounded" width="18" height="18" />{{ $t('reset') }}
            </ElButton>
          </ElFormItem>
        </ElForm>
      </ElCard>

      <ElCard shadow="never">
        <ElRow :gutter="20" justify="space-between" class="mb-4">
          <ElCol :span="16" class="text-left">
            <ElButton v-if="hasAction($route.name, 'create')" title=" create" type="primary" @click="saveRow()">
              <Icon icon="material-symbols:add-rounded" width="18" height="18" />{{ $t('create') }}
            </ElButton>
            <ElButton v-if="hasAction($route.name, 'import')" title=" import" type="warning" plain @click="importRows">
              <Icon icon="material-symbols:database-upload-outline-rounded" width="18" height="18" />{{ $t('import')
              }}
            </ElButton>
            <ElButton v-if="hasAction($route.name, 'export')" title=" export" type="success" plain @click="exportRows"
              :loading="exportLoading">
              <Icon icon="material-symbols:file-export-outline-rounded" width="18" height="18" />{{ $t('export') }}
            </ElButton>
          </ElCol>

          <ElCol :span="8" class="text-right">
            <ElTooltip :content="$t('refresh')" placement="top">
              <ElButton title="view" plain circle @click="load">
                <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
              </ElButton>
            </ElTooltip>
            <ElTooltip :content="$t('view')" placement="top">
              <ElButton title="view" type="primary" plain circle @click="onViewChange">
                <Icon
                  :icon="`material-symbols:${view === 'table' ? 'account-tree-outline-rounded' : 'view-list-outline'}`"
                  width="18" height="18" />
              </ElButton>
            </ElTooltip>

            <ElTooltip :content="$t('column') + $t('settings')" placement="top">
              <div class="inline-flex items-center align-middle ml-3">
                <ElPopover :width="200" trigger="click">
                  <template #reference>
                    <ElButton title="settings" type="success" plain circle>
                      <Icon icon="material-symbols:format-list-bulleted" width="18" height="18" />
                    </ElButton>
                  </template>
                  <div>
                    <ElCheckbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
                      {{ $t('all') }}
                    </ElCheckbox>
                    <ElDivider />
                    <ElCheckboxGroup v-model="checkedColumns" @change="handleCheckedChange">
                      <draggable v-model="columns" item-key="simple">
                        <template #item="{ element }">
                          <div class="flex items-center space-x-2">
                            <Icon icon="material-symbols:drag-indicator" width="18" height="18"
                              class="hover:cursor-move" />
                            <ElCheckbox :label="element" :value="element" :disabled="element === columns[0]">
                              <div class="inline-flex items-center space-x-4">
                                {{ $t(element) }}
                              </div>
                            </ElCheckbox>
                          </div>
                        </template>
                      </draggable>
                    </ElCheckboxGroup>
                  </div>
                </ElPopover>
              </div>
            </ElTooltip>
          </ElCol>
        </ElRow>

        <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" stripe table-layout="auto">
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn type="index" :label="$t('no')" width="55" />
          <ElTableColumn prop="name" :label="$t('name')" sortable />
          <ElTableColumn prop="enabled" :label="$t('enabled')" sortable>
            <template #default="scope">
              <ElSwitch size="small" v-model="scope.row.enabled" @change="enableChange(scope.row.id)"
                style="--el-switch-on-color: var(--el-color-success);" :disabled="!hasAction($route.name, 'enable')" />
            </template>
          </ElTableColumn>
          <ElTableColumn show-overflow-tooltip prop="description" :label="$t('description')" />
          <ElTableColumn :label="$t('actions')">
            <template #default="scope">
              <ElButton v-if="hasAction($route.name, 'modify')" title=" modify" size="small" type="primary" link
                @click="saveRow(scope.row.id)">
                <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('modify') }}
              </ElButton>
              <ElButton v-if="hasAction($route.name, 'relation')" title=" relation" size="small" type="success" link
                @click="relationRow(scope.row.id)">
                <Icon icon="material-symbols:link-rounded" width="16" height="16" />{{ $t('relation') }}
              </ElButton>
              <ElButton v-if="hasAction($route.name, 'authorize')" title="authorize" size="small" type="success" link
                @click="authorizeRow(scope.row.id)">
                <Icon icon="material-symbols:privacy-tip-outline-rounded" width="16" height="16" />{{ $t('authorize') }}
              </ElButton>
              <ElPopconfirm v-if="!scope.row.hasChildren" :title="$t('removeConfirm')" :width="240"
                @confirm="confirmEvent(scope.row.id)">
                <template #reference>
                  <ElButton v-if="hasAction($route.name, 'remove')" title=" remove" size="small" type="danger" link>
                    <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16" />{{ $t('remove') }}
                  </ElButton>
                </template>
              </ElPopconfirm>
            </template>
          </ElTableColumn>
        </ElTable>
        <ElPagination layout="prev, pager, next, sizes, jumper, ->, total" @change="pageChange" :total="total" />
      </ElCard>
    </ElSpace>
  </ElSpace>

  <!-- form -->
  <DialogView v-model="visible" :title="$t('groups')" width="25%">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20" class="w-full !mx-0">
        <ElCol>
          <ElFormItem :label="$t('name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('inputText', { field: $t('name') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20" class="w-full !mx-0">
        <ElCol>
          <ElFormItem :label="$t('description')" prop="description">
            <ElInput v-model="form.description" type="textarea"
              :placeholder="$t('inputText', { field: $t('description') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton title="cancel" @click="visible = false">
        <Icon icon="material-symbols:close" width="18" height="18" />{{ $t('cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="18" height="18" /> {{ $t('submit') }}
      </ElButton>
    </template>
  </DialogView>

  <!-- relation -->
  <DialogView v-model="relationVisible" show-close :title="$t('relation')">
    <div style="text-align: center">
      <ElTransfer v-model="relations" :props="{ key: 'username', label: 'fullName' }"
        :titles="[$t('unselected'), $t('selected')]" filterable :data="members" @change="handleTransferChange" />
    </div>
  </DialogView>

  <!-- authorize -->
  <DialogView v-model="authorizeVisible" :title="$t('authorize')" width="65%" :max-height="500">
    <ElTree :data="userStore.privileges" :props="{ label: 'name' }" node-key="id" show-checkbox default-expand-all
      :default-checked-keys="authorities.map(item => item.privilegeId)" :check-on-click-leaf="false">
      <template #default="{ node, data }">
        <div class="flex flex-1 ">
          <Icon v-if="data.meta.icon" :icon="`material-symbols:${data.meta.icon}-rounded`" width="18" height="18"
            class="mr-2" />
          <span>{{ $t(node.label) }}</span>
        </div>
        <div>
          <ElCheckTag v-for="item in data.meta.actions" :key="item"
            :checked="(authorities.find(a => a.privilegeId === data.id)?.actions || []).includes(item)"
            :type="actions[item]" class="mr-2" @change="handleActionCheck(data.id, item)">
            {{ $t(item) }}
          </ElCheckTag>
        </div>
      </template>
    </ElTree>
    <template #footer>
      <ElButton title="cancel" @click="authorizeVisible = false">
        <Icon icon="material-symbols:close" width="18" height="18" />{{ $t('cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="authorizeLoading" @click="onAuthorizeSubmit">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="18" height="18" /> {{ $t('submit') }}
      </ElButton>
    </template>
  </DialogView>

  <!-- import -->
  <DialogView v-model="importVisible" :title="$t('import')" width="36%">
    <p>{{ $t('master_plates') + ' ' + $t('download') }}：
      <a :href="`templates/groups.xlsx`" :download="$t('groups') + '.xlsx'">
        {{ $t('groups') }}.xlsx
      </a>
    </p>
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" :http-request="onUpload" :on-success="load"
      accept=".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      :headers="{ Authorization: `Bearer ${userStore.accessToken}` }">
      <div class="el-icon--upload inline-flex justify-center">
        <Icon icon="material-symbols:upload-rounded" width="48" height="48" />
      </div>
      <div class="el-upload__text">
        {{ $t('drop2Here') }}<em>{{ $t('click2Upload') }}</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ $t('fileSizeLimit', { size: '50MB' }) }}
        </div>
      </template>
    </ElUpload>
    <p class="text-red">xxxx</p>
    <template #footer>
      <ElButton title="cancel" @click="importVisible = false">
        <Icon icon="material-symbols:close" width="18" height="18" />{{ $t('cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="importLoading" @click="onImportSubmit(importRef)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="18" height="18" /> {{ $t('submit') }}
      </ElButton>
    </template>
  </DialogView>
</template>

<style lang="scss" scoped>
.el-check-tag {
  padding: 4px 9px;
}
</style>