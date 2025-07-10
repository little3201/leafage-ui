<template>
  <q-page padding>
    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('users') }}</div>
          </q-card-section>

          <q-card-section>
            <q-input outlined dense v-model="form.username" :label="$t('username')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" />

            <q-input outlined dense v-model="form.firstname" :label="$t('firstname')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" />

            <q-input outlined dense v-model="form.middleName" :label="$t('middleName')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" />

            <q-input outlined dense v-model="form.lastname" :label="$t('lastname')" lazy-rules
              :rules="[val => val && val.length > 0 || $t('inputText')]" />

            <q-input outlined dense v-model="form.email" :label="$t('email')" lazy-rules type="email"
              :rules="[val => val && val.length > 0 || $t('inputText')]" />

            <q-input outlined dense v-model="form.accountExpiresAt" :label="$t('accountExpiresAt')" mask="date"
              :rules="['date']">
              <template v-slot:append>
                <q-icon name="sym_r_event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.accountExpiresAt">
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input outlined dense v-model="form.credentialsExpiresAt" :label="$t('credentialsExpiresAt')" mask="date"
              :rules="['date']">
              <template v-slot:append>
                <q-icon name="sym_r_event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.credentialsExpiresAt">
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn title="cancel" type="reset" unelevated :label="$t('cancel')" v-close-popup />
            <q-btn title="submit" type="submit" flat :label="$t('submit')" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-table flat ref="tableRef" :title="$t('users')" selection="multiple" v-model:selected="selected" :rows="rows"
      :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading" :filter="filter"
      binary-state-sort @request="onRequest" class="full-width">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter.username" placeholder="Search">
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

      <template v-slot:body-cell-username="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-avatar size="2rem">
              <q-img alt="avatar" :src="props.row.avatar" width="2rem" height="2rem" />
            </q-avatar>
            <div class="column q-ml-sm">
              <span v-if="locale === 'en-US' || props.row.middleName" class="text-subtitle">
                {{ props.row.firstname }} {{ props.row.middleName }} {{ props.row.lastname }}
              </span>
              <span v-else class="text-subtitle">
                {{ props.row.lastname }}{{ props.row.firstname }}
              </span>
              <span class="text-caption text-grey-7">{{ props.row.username }}</span>
            </div>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-enabled="props">
        <q-td :props="props">
          <q-toggle v-model="props.row.enabled" @toogle="enableRow(props.row.id)" size="sm" color="positive" />
        </q-td>
      </template>
      <template v-slot:body-cell-accountExpiresAt="props">
        <q-td :props="props">
          <q-badge v-if="props.row.accountExpiresAt" :color="calculate(props.row.accountExpiresAt)" rounded
            class="q-mr-xs" />
          {{ props.row.accountExpiresAt ? date.formatDate(props.row.accountExpiresAt, 'YYYY/MM/DD HH:mm') : '-' }}
        </q-td>
      </template>
      <template v-slot:body-cell-credentialsExpiresAt="props">
        <q-td :props="props">
          <q-badge v-if="props.row.credentialsExpiresAt" :color="calculate(props.row.credentialsExpiresAt)" rounded
            class="q-mr-xs" />
          {{ props.row.credentialsExpiresAt ? date.formatDate(props.row.credentialsExpiresAt, 'YYYY/MM/DD HH:mm') :
            '-' }}
        </q-td>
      </template>
      <template v-slot:body-cell-accountNonLocked="props">
        <q-td :props="props">
          <q-btn title="accountNonLocked" padding="xs" flat round :disable="props.row.accountNonLocked || loading"
            :color="props.row.accountNonLocked ? 'positive' : 'warning'"
            :icon="props.row.accountNonLocked ? 'sym_r_lock_open_right' : 'sym_r_lock'"
            @click="unlockRow(props.row.id)" />
        </q-td>
      </template>
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit" @click="saveRow(props.row.id)"
            class="q-mt-none" />
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
import { useQuasar, exportFile, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { retrieveUsers, fetchUser, createUser, modifyUser, removeUser, enableUser, unlockUser } from 'src/api/users'
import { calculate } from 'src/utils'

import type { User } from 'src/types'


const { locale } = useI18n()
const $q = useQuasar()

const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const tableRef = ref()
const rows = ref<QTableProps['rows']>([])
const filter = ref({
  username: ''
})
const loading = ref<boolean>(false)

const initialValues: User = {
  id: undefined,
  username: '',
  firstname: '',
  lastname: '',
  email: ''
}
const form = ref<User>({ ...initialValues })

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 7,
  rowsNumber: 0
})

const selected = ref([])

const columns: QTableProps['columns'] = [
  { name: 'username', label: 'username', align: 'left', field: 'username', sortable: true },
  { name: 'email', label: 'email', align: 'center', field: 'email', sortable: true },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'accountNonLocked', label: 'accountNonLocked', align: 'center', field: 'accountNonLocked' },
  { name: 'accountExpiresAt', label: 'accountExpiresAt', align: 'center', field: 'accountExpiresAt', sortable: true },
  { name: 'credentialsExpiresAt', label: 'credentialsExpiresAt', align: 'center', field: 'credentialsExpiresAt', sortable: true },
  { name: 'id', label: 'actions', field: 'id' }
]

onMounted(() => {
  tableRef.value.requestServerInteraction()
})

async function onRequest(props: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  loading.value = true

  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const filter = props.filter

  const params = { page, size: rowsPerPage, sortBy, descending }

  retrieveUsers({ ...params }, filter).then(res => {
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
  enableUser(id)
}

async function unlockRow(id: number) {
  unlockUser(id)
}

async function saveRow(id?: number) {
  form.value = { ...initialValues }
  // You can populate the form with existing user data based on the id
  if (id) {
    fetchUser(id).then(res => { form.value = res.data })
  }
  visible.value = true
}

function removeRow(id: number) {
  loading.value = true
  // You can send a request to delete the user with the specified id
  removeUser(id).finally(() => { loading.value = false })
}

async function onSubmit() {
  if (form.value.id) {
    modifyUser(form.value.id, form.value)
  } else {
    createUser(form.value)
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
