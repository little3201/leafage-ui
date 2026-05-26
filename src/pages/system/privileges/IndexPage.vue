<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { FormInstance, FormRules, InputInstance, TableInstance, UploadInstance, UploadRequestOptions } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  enablePrivilege,
  fetchPrivilege,
  importPrivileges,
  modifyPrivilege,
  retrievePrivileges, retrievePrivilegeSubset
} from 'src/api/system/privileges'
import { actionIcons, actionTypes } from 'src/constants'
import type { Dictionary, Filter, Pagination, Privilege } from 'src/types'
import { exportToCSV, hasAction, visibleArray } from 'src/utils'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const loading = ref<boolean>(false)
const datas = ref<Array<Privilege>>([])
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

const filter = reactive<Filter<Privilege>>({
  name: { op: 'like', value: undefined }
})

const formRef = ref<FormInstance>()
const initialValues: Privilege = {
  id: null,
  name: '',
  superiorId: null,
  path: '',
  component: '',
  icon: '',
  actions: []
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
const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref<InputInstance>()

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

async function load(row?: Privilege, treeNode?: unknown, resolve?: (date: Privilege[]) => void) {
  loading.value = true

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
    const res = await retrievePrivileges(pagination, filter)
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

  loading.value = false
}

/**
 * 刷新子节点
 * @param rowKey row key
 */
const refreshChildren = async (rowKey: number) => {
  const res = await retrievePrivilegeSubset(rowKey)
  const list = res.data
  // 处理子节点
  list.forEach((element: Dictionary) => {
    if (element.count && element.count > 0) {
      element.hasChildren = true
    }
  })

  tableRef.value?.updateKeyChildren(String(rowKey), list)
}

/**
 * 弹出框
 * @param id 主键
 */
async function saveRow(id?: number) {
  form.value = { ...initialValues, id: id || null }

  if (id) {
    await loadOne(id)
    const res = await retrievePrivilegeSubset(id)
    subset.value = res.data
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
  } catch (error) {
    form.value = { ...initialValues }
    throw error
  }
}

async function enableChange(id: number) {
  await enablePrivilege(id)
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
    if (form.value.id) {
      try {
        await modifyPrivilege(form.value.id, form.value)

        visible.value = false

        ElMessage.success(t('message.success', { action: form.value.id ? t('action.modify') : t('action.create') }))
        await load()

        if (form.value.superiorId) {
          await refreshChildren(form.value.superiorId)
        }
      } catch (error) {
        ElMessage.success(t('message.success', { action: form.value.id ? t('action.modify') : t('action.create') }))
        throw error
      } finally {
        saveLoading.value = false
      }
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
function onImportSubmit(importEl: UploadInstance) {
  if (!importEl) return
  importLoading.value = true

  importEl.submit()

  importLoading.value = false
  importVisible.value = false
}

function onUpload(options: UploadRequestOptions) {
  return importPrivileges(options.file)
}

function handleClose(tag: string) {
  if (form.value.actions) {
    form.value.actions.splice(form.value.actions.indexOf(tag), 1)
  }
}

function showInput() {
  inputVisible.value = true
  void nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

function handleInputConfirm() {
  if (inputValue.value && form.value.actions) {
    form.value.actions.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
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
          <Icon :icon="`material-symbols:${actionIcons['search']}-rounded`" width="1.25em" height="1.25em" />
          {{ $t('action.search') }}
        </ElButton>
      </ElCol>

      <ElCol :span="12" class="text-right">
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

    <ElTable ref="tableRef" v-loading="loading" :data="datas" lazy :load="load" row-key="id" table-layout="auto">
      <ElTableColumn type="selection" />
      <ElTableColumn type="index" :label="$t('label.no')" width="55" />
      <ElTableColumn prop="name" :label="$t('label.name')">
        <template #default="scope">
          <Icon :icon="`material-symbols:${scope.row.icon}-rounded`" style="vertical-align: -3.5px" width="1.25em"
            height="1.25em" class="mr-2" />
          {{ scope.row.name ? $t(`page.${scope.row.name}`) : '' }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="path" :label="$t('label.path')" />
      <ElTableColumn prop="redirect" :label="$t('label.redirect')" />
      <ElTableColumn prop="actions" :label="$t('label.actions')">
        <template #default="scope">
          <ElTag v-for="(item, index) in visibleArray(scope.row.actions, 3)" :key="index" :type="actionTypes[item]"
            class="mr-2">
            {{ $t(`action.${item}`) }}
          </ElTag>
          <ElPopover v-if="scope.row.actions && scope.row.actions.length > 3" placement="top-start" trigger="hover">
            <template #reference>
              <ElTag type="primary">
                +{{ scope.row.actions.length - 3 }}
              </ElTag>
            </template>
            <ElTag v-for="(item, index) in scope.row.actions.slice(3)" :key="index" :type="actionTypes[item]"
              class="mb-2 mr-2">
              {{ $t(`action.${item}`) }}
            </ElTag>
          </ElPopover>
        </template>
      </ElTableColumn>
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
          <ElButton v-if="scope.row.count > 0" title="refresh" link @click="refreshChildren(scope.row.id)">
            <Icon :icon="`material-symbols:${actionIcons['refresh']}-rounded`" width="1.25em" height="1.25em" />{{
              $t('action.refresh') }}
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
            <ElInput v-model="form.path" :placeholder="$t('placeholder.inputText', { field: $t('label.path') })"
              disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.component')" prop="component">
            <ElInput v-model="form.component"
              :placeholder="$t('placeholder.inputText', { field: $t('label.component') })" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.redirect')" prop="redirect">
            <ElSelect v-model="form.redirect"
              :placeholder="$t('placeholder.selectText', { field: $t('label.redirect') })">
              <ElOption v-for="item in subset" :key="item.id!" :label="$t(`page.${item.name}`)" :value="item.path" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.actions')" prop="actions">
            <div class="inline-flex flex-wrap gap-2">
              <ElTag v-for="(item, index) in form.actions" :key="index" closable :type="actionTypes[item]"
                @close="handleClose(item)">
                <Icon :icon="`material-symbols:${actionIcons[item]}-rounded`" style="vertical-align: -3.5px"
                  width="1.25em" height="1.25em" />
                {{ $t(`action.${item}`) }}
              </ElTag>

              <ElInput v-if="inputVisible" ref="InputRef" v-model="inputValue" class="w-20"
                @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
              <ElButton v-else circle size="small" type="primary" plain @click="showInput()">
                <Icon icon="material-symbols:add" width="1.25em" height="1.25em" />
              </ElButton>
            </div>
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
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef!)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" :show-close="false" width="480">
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
      <ElButton title="submit" type="primary" :loading="importLoading" @click="onImportSubmit(importRef!)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
