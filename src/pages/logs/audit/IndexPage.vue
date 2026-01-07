<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { TableInstance } from 'element-plus'
import { fetchAuditLog, removeAuditLog, retrieveAuditLogs } from 'src/api/audit-logs'
import { actions } from 'src/constants'
import type { AuditLog, Pagination } from 'src/types'
import { exportToCSV, formatDuration, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'


const loading = ref<boolean>(false)
const datas = ref<Array<AuditLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const filters = ref({
  resource: null,
  action: null
})

const detailLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const initialValues: AuditLog = {
  id: null,
  resource: '',
  action: '',
  ip: ''
}
const row = ref<AuditLog>({ ...initialValues })

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
    const res = await retrieveAuditLogs(pagination, filters.value)
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
    const res = await fetchAuditLog(id)
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
    resource: null,
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
    exportToCSV(selectedRows, 'audit-logs')
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
    await removeAuditLog(id)
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
        <ElFormItem :label="$t('label.resource')" prop="resource">
          <ElInput v-model="filters.resource"
            :placeholder="$t('placeholder.inputText', { field: $t('label.resource') })" />
        </ElFormItem>
        <ElFormItem :label="$t('label.action')" prop="action">
          <ElInput v-model="filters.action" :placeholder="$t('placeholder.inputText', { field: $t('label.action') })" />
        </ElFormItem>
        <ElFormItem>
          <ElButton title="search" type="primary" @click="load">
            <Icon icon="material-symbols:search-rounded" width="1.25em" height="1.25em" />{{ $t('action.search') }}
          </ElButton>
          <ElButton title="reset" @click="reset">
            <Icon icon="material-symbols:replay-rounded" width="1.25em" height="1.25em" />{{ $t('action.reset') }}
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never">
      <ElRow :gutter="20" justify="space-between" class="mb-4">
        <ElCol :span="16" class="text-left">
          <ElButton v-if="hasAction($route.name, 'export')" title="export" type="success" plain @click="exportRows"
            :loading="exportLoading">
            <Icon icon="material-symbols:file-export-outline-rounded" width="1.25em" height="1.25em" />{{
              $t('action.export') }}
          </ElButton>
        </ElCol>

        <ElCol :span="8" class="text-right">
          <ElTooltip class="box-item" effect="dark" :content="$t('action.refresh')" placement="top">
            <ElButton title="refresh" plain circle @click="load">
              <Icon icon="material-symbols:refresh-rounded" width="1.25em" height="1.25em" />
            </ElButton>
          </ElTooltip>
        </ElCol>
      </ElRow>

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
        <ElTableColumn type="index" :label="$t('label.no')" width="55" />
        <ElTableColumn prop="resource" :label="$t('label.resource')" sortable>
          <template #default="scope">
            <ElButton title="resource" type="primary" link @click="showRow(scope.row.id)">
              {{ scope.row.resource }}
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="action" :label="$t('label.action')" sortable>
          <template #default="scope">
            <ElBadge is-dot :type="actions[scope.row.action]" class="mr-1" />
            <ElText :type="actions[scope.row.action]">{{ $t(`action.${scope.row.action}`) }}</ElText>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="targetId" :label="$t('label.targetId')" />
        <ElTableColumn show-overflow-tooltip prop="oldValue" :label="$t('label.oldValue')" />
        <ElTableColumn show-overflow-tooltip prop="newValue" :label="$t('label.newValue')" />
        <ElTableColumn prop="ip" :label="$t('label.ip')" sortable />
        <ElTableColumn prop="statusCode" :label="$t('label.statusCode')" sortable>
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
        <ElTableColumn prop="duration" :label="$t('label.duration')" sortable>
          <template #default="scope">
            {{ formatDuration(scope.row.duration) }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('label.actions')">
          <template #default="scope">
            <ElPopconfirm :title="$t('message.removeConfirm')" :width="240" @confirm="confirmEvent(scope.row.id)">
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
      <ElPagination layout="->, total, prev, pager, next, sizes" @change="pageChange" :total="total" />
    </ElCard>
  </ElSpace>

  <!-- detail -->
  <ElDialog v-model="visible" :title="$t('action.details')" align-center width="600">
    <ElDescriptions v-loading="detailLoading" border>
      <ElDescriptionsItem :label="$t('label.resource')">{{ row.resource }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.action')">
        <ElBadge is-dot :type="actions[row.action]" class="mr-1" />
        <ElText :type="actions[row.action]">{{ $t(`action.${row.action}`) }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.statusCode')">
        <ElTag v-if="row.statusCode && (row.statusCode >= 200 && row.statusCode < 300)" type="success" round>
          {{ row.statusCode }}
        </ElTag>
        <ElTag v-else-if="row.statusCode && row.statusCode >= 500" type="warning" round>
          {{ row.statusCode }}
        </ElTag>
        <ElTag v-else type="danger" round>{{ row.statusCode }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.targetId')" :span="3">{{ row.targetId }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.oldValue')" :span="3">{{ row.oldValue }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.newValue')" :span="3">{{ row.newValue }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.ip')" :span="2">{{ row.ip }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.duration')">
        {{ row.duration ? formatDuration(row.duration) : '' }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>
