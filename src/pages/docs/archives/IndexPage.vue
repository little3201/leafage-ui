<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance, FormRules,
  TableInstance,
  UploadInstance, UploadRequestOptions
} from 'element-plus'
import { dayjs } from 'element-plus'
import {
  createArchive,
  fetchArchive,
  importArchives,
  modifyArchive,
  removeArchive,
  retrieveArchives
} from 'src/api/docs/archives'
import { retrieveSchemas } from 'src/api/docs/schemas'
import { actionIcons, actionTypes } from 'src/constants'
import type { Archive, Filters, Pagination, Schema } from 'src/types'
import { exportToCSV, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ArchiveSection from '../schemas/sections/IndexPage.vue'


const { t } = useI18n()

const loading = ref<boolean>(false)
const saveLoading = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const datas = ref<Array<Archive>>([])
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
const sectionRef = ref<InstanceType<typeof ArchiveSection>>()
const importRef = ref<UploadInstance>()

const filter = reactive<Filters<Archive>>({
  title: { op: 'like', value: undefined }
})

const initialValues: Archive = {
  id: null,
  title: '',
  schemaId: null
}
const form = ref<Archive>({ ...initialValues })

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
    const res = await retrieveArchives(pagination, filter)
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
    const filter: Filters<Schema> = {
      type: { op: 'eq', value: 'WORD' }
    }
    const res = await retrieveSchemas({ page: 1, size: 99 }, filter)
    schemas.value = res.data.content
  } catch (error) {
    return error
  } finally {
    loading.value = false
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
    exportToCSV(selectedRows, 'reports')
  }
  exportLoading.value = false
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
    const res = await fetchArchive(id)
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
        await modifyArchive(form.value.id, form.value)
      } else {
        await createArchive(form.value)
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
  return importArchives(options.file)
}

/**
 * 删除
 * @param id 主键
 */
async function removeRow(id: number) {
  try {
    await removeArchive(id)
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
function formatSchemas(cellValue: number): string {
  const matched = schemas.value.find(item => item.id === cellValue)
  return matched ? matched.name : ''
}

async function onSectionSave() {
  const result = await sectionRef.value?.modifySectionContent()
  if (result) {
    configVisible.value = false
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
            $t('action.import') }}
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
      <ElTableColumn prop="owner" :label="$t('label.owner')" />
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
              $t('action.modify')
            }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'config')" title="config" :type="actionTypes['config']" link
            @click="configRow(scope.row.id!)">
            <Icon :icon="`material-symbols:${actionIcons['config']}-rounded`" width="1.25em" height="1.25em" />
            {{ $t('action.config') }}
          </ElButton>
          <ElPopconfirm :title="$t('message.removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
            <template #reference>
              <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link>
                <Icon :icon="`material-symbols:${actionIcons['remove']}-rounded`" width="1.25em" height="1.25em" />{{
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

  <!-- form -->
  <ElDialog v-model="visible" :title="$t('page.archives')" align-center :show-close="false" width="400">
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
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.owner')" prop="owner">
            <ElInput v-model="form.owner" :placeholder="$t('placeholder.inputText', { field: $t('label.owner') })" />
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
  <ElDialog v-model="configVisible" :title="$t('action.config')" align-center :show-close="false">
    <ArchiveSection ref="sectionRef" :owner-id="form.id!" owner-type="ARCHIVE" schema-type="WORD" />
    <template #footer>
      <ElButton title="close" @click="configVisible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="save" type="primary" @click="onSectionSave">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- preview -->
  <ElDialog v-model="previewVisible" :title="$t('action.preview')" align-center>
    <ArchiveSection :owner-id="form.id!" owner-type="ARCHIVE" schema-type="WORD" />
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
