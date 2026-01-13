<template>
  <q-page padding>
    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 25em">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ $t('page.users') }}</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-gutter-md">
              <q-input outlined dense v-model="form.username" :label="$t('label.username')" lazy-rules
                :rules="[val => val && val.length > 0 || $t('placeholder.inputText')]" />
              <q-input outlined dense v-model="form.fullName" :label="$t('label.fullName')" lazy-rules
                :rules="[val => val && val.length > 0 || $t('placeholder.inputText')]" />
            </div>

            <q-input outlined dense v-model="form.email" :label="$t('label.email')" lazy-rules type="email"
              :rules="[(val, rules) => rules.email(val) || $t('placeholder.inputText')]" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn title="cancel" type="reset" unelevated :label="$t('action.cancel')" v-close-popup />
            <q-btn title="submit" type="submit" flat :label="$t('action.submit')" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-table ref="tableRef" flat :title="$t('page.users')" selection="multiple" v-model:selected="selected" :rows="rows"
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

      <template v-slot:body-cell-username="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-avatar size="32px">
              <img alt="avatar" :src="`${cdn_url}/${props.row.username}.jpg`" />
            </q-avatar>
            <div class="column q-ml-sm">
              <span class="text-subtitle">
                {{ props.row.fullName }}
              </span>
              <span class="text-caption text-grey-7">{{ props.row.username }}</span>
            </div>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.nullable ? 'positive' : 'primary'" rounded class="q-mr-sm" />
          {{ props.row.nullable ? 'Y' : 'N' }}
        </q-td>
      </template>
      <template v-slot:body-cell-enabled="props">
        <q-td :props="props">
          <q-toggle v-model="props.row.enabled" @update:model-value="enableRow(props.row.id)" size="sm"
            color="positive" />
        </q-td>
      </template>
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <q-btn title="unlock" padding="xs" flat round color="positive" icon="sym_r_lock_open"
            @click="unlockRow(props.row.id)" />
          <q-btn title="modify" padding="xs" flat round color="primary" icon="sym_r_edit" @click="saveRow(props.row.id)"
            class="q-mx-sm" />
          <q-btn title="delete" padding="xs" flat round color="negative" icon="sym_r_delete"
            @click="removeRow(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- import -->
    <q-dialog v-model="importVisible" persistent>
      <q-card>
        <q-card-section class="flex items-center q-pb-none">
          <div class="text-h6">{{ $t('action.import') }}</div>
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
import type { QTable, QTableColumn, QTableProps } from 'quasar'
import { createUser, enableUser, fetchUser, importUsers, modifyUser, removeUser, retrieveUsers, unlockUser } from 'src/api/users'
import type { User } from 'src/types'
import { exportTable } from 'src/utils'
import { useUserStore } from 'stores/user-store'
import { onMounted, ref } from 'vue'


const userStore = useUserStore()

const cdn_url = process.env.CDN_URL
const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const tableRef = ref<QTable>()
const rows = ref<Array<User>>([])
const filter = ref({
  username: ''
})
const loading = ref<boolean>(false)

const initialValues: User = {
  id: null,
  username: '',
  fullName: '',
  email: '',
  status: ''
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

const columns: QTableColumn<User>[] = [
  { name: 'username', label: 'username', align: 'left', field: 'username', sortable: true },
  { name: 'email', label: 'email', align: 'center', field: 'email', sortable: true },
  { name: 'status', label: 'status', align: 'center', field: 'status', sortable: true },
  { name: 'enabled', label: 'enabled', align: 'center', field: 'enabled' },
  { name: 'id', label: 'actions', field: 'id' }
]

onMounted(() => {
  refresh()
})

async function onRequest(props: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  loading.value = true

  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const filter = props.filter

  const params = { page, size: rowsPerPage, sortBy, descending }

  try {
    const res = await retrieveUsers({ ...params }, filter)
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

function importRow() {
  importVisible.value = true
}

function refresh() {
  tableRef.value?.requestServerInteraction()
}

async function enableRow(id: number) {
  try {
    await enableUser(id)
    refresh()
  } catch {
    return Promise.resolve()
  }
}

async function unlockRow(id: number) {
  try {
    await unlockUser(id)
    refresh()
  } catch {
    return Promise.resolve()
  }
}

async function saveRow(id?: number) {
  form.value = { ...initialValues }
  if (id) {
    try {
      const res = await fetchUser(id)
      form.value = res.data
    } catch {
      return Promise.resolve()
    }
  }
  visible.value = true
}

async function removeRow(id: number) {
  loading.value = true
  try {
    await removeUser(id)
    refresh()
  } catch {
    return Promise.resolve()
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  try {
    if (form.value.id) {
      await modifyUser(form.value.id, form.value)
    } else {
      await createUser(form.value)
    }
    visible.value = false
  } catch {
    return Promise.resolve()
  }
}

async function onUpload(files: readonly File[]) {
  if (!files || files.length === 0 || !files[0]) {
    return Promise.reject(new Error('No file provided'))
  }
  try {
    const res = await importUsers(files[0])
    importVisible.value = false
    refresh()
    return res.data
  } catch {
    return Promise.resolve()
  }
}
</script>
