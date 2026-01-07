<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { FormInstance, FormRules, TableInstance, UploadInstance, UploadRequestOptions } from 'element-plus'
import {
  createUser,
  enableUser,
  fetchUser,
  importUsers,
  modifyUser, removeUser,
  retrieveUsers,
  unlockUser
} from 'src/api/users'
import { userStatus } from 'src/constants'
import type { Pagination, User } from 'src/types'
import { exportToExcel, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


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
  id: null,
  username: '',
  fullName: '',
  email: '',
  status: ''
}
const form = ref<User>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  username: [
    { required: true, message: t('placeholder.inputText', { field: t('label.username') }), trigger: 'blur' }
  ],
  fullName: [
    { required: true, message: t('placeholder.inputText', { field: t('label.fullName') }), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('placeholder.inputText', { field: t('label.email') }), trigger: 'blur' }
  ]
})

onMounted(async () => {
  await load()
})

/**
 * 分页变化
 * @param currentPage 当前页码
 * @param pageSize 分页大小
 */
async function pageChange(currentPage: number, pageSize: number) {
  pagination.page = currentPage
  pagination.size = pageSize
  await load()
}

/**
 * 加载列表
 */
async function load() {
  loading.value = true
  try {
    const res = await retrieveUsers(pagination, filters.value)
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch {
    return Promise.resolve()
  } finally { loading.value = false }
}

/**
 * reset
 */
async function reset() {
  filters.value = {
    username: null
  }
  await load()
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
    exportToExcel(selectedRows, 'users')
  }
  exportLoading.value = false
}

/**
 * 弹出框
 * @param id 主键
 */
async function saveRow(id?: number) {
  form.value = { ...initialValues }
  if (id) {
    await loadOne(id)
  }
  visible.value = true
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  try {
    const res = await fetchUser(id)
    form.value = res.data
  } catch {
    return Promise.resolve()
  }
}

/**
 * 启用、停用
 * @param id 主键
 */
async function enableChange(id: number) {
  try {
    await enableUser(id)
    await load()
  } catch {
    return Promise.resolve()
  }
}

/**
 * unlock
 * @param id 主键
 */
async function unlockRow(id: number) {
  try {
    await unlockUser(id)
    await load()
  } catch {
    return Promise.resolve()
  }
}

/**
 * 表单提交
 */
async function onSubmit(formEl: FormInstance | undefined) {
  if (!formEl) return

  const valid = await formEl.validate()
  if (valid) {
    try {
      saveLoading.value = true
      if (form.value.id) {
        await modifyUser(form.value.id, form.value)
      } else {
        await createUser(form.value)
      }
      visible.value = false
      await load()
    } catch {
      return Promise.resolve()
    } finally {
      saveLoading.value = false
    }
  }
}

/**
 * 删除
 * @param id 主键
 */
async function removeRow(id: number) {
  try {
    await removeUser(id)
    await load()
  } catch {
    return Promise.resolve()
  }
}

/**
 * 确认
 * @param id 主键
 */
async function confirmEvent(id: number) {
  await removeRow(id)
}

/**
 * 导入提交
 */
function onImportSubmit(importEl: UploadInstance | undefined) {
  if (!importEl) return
  importLoading.value = true

  importEl.submit()

  importLoading.value = false
  importVisible.value = false
}

function onUpload(options: UploadRequestOptions) {
  return importUsers(options.file)
}

</script>

<template>
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filters" @submit.prevent>
        <ElFormItem :label="$t('label.username')" prop="username">
          <ElInput v-model="filters.username"
            :placeholder="$t('placeholder.inputText', { field: $t('label.username') })" />
        </ElFormItem>
        <ElFormItem>
          <ElButton title="search" type="primary" @click="load">
            <Icon icon="material-symbols:search-rounded" width="1.25em" height="1.25em" />{{ $t('action.search') }}
          </ElButton>
          <ElButton title="reset" @click="reset">
            <Icon icon="material-symbols:replay-rounded" width="1.25em" height="1.25em" />{{ $t('action.reset') }}
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never">
      <ElRow :gutter="20" justify="space-between" class="mb-4">
        <ElCol :span="16" class="text-left">
          <ElButton v-if="hasAction($route.name, 'create')" title=" create" type="primary" @click="saveRow()">
            <Icon icon="material-symbols:add-rounded" width="1.25em" height="1.25em" />{{ $t('action.create') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'import')" title=" import" type="warning" plain @click="importRows">
            <Icon icon="material-symbols:database-upload-outline-rounded" width="1.25em" height="1.25em" />{{
              $t('action.import') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'export')" title=" export" type="success" plain @click="exportRows"
            :loading="exportLoading">
            <Icon icon="material-symbols:file-export-outline-rounded" width="1.25em" height="1.25em" />{{
              $t('action.export') }}
          </ElButton>
        </ElCol>

        <ElCol :span="8" class="text-right">
          <ElTooltip effect="dark" :content="$t('action.refresh')" placement="top">
            <ElButton title="refresh" plain circle @click="load">
              <Icon icon="material-symbols:refresh-rounded" width="1.25em" height="1.25em" />
            </ElButton>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
        <ElTableColumn type="selection" />
        <ElTableColumn type="index" :label="$t('label.no')" width="55" />
        <ElTableColumn prop="username" :label="$t('label.username')" sortable>
          <template #default="scope">
            <div class="flex items-center space-x-2">
              <ElAvatar alt="avatar" :size="30" :src="`${cdn_url}/${scope.row.username}`" />
              <div class="inline-flex flex-col">
                <span class="text-sm">
                  {{ scope.row.fullName }}
                </span>
                <span class="text-xs text-(--el-text-color-secondary)">{{ scope.row.username }}</span>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip prop="email" :label="$t('label.email')" />
        <ElTableColumn prop="groups" :label="$t('label.groups')" />
        <ElTableColumn prop="roles" :label="$t('label.roles')" />
        <ElTableColumn prop="status" :label="$t('label.status')" sortable>
          <template #default="scope">
            <ElBadge is-dot :type="userStatus[scope.row.status]" class="mr-1" />
            <ElText :type="userStatus[scope.row.status]">{{ scope.row.status }}</ElText>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="enabled" :label="$t('label.enabled')" sortable>
          <template #default="scope">
            <ElSwitch size="small" v-model="scope.row.enabled" @change="enableChange(scope.row.id)"
              style="--el-switch-on-color: var(--el-color-success);" :disabled="!hasAction($route.name, 'enable')" />
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('label.actions')">
          <template #default="scope">
            <ElButton v-if="hasAction($route.name, 'modify')" title=" modify" type="primary" link
              @click="saveRow(scope.row.id)">
              <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('action.modify') }}
            </ElButton>
            <ElButton v-if="scope.row.status == 'LOCKED' && hasAction($route.name, 'unlock')" title=" unlock"
              type="success" link @click="unlockRow(scope.row.id)">
              <Icon icon="material-symbols:lock-open-outline-rounded" width="16" height="16" />{{ $t('action.unlock') }}
            </ElButton>
            <ElPopconfirm :title="$t('message.removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
              <template #reference>
                <ElButton v-if="hasAction($route.name, 'remove')" title=" remove" type="danger" link>
                  <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16" />{{ $t('action.remove')
                  }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination layout="slot, ->, total, prev, pager, next, sizes" @change="pageChange" :total="total">
        <template #default>
          {{ $t('message.selectedTotal', { total: tableRef?.getSelectionRows().length }) }}
        </template>
      </ElPagination>
    </ElCard>
  </ElSpace>

  <!-- form -->
  <ElDialog v-model="visible" :title="$t('page.users')" align-center :show-close="false" width="480">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.username')" prop="username">
            <ElInput v-model="form.username" :placeholder="$t('placeholder.inputText', { field: $t('label.username') })"
              :maxLength="50" :disabled="!!form.id" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.fullName')" prop="fullName">
            <ElInput v-model="form.fullName" :placeholder="$t('placeholder.inputText', { field: $t('label.fullName') })"
              :maxLength="50" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol>
          <ElFormItem :label="$t('label.email')" prop="email">
            <ElInput type="email" v-model="form.email"
              :placeholder="$t('placeholder.inputText', { field: $t('label.email') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton title="cancel" @click="visible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" align-center width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`templates/users.xlsx`" :download="$t('page.users') + '.xlsx'">
        {{ $t('page.users') }}.xlsx
      </a>
    </p>
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" :http-request="onUpload" :on-success="load"
      accept=".csv,.xls,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
      <div class="el-icon--upload inline-flex justify-center">
        <Icon icon="material-symbols:upload-rounded" width="48" height="48" />
      </div>
      <div class="el-upload__text">
        {{ $t('tips.drop2Here') }}<em>{{ $t('tips.click2Upload') }}</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ $t('tips.fileSizeLimit', { size: '50MB' }) }}
        </div>
      </template>
    </ElUpload>
    <p class="text-red">xxxx</p>
    <template #footer>
      <ElButton title="cancel" @click="importVisible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="importLoading" @click="onImportSubmit(importRef)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
