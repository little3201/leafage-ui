<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { TableInstance } from 'element-plus'
import { clearAccessLogs, fetchAccessLog, removeAccessLog, retrieveAccessLogs } from 'src/api/access-logs'
import { httpMethods } from 'src/constants'
import type { AccessLog, Pagination } from 'src/types'
import { exportToCSV, formatDuration, hasAction } from 'src/utils'
import { onMounted, reactive, ref } from 'vue'


const loading = ref<boolean>(false)
const datas = ref<Array<AccessLog>>([])
const total = ref<number>(0)

const tableRef = ref<TableInstance>()
const pagination = reactive<Pagination>({
  page: 1,
  size: 10
})

const filters = ref({
  url: null,
  statusCode: null
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
  try {
    const res = await retrieveAccessLogs(pagination, filters.value)
    datas.value = res.data.content
    total.value = res.data.page.totalElements
  } catch (error) {
    return error
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
    const res = await fetchAccessLog(id)
    row.value = res.data
  } catch (error) {
    return error
  } finally {
    detailLoading.value = false
  }
}

/**
 * reset
 */
async function reset() {
  filters.value = {
    url: null,
    statusCode: null
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
 */
async function removeRow(id: number) {
  try {
    await removeAccessLog(id)
    await load()
  } catch (error) {
    return error
  }
}

/**
 * 清空
 */
async function clearRows() {
  try {
    await clearAccessLogs()
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
  <ElSpace size="large" fill>
    <ElCard shadow="never">
      <ElForm inline :model="filters">
        <ElFormItem :label="$t('label.url')" prop="url">
          <ElInput v-model="filters.url" :placeholder="$t('placeholder.inputText', { field: $t('label.url') })" />
        </ElFormItem>
        <ElFormItem :label="$t('label.statusCode')" prop="statusCode">
          <ElInput v-model="filters.statusCode"
            :placeholder="$t('placeholder.inputText', { field: $t('label.statusCode') })" />
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
          <ElButton v-if="hasAction($route.name, 'clear')" title="clear" type="danger" plain @click="clearRows">
            <Icon icon="material-symbols:clear-all-rounded" width="1.25em" height="1.25em" />{{ $t('action.clear') }}
          </ElButton>
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
      <ElPagination layout="slot, ->, total, prev, pager, next, sizes" @change="pageChange" :total="total">
        <template #default>
          {{ $t('message.selectedTotal', { total: tableRef?.getSelectionRows().length }) }}
        </template>
      </ElPagination>
    </ElCard>
  </ElSpace>

  <!-- detail -->
  <ElDialog v-model="visible" :title="$t('action.details')" align-center width="600">
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
