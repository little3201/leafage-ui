<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import type { TableInstance } from 'element-plus'
import { dayjs } from 'element-plus'
import { retrieveOperationLogs, fetchOperationLog, removeOperationLog, clearOperationLogs } from 'src/api/operation-logs'
import type { Pagination, OperationLog } from 'src/types'
import { Icon } from '@iconify/vue'
import { hasAction, exportToCSV } from 'src/utils'


const loading = ref<boolean>(false)
const datas = ref<Array<OperationLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const filters = ref({
  module: null,
  action: null
})

const detailLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const initialValues: OperationLog = {
  id: undefined,
  module: '',
  action: '',
  params: ''
}
const row = ref<OperationLog>({ ...initialValues })

const visible = ref<boolean>(false)

onMounted(async () => {
  await load()
})

/**
 * 分页变化
 * @param value 当前页码
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
    const res = await retrieveOperationLogs(pagination, filters.value)
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch {
    return Promise.resolve()
  } finally {
    loading.value = false
  }
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  detailLoading.value = true
  try {
    const res = await fetchOperationLog(id)
    row.value = res.data
  } catch {
    return Promise.resolve()
  } finally {
    detailLoading.value = false
  }
}

/**
 * reset
 */
async function reset() {
  filters.value = {
    module: null,
    action: null
  }
  await load()
}

/**
 * 导出
 */
function exportRows() {
  exportLoading.value = true

  const selectedRows = tableRef.value?.getSelectionRows()
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, 'operation-logs')
  }
  exportLoading.value = false
}

/**
 * 详情
 * @param id 主键
 */
async function showRow(id: number) {
  row.value = { ...initialValues }
  await loadOne(id)
  visible.value = true
}

/**
 * 删除
 * @param id 主键
 */
async function removeRow(id: number) {
  try {
    await removeOperationLog(id)
    await load()
  } catch {
    return Promise.resolve()
  }
}

/**
 * 清空
 */
async function clearRows() {
  try {
    await clearOperationLogs()
    await load()
  } catch {
    return Promise.resolve()
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
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filters">
        <ElFormItem :label="$t('module')" prop="module">
          <ElInput v-model="filters.module" :placeholder="$t('placeholder.inputText', { field: $t('module') })" />
        </ElFormItem>
        <ElFormItem :label="$t('label.actions')" prop="action">
          <ElInput v-model="filters.action"
            :placeholder="$t('placeholder.inputText', { field: $t('label.actions') })" />
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
          <ElButton v-if="hasAction($route.name, 'clear')" title="clear" type="danger" plain @click="clearRows">
            <Icon icon="material-symbols:clear-all-rounded" width="18" height="18" />{{ $t('action.clear') }}
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
        <ElTableColumn type="index" :label="$t('label.no')" width="55" />
        <ElTableColumn prop="module" :label="$t('label.module')" sortable>
          <template #default="scope">
            <ElButton title="details" type="primary" link @click="showRow(scope.row.id)">
              {{ $t(scope.row.module) }}
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="action" :label="$t('label.actions')" sortable>
          <template #default="scope">
            {{ $t(scope.row.action) }}
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip prop="params" :label="$t('label.params')" />
        <ElTableColumn show-overflow-tooltip prop="body" :label="$t('label.body')" />
        <ElTableColumn prop="ip" :label="$t('label.ip')" sortable />
        <ElTableColumn show-overflow-tooltip prop="sessionId" :label="$t('label.sessionId')" />
        <ElTableColumn prop="operator" :label="$t('label.operator')" sortable />
        <ElTableColumn prop="operatedAt" :label="$t('label.operatedAt')" sortable>
          <template #default="scope">
            {{ dayjs(scope.row.operatedAt).format('YYYY-MM-DD HH:mm') }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('label.actions')">
          <template #default="scope">
            <ElPopconfirm :title="$t('message.removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
              <template #reference>
                <ElButton v-if="hasAction($route.name, 'remove')" title="remove" size="small" type="danger" link>
                  <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16" />{{ $t('action.remove')
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

  <ElDialog v-model="visible" align-center show-close width="600">
    <ElDescriptions v-loading="detailLoading" border>
      <ElDescriptionsItem :label="$t('label.module')">{{ $t(row.module) }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.actions')">{{ $t(row.action) }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.ip')">{{ row.ip }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.params')" span="3">{{ row.params }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.body')" span="3">{{ row.body }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.sessionId')">{{ row.sessionId }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.userAgent')" :span="2">{{ row.userAgent }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>
