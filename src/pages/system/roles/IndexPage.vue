<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { TableInstance, FormInstance, FormRules, UploadInstance, UploadRequestOptions, TransferDirection, TransferKey } from 'element-plus'
import type { Pagination, Role, RoleMembers, RolePrivileges, TreeNode } from 'src/types'
import { useI18n } from 'vue-i18n'
import { useUserStore } from 'stores/user-store'
import {
  retrieveRoles, fetchRole, createRole, modifyRole, removeRole, enableRole, importRoles,
  retrieveRoleMembers, relationRoleMembers, removeRoleMembers, retrieveRolePrivileges, relationRolePrivileges,
  removeRolePrivileges
} from 'src/api/roles'
import { retrieveUsers } from 'src/api/users'
import { Icon } from '@iconify/vue'
import { hasAction, exportToCSV } from 'src/utils'
import { actions } from 'src/constants'


const { t } = useI18n()
const userStore = useUserStore()

const loading = ref<boolean>(false)
const datas = ref<Array<Role>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const relationVisible = ref<boolean>(false)
const members = ref([])
const relations = ref<Array<string>>([])

const authorizeVisible = ref<boolean>(false)
const authorities = ref<Array<{
  privilegeId: number,
  actions: string[]
}>>([])

const importVisible = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const importRef = ref<UploadInstance>()

const filters = ref({
  name: null
})

const formRef = ref<FormInstance>()
const initialValues: Role = {
  id: undefined,
  name: ''
}
const form = ref<Role>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, message: t('inputText', { field: t('name') }), trigger: 'blur' }
  ]
})

async function loadUsers() {
  retrieveUsers({ page: 1, size: 99 }).then(res => {
    members.value = res.data.content
  })
}

async function loadRoleUsers(id: number) {
  retrieveRoleMembers(id).then(res => { relations.value = res.data.map((item: RoleMembers) => item.username) })
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
  retrieveRoles(pagination, filters.value).then(res => {
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  }).finally(() => { loading.value = false })
}

/**
 * reset
 */
function reset() {
  filters.value = {
    name: null
  }
  load()
}

onMounted(() => {
  load()
})

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
    exportToCSV(selectedRows, 'roles')
  }
  exportLoading.value = false
}

/**
 * 关联弹出框
 * @param id 主键
 */
async function relationRow(id: number) {
  relationVisible.value = true
  loadUsers()
  if (id) {
    form.value.id = id
    loadRoleUsers(id)
  }
}

async function authorizeRow(id: number) {
  authorities.value = []
  form.value.id = id
  retrieveRolePrivileges(id).then(res => {
    authorities.value = res.data.map((row: RolePrivileges) => ({ privilegeId: row.privilegeId, actions: row.actions }))
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
  fetchRole(id).then(res => {
    form.value = res.data
  })
}

/**
 * 启用、停用
 * @param id 主键
 */
async function enableChange(id: number) {
  enableRole(id).then(() => { load() })
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
        modifyRole(form.value.id, form.value).then(() => {
          load()
          visible.value = false
        }).finally(() => { saveLoading.value = false })
      } else {
        createRole(form.value).then(() => {
          load()
          visible.value = false
        }).finally(() => { saveLoading.value = false })
      }
    }
  })
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
  return importRoles(options.file)
}

/**
 * 删除
 * @param id 主键
 */
function removeRow(id: number) {
  removeRole(id)
    .then(() => load())
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



function handleTransferChange(value: TransferKey[], direction: TransferDirection) {
  if (form.value.id) {
    if (direction === 'right') {
      relationRoleMembers(form.value.id, value as string[])
    } else {
      removeRoleMembers(form.value.id, value as string[])
    }
  }
}

/**
 * 权限树check事件
 * @param data 树节点
 * @param checked 是否checked
 */
function handleCheckChange(data: TreeNode, checked: boolean) {
  if (!data.id || (data.children?.length ?? 0) > 0 || !form.value.id) return

  // 检查是否已授权
  const keyIndex = authorities.value.findIndex(a => a.privilegeId === data.id)

  if (checked && keyIndex === -1) {
    authorities.value.push({ privilegeId: data.id, actions: [] })
    relationRolePrivileges(form.value.id, data.id)
  } else if (!checked && keyIndex !== -1) {
    authorities.value.splice(keyIndex, 1)
    removeRolePrivileges(form.value.id, data.id)
  }
}

function handleActionCheck(privilegeId: number, item: string) {
  if (!form.value.id) return
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
        removeRolePrivileges(form.value.id, privilegeId, item)

      } else {
        existingAction.actions.push(item)
        relationRolePrivileges(form.value.id, privilegeId, item)
      }
    }
  } else {
    authorities.value.push({ privilegeId, actions: [item] })
    relationRolePrivileges(form.value.id, privilegeId, item)
  }
}
</script>

<template>
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
          <ElTooltip class="box-item" effect="dark" :content="$t('refresh')" placement="top">
            <ElButton title="view" plain circle @click="load">
              <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
            </ElButton>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
        <ElTableColumn type="selection" />
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
            <ElPopconfirm :title="$t('removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
              <template #reference>
                <ElButton v-if="hasAction($route.name, 'remove')" title=" remove" size="small" type="danger" link>
                  <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16" />{{ $t('remove') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination layout="slot, ->, total, prev, pager, next, sizes" @change="pageChange" :total="total">
        <template #default>
          {{ $t('selectedTotal', { total: tableRef?.getSelectionRows().length }) }}
        </template>
      </ElPagination>
    </ElCard>
  </ElSpace>

  <!-- form -->
  <ElDialog v-model="visible" align-center :title="$t('roles')" width="25%">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('inputText', { field: $t('name') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
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
  </ElDialog>

  <!-- relation -->
  <ElDialog v-model="relationVisible" show-close :title="$t('relation')">
    <div style="text-align: center">
      <ElTransfer v-model="relations" :props="{ key: 'username', label: 'fullName' }"
        :titles="[$t('unselected'), $t('selected')]" filterable :data="members" @change="handleTransferChange" />
    </div>
  </ElDialog>

  <!-- authorize -->
  <ElDialog v-model="authorizeVisible" show-close :title="$t('authorize')" width="65%" :max-height="500">
    <ElTree :data="userStore.privileges" :props="{ label: 'name' }" node-key="id" show-checkbox default-expand-all
      :default-checked-keys="authorities.map(item => item.privilegeId)" :check-on-click-leaf="false"
      @check-change="handleCheckChange">
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
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('import')" width="36%">
    <p>{{ $t('samples') + ' ' + $t('download') }}：
      <a :href="`templates/roles.xlsx`" :download="$t('roles') + '.xlsx'">
        {{ $t('roles') }}.xlsx
      </a>
    </p>
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" :http-request="onUpload" :on-success="load"
      accept=".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
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
  </ElDialog>
</template>

<style lang="scss" scoped>
.el-check-tag {
  padding: 4px 9px;
}
</style>