<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { TableInstance, FormInstance, FormRules, UploadInstance, UploadRequestOptions } from 'element-plus'
import { useI18n } from 'vue-i18n'
import SubPage from './SubPage.vue'
import {
  retrieveDictionaries, fetchDictionary, modifyDictionary, enableDictionary, importDictionaries
} from 'src/api/dictionaries'
import type { Pagination, Dictionary } from 'src/types'
import { Icon } from '@iconify/vue'
import { hasAction, exportToCSV } from 'src/utils'


const { t } = useI18n()

const loading = ref<boolean>(false)
const datas = ref<Array<Dictionary>>([])
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
  name: null
})

const formRef = ref<FormInstance>()
const initialValues: Dictionary = {
  id: undefined,
  name: ''
}
const form = ref<Dictionary>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, message: t('placeholder.inputText', { field: t('label.name') }), trigger: 'blur' }
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
    const res = await retrieveDictionaries(pagination, filters.value)
    const list = res.data.content
    list.forEach((element: Dictionary) => {
      if (element.count && element.count > 0) {
        element.hasChildren = true
      }
    })
    datas.value = list
    total.value = res.data.page.totalElements
  } catch {
    return Promise.resolve()
  } finally {
    loading.value = false
  }
}

/**
 * reset
 */
async function reset() {
  filters.value = {
    name: null
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
    exportToCSV(selectedRows, 'dictionaries')
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
    const res = await fetchDictionary(id)
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
    await enableDictionary(id)
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

  await formEl.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true
      try {
        if (form.value.id) {
          await modifyDictionary(form.value.id, form.value)

          visible.value = false
          await load()
        }
      } catch {
        return Promise.resolve()
      } finally {
        loading.value = false
      }
    }
  })
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
  return importDictionaries(options.file)
}
</script>

<template>
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filters" @submit.prevent>
        <ElFormItem :label="$t('label.name')" prop="name">
          <ElInput v-model="filters.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
        </ElFormItem>
        <ElFormItem>
          <ElButton title="search" type="primary" @click="load">
            <Icon icon="material-symbols:search-rounded" width="18" height="18" />{{ $t('action.search') }}
          </ElButton>
          <ElButton title="reset" @click="reset">
            <Icon icon="material-symbols:replay-rounded" width="18" height="18" />{{ $t('action.reset') }}
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never">
      <ElRow :gutter="20" justify="space-between" class="mb-4">
        <ElCol :span="16" class="text-left">
          <ElButton v-if="hasAction($route.name, 'import')" title="import" type="warning" plain @click="importRows">
            <Icon icon="material-symbols:database-upload-outline-rounded" width="18" height="18" />{{
              $t('action.import') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'export')" title="export" type="success" plain @click="exportRows"
            :loading="exportLoading">
            <Icon icon="material-symbols:file-export-outline-rounded" width="18" height="18" />{{ $t('action.export') }}
          </ElButton>
        </ElCol>

        <ElCol :span="8" class="text-right">
          <ElTooltip class="box-item" effect="dark" :content="$t('action.refresh')" placement="top">
            <ElButton title="view" plain circle @click="load">
              <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
            </ElButton>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
        <ElTableColumn type="selection" />
        <ElTableColumn type="expand">
          <template #default="props">
            <SubPage :superior-id="props.row.id" :title="props.row.name" />
          </template>
        </ElTableColumn>
        <ElTableColumn type="index" :label="$t('label.no')" width="55" />
        <ElTableColumn prop="name" :label="$t('label.name')" sortable />
        <ElTableColumn prop="enabled" :label="$t('label.enabled')" sortable>
          <template #default="scope">
            <ElSwitch size="small" v-model="scope.row.enabled" @change="enableChange(scope.row.id)"
              style="--el-switch-on-color: var(--el-color-success);" :disabled="!hasAction($route.name, 'enable')" />
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip prop="description" :label="$t('label.description')" />
        <ElTableColumn :label="$t('label.actions')">
          <template #default="scope">
            <ElButton v-if="hasAction($route.name, 'modify')" title="modify" type="primary" link
              @click="saveRow(scope.row.id)">
              <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('action.modify') }}
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
  <ElDialog v-model="visible" :title="$t('page.dictionaries')" align-center width="480">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem :label="$t('label.description')" prop="description">
            <ElInput v-model="form.description" type="textarea"
              :placeholder="$t('placeholder.inputText', { field: $t('label.description') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton title="cancel" @click="visible = false">
        <Icon icon="material-symbols:close" width="18" height="18" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="18" height="18" /> {{ $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" align-center width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`templates/dictionaries.xlsx`" :download="$t('dictionaries') + '.xlsx'">
        {{ $t('dictionaries') }}.xlsx
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
        <Icon icon="material-symbols:close" width="18" height="18" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="importLoading" @click="onImportSubmit(importRef)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="18" height="18" /> {{ $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
