<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance, FormRules, TableInstance, TreeData, TreeInstance, TreeNode,
  TreeNodeData, UploadInstance, UploadRequestOptions
} from 'element-plus'
import {
  createSection,
  fetchSection, importSections,
  modifySection,
  removeSection,
  retrieveSections,
  retrieveSectionSubset
} from 'src/api/sections'
import type { Filters, Pagination, Section } from 'src/types'
import { exportToCSV, hasAction } from 'src/utils'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const loading = ref<boolean>(false)
const datas = ref<Array<Section>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const treeRef = ref<TreeInstance>()
const treeLoading = ref<boolean>(false)
const treeSelected = ref<string>('')
const filterText = ref('')

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const importVisible = ref<boolean>(false)
const importLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const importRef = ref<UploadInstance>()

const filter = reactive<Filters<Section>>({
  superiorId: { op: 'eq', value: Number(treeSelected.value) },
  title: { op: 'eq', value: undefined }
})

const formRef = ref<FormInstance>()
const initialValues: Section = {
  id: null,
  title: '',
  superiorId: null,
  type: 'HEADING',
  body: ''
}
const form = ref<Section>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  title: [
    { required: true, message: t('placeholder.inputText', { field: t('label.title') }), trigger: 'blur' }
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
  filter.superiorId!.value = Number(treeSelected.value)
  pagination.page = 1
  await load()
}

/**
 * 加载tree
 */

/**
 * 加载tree
 */
async function loadTree(node: TreeNode, resolve: (data: TreeData) => void) {
  treeLoading.value = true

  try {
    filter.superiorId!.value = treeSelected.value.length > 0 ? Number(treeSelected.value) : null
    const res = await retrieveSections({ page: 1, size: 34, sortBy: 'id', descending: false }, filter)
    const treeData = res.data.content.map((item: Section) => ({
      id: item.id!,
      name: item.title,
      isLeaf: (item.count ?? 0) === 0
    }))
    resolve(treeData)
  } catch (error) {
    return error
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
  try {
    const res = await retrieveSections(pagination, filter)
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch (error) {
    return error
  } finally { loading.value = false }
}

/**
 * 刷新子节点
 * @param rowKey row key
 */
const refreshChildren = async (rowKey: number) => {
  try {
    const res = await retrieveSectionSubset(rowKey)
    const list = res.data
    // 处理子节点
    list.forEach((element: Section) => {
      if (element.count && element.count > 0) {
        element.hasChildren = true
      }
    })

    treeRef.value?.updateKeyChildren(String(rowKey), list)
  } catch (error) {
    return error
  }
}

/**
 * reset
 */
async function reset() {
  filter.title!.value = undefined
  await load()
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
    const res = await fetchSection(id)
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
        await modifySection(form.value.id, form.value)
      } else {
        form.value.superiorId = Number(treeSelected.value)
        await createSection(form.value)
      }
      visible.value = false
      await load()

      if (form.value.superiorId) {
        await refreshChildren(form.value.superiorId)
      }
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
    await removeSection(id)
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
  return importSections(options.file)
}

</script>

<template>
  <ElRow :gutter="20">
    <ElCol :span="6" :xl="4">
      <ElCard shadow="never">
        <ElFormItem prop="filterText">
          <ElInput v-model="filterText" :placeholder="$t('action.search')" clearable>
            <template #prefix>
              <Icon icon="material-symbols:search-rounded" width="1.25em" height="1.25em" />
            </template>
          </ElInput>
        </ElFormItem>

        <ElTree ref="treeRef" :load="loadTree" lazy v-loading="treeLoading" node-key="id"
          :current-node-key="treeSelected" highlight-current :props="{ label: 'name' }" :filter-node-method="filterNode"
          @current-change="onCurrentChange">
        </ElTree>
      </ElCard>
    </ElCol>

    <ElCol :span="18" :xl="20">
      <ElSpace size="large" fill>
        <ElCard shadow="never">
          <ElForm inline :model="filter" @submit.prevent>
            <ElFormItem :label="$t('label.title')" prop="title">
              <ElInput v-model="filter.title!.value"
                :placeholder="$t('placeholder.inputText', { field: $t('label.title') })" />
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
              <ElButton v-if="hasAction($route.name, 'import')" title=" import" type="warning" plain
                @click="importRows">
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
            <ElTableColumn prop="title" :label="$t('label.title')" sortable />
            <ElTableColumn prop="body" :label="$t('label.body')" />
            <ElTableColumn :label="$t('label.actions')">
              <template #default="scope">
                <ElButton v-if="hasAction($route.name, 'modify')" title=" modify" type="primary" link
                  @click="saveRow(scope.row.id)">
                  <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('action.modify') }}
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
    </ElCol>
  </ElRow>

  <!-- form -->
  <ElDialog v-model="visible" :title="$t('page.sections')" align-center :show-close="false" width="400">
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
          <ElFormItem :label="$t('label.body')" prop="body">
            <ElInput v-model="form.body" type="textarea"
              :placeholder="$t('placeholder.inputText', { field: $t('label.body') })" />
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
  <ElDialog v-model="importVisible" :title="$t('action.import')" align-center width="480">
    <p>{{ $t('action.download') }}：
      <a :href="`templates/sections.xlsx`" :download="$t('page.sections') + '.xlsx'">
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