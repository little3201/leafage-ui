<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance, FormRules, TableInstance, TransferDataItem,
  TransferDirection, TransferKey, UploadInstance, UploadRequestOptions
} from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addMembers,
  addPrivilege,
  createRole,
  enableRole,
  fetchRole,
  importRoles,
  modifyRole,
  removeMembers,
  removePrivilege,
  removeRole,
  retrieveRoleMembers,
  retrieveRolePrivileges,
  retrieveRoles
} from 'src/api/system/roles'
import { retrieveUsers } from 'src/api/system/users'
import { actionIcons, actionTypes } from 'src/constants'
import type { Filter, Pagination, Privilege, Role, RoleMembers, RolePrivileges } from 'src/types'
import { exportToCSV, hasAction } from 'src/utils'
import { useUserStore } from 'stores/user'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


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

const authorizeTableRef = ref<TableInstance>()
const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const relationVisible = ref<boolean>(false)
const members = ref<Array<TransferDataItem>>([])
const relations = ref<Array<string>>([])

const authorizeVisible = ref<boolean>(false)
const authorities = ref<Array<{
  privilegeId: number,
  actions: string[]
}>>([])
const authoritiesMap = reactive<Record<number, string[]>>({})

const importVisible = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const importRef = ref<UploadInstance>()

const filter = reactive<Filter<Role>>({
  name: { op: 'like', value: undefined }
})

const formRef = ref<FormInstance>()
const initialValues: Role = {
  id: null,
  name: ''
}
const form = ref<Role>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, message: t('placeholder.inputText', { field: t('label.name') }), trigger: 'blur' }
  ]
})

onMounted(async () => {
  await load()
})

async function loadUsers() {
  const res = await retrieveUsers({ page: 1, size: 99 })
  members.value = res.data.content
}

async function loadRoleUsers(id: number) {
  const res = await retrieveRoleMembers(id)
  relations.value = res.data.map((item: RoleMembers) => item.username)
}

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
    const res = await retrieveRoles(pagination, filter)
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
 * 关联弹出框
 * @param id 主键
 */
async function relationRow(id: number) {
  await Promise.all([loadRoleUsers(id), loadUsers()])

  relationVisible.value = true
}

/**
 * 认证弹出框
 * @param id 主键
 */
async function authorizeRow(id: number) {
  authorities.value = []
  authorizeTableRef.value?.clearSelection()
  form.value.id = id

  const res = await retrieveRolePrivileges(id)
  authorities.value = res.data.map((row: RolePrivileges) => {
    const toogleRow = { id: row.privilegeId }
    authorizeTableRef.value?.toggleRowSelection(toogleRow, true)

    authoritiesMap[row.privilegeId] = row.actions || []
    return { privilegeId: row.privilegeId, actions: row.actions }
  })

  authorizeVisible.value = true
}

/**
 * 新增、编辑弹出框
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
    const res = await fetchRole(id)
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
  await enableRole(id)
  await load()
}

/**
 * 表单提交
 */
async function onSubmit(formEl: FormInstance) {
  if (!formEl) return

  const valid = await formEl.validate()
  if (valid) {
    saveLoading.value = true
    try {
      if (form.value.id) {
        await modifyRole(form.value.id, form.value)
      } else {
        await createRole(form.value)
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
 * @param name 名称
 */
async function removeRow(id: number, name: string) {
  // 弹出确认框
  await ElMessageBox.confirm(
    t('tips.removeWarning', { module: t('page.roles'), data: name }),
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
      await removeRole(id)
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
  return importRoles(options.file)
}

/**
 * transfer事件
 * @param value 数据
 * @param direction 方向
 */
async function handleTransferChange(value: TransferKey[], direction: TransferDirection, movedKeys: TransferKey[]) {
  if (form.value.id) {

    if (direction === 'right') {
      await addMembers(form.value.id, value as string[])
    } else if (movedKeys.length) {
      await removeMembers(form.value.id, movedKeys as string[])
    }
  }
}

async function handleActionsCheck(privilegeId: number) {
  if (!form.value.id) return
  const selectedActions = authoritiesMap[privilegeId]

  // 查找对应 privilegeId 的对象
  const keyIndex = authorities.value.findIndex(a => a.privilegeId === privilegeId)

  if (keyIndex >= 0) {
    // 如果已存在该 privilegeId 对应的数据
    const existingAction = authorities.value[keyIndex]
    if (existingAction) {
      for (const item of selectedActions) {
        const itemIndex = existingAction.actions.indexOf(item)
        if (itemIndex === -1) {
          // 如果 actions 中没有该 item，则添加
          existingAction.actions.push(item)
          await addPrivilege(form.value.id, privilegeId, item)
        }
      }

      // 移除已取消选择的 actions
      for (const existingItem of existingAction.actions) {
        if (!selectedActions.includes(existingItem)) {
          existingAction.actions.splice(existingAction.actions.indexOf(existingItem), 1)
          await removePrivilege(form.value.id, privilegeId, existingItem)
        }
      }
    }
  } else {
    // 如果不存在该 privilegeId，新增数据
    authorities.value.push({ privilegeId, actions: selectedActions })
    await addPrivilege(form.value.id, privilegeId, selectedActions.join(','))
  }
}

function rowSelected(row: Privilege) {
  if (!authorizeTableRef.value) return false

  const selectedRows = authorizeTableRef.value.getSelectionRows()
  return selectedRows.some(selectedRow => selectedRow.id === row.id)
}
</script>

<template>
  <ElCard>
    <ElRow :gutter="20" justify="space-between" class="mb-4">
      <ElCol :span="12">
        <ElInput v-model="filter.name!.value" clearable style="width: 240px" class="mr-4"
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
            $t('action.import')
          }}
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
      <ElTableColumn prop="name" :label="$t('label.name')" />
      <ElTableColumn prop="members" :label="$t('label.members')" />
      <ElTableColumn prop="enabled" :label="$t('label.enabled')" align="center" sortable>
        <template #default="scope">
          <ElSwitch size="small" v-model="scope.row.enabled" @change="enableChange(scope.row.id)"
            style="--el-switch-on-color: var(--el-color-success);" :disabled="!hasAction($route.name, 'enable')" />
        </template>
      </ElTableColumn>
      <ElTableColumn show-overflow-tooltip prop="description" :label="$t('label.description')" />
      <ElTableColumn :label="$t('label.actions')">
        <template #default="scope">
          <ElButton v-if="hasAction($route.name, 'modify')" title="modify" :type="actionTypes['modify']" link
            @click="saveRow(scope.row.id)">
            <Icon :icon="`material-symbols:${actionIcons['modify']}-rounded`" width="1.25em" height="1.25em" />{{
              $t('action.modify')
            }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'relation')" title="relation" :type="actionTypes['relation']" link
            @click="relationRow(scope.row.id)">
            <Icon :icon="`material-symbols:${actionIcons['relation']}-rounded`" width="1.25em" height="1.25em" />{{
              $t('action.relation') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'authorize')" title="authorize" :type="actionTypes['authorize']" link
            @click="authorizeRow(scope.row.id)">
            <Icon :icon="`material-symbols:${actionIcons['authorize']}-rounded`" width="1.25em" height="1.25em" />{{
              $t('action.authorize') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
            @click="removeRow(scope.row.id, scope.row.name)">
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
  <ElDialog v-model="visible" :title="form.id ? $t('action.modify') : $t('action.create')" :show-close="false"
    width="480">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.description')" prop="description">
            <ElInput v-model="form.description" type="textarea"
              :placeholder="$t('placeholder.inputText', { field: $t('label.description') })" />
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

  <!-- relation -->
  <ElDialog v-model="relationVisible" :title="$t('action.relation')" width="640">
    <div style="text-align: center">
      <ElTransfer v-model="relations" :props="{ key: 'username', label: 'fullName' }"
        :titles="[$t('label.unselected'), $t('label.selected')]" filterable :data="members"
        @change="handleTransferChange" />
    </div>
  </ElDialog>

  <!-- authorize -->
  <ElDialog v-model="authorizeVisible" :title="$t('action.authorize')">
    <ElTable ref="authorizeTableRef" :data="userStore.privileges" row-key="id" table-layout="auto">
      <ElTableColumn type="selection" />
      <ElTableColumn prop="name" :label="$t('label.name')">
        <template #default="scope">
          <Icon :icon="`material-symbols:${scope.row.meta.icon}-rounded`" style="vertical-align: -3.5px" width="1.25em"
            height="1.25em" class="mr-2" />
          {{ scope.row.name ? $t(`page.${scope.row.name}`) : '' }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="actions" :label="$t('label.actions')">
        <template #default="scope">
          <ElCheckboxGroup v-model="authoritiesMap[scope.row.id]" :disabled="!rowSelected(scope.row)"
            @change="handleActionsCheck(scope.row.id)">
            <ElCheckbox v-for="(item, index) in scope.row.meta.actions" :key="index" :label="$t(`action.${item}`)"
              :value="item" />
          </ElCheckboxGroup>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" :show-close="false" width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`templates/roles.xlsx`" :download="$t('page.roles') + '.xlsx'">
        {{ $t('page.roles') }}.xlsx
      </a>
    </p>
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" :http-request="onUpload" :on-success="load"
      accept=".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
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

<style lang="scss" scoped>
.el-check-tag {
  padding: 4px 9px;
}
</style>