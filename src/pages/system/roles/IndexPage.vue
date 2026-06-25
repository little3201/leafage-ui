<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance, FormRules, TableInstance, TransferDataItem,
  TransferDirection, TransferKey,
  UploadRequestOptions
} from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addMembers,
  addPrivilege,
  createRole,
  disableRole,
  enableRole,
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
import { actionIcon, exportToCSV, hasAction } from 'src/utils'
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

const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)

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
  const res = await retrieveUsers({ page: 1, size: 10 })
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
async function memberRow(id: number) {
  form.value.id = id
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
 * 弹出框
 * @param row 数据
 */
function saveRow(row?: Role) {
  form.value = row ? { ...row } : { ...initialValues }

  visible.value = true
}

/**
 * 启用
 * @param id 主键
 */
async function enableRow(id: number) {
  try {
    await enableRole(id)
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
      await disableRole(id)
      await load()
      ElMessage.success(t('message.success', { action: t('action.disable') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.disable') }))
      throw error
    }
  })
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
 * 导出
 */
function exportRows() {
  exportLoading.value = true

  const selectedRows = tableRef.value?.getSelectionRows()
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, 'roles')
  } else {
    exportToCSV(datas.value, 'roles')
  }
  exportLoading.value = false
}

/**
 * 导入
 */
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
    try {
      if (direction === 'right') {
        await addMembers(form.value.id, value as string[])
      } else if (movedKeys.length) {
        await removeMembers(form.value.id, movedKeys as string[])
      }

      await load()
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.member') }))
      throw error
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
      <ElTableColumn prop="name" :label="$t('label.name')" />
      <ElTableColumn prop="members" :label="$t('label.members')">
        <template #default="scope">
          <div class="flex items-center">
            <ElAvatarGroup collapse-avatars :max-collapse-avatars="3" collapse-avatars-tooltip>
              <ElAvatar v-for="member in scope.row.members" :key="member.id"
                :src="`https://cdn.leafage.top/${member.username}`" />
            </ElAvatarGroup>
          </div>
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
          <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
            @click="removeRow(scope.row.id, scope.row.name)">
            <Icon :icon="actionIcon('remove')" width="1.25em" height="1.25em" />{{
              $t('action.remove')
            }}
          </ElButton>
          <ElDropdown
            v-if="scope.row.enabled && (hasAction($route.name, 'member') || hasAction($route.name, 'authorize'))"
            trigger="click" class="ml-2">
            <ElButton link>
              <Icon :icon="actionIcon('more')" width="1.25em" height="1.25em" />{{
                $t('action.more')
              }}
            </ElButton>
            <template #dropdown>
              <ElDropdownItem>
                <ElButton v-if="hasAction($route.name, 'member')" title="member" :type="actionTypes['member']" link
                  @click="memberRow(scope.row.id)">
                  <Icon :icon="`material-symbols:${actionIcons['member']}-rounded`" width="1.25em" height="1.25em" />
                  {{ $t('action.member')
                  }}
                </ElButton>
              </ElDropdownItem>
              <ElDropdownItem>
                <ElButton v-if="hasAction($route.name, 'authorize')" title="authorize" :type="actionTypes['authorize']"
                  link @click="authorizeRow(scope.row.id)">
                  <Icon :icon="`material-symbols:${actionIcons['authorize']}-rounded`" width="1.25em" height="1.25em" />
                  {{
                    $t('action.authorize')
                  }}
                </ElButton>
              </ElDropdownItem>
            </template>
          </ElDropdown>
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

  <!-- member -->
  <ElDialog v-model="relationVisible" :title="$t('action.member')" width="600">
    <div style="text-align: center">
      <ElTransfer v-model="relations" :props="{ key: 'username', label: 'fullName' }"
        :titles="[$t('label.unselected'), $t('label.selected')]" filterable :data="members"
        @change="handleTransferChange" />
    </div>
  </ElDialog>

  <!-- authorize -->
  <ElDialog v-model="authorizeVisible" :title="$t('action.authorize')" width="57em">
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
</template>

<style lang="scss" scoped>
.el-check-tag {
  padding: 4px 9px;
}
</style>