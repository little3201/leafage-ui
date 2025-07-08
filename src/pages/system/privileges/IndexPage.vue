<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('privileges') }}</div>
          </q-card-section>

          <q-card-section>
            <q-input outlined dense v-model="form.name" :label="$t('name')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" />
            <q-input outlined dense v-model="form.path" :label="$t('path')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" />
            <q-input outlined dense v-model="form.component" :label="$t('component')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" />
            <q-select outlined dense v-model="form.redirect" :label="$t('redirect')" :options="subset" option-value="id"
              option-label="name" />

            <q-input outlined dense v-model="form.description" type="textarea" :label="$t('description')" />

          </q-card-section>

          <q-card-actions align="right">
            <q-btn title="cancel" type="reset" unelevated :label="$t('cancel')" v-close-popup />
            <q-btn title="submit" type="submit" flat :label="$t('submit')" color="primary" />
          </q-card-actions>

        </q-form>
      </q-card>
    </q-dialog>

    <q-table flat ref="tableRef" :title="$t('privileges')" selection="multiple" v-model:selected="selected" :rows="rows"
      :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading" :filter="filter"
      binary-state-sort @request="onRequest" class="full-width">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn title="refresh" round padding="xs" flat color="primary" class="q-ml-sm" :disable="loading"
          icon="sym_r_refresh" @click="refresh" />
        <q-btn title="import" round padding="xs" flat color="primary" class="q-mx-sm" :disable="loading"
          icon="sym_r_database_upload" @click="importRow" />
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

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn v-if="props.row.count > 0" title="expand" round flat dense @click="props.expand = !props.expand"
              :icon="props.expand ? 'sym_r_keyboard_arrow_down' : 'sym_r_keyboard_arrow_right'" />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name">
            <div v-if="col.name === 'id'" class="text-right">
              <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit"
                @click="saveRow(col.value)" class="q-mt-none" />
            </div>
            <div v-else-if="col.name === 'name'">
              <q-icon :name="`sym_r_${props.row.icon}`" size="sm" class="q-pr-sm" />{{ $t(col.value) }}
            </div>
            <div v-else-if="col.name === 'actions' && props.row.actions && props.row.actions.length > 0">
              <q-chip v-for="(item, index) in visibleArray(props.row.actions, 3)" :key="index"
                :label="$t(item as string)" :color="actions[item]" text-color="white" class="q-mr-sm" size="sm" />
              <template v-if="props.row.actions.length > 3">
                <q-chip color="primary" text-color="white" class="q-mr-sm" size="sm">
                  + {{ props.row.actions.length - 3 }}
                  <q-tooltip>
                    <q-chip v-for="(item, index) in props.row.actions.slice(3)" :key="index" :label="$t(item)"
                      :color="actions[item]" text-color="white" class="q-mr-sm" size="sm" />
                  </q-tooltip>
                </q-chip>
              </template>
            </div>
            <div v-else-if="col.name === 'enabled'" class="text-center">
              <q-toggle v-model="props.row.enabled" @toogle="enableRow(props.row.id)" size="sm" color="positive" />
            </div>
            <span v-else>{{ col.value }}</span>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" class="q-pr-none">
            <sub-page v-if="props.expand" :title="props.row.name" :superior-id="props.row.id" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { useQuasar, exportFile } from 'quasar'
import { retrievePrivileges, retrievePrivilegeSubset, fetchPrivilege, modifyPrivilege, enablePrivilege } from 'src/api/privileges'
import SubPage from './SubPage.vue'
import { visibleArray } from 'src/utils'
import { actions } from 'src/constants'
import type { Privilege } from 'src/types'

const $q = useQuasar()

const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const tableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: Privilege = {
  id: undefined,
  name: '',
  path: '',
  component: '',
  icon: '',
  actions: [],
  description: ''
}
const form = ref<Privilege>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const selected = ref([])

const columns: QTableProps['columns'] = [
  { name: 'name', label: 'name', align: 'left', field: 'name', sortable: true },
  { name: 'path', label: 'path', align: 'left', field: 'path', sortable: true },
  { name: 'actions', label: 'actions', align: 'left', field: 'actions' },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'description', label: 'description', align: 'left', field: 'description' },
  { name: 'id', label: 'actions', field: 'id' }
]

const subset = ref<Array<Privilege>>()

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

  retrievePrivileges({ ...params }, filter).then(res => {
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

function importRow() {
  importVisible.value = true
}

function refresh() {
  tableRef.value.requestServerInteraction()
}

async function enableRow(id: number) {
  enablePrivilege(id)
}

async function saveRow(id: number) {
  form.value = { ...initialValues }
  // You can populate the form with existing user data based on the id
  if (id) {
    fetchPrivilege(id).then(res => { form.value = res.data })
    retrievePrivilegeSubset(id).then(res => { subset.value = res.data })
  }
  visible.value = true
}

function onSubmit() {
  if (form.value.id) {
    modifyPrivilege(form.value.id, form.value)
  }

  // Close the dialog after submitting
  visible.value = false
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
