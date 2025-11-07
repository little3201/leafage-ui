<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card>
        <q-card-section class="flex items-center q-pb-none">
          <div class="text-h6">{{ $t('scheduler_logs') }}</div>
          <q-space />
          <q-btn icon="sym_r_close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <p><strong>{{ $t('name') }}</strong>{{ row.name }}</p>
            <p><strong>{{ $t('startTime') }}</strong>
              {{ row.startTime ? date.formatDate(row.startTime, 'YYYY-MM-DD HH:mm') : '-' }}
            </p>
            <p><strong>{{ $t('executedTimes') }}</strong>
              {{ row.executedTimes ? formatDuration(row.executedTimes) : '-' }}
            </p>
          </div>

          <div class="row q-gutter-md">
            <p>
              <strong>{{ $t('status') }}</strong>
              <q-chip v-if="row.status === 0" size="sm" icon="sym_r_progress_activity" color="primary"
                text-color="white">
                {{ $t('processing') }}
              </q-chip>
              <q-chip v-else-if="row.status === 1" size="sm" icon="sym_r_check" color="positive" text-color="white">
                {{ $t('done') }}
              </q-chip>
              <q-chip v-else size="sm" icon="sym_r_error" color="negative" text-color="white">{{ $t('failure')
              }}</q-chip>
            </p>
            <p><strong>{{ $t('nextExecuteTime') }}</strong>
              {{ row.nextExecuteTime ? date.formatDate(row.nextExecuteTime, 'YYYY-MM-DD HH:mm') : '-' }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-table flat ref="tableRef" :title="$t('scheduler_logs')" selection="multiple" v-model:selected="selected"
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
            {{ $t(col.label) }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <q-btn :title="props.row.name" flat rounded no-caps color="primary" @click="showRow(props.row.id)">
            {{ props.row.name }}
          </q-btn>
        </q-td>
      </template>
      <template v-slot:body-cell-startTime="props">
        <q-td :props="props">
          {{ props.row.startTime ? date.formatDate(props.row.startTime, 'YYYY-MM-DD HH:mm') : '-' }}
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip v-if="props.row.status === 0" size="sm" icon="sym_r_progress_activity" color="primary"
            text-color="white">
            {{ $t('processing') }}
          </q-chip>
          <q-chip v-else-if="props.row.status === 1" size="sm" icon="sym_r_check" color="positive" text-color="white">
            {{ $t('done') }}
          </q-chip>
          <q-chip v-else size="sm" icon="sym_r_error" color="negative" text-color="white">{{ $t('failure') }}</q-chip>
        </q-td>
      </template>
      <template v-slot:body-cell-executedTimes="props">
        <q-td :props="props">
          {{ props.row.executedTimes ? formatDuration(props.row.executedTimes) : '-' }}
        </q-td>
      </template>
      <template v-slot:body-cell-nextExecuteTime="props">
        <q-td :props="props">
          {{ props.row.nextExecuteTime ? date.formatDate(props.row.nextExecuteTime, 'YYYY-MM-DD HH:mm') : '-' }}
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
import { date } from 'quasar'
import { retrieveSchedulerLogs, fetchSchedulerLog } from 'src/api/scheduler-logs'
import { formatDuration, exportTable } from 'src/utils'
import type { SchedulerLog } from 'src/types'


const visible = ref<boolean>(false)

const tableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: SchedulerLog = {
  id: undefined,
  name: ''
}
const row = ref<SchedulerLog>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const selected = ref([])

const columns: QTableProps['columns'] = [
  { name: 'name', label: 'name', align: 'left', field: 'name' },
  { name: 'startTime', label: 'startTime', align: 'center', field: 'startTime' },
  { name: 'status', label: 'status', align: 'center', field: 'status' },
  { name: 'executedTimes', label: 'executedTimes', align: 'center', field: 'executedTimes' },
  { name: 'nextExecuteTime', label: 'nextExecuteTime', align: 'center', field: 'nextExecuteTime' },
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

  retrieveSchedulerLogs({ ...params }, filter).then(res => {
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
  row.value = { ...initialValues }
  visible.value = true
  if (id) {
    fetchSchedulerLog(id).then(res => { row.value = res.data })
  }
}

function removeRow(id: number) {
  console.log('id: ', id)
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}
</script>
