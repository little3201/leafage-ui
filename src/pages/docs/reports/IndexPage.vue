<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance,
  FormRules,
  TableInstance,
  UploadInstance, UploadRequestOptions
} from 'element-plus'
import { dayjs, ElMessage, ElMessageBox } from 'element-plus'
import { createReport, fetchReport, importReports, modifyReport, removeReport, retrieveReports } from 'src/api/docs/reports'
import { retrieveSchemas } from 'src/api/docs/schemas'
import { actionIcons, actionTypes } from 'src/constants'
import type { Filters, Pagination, Report, Schema } from 'src/types'
import { exportToCSV, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ExcelContent from '../schemas/sections/ExcelContent.vue'
import Section from '../schemas/sections/IndexPage.vue'


const { t } = useI18n()
const loading = ref<boolean>(false)
const datas = ref<Array<Report>>([])
const total = ref<number>(0)

const schemas = ref<Array<Schema>>([])

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)
const previewVisible = ref<boolean>(false)
const fieldVisible = ref<boolean>(false)
const contentVisible = ref<boolean>(false)

const importVisible = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const importRef = ref<UploadInstance>()

const filter = reactive<Filters<Report>>({
  title: { op: 'like', value: undefined }
})

const sectionRef = ref<InstanceType<typeof Section>>()
const formRef = ref<FormInstance>()
const initialValues: Report = {
  id: null,
  title: '',
  schemaId: null,
  body: ''
}
const form = ref<Report>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  title: [
    { required: true, message: t('placeholder.inputText', { field: t('label.title') }), trigger: 'blur' }
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
    datas.value = []
    total.value = 0

    throw error
  } finally {
    loading.value = false
  }
}

/**
 * 加载 schemas
 */
async function loadSchemas() {
  const filter: Filters<Schema> = {
    type: { op: 'eq', value: 'EXCEL' }
  }
  const res = await retrieveSchemas({ page: 1, size: 99 }, filter)
  schemas.value = res.data.content
}

/**
 * 预览
 * @param id 主键
 */
function previewRow(id: number) {
  form.value.id = id
  previewVisible.value = true
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
    const res = await fetchReport(id)
    form.value = res.data
  } catch (error) {
    form.value = { ...initialValues }
    throw error
  }
}

/**
 * 配置
 * @param id 主键
 */
function configRow(id: number) {
  form.value.id = id
  fieldVisible.value = true
}

/**
 * 数据维护
 * @param id 主键
 */
function modifyRow(id: number) {
  if (!id) {
    return
  }

  form.value.id = id
  contentVisible.value = true
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
      await removeReport(id)
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
    exportToCSV(selectedRows, 'sections')
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
  return importReports(options.file)
}

/**
   * format schemas
   * @param cellValue cell value
   */
function formatSchemas(cellValue: number): string {
  const matched = schemas.value.find(item => item.id === cellValue)
  return matched ? matched.name : ''
}

async function onSectionSave() {
  const result = await sectionRef.value?.modifySectionContent()
  if (result) {
    fieldVisible.value = false
  }
}

async function onSectionContentSave() {
  const result = await sectionRef.value?.modifySectionContent()
  if (result) {
    contentVisible.value = false
  }
}
</script>

<template>
  <ElCard shadow="never">
    <ElRow :gutter="20" justify="space-between" class="mb-4">
      <ElCol :span="12">
        <ElInput v-model="filter.title!.value" clearable style="width: 240px" class="mr-4"
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
            $t('action.export')
          }}
        </ElButton>
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
          {{ scope.row.schemaId ? formatSchemas(scope.row.schemaId) : '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="lastModifiedDate" :label="$t('label.lastModifiedDate')" sortable>
        <template #default="scope">
          {{ scope.row.lastModifiedDate ? dayjs(scope.row.lastModifiedDate).format('YYYY-MM-DD HH:mm') : '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('label.actions')">
        <template #default="scope">
          <ElButton v-if="hasAction($route.name, 'modify')" title="modify" :type="actionTypes['modify']" link
            @click="saveRow(scope.row.id)">
            <Icon :icon="`material-symbols:${actionIcons['modify']}-rounded`" width="1.25em" height="1.25em" />{{
              $t('action.modify') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'config')" title="config" :type="actionTypes['config']" link
            @click="configRow(scope.row.id!)">
            <Icon :icon="`material-symbols:${actionIcons['config']}-rounded`" width="1.25em" height="1.25em" />
            {{ $t('action.config') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'maintenance')" title="maintenance" :type="actionTypes['maintenance']"
            link @click="modifyRow(scope.row.id!)">
            <Icon :icon="`material-symbols:${actionIcons['maintenance']}-rounded`" width="1.25em" height="1.25em" />
            {{ $t('action.maintenance') }}
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
    :show-close="false" width="400">
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
            <ElSelect v-model="form.schemaId" :disabled="form.id !== null"
              :placeholder="$t('placeholder.selectText', { field: $t('label.template') })">
              <ElOption v-for="(item, index) in schemas" :key="index" :label="item.name" :value="item.id!" />
            </ElSelect>
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
  <ElDialog v-model="fieldVisible" :title="$t('action.config')" align-center :show-close="false">
    <Section ref="sectionRef" :owner-id="form.id!" owner-type="REPORT" schema-type="EXCEL" />
    <template #footer>
      <ElButton title="close" @click="fieldVisible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="save" type="primary" @click="onSectionSave">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- maintenance -->
  <ElDialog v-model="contentVisible" :title="$t('action.maintenance')" align-center :show-close="false">
    <ExcelContent ref="sectionContentRef" :section-id="form.id!" />
    <template #footer>
      <ElButton title="close" @click="contentVisible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="save" type="primary" @click="onSectionContentSave">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- preview -->
  <ElDialog v-model="previewVisible" :title="$t('action.preview')" align-center>
    <Section :owner-id="form.id!" owner-type="REPORT" schema-type="EXCEL" :read-only="true" />
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" align-center :show-close="false" width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`schemas/sections.xlsx`" :download="$t('page.sections') + '.xlsx'">
        {{ $t('page.sections') }}.xlsx
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