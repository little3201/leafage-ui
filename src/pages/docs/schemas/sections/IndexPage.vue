<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
  FormInstance, FormRules, TableInstance, TreeData, TreeInstance,
  TreeNodeData
} from 'element-plus'
import { createSchemaSection, fetchSchemaSection, modifySchemaSection, removeSchemaSection, retrieveSchemaSections, retrieveSchemaSectionSubset } from 'src/api/schemas'
import type { Filters, Pagination, SchemaSection } from 'src/types'
import { hasAction } from 'src/utils'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
const props = defineProps<{
  schemaId: number
}>()
const loading = ref<boolean>(false)
const datas = ref<Array<SchemaSection>>([])
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

const filter = reactive<Filters<SchemaSection>>({
  superiorId: { op: 'eq', value: null },
  title: { op: 'eq', value: undefined }
})

const formRef = ref<FormInstance>()
const initialValues: SchemaSection = {
  id: null,
  schemaId: props.schemaId,
  title: '',
  superiorId: null,
  body: ''
}
const form = ref<SchemaSection>({ ...initialValues })

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
  [() => filterText.value, () => props.schemaId],
  async ([newFilterText, newSchemaId], [oldFilterText, oldSchemaId]) => {
    if (newFilterText !== oldFilterText) {
      treeRef.value!.filter(newFilterText)
    }

    if (newSchemaId !== oldSchemaId) {
      await loadTree({ data: { id: null } as TreeNodeData }, () => { })
    }
  },
  { immediate: false }
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
async function loadTree({ data }: { data: TreeNodeData }, resolve: (data: TreeData) => void) {
  treeLoading.value = true
  try {
    const superiorId = data.id ? Number(data.id) : null
    const res = await retrieveSchemaSectionSubset(props.schemaId, superiorId)
    const treeData = res.data.map((element: SchemaSection) => ({
      ...element,
      isLeaf: !(element.count && element.count > 0)
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
    const res = await retrieveSchemaSections(props.schemaId, pagination, filter)
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
async function refreshChildren(rowKey: number) {
  try {
    const res = await retrieveSchemaSectionSubset(props.schemaId, rowKey)
    const treeData = res.data.map((element: SchemaSection) => ({
      ...element,
      isLeaf: !(element.count && element.count > 0)
    }))

    treeRef.value?.updateKeyChildren(String(rowKey), treeData)
  } catch (error) {
    return error
  }
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
    const res = await fetchSchemaSection(props.schemaId, id)
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
        await modifySchemaSection(props.schemaId, form.value)
      } else {
        form.value.superiorId = Number(treeSelected.value)
        await createSchemaSection(props.schemaId, form.value)
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
    await removeSchemaSection(props.schemaId, id)
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
</script>

<template>
  <ElRow :gutter="16">
    <ElCol :span="8" :xl="6">
      <ElCard shadow="never">
        <ElFormItem prop="filterText">
          <ElInput v-model="filterText" :placeholder="$t('action.search')" clearable>
            <template #prefix>
              <Icon icon="material-symbols:search-rounded" width="1.25em" height="1.25em" />
            </template>
          </ElInput>
        </ElFormItem>

        <ElTree ref="treeRef" :load="loadTree" lazy v-loading="treeLoading" node-key="id"
          :current-node-key="treeSelected" highlight-current :props="{ label: 'title', isLeaf: 'isLeaf' }"
          :filter-node-method="filterNode" @current-change="onCurrentChange">
        </ElTree>
      </ElCard>
    </ElCol>

    <ElCol :span="16" :xl="18">
      <ElCard shadow="never">
        <ElRow :gutter="20" justify="space-between" class="mb-4">
          <ElCol :span="16" class="text-left">
            <ElButton v-if="hasAction($route.name, 'create')" title=" create" type="primary" @click="saveRow()">
              <Icon icon="material-symbols:add-rounded" width="1.25em" height="1.25em" />{{ $t('action.create') }}
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
          <ElTableColumn show-overflow-tooltip prop="body" :label="$t('label.body')" />
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
            <ElInput v-model="form.body" type="textarea" :rows="6"
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
</template>