<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { TableInstance } from 'element-plus'
import { dayjs, ElMessage, ElMessageBox } from 'element-plus'
import { clearOperationLogs, fetchOperationLog, removeOperationLog, retrieveOperationLogs } from 'src/api/logs/operation-logs'
import { actionIcons, actionTypes } from 'src/constants'
import type { Filter, OperationLog, Pagination } from 'src/types'
import { exportToCSV, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const loading = ref<boolean>(false)
const datas = ref<Array<OperationLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const filter = reactive<Filter<OperationLog>>({
  module: { op: 'eq', value: undefined }
})

const detailLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const initialValues: OperationLog = {
  id: null,
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

  const res = await retrieveOperationLogs(pagination, filter)
  datas.value = res.data.content
  total.value = res.data.page.totalElements

  loading.value = false
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  detailLoading.value = true

  const res = await fetchOperationLog(id)
  row.value = res.data

  detailLoading.value = false
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
      await removeOperationLog(id)
      await load()
      ElMessage.success(t('message.success', { action: t('action.remove') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.remove') }))
      throw error
    }
  })
}

/**
 * 清空
 */
async function clearRows() {
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
      await clearOperationLogs()
      await load()
      ElMessage.success(t('message.success', { action: t('action.clear') }))
    } catch (error) {
      ElMessage.error(t('message.error', { action: t('action.clear') }))
      throw error
    }
  })
}
</script>

<template>
  <ElCard>
    <ElRow :gutter="20" justify="space-between" class="mb-4">
      <ElCol :span="12">
        <ElInput v-model="filter.module!.value" clearable style="width: 240px" class="mr-4"
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
        <ElButton v-if="hasAction($route.name, 'clear')" title="clear" type="danger" plain @click="clearRows">
          <Icon icon="material-symbols:clear-all-rounded" width="1.25em" height="1.25em" />{{ $t('action.clear') }}
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
      <ElTableColumn prop="module" :label="$t('label.module')" sortable>
        <template #default="scope">
          <ElButton title="module" type="primary" link @click="showRow(scope.row.id)">
            {{ scope.row.module }}
          </ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="action" :label="$t('label.actions')" sortable>
        <template #default="scope">
          <ElBadge is-dot :type="actionTypes[scope.row.action]" class="mr-1" />
          <ElText :type="actionTypes[scope.row.action]">{{ $t(`action.${scope.row.action}`) }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn show-overflow-tooltip prop="params" :label="$t('label.params')" />
      <ElTableColumn show-overflow-tooltip prop="body" :label="$t('label.request.body')" />
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
      <ElTableColumn prop="operator" :label="$t('label.operator')" sortable />
      <ElTableColumn prop="operatedAt" :label="$t('label.operatedAt')" sortable>
        <template #default="scope">
          {{ scope.row.operatedAt ? dayjs(scope.row.operatedAt).format('YYYY-MM-DD HH:mm') : '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('label.actions')">
        <template #default="scope">
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

  <!-- detail -->
  <ElDialog v-model="visible" :title="$t('action.details')" width="600">
    <ElDescriptions v-loading="detailLoading" border>
      <ElDescriptionsItem :label="$t('label.module')">{{ $t(`page.${row.module}`) }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.actions')">
        <ElBadge is-dot :type="actionTypes[row.action]" class="mr-1" />
        <ElText :type="actionTypes[row.action]">{{ $t(`action.${row.action}`) }}</ElText>
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
      <ElDescriptionsItem :label="$t('label.params')" :span="3">{{ row.params }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.request.body')" :span="3">{{ row.body }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.ip')">{{ row.ip }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.sessionId')" :span="2">{{ row.sessionId }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.userAgent')" :span="3">{{ row.userAgent }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.operator')" :span="3">{{ row.operator }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.operatedAt')" :span="3">
        {{ row.operatedAt ? dayjs(row.operatedAt).format('YYYY-MM-DD HH:mm') : '-' }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>