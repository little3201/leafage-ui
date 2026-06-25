<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { FormInstance, FormRules, TableInstance, UploadRequestOptions } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createUser,
  disableUser,
  enableUser,
  importUsers, modifyUser, removeUser, retrieveUsers, unlockUser
} from 'src/api/system/users'
import { actionTypes, userStatus } from 'src/constants'
import type { Filter, Pagination, User } from 'src/types'
import { actionIcon, exportToCSV, hasAction } from 'src/utils'
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
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)

const filter = reactive<Filter<User>>({
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
 * 导出
 */
function exportRows() {
  exportLoading.value = true

  const selectedRows = tableRef.value?.getSelectionRows()
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, 'users')
  } else {
    exportToCSV(datas.value, 'users')
  }
  exportLoading.value = false
}

/**
 * 弹出框
 * @param row 数据
 */
function saveRow(row?: User) {
  form.value = row ? { ...row } : { ...initialValues }

  visible.value = true
}

/**
 * 启用
 * @param id 主键
 */
async function enableRow(id: number) {
  try {
    await enableUser(id)
    await load()
    ElMessage.success(t('message.success', { action: t('action.enable') }))
  } catch (error) {
    ElMessage.error(t('message.error', { action: t('action.enable') }))
    throw error
  }
}

/**
 * 停用
 * @param id 主键
 */
async function disableRow(id: number) {
  await ElMessageBox.confirm(
    t('tips.disableWarning'),
    t('tips.confirm'),
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: false,
      confirmButtonType: 'danger',
      confirmButtonClass: 'w-full',
      confirmButtonText: t('tips.disableButtonText'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      await disableUser(id)
      await load()
      ElMessage.success(t('message.success', { action: t('action.disable') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.disable') }))
      throw error
    }
  })
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
 * @param username 用户名
 */
async function removeRow(id: number, username: string) {
  // 弹出确认框
  await ElMessageBox.confirm(
    t('tips.removeWarning', { module: t('page.users'), data: username }),
    t('tips.confirm'),
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: false,
      confirmButtonType: 'danger',
      confirmButtonClass: 'w-full',
      confirmButtonText: t('tips.removeButtonText'),
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
 * 导入
 */
function onUpload(options: UploadRequestOptions) {
  return importUsers(options.file)
}

</script>

<template>
  <ElCard>
    <ElRow :gutter="20" justify="space-between" class="mb-4">
      <ElCol :span="12">
        <ElInput v-model="filter.username!.value" clearable style="width: 240px" class="mr-4"
          :placeholder="$t('placeholder.search')">
          <template #prefix>
            <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />
          </template>
        </ElInput>
        <ElButton title="search" plain :type="actionTypes['search']" @click="load()">
          <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />{{
            $t('action.search') }}
        </ElButton>
      </ElCol>
      <ElCol :span="12" class="inline-flex! justify-end space-x-3">
        <ElButton v-if="hasAction($route.name, 'create')" title="create" :type="actionTypes['create']"
          @click="saveRow()">
          <Icon :icon="actionIcon('create')" width="1.25em" height="1.25em" />{{
            $t('action.create') }}
        </ElButton>

        <ElUpload :limit="1" :auto-upload="false" :http-request="onUpload" :on-success="load"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
          <ElButton v-if="hasAction($route.name, 'import')" v-loading="importLoading" title="import"
            :type="actionTypes['import']" plain>
            <Icon :icon="actionIcon('import')" width="1.25em" height="1.25em" />{{
              $t('action.import') }}
          </ElButton>
        </ElUpload>

        <ElButton v-if="hasAction($route.name, 'export')" title="export" :type="actionTypes['export']" plain
          @click="exportRows" :loading="exportLoading">
          <Icon :icon="actionIcon('export')" width="1.25em" height="1.25em" />{{
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
      <ElTableColumn prop="status" :label="$t('label.status')" sortable>
        <template #default="scope">
          <ElBadge is-dot :type="userStatus[scope.row.status]" class="mr-1" />
          <ElText :type="userStatus[scope.row.status]">{{ scope.row.status }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="enabled" :label="$t('label.enabled')" sortable>
        <template #default="scope">
          <ElBadge is-dot :type="scope.row.enabled ? 'success' : 'info'" class="mr-1" />
          <ElText :type="scope.row.enabled ? 'success' : 'info'">{{ scope.row.enabled ? 'Y' : 'N' }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('label.actions')">
        <template #default="scope">
          <ElButton v-if="hasAction($route.name, 'modify')" title="modify" :type="actionTypes['modify']" link
            @click="saveRow(scope.row)">
            <Icon :icon="actionIcon('modify')" width="1.25em" height="1.25em" />{{
              $t('action.modify')
            }}
          </ElButton>
          <ElButton v-if="scope.row.enabled && hasAction($route.name, 'disable')" title="disable"
            :type="actionTypes['disable']" link @click="disableRow(scope.row.id)">
            <Icon :icon="actionIcon('disable')" width="1.25em" height="1.25em" />{{
              $t('action.disable') }}
          </ElButton>
          <ElButton v-else-if="hasAction($route.name, 'enable')" title="enable" :type="actionTypes['enable']" link
            @click="enableRow(scope.row.id)">
            <Icon :icon="actionIcon('enable')" width="1.25em" height="1.25em" />{{
              $t('action.enable') }}
          </ElButton>
          <ElButton v-if="scope.row.status == 'LOCKED' && hasAction($route.name, 'unlock')" title="unlock"
            :type="actionTypes['unlock']" link @click="unlockRow(scope.row.id)">
            <Icon :icon="actionIcon('unlock')" width="1.25em" height="1.25em" />{{
              $t('action.unlock') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
            @click="removeRow(scope.row.id, scope.row.username)">
            <Icon :icon="actionIcon('remove')" width="1.25em" height="1.25em" />{{
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
  <ElDialog v-model="visible" :title="form.id ? $t('action.modify') : $t('action.create')" :show-close="false"
    width="480">
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
        <Icon :icon="actionIcon('cancel')" width="1.25em" height="1.25em" />{{
          $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef!)">
        <Icon :icon="actionIcon('submit')" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
