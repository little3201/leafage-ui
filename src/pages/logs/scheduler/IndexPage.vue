<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { dayjs } from 'element-plus'
import type { TableInstance } from 'element-plus'
import { retrieveSchedulerLogs, fetchSchedulerLog, removeSchedulerLog, clearSchedulerLogs } from 'src/api/scheduler-logs'
import type { Pagination, SchedulerLog } from 'src/types'
import { Icon } from '@iconify/vue'
import { formatDuration, hasAction, exportToCSV } from 'src/utils'
import { shceduleStatus, shceduleStatusIcon } from 'src/constants'


const loading = ref<boolean>(false)
const datas = ref<Array<SchedulerLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const filters = ref({
  name: null,
  method: null
})

const detailLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const initialValues: SchedulerLog = {
  id: undefined,
  name: ''
}
const row = ref<SchedulerLog>({ ...initialValues })

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
    const res = await retrieveSchedulerLogs(pagination, filters.value)
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
    const res = await fetchSchedulerLog(id)
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
    name: null,
    method: null
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
    exportToCSV(selectedRows, 'scheduler-logs')
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
    await removeSchedulerLog(id)
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
    await clearSchedulerLogs()
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
            <ElButton title="refresh" plain circle @click="load">
              <Icon icon="material-symbols:refresh-rounded" width="18" height="18" />
            </ElButton>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
        <ElTableColumn type="selection" />
        <ElTableColumn type="index" :label="$t('label.no')" width="55" />
        <ElTableColumn prop="name" :label="$t('label.name')" sortable>
          <template #default="scope">
            <ElButton title="name" type="primary" link @click="showRow(scope.row.id)">
              {{ scope.row.name }}
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="startTime" :label="$t('label.startTime')" sortable>
          <template #default="scope">
            {{ dayjs(scope.row.startTime).format('YYYY-MM-DD HH:mm') }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" :label="$t('label.status')" sortable>
          <template #default="scope">
            <ElTag :type="shceduleStatus[scope.row.status]" round>
              <Icon :icon="`material-symbols:${shceduleStatusIcon[scope.row.status]}`"
                :class="[scope.row.status === 'RUNNING' ? 'spin' : '', 'mr-1']" width="16" height="16" />
              {{ scope.row.status }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="duration" :label="$t('label.duration')" sortable>
          <template #default="scope">
            {{ scope.row.duration ? formatDuration(scope.row.duration) : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="nextExecuteTime" :label="$t('label.nextExecuteTime')" sortable>
          <template #default="scope">
            {{ dayjs(scope.row.nextExecuteTime).format('YYYY-MM-DD HH:mm') }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('label.actions')">
          <template #default="scope">
            <ElPopconfirm v-if="scope.row.status != 'RUNNING' && scope.row.status != 'PENDING'"
              :title="$t('message.removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
              <template #reference>
                <ElButton v-if="hasAction($route.name, 'remove')" title="remove" type="danger" link>
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

  <ElDialog v-model="visible" :title="$t('action.details')" align-center show-close width="600">
    <ElDescriptions v-loading="detailLoading" border>
      <ElDescriptionsItem :label="$t('label.name')">{{ row.name }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.startTime')">
        {{ dayjs(row.startTime).format('YYYY-MM-DD HH:mm') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.status')">
        <ElTag :type="shceduleStatus[row.status || '']" round>
          <Icon :icon="`material-symbols:${shceduleStatusIcon[row.status || '']}`"
            :class="[row.status === 'RUNNING' ? 'spin' : '', 'mr-1']" width="16" height="16" />
          {{ row.status }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.duration')">
        {{ row.duration ? formatDuration(row.duration) : '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.nextExecuteTime')" :span="2">
        {{ dayjs(row.nextExecuteTime).format('YYYY-MM-DD HH:mm') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.record')" :span="3">
        {{ row.record }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>

<style lang="scss">
.el-tag__content {
  display: inline-flex;
  align-items: center;
}
</style>
