<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 25em">
      <q-form @submit="onSubmit">
        <q-card-section>
          <div class="text-h6">{{ $t('regions') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input outlined dense v-model="form.name" label="Region name" lazy-rules
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

  <q-table flat ref="subtableRef" :title="title" selection="multiple" v-model:selected="selected" :rows="rows"
    :columns="columns" row-key="id" :loading="loading" :filter="filter" binary-state-sort @request="onRequest"
    class="full-width" table-class="bg-transparent" :pagination="pagination" hide-pagination>
    <template v-slot:top-right>
      <q-input dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="sym_r_search" />
        </template>
      </q-input>
      <q-btn title="create" round padding="xs" color="primary" class="q-mx-md" :disable="loading" icon="sym_r_add"
        @click="saveRow()" />
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

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-btn title="expand" round flat dense @click="props.expand = !props.expand"
            :icon="props.expand ? 'sym_r_keyboard_arrow_down' : 'sym_r_keyboard_arrow_right'" />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name">
          <div v-if="col.name === 'id'" class="text-right">
            <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit"
              @click="saveRow(props.row.id)" class="q-mt-none" />
            <q-btn title="delete" padding="xs" flat round color="negative" icon="sym_r_delete"
              @click="removeRow(props.row.id)" class="q-mt-none q-ml-sm" />
          </div>
          <div v-else-if="col.name === 'enabled'" class="text-center">
            <q-toggle v-model="props.row.enabled" @update:model-value="enableRow(props.row.id)" size="sm"
              color="positive" />
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { useQuasar, exportFile } from 'quasar'
import { retrieveRegionSubset, fetchRegion, createRegion, modifyRegion, removeRegion, enableRegion } from 'src/api/regions'
import type { Region } from 'src/types'


const $q = useQuasar()

const props = withDefaults(defineProps<{
  title: string
  superiorId?: number
}>(), {
  title: ''
})

const visible = ref<boolean>(false)

const subtableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref<boolean>(false)

const initialValues: Region = {
  id: undefined,
  name: '',
  areaCode: 0,
  postalCode: 0,
  description: ''
}
const form = ref<Region>({ ...initialValues })

const pagination = ref({
  rowsPerPage: 0
})

const selected = ref([])

const columns: QTableProps['columns'] = [
  { name: 'name', label: 'name', align: 'left', field: 'name', sortable: true },
  { name: 'postalCode', label: 'postalCode', align: 'left', field: 'postalCode', sortable: true },
  { name: 'areaCode', label: 'areaCode', align: 'left', field: 'areaCode', sortable: true },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'description', label: 'description', align: 'left', field: 'description' },
  { name: 'id', label: 'actions', field: 'id' }
]

onMounted(() => {
  subtableRef.value.requestServerInteraction()
})

/**
 * 查询列表
 */
async function onRequest() {
  loading.value = true

  if (props.superiorId) {
    retrieveRegionSubset(props.superiorId).then(res => {
      rows.value = res.data
    }).finally(() => {
      loading.value = false
    })
  }
}

function refresh() {
  subtableRef.value.requestServerInteraction()
}

async function enableRow(id: number) {
  enableRegion(id)
}

async function saveRow(id?: number) {
  form.value = { ...initialValues }
  // You can populate the form with existing user data based on the id
  if (id) {
    fetchRegion(id).then(res => { form.value = res.data })
  }
  visible.value = true
}

function removeRow(id: number) {
  loading.value = true
  removeRegion(id).finally(() => { loading.value = false })
}

function onSubmit() {
  if (form.value.id) {
    modifyRegion(form.value.id, form.value)
  } else {
    createRegion(form.value)
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
