<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import type { TableInstance } from 'element-plus'
import DialogView from 'components/DialogView.vue'
import { retrieveAccessLogs, fetchAccessLog, removeAccessLog, clearAccessLogs } from 'src/api/access-logs'
import type { Pagination, AccessLog } from 'src/types'
import { Icon } from '@iconify/vue'
import { formatDuration, hasAction, exportToCSV } from 'src/utils'
import { httpMethods } from 'src/constants'

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
  id: undefined,
  url: '',
  httpMethod: '',
  ip: '',
  location: '',
  responseMessage: ''
}
const row = ref<AccessLog>({ ...initialValues })

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
  loading.value = true
  retrieveAccessLogs(pagination, filters.value).then(res => {
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
  fetchAccessLog(id).then(res => {
    row.value = res.data
  }).finally(() => { detailLoading.value = false })
}

/**
 * reset
 */
function reset() {
  filters.value = {
    url: null,
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
    exportToCSV(selectedRows, 'access-logs')
  }
  exportLoading.value = false
}

/**
 * 详情
 * @param id 主键
 */
function showRow(id: number) {
  row.value = { ...initialValues }
  visible.value = true
  loadOne(id)
}

/**
 * 删除
 * @param id 主键
 */
function removeRow(id: number) {
  removeAccessLog(id).then(() => load())
}

/**
 * 清空
 */
function clearRows() {
  clearAccessLogs().then(() => load())
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
        <ElFormItem :label="$t('url')" prop="url">
          <ElInput v-model="filters.url" :placeholder="$t('inputText', { field: $t('url') })" />
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

      <ElTable ref="tableRef" v-loading="loading" :data="datas" row-key="id" stripe table-layout="auto">
        <ElTableColumn type="selection" />
        <ElTableColumn type="index" :label="$t('no')" width="55" />
        <ElTableColumn prop="url" :label="$t('url')" sortable>
          <template #default="scope">
            <ElButton title="details" type="primary" link @click="showRow(scope.row.id)">
              <ElTag :type="httpMethods[scope.row.httpMethod]" size="small" class="mr-2">
                {{ scope.row.httpMethod }}
              </ElTag>
              {{ scope.row.url }}
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip prop="params" :label="$t('params')" />
        <ElTableColumn show-overflow-tooltip prop="body" :label="$t('body')" />
        <ElTableColumn prop="ip" :label="$t('ip')" sortable />
        <ElTableColumn show-overflow-tooltip prop="location" :label="$t('location')" sortable />
        <ElTableColumn prop="statusCode" :label="$t('statusCode')">
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
        <ElTableColumn prop="responseTimes" :label="$t('responseTimes')" sortable>
          <template #default="scope">
            {{ formatDuration(scope.row.responseTimes) }}
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
      <ElPagination layout="prev, pager, next, sizes, jumper, ->, total" @change="pageChange" :total="total" />
    </ElCard>
  </ElSpace>

  <DialogView v-model="visible" show-close :title="$t('details')">
    <ElDescriptions v-loading="detailLoading" border>
      <ElDescriptionsItem :label="$t('url')" :span="2">
        <ElTag :type="httpMethods[row.httpMethod]" size="small" class="mr-2">
          {{ row.httpMethod }}
        </ElTag>
        {{ row.url }}
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
      <ElDescriptionsItem :label="$t('params')" :span="3">{{ row.params }}</ElDescriptionsItem>
      <ElDescriptionsItem v-if="row.body" :label="$t('body')" :span="3">{{ row.body }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('ip')">{{ row.ip }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('location')">{{ row.location }}</ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('responseTimes')">{{ row.responseTimes ? formatDuration(row.responseTimes) : '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="$t('responseMessage')" :span=3>{{ row.responseMessage }}</ElDescriptionsItem>
    </ElDescriptions>
  </DialogView>
</template>

<style lang="scss" scoped>
.el-badge {
  display: inline-flex;
  vertical-align: baseline;
}
</style>
