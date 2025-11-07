<template>
  <q-page padding>

    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('dictionaries') }}</div>
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

    <q-table flat ref="tableRef" :title="$t('dictionaries')" :rows="rows" :columns="columns" row-key="id"
      :loading="loading" v-model:pagination="pagination" binary-state-sort @request="onRequest" class="full-width">
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

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn title="expand" round flat dense @click="props.expand = !props.expand"
              :icon="props.expand ? 'sym_r_keyboard_arrow_down' : 'sym_r_keyboard_arrow_right'" />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name">
            <div v-if="col.name === 'id'" class="text-right">
              <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit"
                @click="saveRow(col.value)" class="q-mt-none" />
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

    <!-- import -->
    <q-dialog v-model="importVisible" persistent>
      <q-card>
        <q-card-section class="flex items-center q-pb-none">
          <div class="text-h6">{{ $t('import') }}</div>
          <q-space />
          <q-btn icon="sym_r_close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-uploader flat bordered :headers="[{ name: 'Authorization', value: `Bearer ${userStore.accessToken}` }]"
            :factory="onUpload"
            accept=".csv,.xls,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { useUserStore } from 'stores/user-store'
import { retrieveDictionaries, fetchDictionary, modifyDictionary, enableDictionary, importDictionaries } from 'src/api/dictionaries'
import SubPage from './SubPage.vue'
import { exportTable } from 'src/utils'
import type { Dictionary } from 'src/types'


const userStore = useUserStore()

const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const tableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref('')
const loading = ref(false)

const initialValues: Dictionary = {
  id: undefined,
  name: '',
  enabled: true
}
const form = ref<Dictionary>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const columns: QTableProps['columns'] = [
  { name: 'name', label: 'name', align: 'left', field: 'name', sortable: true },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'description', label: 'description', align: 'left', field: 'description' },
  { name: 'id', label: 'actions', field: 'id' }
]

onMounted(async () => {
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

  retrieveDictionaries({ ...params }, filter).then(res => {
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    rows.value = res.data.content
    pagination.value.rowsNumber = res.data.totalElements
  }).finally(() => { loading.value = false })
}

function importRow() {
  importVisible.value = true
}

function refresh() {
  tableRef.value.requestServerInteraction()
}

function enableRow(id: number) {
  enableDictionary(id)
}

async function saveRow(id: number) {
  form.value = { ...initialValues }
  // You can populate the form with existing user data based on the id
  if (id) {
    fetchDictionary(id).then(res => { form.value = res.data })
  }
  visible.value = true
}

function onSubmit() {
  if (form.value.id) {
    modifyDictionary(form.value.id, form.value)
  }

  // Close the dialog after submitting
  visible.value = false
}

async function onUpload(files: readonly File[]) {
  if (!files || files.length === 0 || !files[0]) {
    return Promise.reject(new Error('No file provided'))
  }
  const res = await importDictionaries(files[0])

  importVisible.value = false
  refresh()
  return res.data
}
</script>
