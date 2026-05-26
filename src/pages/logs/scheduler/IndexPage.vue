<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { TableInstance } from 'element-plus'
import { dayjs, ElMessage, ElMessageBox } from 'element-plus'
import { clearSchedulerLogs, fetchSchedulerLog, removeSchedulerLog, retrieveSchedulerLogs } from 'src/api/logs/scheduler-logs'
import { actionIcons, actionTypes, shceduleStatus, shceduleStatusIcon } from 'src/constants'
import type { Filter, Pagination, SchedulerLog } from 'src/types'
import { exportToCSV, formatDuration, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()


const loading = ref<boolean>(false)
const datas = ref<Array<SchedulerLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const filter = reactive<Filter<SchedulerLog>>({
  name: { op: 'eq', value: undefined }
})

const detailLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const initialValues: SchedulerLog = {
  id: null,
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

  const res = await retrieveSchedulerLogs(pagination, filter)
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

  const res = await fetchSchedulerLog(id)
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
 * @param name 名称
 * @param startTime 开始时间
 */
async function removeRow(id: number, name: string, startTime: string) {
  // 弹出确认框
  await ElMessageBox.confirm(
    t('tips.removeWarning', { module: t('page.schedulerLogs'), data: name + ' (start: ' + dayjs(startTime).format('YYYY-MM-DD HH:mm') + ')' }),
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
      await removeSchedulerLog(id)
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
      await clearSchedulerLogs()
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
      <ElTableColumn prop="name" :label="$t('label.name')">
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
      <ElTableColumn prop="status" :label="$t('label.status')" align="center" sortable>
        <template #default="scope">
          <ElTag :type="shceduleStatus[scope.row.status]" round>
            <Icon :icon="`material-symbols:${shceduleStatusIcon[scope.row.status]}`"
              :class="[scope.row.status === 'RUNNING' ? 'spin' : '', 'mr-1']" width="1.25em" height="1.25em" />
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
          <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
            @click="removeRow(scope.row.id, scope.row.name, scope.row.startTime)">
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
      <ElDescriptionsItem :label="$t('label.name')">{{ row.name }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.startTime')">
        {{ dayjs(row.startTime).format('YYYY-MM-DD HH:mm') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.status')">
        <ElTag :type="shceduleStatus[row.status || '']" round>
          <Icon :icon="`material-symbols:${shceduleStatusIcon[row.status || '']}`"
            :class="[row.status === 'RUNNING' ? 'spin' : '', 'mr-1']" width="1.25em" height="1.25em" />
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

<style lang="scss" scoped>
:deep(.el-tag__content) {
  display: inline-flex;
  align-items: center;
}
</style>
