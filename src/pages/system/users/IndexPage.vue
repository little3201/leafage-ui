<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { FormInstance, FormRules, TableInstance, UploadInstance, UploadRequestOptions } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createUser, enableUser, fetchUser, importUsers, modifyUser, removeUser, retrieveUsers, unlockUser
} from 'src/api/system/users'
import { actionIcons, actionTypes, userStatus } from 'src/constants'
import type { Filters, Pagination, User } from 'src/types'
import { exportToExcel, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

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

const filter = reactive<Filters<User>>({
  username: { op: 'like', value: undefined }
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
    const res = await retrieveUsers(pagination, filter)
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch (error) {
    datas.value = []
    total.value = 0

    throw error
  } finally {
    loading.value = false
  }
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
  } catch (error) {
    form.value = { ...initialValues }
    throw error
  }
}

/**
 * 启用、停用
 * @param id 主键
 */
async function enableChange(id: number) {
  await enableUser(id)
  await load()
}

/**
 * unlock
 * @param id 主键
 */
async function unlockRow(id: number) {
  try {
    await unlockUser(id)
    await load()

    ElMessage.success(t('message.success', { action: t('action.unlock') }))
  } catch (error) {
    ElMessage.error(t('message.error', { action: t('action.unlock') }))
    throw error
  }
}

/**
 * 表单提交
 */
async function onSubmit(formEl: FormInstance) {
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

      ElMessage.success(t('message.success', { action: form.value.id ? t('action.modify') : t('action.create') }))
      await load()
    } catch (error) {
      ElMessage.error(t('message.error', { action: form.value.id ? t('action.modify') : t('action.create') }))
      throw error
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
  // 弹出确认框
  await ElMessageBox.confirm(
    t('tips.removeConfirm'),
    t('tips.actionConfirm'),
    {
      confirmButtonType: 'danger',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await removeUser(id)
      await load()
      ElMessage.success(t('message.success', { action: t('action.remove') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.remove') }))
      throw error
    }
  })
}

/**
 * 导入提交
 */
function onImportSubmit(importEl: UploadInstance) {
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
  <ElCard shadow="never">
    <ElRow :gutter="20" justify="space-between" class="mb-4">
      <ElCol :span="12">
        <ElInput v-model="filter.username!.value" clearable style="width: 240px" class="mr-4"
          :placeholder="$t('placeholder.search')">
          <template #prefix>
            <Icon :icon="`material-symbols:${actionIcons['search']}-rounded`" width="1.25em" height="1.25em" />
          </template>
        </ElInput>
        <ElButton title="search" plain :type="actionTypes['search']" @click="load()">
          <Icon :icon="`material-symbols:${actionIcons['search']}-rounded`" width="1.25em" height="1.25em" />{{
            $t('action.search') }}
        </ElButton>
      </ElCol>
      <ElCol :span="12" class="text-right">
        <ElButton v-if="hasAction($route.name, 'create')" title="create" :type="actionTypes['create']"
          @click="saveRow()">
          <Icon :icon="`material-symbols:${actionIcons['create']}-rounded`" width="1.25em" height="1.25em" />{{
            $t('action.create') }}
        </ElButton>
        <ElButton v-if="hasAction($route.name, 'import')" title="import" :type="actionTypes['import']" plain
          @click="importRows">
          <Icon :icon="`material-symbols:${actionIcons['import']}-rounded`" width="1.25em" height="1.25em" />{{
            $t('action.import') }}
        </ElButton>
        <ElButton v-if="hasAction($route.name, 'export')" title="export" :type="actionTypes['export']" plain
          @click="exportRows" :loading="exportLoading">
          <Icon :icon="`material-symbols:${actionIcons['export']}-rounded`" width="1.25em" height="1.25em" />{{
            $t('action.export') }}
        </ElButton>
      </ElCol>
    </ElRow>

    <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
      <ElTableColumn type="selection" />
      <ElTableColumn type="index" :label="$t('label.no')" width="55" />
      <ElTableColumn prop="username" :label="$t('label.username')" sortable>
        <template #default="scope">
          <div class="flex items-center space-x-2">
            <ElAvatar alt="avatar" :size="34" :src="`https://cdn.leafage.top/${scope.row.username}`" />
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
      <ElTableColumn prop="status" :label="$t('label.status')" align="center" sortable>
        <template #default="scope">
          <ElBadge is-dot :type="userStatus[scope.row.status]" class="mr-1" />
          <ElText :type="userStatus[scope.row.status]">{{ scope.row.status }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="enabled" :label="$t('label.enabled')" align="center" sortable>
        <template #default="scope">
          <ElSwitch size="small" v-model="scope.row.enabled" @change="enableChange(scope.row.id)"
            style="--el-switch-on-color: var(--el-color-success);" :disabled="!hasAction($route.name, 'enable')" />
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('label.actions')">
        <template #default="scope">
          <ElButton v-if="hasAction($route.name, 'modify')" title="modify" :type="actionTypes['modify']" link
            @click="saveRow(scope.row.id)">
            <Icon :icon="`material-symbols:${actionIcons['modify']}-rounded`" width="1.25em" height="1.25em" />{{
              $t('action.modify')
            }}
          </ElButton>
          <ElButton v-if="scope.row.status == 'LOCKED' && hasAction($route.name, 'unlock')" title="unlock"
            type="success" link @click="unlockRow(scope.row.id)">
            <Icon icon="material-symbols:lock-open-outline-rounded" width="1.25em" height="1.25em" />{{
              $t('action.unlock') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
            @click="removeRow(scope.row.id)">
            <Icon :icon="`material-symbols:${actionIcons['remove']}-rounded`" width="1.25em" height="1.25em" />{{
              $t('action.remove')
            }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <ElPagination layout="slot, ->, total, prev, pager, next, sizes" @change="pageChange" :total="total">
      <template #default>
        {{ $t('message.selectedTotal', { total: tableRef?.getSelectionRows().length }) }}
      </template>
    </ElPagination>
  </ElCard>

  <!-- form -->
  <ElDialog v-model="visible" :title="form.id ? $t('action.modify') : $t('action.create')" align-center
    :show-close="false" width="480">
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
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef!)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" align-center :show-close="false" width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`schemas/users.xlsx`" :download="$t('page.users') + '.xlsx'">
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

    <template #footer>
      <ElButton title="cancel" @click="importVisible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="importLoading" @click="onImportSubmit(importRef!)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
