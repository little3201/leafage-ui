<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { TableInstance, FormInstance, FormRules, UploadInstance, UploadRequestOptions } from 'element-plus'
import { dayjs } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  retrieveUsers, fetchUser, createUser, modifyUser, removeUser, enableUser, unlockUser, importUsers
} from 'src/api/users'
import type { Pagination, User } from 'src/types'
import { Icon } from '@iconify/vue'
import { calculate, hasAction, exportToExcel } from 'src/utils'


const { t } = useI18n()

const cdn_url = import.meta.env.VITE_APP_CDN_URL
const loading = ref<boolean>(false)
const datas = ref<Array<User>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const importVisible = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const importRef = ref<UploadInstance>()

const filters = ref({
  username: null
})

const formRef = ref<FormInstance>()
const initialValues: User = {
  id: undefined,
  username: '',
  name: '',
  email: ''
}
const form = ref<User>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  username: [
    { required: true, message: t('inputText', { field: t('username') }), trigger: 'blur' }
  ],
  name: [
    { required: true, message: t('inputText', { field: t('name_') }), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('inputText', { field: t('email') }), trigger: 'blur' }
  ]
})

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
  retrieveUsers(pagination, filters.value).then(res => {
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  }).finally(() => { loading.value = false })
}

/**
 * reset
 */
function reset() {
  filters.value = {
    username: null
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
    exportToExcel(selectedRows, 'users')
  }
  exportLoading.value = false
}

/**
 * 弹出框
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
  fetchUser(id).then(res => {
    form.value = res.data
  })
}

/**
 * 启用、停用
 * @param id 主键
 */
async function enableChange(id: number) {
  enableUser(id).then(() => { load() })
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
        modifyUser(form.value.id, form.value).then(() => {
          load()
          visible.value = false
        }).finally(() => { saveLoading.value = false })
      } else {
        createUser(form.value).then(() => {
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
  return importUsers(options.file)
}

/**
 * 删除
 * @param id 主键
 */
function removeRow(id: number) {
  removeUser(id).then(() => load())
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
 * 解锁/上锁
 * @param row 数据
 */
function lockRow(id: number) {
  unlockUser(id).then(() => load())
}


</script>

<template>
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filters" @submit.prevent>
        <ElFormItem :label="$t('username')" prop="username">
          <ElInput v-model="filters.username" :placeholder="$t('inputText', { field: $t('username') })" />
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
            <Icon icon="material-symbols:database-upload-outline-rounded" width="18" height="18" />{{ $t('import') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'export')" title=" export" type="success" plain @click="exportRows"
            :loading="exportLoading">
            <Icon icon="material-symbols:file-export-outline-rounded" width="18" height="18" />{{ $t('export') }}
          </ElButton>
        </ElCol>

        <ElCol :span="8" class="text-right">
          <ElTooltip effect="dark" :content="$t('refresh')" placement="top">
            <ElButton title="view" plain circle @click="load">
              <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
            </ElButton>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
        <ElTableColumn type="selection" />
        <ElTableColumn type="index" :label="$t('no')" width="55" />
        <ElTableColumn prop="username" :label="$t('username')" sortable>
          <template #default="scope">
            <div class="flex items-center space-x-2">
              <ElAvatar alt="avatar" :size="30" :src="`${cdn_url}/${scope.row.username}`" />
              <div class="inline-flex flex-col">
                <span class="text-sm">
                  {{ scope.row.name }}
                </span>
                <span class="text-xs text-(--el-text-color-secondary)">{{ scope.row.username }}</span>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip prop="email" :label="$t('email')" />
        <ElTableColumn prop="accountNonLocked" :label="$t('accountNonLocked')" sortable>
          <template #default="scope">
            <ElButton title="unlock" :type="scope.row.accountNonLocked ? 'success' : 'warning'" link
              @click="lockRow(scope.row.id)" :disabled="!hasAction($route.name, 'unlock')">
              <Icon
                :icon="`material-symbols:${scope.row.accountNonLocked ? 'lock-open-right-outline-rounded' : 'lock-outline'}`"
                width="18" height="18" />
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="enabled" :label="$t('enabled')" sortable>
          <template #default="scope">
            <ElSwitch size="small" v-model="scope.row.enabled" @change="enableChange(scope.row.id)"
              style="--el-switch-on-color: var(--el-color-success);" :disabled="!hasAction($route.name, 'enable')" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="accountExpiresAt" :label="$t('accountExpiresAt')" sortable>
          <template #default="scope">
            <ElBadge v-if="scope.row.accountExpiresAt" is-dot :type="calculate(scope.row.accountExpiresAt)"
              class="mr-1" />
            {{ scope.row.accountExpiresAt ? dayjs(scope.row.accountExpiresAt).format('YYYY-MM-DD HH:mm') : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="credentialsExpiresAt" :label="$t('credentialsExpiresAt')" sortable>
          <template #default="scope">
            <ElBadge v-if="scope.row.credentialsExpiresAt" is-dot :type="calculate(scope.row.credentialsExpiresAt)"
              class="mr-1" />
            {{ scope.row.credentialsExpiresAt ? dayjs(scope.row.credentialsExpiresAt).format('YYYY-MM-DD HH:mm') :
              '-'
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('actions')">
          <template #default="scope">
            <ElButton v-if="hasAction($route.name, 'modify')" title=" modify" size="small" type="primary" link
              @click="saveRow(scope.row.id)">
              <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('modify') }}
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
      <ElPagination layout="prev, pager, next, sizes, jumper, ->, total" @change="pageChange" :total="total" />
    </ElCard>
  </ElSpace>

  <ElDialog v-model="visible" align-center :title="$t('users')" width="36%">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('username')" prop="username">
            <ElInput v-model="form.username" :placeholder="$t('inputText', { field: $t('username') })" :maxLength="50"
              :disabled="!!form.id" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('name_')" prop="name_">
            <ElInput v-model="form.name" :placeholder="$t('inputText', { field: $t('name_') })" :maxLength="50" />
          </ElFormItem>
        </ElCol>

      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('email')" prop="email">
            <ElInput type="email" v-model="form.email" :placeholder="$t('inputText', { field: $t('email') })"
              :maxLength="50" :disabled="!!form.id" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('accountExpiresAt')" prop="accountExpiresAt">
            <ElDatePicker v-model="form.accountExpiresAt" type="datetime" :placeholder="$t('selectText')"
              style="width: 100%;" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('credentialsExpiresAt')" prop="credentialsExpiresAt">
            <ElDatePicker v-model="form.credentialsExpiresAt" type="datetime" :placeholder="$t('selectText')"
              style="width: 100%;" />
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

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('import')" width="36%">
    <p>{{ $t('samples') + ' ' + $t('download') }}：
      <a :href="`templates/users.xlsx`" :download="$t('users') + '.xlsx'">
        {{ $t('users') }}.xlsx
      </a>
    </p>
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" :http-request="onUpload" :on-success="load"
      accept=".csv,.xls,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
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
.el-badge {
  display: inline-flex;
  vertical-align: baseline;
}
</style>
