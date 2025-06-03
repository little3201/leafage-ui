<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { TableInstance, FormInstance, FormRules, UploadInstance, UploadRequestOptions, CheckboxValueType } from 'element-plus'
import draggable from 'vuedraggable'
import { useUserStore } from 'stores/user-store'
import DialogView from 'components/DialogView.vue'
import {
  retrievePrivileges, retrievePrivilegeSubset, fetchPrivilege, modifyPrivilege, enablePrivilege, importPrivileges
} from 'src/api/privileges'
import { retrieveDictionarySubset } from 'src/api/dictionaries'
import { visibleArray, hasAction, exportToCSV } from 'src/utils'
import { actions } from 'src/constants'
import type { Pagination, Privilege, Dictionary } from 'src/types'
import { Icon } from '@iconify/vue'


const userStore = useUserStore()

const loading = ref<boolean>(false)
const datas = ref<Array<Privilege>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const checkAll = ref<boolean>(true)
const isIndeterminate = ref<boolean>(false)
const checkedColumns = ref<Array<string>>(['name', 'path', 'redirect', 'actions', 'enabled', 'description'])
const columns = ref<Array<string>>(['name', 'path', 'redirect', 'actions', 'enabled', 'description'])

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

async function load(row?: Privilege, treeNode?: unknown, resolve?: (date: Privilege[]) => void) {
  loading.value = true
  if (row && row.id && resolve) {
    retrievePrivilegeSubset(row.id).then(res => {
      const list = res.data
      // 处理字节点
      list.forEach((element: Privilege) => {
        if (element.count && element.count > 0) {
          element.hasChildren = true
        }
      })
      resolve(list)
    }).finally(() => { loading.value = false })
  } else {
    retrievePrivileges(pagination, filters.value).then(res => {
      const list = res.data.content
      // 处理字节点
      list.forEach((element: Privilege) => {
        if (element.count && element.count > 0) {
          element.hasChildren = true
        }
      })
      datas.value = list
      total.value = res.data.page.totalElements
    }).finally(() => { loading.value = false })
  }
}

async function loadDictionaries() {
  retrieveDictionarySubset(2).then(res => {
    buttonOptions.value = res.data
  })
}

/**
 * reset
 */
function reset() {
  filters.value = {
    name: null,
    path: null
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
    exportToCSV(selectedRows, 'privileges')
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
    retrievePrivilegeSubset(id).then(res => { subset.value = res.data })
  }
  loadDictionaries()
  visible.value = true
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  fetchPrivilege(id).then(res => {
    form.value = res.data
  })
}

async function enableChange(id: number) {
  enablePrivilege(id).then(() => { load() })
}

/**
 * 表单提交
 */
async function onSubmit(formEl: FormInstance | undefined) {
  if (!formEl) return

  formEl.validate((valid) => {
    if (valid) {
      saveLoading.value = true
      if (form.value.id) {
        modifyPrivilege(form.value.id, form.value).then(res => {
          load(res.data)
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
</script>

<template>
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filters">
        <ElFormItem :label="$t('name')" prop="name">
          <ElInput v-model="filters.name" :placeholder="$t('inputText', { field: $t('name') })" />
        </ElFormItem>
        <ElFormItem :label="$t('path')" prop="path">
          <ElInput v-model="filters.path" :placeholder="$t('inputText', { field: $t('path') })" />
        </ElFormItem>
        <ElFormItem>
          <ElButton title="search" type="primary" @click="load()">
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
          <ElButton v-if="hasAction($route.name, 'import')" title=" import" type="warning" plain @click="importRows">
            <Icon icon="material-symbols:database-upload-outline-rounded" width="18" height="18" />{{ $t('import') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'export')" title=" export" type="success" plain @click="exportRows"
            :loading="exportLoading">
            <Icon icon="material-symbols:file-export-outline-rounded" width="18" height="18" />{{ $t('export') }}
          </ElButton>
        </ElCol>
        <ElCol :span="8" class="text-right">
          <ElTooltip class="box-item" effect="dark" :content="$t('refresh')" placement="top">
            <ElButton title="refresh" type="primary" plain circle @click="load()">
              <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
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

      <ElTable ref="tableRef" v-loading="loading" :data="datas" lazy :load="load" row-key="id" stripe
        table-layout="auto">
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn prop="name" :label="$t('name')" class-name="name-cell" sortable>
          <template #default="scope">
            <Icon :icon="`material-symbols:${scope.row.icon}-rounded`" width="18" height="18" class="mr-2" />
            {{ $t(scope.row.name) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="path" :label="$t('path')" sortable />
        <ElTableColumn prop="redirect" :label="$t('redirect')" />
        <ElTableColumn prop="actions" :label="$t('actions')">
          <template #default="scope">
            <template v-if="scope.row.actions && scope.row.actions.length > 0">
              <ElTag v-for="(item, index) in visibleArray(scope.row.actions, 3)" :key="index" :type="actions[item]"
                class="mr-2">
                {{ $t(item as string) }}
              </ElTag>
              <ElPopover v-if="scope.row.actions.length > 3" placement="top-start" trigger="hover">
                <template #reference>
                  <ElTag type="primary">
                    +{{ scope.row.actions.length - 3 }}
                  </ElTag>
                </template>
                <ElTag v-for="(item, index) in scope.row.actions.slice(3)" :key="index" :type="actions[item]"
                  class="mb-2 mr-2">
                  {{ $t(item) }}
                </ElTag>
              </ElPopover>
            </template>
          </template>
        </ElTableColumn>
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
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination layout="prev, pager, next, sizes, jumper, ->, total" @change="pageChange" :total="total" />
    </ElCard>
  </ElSpace>

  <DialogView v-model="visible" :title="$t('privileges')" width="36%">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20" class="w-full !mx-0">
        <ElCol :span="12">
          <ElFormItem :label="$t('name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('inputText', { field: $t('name') })" disabled>
              <template #prefix>
                <Icon :icon="`material-symbols:${form.icon}-rounded`" />
              </template>
            </ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('path')" prop="path">
            <ElInput v-model="form.path" :placeholder="$t('inputText', { field: $t('path') })" disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20" class="w-full !mx-0">
        <ElCol :span="12">
          <ElFormItem :label="$t('component')" prop="component">
            <ElInput v-model="form.component" :placeholder="$t('inputText', { field: $t('component') })" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('redirect')" prop="redirect">
            <ElSelect v-model="form.redirect" :placeholder="$t('selectText', { field: $t('redirect') })">
              <ElOption v-for="item in subset" :key="item.id" :label="$t(item.name)" :value="item.path" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20" v-if="!form.redirect" class="w-full !mx-0">
        <ElCol>
          <ElFormItem :label="$t('actions')" prop="meta.actions">
            <ElCheckTag v-for="item in buttonOptions" :key="item.id" :checked="form.actions?.includes(item.name)"
              :type="actions[item.name]" class="mr-2 mb-2" @change="onCheckChange(item.name)">
              {{ $t(item.name) }}
            </ElCheckTag>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20" class="w-full !mx-0">
        <ElCol>
          <ElFormItem :label="$t('description')" prop="description">
            <ElInput v-model="form.description" type="textarea" :placeholder="$t('description')" />
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

  <!-- import -->
  <DialogView v-model="importVisible" :title="$t('import')" width="36%">
    <p>{{ $t('master_plates') + ' ' + $t('download') }}：
      <a :href="`templates/privileges.xlsx`" :download="$t('privileges') + '.xlsx'">
        {{ $t('privileges') }}.xlsx
      </a>
    </p>
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" :http-request="onUpload"
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
    <p class="text-red-600">xxxx</p>
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

<style lang="scss">
.name-cell {
  .cell {
    display: inline-flex;
    align-items: center;
  }
}
</style>

<style lang="scss" scoped>
.el-badge {
  display: inline-flex;
  vertical-align: baseline;
}
</style>
