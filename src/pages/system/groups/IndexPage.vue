<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import type { TableInstance, FormInstance, FormRules, TreeInstance, UploadInstance, UploadRequestOptions, TransferDirection, TransferKey } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from 'stores/user-store'
import {
  retrieveGroups, createGroup, modifyGroup, removeGroup, enableGroup, fetchGroup, importGroups,
  retrieveGroupMembers, retrieveGroupRoles, retrieveGroupTree, relationGroupMembers, removeGroupMembers, retrieveGroupPrivileges,
  relationGroupPrivileges, removeGroupPrivileges,
  relationGroupRoles,
  removeGroupRoles
} from 'src/api/groups'
import { retrieveUsers } from 'src/api/users'
import { retrieveRoles } from 'src/api/roles'
import type { Pagination, Group, TreeNode, GroupMembers, GroupRoles, User, Role, GroupPrivileges } from 'src/types'
import { Icon } from '@iconify/vue'
import { hasAction, exportToCSV } from 'src/utils'
import { actions } from 'src/constants'


const { t } = useI18n()
const userStore = useUserStore()

const loading = ref<boolean>(false)
const datas = ref<Array<Group>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const treeEl = ref<TreeInstance>()
const treeLoading = ref<boolean>(false)
const currentNodeKey = ref<string>('1')
const filterText = ref('')

const groupTree = ref<TreeNode[]>([])
const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const activeTabName = ref<string>('user')
const relationVisible = ref<boolean>(false)
const relationUsers = ref<Array<string>>([])
const relationRoles = ref<Array<string>>([])
const members = ref<Array<User>>([])
const roles = ref<Array<Role>>([])

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
  superiorId: null as string | null,
  name: null
})

const formRef = ref<FormInstance>()
const initialValues: Group = {
  id: null,
  name: '',
  superiorId: null
}
const form = ref<Group>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, message: t('placeholder.inputText', { field: t('label.name') }), trigger: 'blur' }
  ]
})

onMounted(async () => {
  await loadTree()
})

/**
 * 监听tree
 */
watch(
  () => filterText.value,
  (val) => {
    treeEl.value!.filter(val)
  }
)

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
async function onCurrentChange(data: TreeNode) {
  if (currentNodeKey.value === String(data.id)) {
    return
  }
  currentNodeKey.value = String(data.id)
  pagination.page = 1
  await load()
}

async function loadUsers() {
  try {
    const res = await retrieveUsers({ page: 1, size: 99 })
    members.value = res.data.content
  } catch {
    return Promise.resolve()
  }
}

async function loadRoles() {
  try {
    const res = await retrieveRoles({ page: 1, size: 99 })
    roles.value = res.data.content
  } catch {
    return Promise.resolve()
  }
}

async function loadGroupUsers(id: number) {
  try {
    const res = await retrieveGroupMembers(id)
    relationUsers.value = res.data.map((item: GroupMembers) => item.username)
  } catch {
    return Promise.resolve()
  }
}

async function loadGrouRoles(id: number) {
  try {
    const res = await retrieveGroupRoles(id)
    relationRoles.value = res.data.map((item: GroupRoles) => item.roleId)
  } catch {
    return Promise.resolve()
  }
}

/**
 * 加载tree
 */
async function loadTree() {
  treeLoading.value = true
  try {
    const res = await retrieveGroupTree()
    groupTree.value = res.data
    currentNodeKey.value = (res.data[0] && res.data[0]?.id) || 1

    treeEl.value!.setCurrentKey(currentNodeKey.value)
    await load()
  } catch {
    return Promise.resolve()
  } finally {
    treeLoading.value = false
  }
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
  filters.value.superiorId = currentNodeKey.value ? 'eq:' + currentNodeKey.value : null
  try {
    const res = await retrieveGroups(pagination, filters.value)
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
  filters.value.name = null
  await load()
}

/**
 * 关联弹出框
 * @param id 主键
 */
async function relationRow(id: number) {
  relationVisible.value = true
  try {
    await Promise.all([loadGroupUsers(id), loadUsers()])
  } catch {
    return Promise.resolve()
  }
}

async function authorizeRow(id: number) {
  authorities.value = []
  form.value.id = id
  try {
    const res = await retrieveGroupPrivileges(id)
    authorities.value = res.data.map((row: GroupPrivileges) => ({ privilegeId: row.privilegeId, actions: row.actions }))
  } catch {
    return Promise.resolve()
  }
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
    const res = await fetchGroup(id)
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
    await enableGroup(id)
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
    saveLoading.value = true
    try {
      if (form.value.id) {
        await modifyGroup(form.value.id, form.value)
      } else {
        form.value.superiorId = Number(currentNodeKey.value)
        await createGroup(form.value)
      }
      visible.value = false
      await load()
      await loadTree()
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
    await Promise.all([removeGroup(id), load(), loadTree()])
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
 * 关联用户
 * @param value 用户
 * @param direction 方向
 */
async function handleTransferUserChange(value: TransferKey[], direction: TransferDirection, movedKeys: TransferKey[]) {
  if (form.value.id) {
    try {
      if (direction === 'right') {
        await relationGroupMembers(form.value.id, value as string[])
      } else if (movedKeys.length) {
        await removeGroupMembers(form.value.id, movedKeys as string[])
      }
    } catch {
      return Promise.resolve()
    }
  }
}

/**
 * 关联角色
 * @param value 角色
 * @param direction 方向
 */
async function handleTransferRoleChange(value: TransferKey[], direction: TransferDirection, movedKeys: TransferKey[]) {
  if (form.value.id) {
    try {
      if (direction === 'right') {
        await relationGroupRoles(form.value.id, value as number[])
      } else if (movedKeys.length) {
        await removeGroupRoles(form.value.id, movedKeys as number[])
      }
    } catch {
      return Promise.resolve()
    }
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
    exportToCSV(selectedRows, 'groups')
  }
  exportLoading.value = false
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
  return importGroups(options.file)
}

/**
 * 权限树check事件
 * @param data 树节点
 * @param checked 是否checked
 */
async function handleCheckChange(data: TreeNode, checked: boolean) {
  if (!data.id || (data.children?.length ?? 0) > 0 || !form.value.id) return
  // 检查是否已授权
  const keyIndex = authorities.value.findIndex(a => a.privilegeId === data.id)

  try {
    if (checked && keyIndex === -1) {
      authorities.value.push({ privilegeId: data.id, actions: [] })
      await relationGroupPrivileges(form.value.id, data.id)
    } else if (!checked && keyIndex !== -1) {
      authorities.value.splice(keyIndex, 1)
      await removeGroupPrivileges(form.value.id, data.id)
    }
  } catch {
    return Promise.resolve()
  }
}

async function handleActionCheck(privilegeId: number, item: string) {
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
        await removeGroupPrivileges(form.value.id, privilegeId, item)

      } else {
        existingAction.actions.push(item)
        await relationGroupPrivileges(form.value.id, privilegeId, item)
      }
    }
  } else {
    authorities.value.push({ privilegeId, actions: [item] })
    await relationGroupPrivileges(form.value.id, privilegeId, item)
  }
}

async function tabChange(tab: string) {
  activeTabName.value = tab

  if (tab === 'role') {
    await loadRoles()
    if (form.value.id) {
      await loadGrouRoles(form.value.id)
    }
  }
}
</script>

<template>
  <ElSpace size="large" alignment="flex-start">
    <ElCard class="w-64" shadow="never">
      <ElFormItem prop="filterText">
        <ElInput v-model="filterText" :placeholder="$t('action.search')" clearable>
          <template #prefix>
            <Icon icon="material-symbols:search-rounded" width="1.25em" height="1.25em" />
          </template>
        </ElInput>
      </ElFormItem>

      <ElTree ref="treeEl" v-loading="treeLoading" :data="groupTree" default-expand-all :expand-on-click-node="false"
        node-key="id" :current-node-key="currentNodeKey" highlight-current :props="{ label: 'name' }"
        :filter-node-method="filterNode" @current-change="onCurrentChange">
      </ElTree>
    </ElCard>

    <ElSpace size="large" fill>
      <ElCard shadow="never">
        <ElForm inline :model="filters" @submit.prevent>
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput v-model="filters.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
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
                $t('action.import')
              }}
            </ElButton>
            <ElButton v-if="hasAction($route.name, 'export')" title=" export" type="success" plain @click="exportRows"
              :loading="exportLoading">
              <Icon icon="material-symbols:file-export-outline-rounded" width="1.25em" height="1.25em" />{{
                $t('action.export')
              }}
            </ElButton>
          </ElCol>

          <ElCol :span="8" class="text-right">
            <ElTooltip :content="$t('action.refresh')" placement="top">
              <ElButton title="refresh" plain circle @click="load">
                <Icon icon="material-symbols:refresh-rounded" width="1.25em" height="1.25em" />
              </ElButton>
            </ElTooltip>
          </ElCol>
        </ElRow>

        <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
          <ElTableColumn type="selection" />
          <ElTableColumn type="index" :label="$t('label.no')" width="55" />
          <ElTableColumn prop="name" :label="$t('label.name')" sortable />
          <ElTableColumn prop="members" :label="$t('label.members')" />
          <ElTableColumn prop="roles" :label="$t('label.roles')" />
          <ElTableColumn prop="enabled" :label="$t('label.enabled')" sortable>
            <template #default="scope">
              <ElSwitch size="small" v-model="scope.row.enabled" @change="enableChange(scope.row.id)"
                style="--el-switch-on-color: var(--el-color-success);" :disabled="!hasAction($route.name, 'enable')" />
            </template>
          </ElTableColumn>
          <ElTableColumn show-overflow-tooltip prop="description" :label="$t('label.description')" />
          <ElTableColumn :label="$t('label.actions')">
            <template #default="scope">
              <ElButton v-if="hasAction($route.name, 'modify')" title=" modify" type="primary" link
                @click="saveRow(scope.row.id)">
                <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('action.modify') }}
              </ElButton>
              <ElButton v-if="hasAction($route.name, 'relation')" title=" relation" type="success" link
                @click="relationRow(scope.row.id)">
                <Icon icon="material-symbols:link-rounded" width="16" height="16" />{{ $t('action.relation') }}
              </ElButton>
              <ElButton v-if="hasAction($route.name, 'authorize')" title="authorize" type="success" link
                @click="authorizeRow(scope.row.id)">
                <Icon icon="material-symbols:privacy-tip-outline-rounded" width="16" height="16" />{{
                  $t('action.authorize')
                }}
              </ElButton>
              <ElPopconfirm v-if="!scope.row.hasChildren" :title="$t('message.removeConfirm')" :width="240"
                @confirm="confirmEvent(scope.row.id)">
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
  </ElSpace>

  <!-- form -->
  <ElDialog v-model="visible" :title="$t('page.groups')" align-center :show-close="false" width="400">
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
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- relation -->
  <ElDialog v-model="relationVisible" :title="$t('action.relation')" align-center width="640">
    <ElTabs stretch v-model="activeTabName" @tab-change="tabChange">
      <ElTabPane :label="$t('page.users')" name="user" style="text-align: center">
        <ElTransfer v-model="relationUsers" :props="{ key: 'username', label: 'fullName' }"
          :titles="[$t('label.unselected'), $t('label.selected')]" filterable :data="members"
          @change="handleTransferUserChange" />
      </ElTabPane>

      <ElTabPane :label="$t('page.roles')" name="role" style="text-align: center">
        <ElTransfer v-model="relationRoles" :props="{ key: 'id', label: 'name' }"
          :titles="[$t('label.unselected'), $t('label.selected')]" filterable :data="roles"
          @change="handleTransferRoleChange" />
      </ElTabPane>
    </ElTabs>
  </ElDialog>

  <!-- authorize -->
  <ElDialog v-model="authorizeVisible" :title="$t('action.authorize')" align-center width="65em">
    <ElTree :data="userStore.privileges" :props="{ label: 'name' }" node-key="id" show-checkbox default-expand-all
      :default-checked-keys="authorities.map(item => item.privilegeId)" :check-on-click-leaf="false"
      @check-change="handleCheckChange">
      <template #default="{ node, data }">
        <div class="flex flex-1 ">
          <Icon v-if="data.meta.icon" :icon="`material-symbols:${data.meta.icon}-rounded`" width="1.25em"
            height="1.25em" class="mr-2" />
          <span>{{ $t(`page.${node.label}`) }}</span>
        </div>
        <div>
          <ElCheckTag v-for="item in data.meta.actions" :key="item"
            :checked="(authorities.find(a => a.privilegeId === data.id)?.actions || []).includes(item)"
            :type="actions[item]" class="mr-2" @change="handleActionCheck(data.id, item)">
            {{ $t(`action.${item}`) }}
          </ElCheckTag>
        </div>
      </template>
    </ElTree>
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" align-center width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`templates/groups.xlsx`" :download="$t('page.groups') + '.xlsx'">
        {{ $t('page.groups') }}.xlsx
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

<style lang="scss" scoped>
.el-check-tag {
  padding: 4px 9px;
}
</style>