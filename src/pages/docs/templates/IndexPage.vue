<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance, FormRules, TableInstance,
  UploadInstance, UploadRequestOptions
} from 'element-plus'
import { dayjs } from 'element-plus'
import {
  createTemplate, fetchTemplate, importTemplates, modifyTemplate, previewTemplate,
  removeTemplate, retrieveTemplates,
} from 'src/api/templates'
import type { Filters, Pagination, Template } from 'src/types'
import { exportToCSV, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const loading = ref<boolean>(false)
const datas = ref<Array<Template>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const configVisible = ref<boolean>(false)
const previewVisible = ref<boolean>(false)
const importVisible = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const importRef = ref<UploadInstance>()

const filter = reactive<Filters<Template>>({
  name: { op: 'eq', value: undefined }
})

const formRef = ref<FormInstance>()
const initialValues: Template = {
  id: null,
  name: ''
}
const form = ref<Template>({ ...initialValues })

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
    const res = await retrieveTemplates(pagination, filter)
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch (error) {
    return error
  } finally { loading.value = false }
}

/**
 * reset
 */
async function reset() {
  filter.name!.value = undefined
  await load()
}

/**
 * preview
 * @param id 主键
 */
async function previewRow(id: number) {
  try {
    const res = await previewTemplate(id)
    form.value = res.data
  } catch (error) {
    return error
  }
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
 * 配置
 * @param id 主键
 */
function configRow(row: Template) {
  if (!row.id) {
    return
  }
  configVisible.value = true
  form.value.id = row.id
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  try {
    const res = await fetchTemplate(id)
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
        await modifyTemplate(form.value.id, form.value)
      } else {
        await createTemplate(form.value)
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
 * 删除
 * @param id 主键
 */
async function removeRow(id: number) {
  try {
    await removeTemplate(id)
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
    exportToCSV(selectedRows, 'templates')
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
  return importTemplates(options.file)
}

</script>

<template>
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filter" @submit.prevent>
        <ElFormItem :label="$t('label.name')" prop="name">
          <ElInput v-model="filter.name!.value"
            :placeholder="$t('placeholder.inputText', { field: $t('label.name') })" />
        </ElFormItem>
        <ElFormItem>
          <ElButton title="search" type="primary" @click="load()">
            <Icon icon="material-symbols:search-rounded" width="1.25em" height="1.25em" />{{ $t('action.search') }}
          </ElButton>
          <ElButton title="reset" @click="reset()">
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
            <ElButton title="refresh" plain circle @click="load()">
              <Icon icon="material-symbols:refresh-rounded" width="1.25em" height="1.25em" />
            </ElButton>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
        <ElTableColumn type="selection" />
        <ElTableColumn type="index" :label="$t('label.no')" width="55" />
        <ElTableColumn prop="name" :label="$t('label.name')">
          <template #default="scope">
            <ElButton title="details" type="primary" link @click="previewRow(scope.row.id)">
              {{ scope.row.name }}
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip prop="description" :label="$t('label.description')" />
        <ElTableColumn prop="lastModifiedDate" :label="$t('label.lastModifiedDate')" sortable>
          <template #default="scope">
            {{ scope.row.lastModifiedDate ? dayjs(scope.row.lastModifiedDate).format('YYYY-MM-DD HH:mm') : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('label.actions')">
          <template #default="scope">
            <ElButton v-if="hasAction($route.name, 'modify')" title=" modify" type="primary" link
              @click="saveRow(scope.row.id)">
              <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('action.modify') }}
            </ElButton>
            <ElButton v-if="hasAction($route.name, 'config')" title="config" type="success" link
              @click="configRow(scope.row)">
              <Icon icon="material-symbols:plug-connect-outline-rounded" width="16" height="16" />{{ $t('action.config')
              }}
            </ElButton>
            <ElPopconfirm v-if="!scope.row.hasChildren" :title="$t('message.removeConfirm')" :width="240"
              @confirm="confirmEvent(scope.row.id)">
              <template #reference>
                <ElButton v-if="hasAction($route.name, 'remove')" title=" remove" type="danger" link>
                  <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16" />{{
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
  <ElDialog v-model="visible" :title="$t('page.templates')" align-center :show-close="false">
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
            <ElInput v-model="form.description" type="textarea" :rows="6"
              :placeholder="$t('placeholder.inputText', { field: $t('label.description') })" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.variables')" prop="variables">
            <ElInput v-model="form.variables" type="textarea" :rows="6"
              :placeholder="$t('placeholder.inputText', { field: $t('label.variables') })" />
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
    <div style="text-align: center">

    </div>
  </ElDialog>

  <!-- preview -->
  <ElDialog v-model="previewVisible" :title="$t('action.preview')" align-center>
    <ElScrollbar max-height="600px">
      <div>xxxx</div>
    </ElScrollbar>
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" align-center width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`templates/templates.xlsx`" :download="$t('page.templates') + '.xlsx'">
        {{ $t('page.templates') }}.xlsx
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