<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance, FormRules, TableInstance, TreeData, TreeInstance,
  TreeNodeData, UploadInstance, UploadRequestOptions
} from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createRegion, enableRegion, fetchRegion, importRegions,
  modifyRegion, removeRegion,
  retrieveRegions, retrieveRegionSubset
} from 'src/api/regions'
import { actionIcons, actionTypes } from 'src/constants'
import type { Filter, Pagination, Region } from 'src/types'
import { exportToCSV, hasAction } from 'src/utils'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const treeRef = ref<TreeInstance>()
const treeLoading = ref<boolean>(false)
const treeSelected = ref<string>('')
const filterText = ref('')

const loading = ref<boolean>(false)
const datas = ref<Array<Region>>([])
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

const filter = reactive<Filter<Region>>({
  superiorId: { op: 'eq', value: null },
  name: { op: 'like', value: undefined }
})

const formRef = ref<FormInstance>()
const initialValues: Region = {
  id: null,
  name: '',
  superiorId: null
}
const form = ref<Region>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, message: t('placeholder.inputText', { field: t('label.name') }), trigger: 'blur' }
  ]
})

onMounted(async () => {
  await load()
})

/**
 * 监听tree
 */
watch(
  () => filterText.value,
  (val) => {
    treeRef.value!.filter(val)
  }
)

/**
 * tree过滤
 */
const filterNode = (value: string, data: { [key: string]: string }) => {
  if (!value) return true
  return data.name?.includes(value) ?? false
}

/**
 * node 变化
 * @param data node节点
 */
async function onCurrentChange(data: TreeNodeData) {
  if (treeSelected.value === String(data.id)) {
    return
  }
  treeSelected.value = String(data.id)
  filter.superiorId!.value = treeSelected.value ? Number(treeSelected.value) : null
  pagination.page = 1
  await load()
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
 * 加载tree
 */
async function loadTree({ data }: { data: TreeNodeData }, resolve: (data: TreeData) => void) {
  treeLoading.value = true

  const superiorId = data.id ? Number(data.id) : null
  const res = await retrieveRegionSubset(superiorId)
  const treeData = res.data.map((element: Region) => ({
    ...element,
    isLeaf: !(element.count && element.count > 0)
  }))
  resolve(treeData)

  treeLoading.value = false
}

/**
 * 加载列表
 */
async function load() {
  loading.value = true

  try {
    const res = await retrieveRegions(pagination, filter)
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
 * 刷新子节点
 * @param rowKey row key
 */
const refreshChildren = async (rowKey: number) => {
  const res = await retrieveRegionSubset(rowKey)
  const treeData = res.data.map((element: Region) => ({
    ...element,
    isLeaf: !(element.count && element.count > 0)
  }))

  treeRef.value?.updateKeyChildren(String(rowKey), treeData)
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
    const res = await fetchRegion(id)
    form.value = res.data
  } catch (error) {
    form.value = { ...initialValues }
    throw error
  }
}

/**
 * 启用、停用
 * @param id 主键
 */
async function enableChange(id: number) {
  await enableRegion(id)
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
    try {
      if (form.value.id) {
        await modifyRegion(form.value.id, form.value)
      } else {
        form.value.superiorId = treeSelected.value ? Number(treeSelected.value) : null
        await createRegion(form.value)
      }
      visible.value = false

      ElMessage.success(t('message.success', { action: form.value.id ? t('action.modify') : t('action.create') }))
      await load()

      if (form.value.superiorId) {
        await refreshChildren(form.value.superiorId)
      }
    } catch (error) {
      ElMessage.error(t('message.error', { action: form.value.id ? t('action.modify') : t('action.create') }))
      throw error
    } finally {
      saveLoading.value = false
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
    exportToCSV(selectedRows, 'regions')
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
  return importRegions(options.file)
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
      await removeRegion(id)
      await Promise.all([load(), refreshChildren(id)])

      ElMessage.success(t('message.success', { action: t('action.remove') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.remove') }))
      throw error
    }
  })
}
</script>

<template>
  <ElRow :gutter="16">
    <ElCol :span="6" :xl="4">
      <ElCard>
        <ElFormItem prop="filterText">
          <ElInput v-model="filterText" :placeholder="$t('action.search')" clearable>
            <template #prefix>
              <Icon :icon="`material-symbols:${actionIcons['search']}-rounded`" width="1.25em" height="1.25em" />
            </template>
          </ElInput>
        </ElFormItem>

        <ElTree ref="treeRef" :load="loadTree" lazy v-loading="treeLoading" node-key="id"
          :current-node-key="treeSelected" highlight-current :props="{ label: 'name', isLeaf: 'isLeaf' }"
          :filter-node-method="filterNode" @current-change="onCurrentChange">
        </ElTree>
      </ElCard>
    </ElCol>

    <ElCol :span="18" :xl="20">
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
          <ElTableColumn prop="name" :label="$t('label.name')" />
          <ElTableColumn prop="areaCode" :label="$t('label.areaCode')" sortable />
          <ElTableColumn prop="postalCode" :label="$t('label.postalCode')" sortable />
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
                  $t('action.modify') }}
              </ElButton>
              <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
                @click="removeRow(scope.row.id)">
                <Icon :icon="`material-symbols:${actionIcons['remove']}-rounded`" width="1.25em" height="1.25em" />
                {{
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
    </ElCol>
  </ElRow>

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
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.areaCode')" prop="areaCode">
            <ElInput v-model="form.areaCode"
              :placeholder="$t('placeholder.inputText', { field: $t('label.areaCode') })" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.postalCode')" prop="postalCode">
            <ElInput v-model="form.postalCode"
              :placeholder="$t('placeholder.inputText', { field: $t('label.postalCode') })" />
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
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef!)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>

  <!-- import -->
  <ElDialog v-model="importVisible" :title="$t('action.import')" :show-close="false" width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`templates/regions.xlsx`" :download="$t('page.regions') + '.xlsx'">
        {{ $t('page.regions') }}.xlsx
      </a>
    </p>
    <ElUpload ref="importRef" :limit="1" drag :auto-upload="false" :http-request="onUpload" :on-success="() => load()"
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