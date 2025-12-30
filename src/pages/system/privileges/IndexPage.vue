<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { TableInstance, FormInstance, FormRules, UploadInstance, UploadRequestOptions } from 'element-plus'
import {
  retrievePrivileges, retrievePrivilegeSubset, fetchPrivilege, modifyPrivilege, enablePrivilege, importPrivileges
} from 'src/api/privileges'
import { retrieveDictionarySubset } from 'src/api/dictionaries'
import { visibleArray, hasAction, exportToCSV } from 'src/utils'
import { actions } from 'src/constants'
import type { Pagination, Privilege, Dictionary } from 'src/types'
import { Icon } from '@iconify/vue'


const loading = ref<boolean>(false)
const datas = ref<Array<Privilege>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const buttonOptions = ref<Array<Dictionary>>([])
const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const importVisible = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const importRef = ref<UploadInstance>()

const filters = ref({
  name: null,
  path: null
})

const formRef = ref<FormInstance>()
const initialValues: Privilege = {
  id: undefined,
  name: '',
  superiorId: null,
  path: '',
  component: '',
  icon: ''
}
const form = ref<Privilege>({ ...initialValues })
const subset = ref<Array<Privilege>>()

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, trigger: 'blur' }
  ],
  path: [
    { required: true, trigger: 'blur' }
  ]
})

onMounted(async () => {
  await load()

  const res = await retrieveDictionarySubset(100)
  buttonOptions.value = res.data
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

async function load(row?: Privilege, treeNode?: unknown, resolve?: (date: Privilege[]) => void) {
  loading.value = true
  try {
    if (row && row.id && resolve) {
      const res = await retrievePrivilegeSubset(row.id)
      const list = res.data
      // 处理子节点
      list.forEach((element: Privilege) => {
        if (element.count && element.count > 0) {
          element.hasChildren = true
        }
      })
      resolve(list)
    } else {
      const res = await retrievePrivileges(pagination, filters.value)
      const list = res.data.content
      // 处理子节点
      list.forEach((element: Privilege) => {
        if (element.count && element.count > 0) {
          element.hasChildren = true
        }
      })
      datas.value = list
      total.value = res.data.page.totalElements
    }
  } catch {
    return Promise.resolve()
  } finally {
    loading.value = false
  }
}

/**
 * 刷新子节点
 * @param rowKey row key
 */
const refreshChildren = async (rowKey: number) => {
  try {
    const res = await retrievePrivilegeSubset(rowKey)
    const list = res.data
    // 处理子节点
    list.forEach((element: Dictionary) => {
      if (element.count && element.count > 0) {
        element.hasChildren = true
      }
    })

    tableRef.value?.updateKeyChildren(String(rowKey), list)
  } catch {
    return Promise.resolve()
  }
}

/**
 * reset
 */
async function reset() {
  filters.value = {
    name: null,
    path: null
  }
  await load()
}

/**
 * 弹出框
 * @param id 主键
 */
async function saveRow(id?: number) {
  form.value = { ...initialValues }
  try {
    if (id) {
      await loadOne(id)
      const res = await retrievePrivilegeSubset(id)
      subset.value = res.data
    }
  } catch {
    return Promise.resolve()
  }
  visible.value = true
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  try {
    const res = await fetchPrivilege(id)
    form.value = res.data
  } catch {
    return Promise.resolve()
  }
}

async function enableChange(id: number) {
  try {
    await enablePrivilege(id)
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
    if (form.value.id) {
      try {
        await modifyPrivilege(form.value.id, form.value)

        visible.value = false
        await load()

        await refreshChildren(form.value.superiorId!)
      } catch {
        return Promise.resolve()
      } finally { saveLoading.value = false }
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
    exportToCSV(selectedRows, 'privileges')
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
  return importPrivileges(options.file)
}

/**
 * handle check change
 * @param item checked item
 */
function onCheckChange(item: string) {
  if (form.value.actions) {
    const index = form.value.actions.indexOf(item)
    if (index === -1) {
      form.value.actions.push(item)
    } else {
      form.value.actions.splice(index, 1)
    }
  }
}
</script>

<template>
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filters">
        <ElFormItem :label="$t('label.name')" prop="name">
          <ElInput v-model="filters.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
        </ElFormItem>
        <ElFormItem :label="$t('label.path')" prop="path">
          <ElInput v-model="filters.path" :placeholder="$t('placeholder.inputText', { field: $t('label.path') })" />
        </ElFormItem>
        <ElFormItem>
          <ElButton title="search" type="primary" @click="load()">
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
          <ElButton v-if="hasAction($route.name, 'import')" title="import" type="warning" plain @click="importRows">
            <Icon icon="material-symbols:database-upload-outline-rounded" width="1.25em" height="1.25em" />{{
              $t('action.import') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'export')" title="export" type="success" plain @click="exportRows"
            :loading="exportLoading">
            <Icon icon="material-symbols:file-export-outline-rounded" width="1.25em" height="1.25em" />{{
              $t('action.export') }}
          </ElButton>
        </ElCol>
        <ElCol :span="8" class="text-right">
          <ElTooltip class="box-item" effect="dark" :content="$t('action.refresh')" placement="top">
            <ElButton title="refresh" plain circle @click="load()">
              <Icon icon="material-symbols:refresh-rounded" width="1.25em" height="1.25em" />
            </ElButton>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" lazy :load="load" row-key="id" table-layout="auto">
        <ElTableColumn type="selection" />
        <ElTableColumn type="index" :label="$t('label.no')" width="55" />
        <ElTableColumn prop="name" :label="$t('label.name')" class-name="name-cell" sortable>
          <template #default="scope">
            <Icon :icon="`material-symbols:${scope.row.icon}-rounded`" style="vertical-align: -3.5px" width="1.25em"
              height="1.25em" class="mr-2" />
            {{ $t(`page.${scope.row.name}`) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="path" :label="$t('label.path')" sortable />
        <ElTableColumn prop="redirect" :label="$t('label.redirect')" />
        <ElTableColumn prop="actions" :label="$t('label.actions')">
          <template #default="scope">
            <template v-if="scope.row.actions && scope.row.actions.length > 0">
              <ElTag v-for="(item, index) in visibleArray(scope.row.actions, 3)" :key="index" :type="actions[item]"
                class="mr-2">
                {{ $t(`action.${item}`) }}
              </ElTag>
              <ElPopover v-if="scope.row.actions.length > 3" placement="top-start" trigger="hover">
                <template #reference>
                  <ElTag type="primary">
                    +{{ scope.row.actions.length - 3 }}
                  </ElTag>
                </template>
                <ElTag v-for="(item, index) in scope.row.actions.slice(3)" :key="index" :type="actions[item]"
                  class="mb-2 mr-2">
                  {{ $t(`action.${item}`) }}
                </ElTag>
              </ElPopover>
            </template>
          </template>
        </ElTableColumn>
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
            <ElButton v-if="scope.row.count > 0" title="refresh" link @click="refreshChildren(scope.row.id)">
              <Icon icon="material-symbols:refresh-rounded" width="1.25em" height="1.25em" />{{ $t('action.refresh') }}
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
  </ElSpace>

  <!-- form -->
  <ElDialog v-model="visible" :title="$t('page.privileges')" align-center :show-close="false" width="480">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })"
              disabled>
              <template #prefix>
                <Icon :icon="`material-symbols:${form.icon}-rounded`" />
              </template>
            </ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.path')" prop="path">
            <ElInput v-model="form.path" :placeholder="$t('placeholder.inputText', { field: $t('path') })" disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.component')" prop="component">
            <ElInput v-model="form.component" :placeholder="$t('placeholder.inputText', { field: $t('component') })"
              disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.redirect')" prop="redirect">
            <ElSelect v-model="form.redirect" :placeholder="$t('placeholder.selectText', { field: $t('redirect') })">
              <ElOption v-for="item in subset" :key="item.id" :label="$t(`page.${item.name}`)" :value="item.path" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20" v-if="!form.redirect">
        <ElCol>
          <ElFormItem :label="$t('label.actions')" prop="meta.actions">
            <ElCheckTag v-for="item in buttonOptions" :key="item.id" :checked="form.actions?.includes(item.name)"
              :type="actions[item.name]" class="mr-2 mb-2" @change="onCheckChange(item.name)">
              {{ $t(`action.${item.name}`) }}
            </ElCheckTag>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.description')" prop="description">
            <ElInput v-model="form.description" type="textarea" :placeholder="$t('label.description')" />
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
      <a :href="`templates/privileges.xlsx`" :download="$t('page.privileges') + '.xlsx'">
        {{ $t('page.privileges') }}.xlsx
      </a>
    </p>
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" :http-request="onUpload"
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
    <p class="text-red-600">xxxx</p>
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
.el-badge {
  display: inline-flex;
  vertical-align: baseline;
}
</style>
