<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('audit_logs') }}</div>
          <q-space />
          <q-btn icon="sym_r_close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p><strong>{{ $t('resource') }}</strong>
            {{ row.resource }}
          </p>
          <p><strong>{{ $t('operation') }}</strong>{{ row.operation }}</p>
          <p><strong>{{ $t('ip') }}</strong>
            {{ row.ip }}
          </p>
          <p><strong>{{ $t('location') }}</strong>
            {{ row.location }}
          </p>
          <p><strong>{{ $t('oldValue') }}</strong>
            {{ row.oldValue }}
          </p>
          <p><strong>{{ $t('newValue') }}</strong>
            {{ row.newValue }}
          </p>
          <p>
            <strong>{{ $t('statusCode') }}</strong>
            <q-chip v-if="row.statusCode && row.statusCode >= 200 && row.statusCode < 300" size="sm" color="positive"
              text-color="white">{{ row.statusCode }}</q-chip>
            <q-chip v-else-if="row.statusCode && row.statusCode >= 500" size="sm" color="warning" text-color="white">{{
              row.statusCode }}</q-chip>
            <q-chip v-else size="sm" color="negative" text-color="white">{{ row.statusCode }}</q-chip>
          </p>
          <p><strong>{{ $t('operatedTimes') }}</strong>
            {{ row.operatedTimes ? formatDuration(row.operatedTimes) : '' }}
          </p>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-table flat ref="tableRef" :title="$t('audit_logs')" selection="multiple" v-model:selected="selected" :rows="rows"
      :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading" :filter="filter"
      binary-state-sort @request="onRequest" class="full-width">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn title="refresh" round padding="xs" flat color="primary" class="q-mx-sm" :disable="loading"
          icon="sym_r_refresh" @click="refresh" />
        <q-btn title="export" round padding="xs" flat color="primary" icon="sym_r_file_export" @click="exportTable" />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ $t(col.label) }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-resource="props">
        <q-td :props="props">
          <q-btn :title="props.row.resource" flat rounded no-caps color="primary" @click="showRow(props.row.id)">
            {{ props.row.resource }}
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
      <template v-slot:body-cell-operatedTimes="props">
        <q-td :props="props">
          {{ props.row.operatedTimes ? formatDuration(props.row.operatedTime) : '' }}
        </q-td>
      </template>
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <q-btn title="delete" padding="xs" flat round color="negative" icon="sym_r_delete"
            @click="removeRow(props.row.id)" class="q-mt-none q-ml-sm" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { useQuasar, exportFile } from 'quasar'
import { retrieveAuditLogs, fetchAuditLog } from 'src/api/audit-logs'
import type { AuditLog } from 'src/types'
import { formatDuration } from 'src/utils'


const $q = useQuasar()

const visible = ref<boolean>(false)

const tableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: AuditLog = {
  id: undefined,
  operation: '',
  resource: '',
  ip: '',
  location: ''
}
const row = ref<AuditLog>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const selected = ref([])

const columns: QTableProps['columns'] = [
  { name: 'resource', label: 'resource', align: 'left', field: 'resource' },
  { name: 'operation', label: 'operation', align: 'left', field: 'operation' },
  { name: 'oldValue', label: 'oldValue', align: 'left', field: 'oldValue' },
  { name: 'newValue', label: 'newValue', align: 'center', field: 'newValue' },
  { name: 'ip', label: 'ip', align: 'center', field: 'ip' },
  { name: 'location', label: 'location', align: 'center', field: 'location' },
  { name: 'statusCode', label: 'statusCode', align: 'center', field: 'statusCode' },
  { name: 'operatedTimes', label: 'operatedTimes', align: 'center', field: 'operatedTimes' },
  { name: 'id', label: 'actions', field: 'id' }
]

onMounted(() => {
  tableRef.value.requestServerInteraction()
})

/**
 * 查询列表
 */
async function onRequest(props: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  loading.value = true

  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const filter = props.filter

  const params = { page, size: rowsPerPage, sortBy, descending }

  retrieveAuditLogs({ ...params }, filter).then(res => {
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    rows.value = res.data.content
    pagination.value.rowsNumber = res.data.totalElements
  }).finally(() => {
    loading.value = false
  })
}

function refresh() {
  tableRef.value.requestServerInteraction()
}

function showRow(id: number) {
  visible.value = true
  if (id) {
    fetchAuditLog(id).then(res => { row.value = res.data })
  }
}

function removeRow(id: number) {
  console.log('id: ', id)
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function wrapCsvValue(val: string, formatFn?: (val: string, row?: string) => string, row?: string) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val

  formatted = formatted === void 0 || formatted === null ? '' : String(formatted)

  formatted = formatted.split('"').join('""')

  return `"${formatted}"`
}

function exportTable() {
  if (!columns || !rows.value || columns.length === 0 || rows.value.length === 0) {
    // Handle the case where columns or rows are undefined or empty
    console.error('Columns or rows are undefined or empty.')
    return
  }
  // naive encoding to csv format
  const content = [columns.map(col => wrapCsvValue(col.label))]
    .concat(rows.value.map(row => columns.map(col =>
      wrapCsvValue(typeof col.field === 'function' ? col.field(row) : row[col.field === void 0 ? col.name : col.field],
        col.format,
        row
      )).join(','))
    ).join('\r\n')

  const status = exportFile(
    'table-export.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
}
</script>
