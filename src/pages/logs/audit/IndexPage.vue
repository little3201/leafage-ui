<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card>
        <q-card-section class="flex items-center q-pb-none">
          <div class="text-h6">{{ $t('page.auditLogs') }}</div>
          <q-space />
          <q-btn icon="sym_r_close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <p><strong>{{ $t('label.resource') }}</strong>
              {{ row.resource }}
            </p>
            <p><strong>{{ $t('label.operation') }}</strong>{{ row.operation }}</p>
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
            <p><strong>{{ $t('label.oldValue') }}</strong>
              {{ row.oldValue }}
            </p>
            <p><strong>{{ $t('label.newValue') }}</strong>
              {{ row.newValue }}
            </p>
          </div>

          <div class="row q-gutter-md">
            <p><strong>{{ $t('label.ip') }}</strong>
              {{ row.ip }}
            </p>
            <p><strong>{{ $t('label.operatedTimes') }}</strong>
              {{ row.operatedTimes ? formatDuration(row.operatedTimes) : '' }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-table ref="tableRef" flat :title="$t('page.page.auditLogs')" selection="multiple" v-model:selected="selected"
      :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading" :filter="filter"
      binary-state-sort @request="onRequest" class="full-width">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn title="refresh" round padding="xs" flat color="primary" class="q-mx-sm" :disable="loading"
          icon="sym_r_refresh" @click="refresh" />
        <q-btn title="export" round padding="xs" flat color="primary" icon="sym_r_file_export"
          @click="exportTable(columns, rows)" />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ $t(`label.${col.label}`) }}
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
            @click="removeRow(props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { retrieveAuditLogs, fetchAuditLog, removeAuditLog } from 'src/api/audit-logs'
import { formatDuration, exportTable } from 'src/utils'
import type { AuditLog } from 'src/types'


const visible = ref<boolean>(false)

const tableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: AuditLog = {
  id: undefined,
  operation: '',
  resource: '',
  ip: ''
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
  { name: 'statusCode', label: 'statusCode', align: 'center', field: 'statusCode' },
  { name: 'operatedTimes', label: 'operatedTimes', align: 'center', field: 'operatedTimes' },
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
    const res = await retrieveAuditLogs({ ...params }, filter)
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    rows.value = res.data.content
    pagination.value.rowsNumber = res.data.totalElements
  } catch {
    return Promise.resolve()
  } finally {
    loading.value = false
  }
}

function refresh() {
  tableRef.value.requestServerInteraction()
}

async function showRow(id: number) {
  try {
    const res = await fetchAuditLog(id)
    row.value = res.data
  } catch {
    return Promise.resolve()
  }
  visible.value = true
}

async function removeRow(id: number) {
  try {
    await removeAuditLog(id)
    refresh()
  } catch {
    return Promise.resolve()
  }
}
</script>
