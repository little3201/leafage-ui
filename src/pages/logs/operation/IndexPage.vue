<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import type { TableInstance } from 'element-plus'
import { retrieveOperationLogs, fetchOperationLog, removeOperationLog, clearOperationLogs } from 'src/api/operation-logs'
import type { Pagination, OperationLog } from 'src/types'
import { Icon } from '@iconify/vue'
import { formatDuration, hasAction, exportToCSV } from 'src/utils'


const loading = ref<boolean>(false)
const datas = ref<Array<OperationLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const filters = ref({
  operation: null,
  statusCode: null
})

const detailLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const initialValues: OperationLog = {
  id: undefined,
  operation: '',
  content: '',
  ip: '',
  location: ''
}
const row = ref<OperationLog>({ ...initialValues })

const visible = ref<boolean>(false)
/**
 * 分页变化
 * @param value 当前页码
 */
function pageChange(currentPage: number, pageSize: number) {
  pagination.page = currentPage
  pagination.size = pageSize
  load()
}

/**
 * 加载列表
 */
async function load() {
  retrieveOperationLogs(pagination, filters.value).then(res => {
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  }).finally(() => { loading.value = false })
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  detailLoading.value = true
  fetchOperationLog(id).then(res => {
    row.value = res.data
  }).finally(() => { detailLoading.value = false })
}

/**
 * reset
 */
function reset() {
  filters.value = {
    operation: null,
    statusCode: null
  }
  load()
}

onMounted(() => {
  load()
})

/**
 * 导出
 */
async function exportRows() {
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
function showRow(id: number) {
  row.value = { ...initialValues }
  loadOne(id)
  visible.value = true
}

/**
 * 删除
 * @param id 主键
 */
function removeRow(id: number) {
  removeOperationLog(id).then(() => load())
}

/**
 * 清空
 */
function clearRows() {
  clearOperationLogs().then(() => load())
}

/**
 * 确认
 * @param id 主键
 */
function confirmEvent(id: number) {
  if (id) {
    removeRow(id)
  }
}


</script>

<template>
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filters">
        <ElFormItem :label="$t('operation')" prop="operation">
          <ElInput v-model="filters.operation" :placeholder="$t('inputText', { field: $t('operation') })" />
        </ElFormItem>
        <ElFormItem :label="$t('statusCode')" prop="statusCode">
          <ElInput v-model="filters.statusCode" :placeholder="$t('inputText', { field: $t('statusCode') })" />
        </ElFormItem>
        <ElFormItem>
          <ElButton title="search" type="primary" @click="load">
            <Icon icon="material-symbols:search-rounded" width="18" height="18" />{{ $t('search') }}
          </ElButton>
          <ElButton title="reset" @click="reset">
            <Icon icon="material-symbols:replay-rounded" width="18" height="18" />{{ $t('reset') }}
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never">
      <ElRow :gutter="20" justify="space-between" class="mb-4">
        <ElCol :span="16" class="text-left">
          <ElButton v-if="hasAction($route.name, 'clear')" title="clear" type="danger" plain @click="clearRows">
            <Icon icon="material-symbols:clear-all-rounded" width="18" height="18" />{{ $t('clear') }}
          </ElButton>
          <ElButton v-if="hasAction($route.name, 'export')" title="export" type="success" plain @click="exportRows"
            :loading="exportLoading">
            <Icon icon="material-symbols:file-export-outline-rounded" width="18" height="18" />{{ $t('export') }}
          </ElButton>
        </ElCol>

        <ElCol :span="8" class="text-right">
          <ElTooltip class="box-item" effect="dark" :content="$t('refresh')" placement="top">
            <ElButton title="view" plain circle @click="load">
              <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
            </ElButton>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
        <ElTableColumn type="selection" />
        <ElTableColumn type="index" :label="$t('no')" width="55" />
        <ElTableColumn prop="operation" :label="$t('operation')" sortable>
          <template #default="scope">
            <ElButton title="details" type="primary" link @click="showRow(scope.row.id)">
              {{ scope.row.operation }}
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip prop="os" :label="$t('os')" sortable />
        <ElTableColumn show-overflow-tooltip prop="browser" :label="$t('browser')" sortable />
        <ElTableColumn show-overflow-tooltip prop="ip" :label="$t('ip')" sortable />
        <ElTableColumn show-overflow-tooltip prop="location" :label="$t('location')" sortable />
        <ElTableColumn prop="statusCode" :label="$t('statusCode')" sortable>
          <template #default="scope">
            <ElTag v-if="scope.row.statusCode >= 200 && scope.row.statusCode < 300" type="success" round>
              {{ scope.row.statusCode }}
            </ElTag>
            <ElTag v-else-if="scope.row.statusCode >= 500" type="warning" round>
              {{ scope.row.statusCode }}
            </ElTag>
            <ElTag v-else type="danger" round>{{ scope.row.statusCode }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="operatedTimes" :label="$t('operatedTimes')" sortable>
          <template #default="scope">
            {{ formatDuration(scope.row.operatedTimes) }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('actions')">
          <template #default="scope">
            <ElPopconfirm :title="$t('removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
              <template #reference>
                <ElButton v-if="hasAction($route.name, 'remove')" title="remove" size="small" type="danger" link>
                  <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16" />{{ $t('remove') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination layout="slot, ->, total, prev, pager, next, sizes" @change="pageChange" :total="total">
        <template #default>
          {{ $t('selectedTotal', { total: tableRef?.getSelectionRows().length }) }}
        </template>
      </ElPagination>
    </ElCard>
  </ElSpace>

  <ElDialog v-model="visible" align-center show-close :title="$t('details')">
    <ElDescriptions v-loading="detailLoading" border>
      <ElDescriptionsItem :label="$t('operation')">{{ row.operation }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('ip')">{{ row.ip }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('location')">{{ row.location }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('os')">{{ row.os }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('userAgent')" :span="2">{{ row.userAgent }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('browser')">{{ row.browser }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('referer')" :span="2">{{ row.referer }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('sessionId')">{{ row.sessionId }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('operatedTimes')">
        {{ row.operatedTimes ? formatDuration(row.operatedTimes) : '' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('statusCode')">
        <ElTag v-if="row.statusCode && (row.statusCode >= 200 && row.statusCode < 300)" type="success" round>
          {{ row.statusCode }}
        </ElTag>
        <ElTag v-else-if="row.statusCode && row.statusCode >= 500" type="warning" round>
          {{ row.statusCode }}
        </ElTag>
        <ElTag v-else type="danger" round>{{ row.statusCode }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('content')" :span="3">{{ row.content }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>
