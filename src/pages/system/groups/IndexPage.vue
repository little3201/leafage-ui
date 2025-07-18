<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('groups') }}</div>
          </q-card-section>

          <q-card-section>
            <q-input outlined dense v-model="form.name" :label="$t('name')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" />

            <q-input outlined dense v-model="form.description" :label="$t('description')" type="textarea" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn title="cancel" type="reset" unelevated :label="$t('cancel')" v-close-popup />
            <q-btn title="submit" type="submit" flat :label="$t('submit')" color="primary" />
          </q-card-actions>

        </q-form>
      </q-card>
    </q-dialog>

    <q-table flat ref="tableRef" :title="$t('groups')" selection="multiple" v-model:selected="selected" :rows="rows"
      :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading" :filter="filter"
      binary-state-sort @request="onRequest" class="full-width col">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn title="create" round padding="xs" color="primary" class="q-ml-sm" :disable="loading" icon="sym_r_add"
          @click="saveRow()" />
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

      <template v-slot:body-cell-members="props">
        <q-td :props="props">
          <template v-if="props.row.members && props.row.members.length > 0">
            <q-avatar v-for="(item, index) in visibleArray(props.row.members, 5)" :key="index" size="2em"
              :style="{ left: `${index * -2}px`, border: '2px solid white' }">
              <q-img :src="item as string" :alt="`avater${index}`" width="2em" height="2em" />
            </q-avatar>
            <template v-if="props.row.members.length > 5">
              <q-chip color="primary" text-color="white" class="q-mr-xs" size="sm">
                + {{ props.row.members.length - 5 }}
                <q-tooltip>
                  <q-avatar v-for="(item, index) in props.row.members.slice(5)" :key="index" size="2em"
                    :style="{ left: `${index * -2}px`, border: '2px solid white' }">
                    <q-img :src="item" :alt="`avater${index}`" width="2em" height="2em" />
                  </q-avatar>
                </q-tooltip>
              </q-chip>
            </template>
          </template>
        </q-td>
      </template>
      <template v-slot:body-cell-enabled="props">
        <q-td :props="props">
          <q-toggle v-model="props.row.enabled" @toogle="enableRow(props.row.id)" size="sm" color="positive" />
        </q-td>
      </template>
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit" @click="saveRow(props.row.id)"
            class="q-mt-none" />
          <q-btn title="relation" padding="xs" flat round color="positive" icon="sym_r_link"
            @click="relationRow(props.row.id)" class="q-mt-none q-mx-sm" />
          <q-btn title="delete" padding="xs" flat round color="negative" icon="sym_r_delete"
            @click="removeRow(props.row.id)" class="q-mt-none " />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { useQuasar, exportFile } from 'quasar'
import { retrieveGroups, fetchGroup, createGroup, modifyGroup, removeGroup, enableGroup } from 'src/api/groups'
import { visibleArray } from 'src/utils'
import type { Group } from 'src/types'


const $q = useQuasar()

const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const tableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: Group = {
  id: undefined,
  name: '',
  enabled: true
}
const form = ref<Group>({ ...initialValues })

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
  { name: 'members', label: 'members', align: 'center', field: 'members' },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'description', label: 'description', field: 'description' },
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

  retrieveGroups({ ...params }, filter).then(res => {
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

function relationRow(id: number) {
  console.log(id)
}

function enableRow(id: number) {
  enableGroup(id)
}

async function saveRow(id?: number) {
  form.value = { ...initialValues }
  // You can populate the form with existing user data based on the id
  if (id) {
    fetchGroup(id).then(res => { form.value = res.data })
  }
  visible.value = true
}

function removeRow(id: number) {
  loading.value = true
  // You can send a request to delete the group with the specified id
  removeGroup(id).finally(() => { loading.value = false })
}

function onSubmit() {
  if (form.value.id) {
    modifyGroup(form.value.id, form.value)
  } else {
    createGroup(form.value)
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
