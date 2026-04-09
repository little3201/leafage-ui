<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance, FormRules,
  TableInstance,
  UploadInstance, UploadRequestOptions
} from 'element-plus'
import { dayjs } from 'element-plus'
import {
  createReport,
  fetchReport,
  importReports,
  modifyReport,
  removeReport,
  retrieveReports
} from 'src/api/reports'
import { retrieveSchemas } from 'src/api/schemas'
import { reportStatus } from 'src/constants'
import type { Filters, Pagination, Report, Schema } from 'src/types'
import { exportToCSV, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportSection from './sections/IndexPage.vue'


const { t } = useI18n()

const loading = ref<boolean>(false)
const saveLoading = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const datas = ref<Array<Report>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const schemas = ref<Array<Schema>>([])

const visible = ref<boolean>(false)
const configVisible = ref<boolean>(false)
const importVisible = ref<boolean>(false)
const previewVisible = ref<boolean>(false)

const formRef = ref<FormInstance>()
const importRef = ref<UploadInstance>()

const filter = reactive<Filters<Report>>({
  title: { op: 'like', value: undefined },
  status: { op: 'eq', value: undefined }
})

const initialValues: Report = {
  id: null,
  title: '',
  schemaId: null,
  version: 1,
  status: 'DRAFT',
}
const form = ref<Report>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  title: [
    { required: true, message: t('placeholder.inputText', { field: t('label.title') }), trigger: 'blur' }
  ],
  status: [
    { required: true, message: t('placeholder.selectText', { field: t('label.status') }), trigger: 'blur' }
  ]
})

onMounted(async () => {
  await load()

  await loadSchemas()
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
    const res = await retrieveReports(pagination, filter)
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

/**
 * 加载列表
 */
async function loadSchemas() {
  loading.value = true
  try {
    const res = await retrieveSchemas({ page: 1, size: 99 })
    schemas.value = res.data.content
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

/**
 * reset
 */
async function reset() {
  filter.title!.value = undefined
  filter.status!.value = undefined
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
    exportToCSV(selectedRows, 'reports')
  }
  exportLoading.value = false
}

/**
 * preview
 * @param id 主键
 */
function previewRow(id: number) {
  form.value.id = id
  previewVisible.value = true
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
 * 配置
 * @param id 主键
 */
function configRow(id: number) {
  if (!id) {
    return
  }

  form.value.id = id
  configVisible.value = true
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  try {
    const res = await fetchReport(id)
    form.value = res.data
  } catch (error) {
    return error
  }
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
        await modifyReport(form.value.id, form.value)
      } else {
        await createReport(form.value)
      }
      visible.value = false
      await load()
    } catch (error) {
      return error
    } finally {
      saveLoading.value = false
    }
  }
}

/**
 * 表单提交
 */
function onImportSubmit(importEl: UploadInstance) {
  if (!importEl) return
  importLoading.value = true

  importEl.submit()

  importLoading.value = false
  importVisible.value = false
}

function onUpload(options: UploadRequestOptions) {
  return importReports(options.file)
}

/**
 * 删除
 * @param id 主键
 */
async function removeRow(id: number) {
  try {
    await removeReport(id)
    await load()
  } catch (error) {
    return error
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
   * format schemas
   * @param cellValue cell value
   */
function formatTemplates(cellValue: number): string {
  const matched = schemas.value.find(item => item.id === cellValue)
  return matched ? matched.name : ''
}
</script>

<template>
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filter" @submit.prevent>
        <ElFormItem :label="$t('label.title')" prop="title">
          <ElInput v-model="filter.title!.value"
            :placeholder="$t('placeholder.inputText', { field: $t('label.title') })" />
        </ElFormItem>
        <ElFormItem :label="$t('label.status')" prop="status">
          <ElSelect v-model="filter.status!.value" class="min-w-48"
            :placeholder="$t('placeholder.selectText', { field: $t('label.status') })">
            <ElOption v-for="(_, value) in reportStatus" :key="value" :label="value" :value="value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="load()">
            <Icon icon="material-symbols:search-rounded" width="1.25em" height="1.25em" />{{ $t('action.search') }}
          </ElButton>
          <ElButton @click="reset()">
            <Icon icon="material-symbols:replay-rounded" width="1.25em" height="1.25em" />{{ $t('action.reset') }}
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never">
      <ElRow :gutter="20" justify="space-between" class="mb-4">
        <ElCol :span="16" class="text-left">
          <ElButton v-if="hasAction($route.name, 'create')" title="create" type="primary" @click="saveRow()">
            <Icon icon="material-symbols:add-rounded" width="1.25em" height="1.25em" />{{ $t('action.create') }}
          </ElButton>
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

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
        <ElTableColumn type="selection" />
        <ElTableColumn type="index" :label="$t('label.no')" width="55" />
        <ElTableColumn prop="title" :label="$t('label.title')">
          <template #default="scope">
            <ElButton title="details" type="primary" link @click="previewRow(scope.row.id)">
              {{ scope.row.title }}
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="version" :label="$t('label.version')">
          <template #default="scope">
            V{{ scope.row.version }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="schemaId" :label="$t('label.template')">
          <template #default="scope">
            {{ scope.row.schemaId ? formatTemplates(scope.row.schemaId) : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" :label="$t('label.status')" sortable>
          <template #default="scope">
            <ElBadge is-dot :type="reportStatus[scope.row.status]" class="mr-1" />
            <ElText :type="reportStatus[scope.row.status]">{{ scope.row.status }}</ElText>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="owner" :label="$t('label.owner')" />
        <ElTableColumn prop="lastModifiedDate" :label="$t('label.lastModifiedDate')" sortable>
          <template #default="scope">
            {{ scope.row.lastModifiedDate ? dayjs(scope.row.lastModifiedDate).format('YYYY-MM-DD HH:mm') : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('label.actions')">
          <template #default="scope">
            <ElButton v-if="scope.row.status === 'DRAFT' && hasAction($route.name, 'modify')" title="modify"
              type="primary" link @click="saveRow(scope.row.id)">
              <Icon icon="material-symbols:edit-outline-rounded" width="1.25em" height="1.25em" />{{ $t('action.modify')
              }}
            </ElButton>
            <ElButton v-if="scope.row.status === 'DRAFT' && hasAction($route.name, 'config')" title="config"
              type="success" link @click="configRow(scope.row.id!)">
              <Icon icon="material-symbols:plug-connect-outline-rounded" width="1.25em" height="1.25em" />
              {{ $t('action.config') }}
            </ElButton>
            <ElPopconfirm :title="$t('message.removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
              <template #reference>
                <ElButton v-if="hasAction($route.name, 'remove')" title="remove" type="danger" link>
                  <Icon icon="material-symbols:delete-outline-rounded" width="1.25em" height="1.25em" />{{
                    $t('action.remove')
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
  <ElDialog v-model="visible" :title="$t('page.reports')" align-center :show-close="false" width="400">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.title')" prop="title">
            <ElInput v-model="form.title" :placeholder="$t('placeholder.inputText', { field: $t('label.title') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.template')" prop="schemaId">
            <ElSelect v-model="form.schemaId"
              :placeholder="$t('placeholder.selectText', { field: $t('label.template') })">
              <ElOption v-for="(item, index) in schemas" :key="index" :label="item.name" :value="item.id!" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.owner')" prop="owner">
            <ElInput v-model="form.owner" type="textarea"
              :placeholder="$t('placeholder.inputText', { field: $t('label.owner') })" />
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

  <!-- config -->
  <ElDialog v-model="configVisible" :title="$t('action.config')" align-center>
    <ReportSection :report-id="form.id!" />
  </ElDialog>

  <!-- preview -->
  <ElDialog v-model="previewVisible" :title="$t('action.preview')" align-center>
    <!-- <ElScrollbar max-height="600px"> -->
    <ReportSection :report-id="form.id!" :preview="true" />
    <!-- </ElScrollbar> -->
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" align-center width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`schemas/reports.xlsx`" :download="$t('page.reports') + '.xlsx'">
        {{ $t('page.reports') }}.xlsx
      </a>
    </p>
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" :http-request="onUpload" :on-success="load"
      accept=".xls,application/vnd.ms-excel,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
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
