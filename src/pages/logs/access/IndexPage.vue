<template>
  <q-page padding>

    <q-dialog v-model="visible">
      <q-card>
        <q-card-section class="flex items-center q-pb-none">
          <div class="text-h6">{{ $t('page.accessLogs') }}</div>
          <q-space />
          <q-btn icon="sym_r_close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <p><strong>{{ $t('label.url') }}</strong>
              {{ row.url }}
            </p>
            <p><strong>{{ $t('label.httpMethod') }}</strong>{{ row.httpMethod }}</p>
            <p>
              <strong>{{ $t('label.statusCode') }}</strong>
              <q-chip v-if="row.statusCode && row.statusCode >= 200 && row.statusCode < 300" size="sm" color="positive"
                text-color="white">{{ row.statusCode }}</q-chip>
              <q-chip v-else-if="row.statusCode && row.statusCode >= 500" size="sm" color="warning"
                text-color="white">{{
                  row.statusCode }}</q-chip>
              <q-chip v-else size="sm" color="negative" text-color="white">{{ row.statusCode }}</q-chip>
            </p>
          </div>

          <div class="q-gutter-md">
            <p><strong>{{ $t('label.params') }}</strong>
              {{ row.params }}
            </p>
            <p><strong>{{ $t('label.request.body') }}</strong>
              {{ row.body }}
            </p>
          </div>

          <div class="row q-gutter-md">
            <p><strong>{{ $t('label.ip') }}</strong>
              {{ row.ip }}
            </p>
          </div>
          <div class="q-gutter-md">
            <p><strong>{{ $t('label.duration') }}</strong>
              {{ row.duration ? formatDuration(row.duration) : '' }}
            </p>
            <p><strong>{{ $t('label.response') }}</strong>
              {{ row.response }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-table ref="tableRef" flat :title="$t('page.accessLogs')" selection="multiple" v-model:selected="selected"
      :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading" :filter="filter"
      binary-state-sort @request="onRequest" class="full-width">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn title="refresh" round padding="xs" flat color="primary" class="q-ml-sm" :disable="loading"
          icon="sym_r_refresh" @click="refresh" />
        <q-btn title="clear" round padding="xs" flat color="negative" class="q-mx-sm" icon="sym_r_clear_all" />
        <q-btn title="export" round padding="xs" flat color="primary" icon="sym_r_file_export"
          @click="exportTable(columns, rows)" />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            <span v-if="col.label === 'body'">{{ $t('label.request.body') }}</span>
            <span v-else>{{ $t(`label.${col.label}`) }}</span>
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-url="props">
        <q-td :props="props">
          <q-btn :title="props.row.url" flat rounded no-caps color="primary" @click="showRow(props.row.id)">
            <q-badge :color="httpMethods[props.row.httpMethod]" rounded class="q-mr-sm">
              {{ props.row.httpMethod }}
            </q-badge>
            {{ props.row.url }}
          </q-btn>
        </q-td>
      </template>
      <template v-slot:body-cell-statusCode="props">
        <q-td :props="props">
          <q-chip v-if="props.row.statusCode >= 200 && props.row.statusCode < 300" size="sm" color="positive"
            text-color="white">{{ props.row.statusCode }}</q-chip>
          <q-chip v-else-if="props.row.statusCode >= 500" size="sm" color="warning" text-color="white">{{
            props.row.statusCode }}</q-chip>
          <q-chip v-else size="sm" color="negative" text-color="white">{{ props.row.statusCode }}</q-chip>
        </q-td>
      </template>
      <template v-slot:body-cell-responseTimes="props">
        <q-td :props="props">
          {{ props.row.responseTimes ? formatDuration(props.row.responseTimes) : '-' }}
        </q-td>
      </template>
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <q-btn title="delete" padding="xs" flat round color="negative" icon="sym_r_delete"
            @click="removeRow(props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import type { QTable, QTableColumn, QTableProps } from 'quasar'
import { fetchAccessLog, removeAccessLog, retrieveAccessLogs } from 'src/api/access-logs'
import { httpMethods } from 'src/constants'
import type { AccessLog } from 'src/types'
import { exportTable, formatDuration } from 'src/utils'
import { onMounted, ref } from 'vue'


const visible = ref<boolean>(false)

const tableRef = ref<QTable>()
const rows = ref<Array<AccessLog>>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: AccessLog = {
  id: null,
  url: '',
  httpMethod: '',
  ip: ''
}
const row = ref<AccessLog>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const selected = ref([])

const columns: QTableColumn<AccessLog>[] = [
  { name: 'url', label: 'url', align: 'left', field: 'url' },
  { name: 'params', label: 'params', align: 'left', field: 'params' },
  { name: 'body', label: 'body', align: 'left', field: 'body' },
  { name: 'ip', label: 'ip', align: 'center', field: 'ip' },
  { name: 'statusCode', label: 'statusCode', align: 'center', field: 'statusCode' },
  { name: 'duration', label: 'duration', align: 'center', field: 'duration' },
  { name: 'response', label: 'response', align: 'center', field: 'response' },
  { name: 'id', label: 'actions', field: 'id' }
]

onMounted(() => {
  refresh()
})

/**
 * 查询列表
 */
async function onRequest(props: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  loading.value = true

  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const filter = props.filter

  const params = { page, size: rowsPerPage, sortBy, descending }

  try {
    const res = await retrieveAccessLogs({ ...params }, filter)
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    rows.value = res.data.content
    pagination.value.rowsNumber = res.data.totalElements
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

function refresh() {
  tableRef.value?.requestServerInteraction()
}

async function showRow(id: number) {
  try {
    const res = await fetchAccessLog(id)
    row.value = res.data
  } catch (error) {
    return error
  }
  visible.value = true
}

async function removeRow(id: number) {
  try {
    await removeAccessLog(id)
    refresh()
  } catch (error) {
    return error
  }
}
</script>
