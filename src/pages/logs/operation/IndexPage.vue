<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { TableInstance } from 'element-plus'
import { dayjs, ElMessage, ElMessageBox } from 'element-plus'
import { clearOperationLogs, removeOperationLog, retrieveOperationLogs } from 'src/api/logs/operation-logs'
import { actionTypes } from 'src/constants'
import type { Filter, OperationLog, Pagination } from 'src/types'
import { actionIcon, exportToCSV, formatDuration, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()

const loading = ref<boolean>(false)
const datas = ref<Array<OperationLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10,
  descending: true
})

const filter = reactive<Filter<OperationLog>>({
  module: { op: 'eq', value: undefined }
})

const exportLoading = ref<boolean>(false)
const initialValues: OperationLog = {
  id: null,
  module: '',
  action: '',
  params: ''
}
const data = ref<OperationLog>({ ...initialValues })

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
 * 导出
 */
function exportRows() {
  exportLoading.value = true

  const selectedRows = tableRef.value?.getSelectionRows()
  if (selectedRows && selectedRows.length) {
    exportToCSV(selectedRows, 'operation-logs')
  } else {
    exportToCSV(datas.value, 'operation-logs')
  }
  exportLoading.value = false
}

/**
 * 详情
 * @param row 数据
 */
function showRow(row: OperationLog) {
  data.value = row ? { ...row } : { ...initialValues }

  visible.value = true
}

/**
 * 删除
 * @param id 主键
 * @param module 模块名称
 * @param action 操作
 */
async function removeRow(id: number, module: string, action: string) {
  // 弹出确认框
  await ElMessageBox.confirm(
    t('tips.removeWarning', { module: t('page.operationLogs'), data: module + ' - ' + action }),
    t('tips.confirm'),
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: false,
      confirmButtonType: 'danger',
      confirmButtonClass: 'w-full',
      confirmButtonText: t('tips.removeButtonText'),
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
    t('tips.clearWarning'),
    t('tips.confirm'),
    {
      dangerouslyUseHTMLString: true,
      showCancelButton: false,
      confirmButtonType: 'danger',
      confirmButtonClass: 'w-full',
      confirmButtonText: t('tips.clearButtonText'),
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
            <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />
          </template>
        </ElInput>
        <ElButton title="search" plain :type="actionTypes['search']" @click="load()">
          <Icon :icon="actionIcon('search')" width="1.25em" height="1.25em" />{{
            $t('action.search') }}
        </ElButton>
      </ElCol>

      <ElCol :span="12" class="text-right">
        <ElButton v-if="hasAction($route.name, 'clear')" title="clear" :type="actionTypes['clear']" plain
          @click="clearRows">
          <Icon :icon="actionIcon('clear')" width="1.25em" height="1.25em" />{{ $t('action.clear') }}
        </ElButton>
        <ElButton v-if="hasAction($route.name, 'export')" title="export" :type="actionTypes['export']" plain
          @click="exportRows" :loading="exportLoading">
          <Icon :icon="actionIcon('export')" width="1.25em" height="1.25em" />{{
            $t('action.export') }}
        </ElButton>
      </ElCol>
    </ElRow>

    <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" table-layout="auto">
      <ElTableColumn type="selection" />
      <ElTableColumn type="index" :label="$t('label.no')" width="55" />
      <ElTableColumn prop="module" :label="$t('label.module')" sortable>
        <template #default="scope">
          <ElButton title="module" type="primary" link @click="showRow(scope.row)">
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
      <ElTableColumn show-overflow-tooltip prop="targetId" :label="$t('label.targetId')" />
      <ElTableColumn prop="params" :label="$t('label.params')">
        <template #default="scope">
          <ElText class="w-56" truncated>{{ scope.row.params }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="response" :label="$t('label.response')">
        <template #default="scope">
          <ElText class="w-56" truncated>{{ scope.row.response }}</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="status" :label="$t('label.status')" sortable>
        <template #default="scope">
          <ElTag :type="scope.row.status == 'SUCCEED' ? 'success' : 'warning'" round>
            {{ scope.row.status }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="duration" :label="$t('label.duration')" sortable>
        <template #default="scope">
          {{ scope.row.duration ? formatDuration(scope.row.duration) : '-' }}
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
            @click="removeRow(scope.row.id, scope.row.module, scope.row.action)">
            <Icon :icon="actionIcon('remove')" width="1.25em" height="1.25em" />{{
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
    <ElDescriptions border>
      <ElDescriptionsItem :label="$t('label.module')">{{ $t(`page.${data.module}`) }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.actions')">
        <ElBadge is-dot :type="actionTypes[data.action]" class="mr-1" />
        <ElText :type="actionTypes[data.action]">{{ $t(`action.${data.action}`) }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.status')">
        <ElTag :type="data.status == 'SUCCEED' ? 'success' : 'danger'" round>{{ data.status }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.params')" :span="3">
        <ElText class="w-96" truncated>{{ data.params }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.response')" :span="3">
        <ElText class="w-96" truncated>{{ data.response }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.duration')"> {{ data.duration ? formatDuration(data.duration) : '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.operator')" :span="3">{{ data.operator }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.operatedAt')" :span="3">
        {{ data.operatedAt ? dayjs(data.operatedAt).format('YYYY-MM-DD HH:mm') : '-' }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>