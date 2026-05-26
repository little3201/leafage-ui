<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { TableInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { clearAccessLogs, fetchAccessLog, removeAccessLog, retrieveAccessLogs } from 'src/api/logs/access-logs'
import { actionIcons, actionTypes, httpMethods } from 'src/constants'
import type { AccessLog, Filter, Pagination } from 'src/types'
import { exportToCSV, formatDuration, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()


const loading = ref<boolean>(false)
const datas = ref<Array<AccessLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const filter = reactive<Filter<AccessLog>>({
  url: { op: 'eq', value: undefined }
})

const detailLoading = ref<boolean>(false)
const exportLoading = ref<boolean>(false)
const initialValues: AccessLog = {
  id: null,
  url: '',
  httpMethod: '',
  ip: '',
}
const row = ref<AccessLog>({ ...initialValues })

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

  const res = await retrieveAccessLogs(pagination, filter)
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

  const res = await fetchAccessLog(id)
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
    exportToCSV(selectedRows, 'access-logs')
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
 * @param httpMethod http 方法
 * @param url URL
 */
async function removeRow(id: number, httpMethod: string, url: string) {
  // 弹出确认框
  await ElMessageBox.confirm(
    t('tips.removeWarning', { module: t('page.accessLogs'), data: httpMethod + ' (url: "' + url + '")' }),
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
      await removeAccessLog(id)
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
      await clearAccessLogs()
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
        <ElInput v-model="filter.url!.value" clearable style="width: 240px" class="mr-4"
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
      <ElTableColumn prop="url" :label="$t('label.url')" sortable>
        <template #default="scope">
          <ElButton title="url" type="primary" link @click="showRow(scope.row.id)">
            <ElTag :type="httpMethods[scope.row.httpMethod]" size="small" class="mr-2">
              {{ scope.row.httpMethod }}
            </ElTag>
            {{ scope.row.url }}
          </ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn show-overflow-tooltip prop="params" :label="$t('label.params')" />
      <ElTableColumn show-overflow-tooltip prop="body" :label="$t('label.request.body')" />
      <ElTableColumn prop="ip" :label="$t('label.ip')" sortable />
      <ElTableColumn prop="statusCode" :label="$t('label.statusCode')">
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
          {{ scope.row.duration ? formatDuration(scope.row.duration) : '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('label.actions')">
        <template #default="scope">
          <ElButton v-if="hasAction($route.name, 'remove')" title="remove" :type="actionTypes['remove']" link
            @click="removeRow(scope.row.id, scope.row.httpMethod, scope.row.url)">
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
      <ElDescriptionsItem :label="$t('label.url')">
        <ElTag :type="httpMethods[row.httpMethod]" size="small" class="mr-2">
          {{ row.httpMethod }}
        </ElTag>
        {{ row.url }}
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
      <ElDescriptionsItem :label="$t('label.duration')">{{ row.duration ? formatDuration(row.duration) :
        '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.params')" :span="3">{{ row.params }}</ElDescriptionsItem>
      <ElDescriptionsItem v-if="row.body" :label="$t('label.request.body')" :span="3">{{ row.body }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('label.ip')" :span="3">{{ row.ip }}</ElDescriptionsItem>

      <ElDescriptionsItem :label="$t('label.response')" :span="3">{{ row.response }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>
