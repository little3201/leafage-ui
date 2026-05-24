<template>
  <q-page padding>
    <q-dialog v-model="visible" persistent>
      <q-card style="width: 34em;">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">{{ form.id ? $t('action.modify') : $t('action.create') }}</div>
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

          <q-separator />

          <q-card-actions align="right">
            <q-btn title="cancel" type="reset" unelevated :label="$t('action.cancel')" v-close-popup />
            <q-btn title="submit" type="submit" flat :label="$t('action.submit')" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-table ref="tableRef" flat selection="multiple" v-model:selected="selected" :rows="rows" :columns="columns"
      row-key="id" v-model:pagination="pagination" :loading="loading" :filter="filter" binary-state-sort
      @request="onRequest" class="full-width">
      <template v-slot:top-left>
        <q-input dense debounce="300" filled v-model="filter.username!.value" placeholder="Search">
          <template v-slot:prepend>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>
        <q-btn title="refresh" round padding="xs" flat color="primary" class="q-ml-sm" :disable="loading"
          icon="sym_r_refresh" @click="refresh" />
      </template>
      <template v-slot:top-right>
        <q-btn title="create" round padding="xs" color="primary" class="q-ml-sm" :disable="loading" icon="sym_r_add"
          @click="saveRow()" />
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
              <img alt="avatar" :src="`https://cdn.leafage.top/${props.row.username}`" />
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
          <q-badge :color="userStatus[props.row.status]" rounded class="q-mr-sm" />
          {{ props.row.status }}
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
import { Notify } from 'quasar'
import { createUser, enableUser, fetchUser, importUsers, modifyUser, removeUser, retrieveUsers, unlockUser } from 'src/api/system/users'
import { userStatus } from 'src/constants'
import type { Filter, Pagination, User } from 'src/types'
import { exportTable } from 'src/utils'
import { useUserStore } from 'stores/user'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
const userStore = useUserStore()

const visible = ref<boolean>(false)
const importVisible = ref<boolean>(false)

const tableRef = ref<QTable>()
const rows = ref<Array<User>>([])
const filter = reactive<Filter<User>>({
  username: { op: 'like', value: undefined }
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
  sortBy: '',
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
  const params: Pagination = { page, size: rowsPerPage }
  if (sortBy) {
    params.sortBy = sortBy
    params.descending = descending
  }

  try {
    const res = await retrieveUsers(params, filter)
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    rows.value = res.data.content
    pagination.value.rowsNumber = res.data.totalElements
  } catch (error) {
    rows.value = []
    pagination.value.rowsNumber = 0

    throw error
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
  await enableUser(id)
  refresh()
}

async function unlockRow(id: number) {
  try {
    await unlockUser(id)
    refresh()
    Notify.create({
      message: t('message.success', { action: t('action.unlock') }),
      type: 'positive',
    })
  } catch (error) {
    Notify.create({
      message: t('message.error', { action: t('action.unlock') }),
      type: 'negative',
    })
    throw error
  }
}

async function saveRow(id?: number) {
  form.value = { ...initialValues }
  if (id) {
    try {
      const res = await fetchUser(id)
      form.value = res.data
    } catch (error) {
      form.value = { ...initialValues }
      throw error
    }
  }
  visible.value = true
}

async function removeRow(id: number) {
  try {
    await removeUser(id)
    refresh()
    Notify.create({
      message: t('message.success', { action: t('action.remove') }),
      type: 'positive',
    })
  } catch (error) {
    Notify.create({
      message: t('message.error', { action: t('action.remove') }),
      type: 'negative',
    })
    throw error
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
    Notify.create({
      message: t('message.success', { action: form.value.id ? t('action.modify') : t('action.create') }),
      type: 'positive',
    })

    refresh()
  } catch (error) {
    Notify.create({
      message: t('message.error', { action: form.value.id ? t('action.modify') : t('action.create') }),
      type: 'negative',
    })
    throw error
  }
}

async function onUpload(files: readonly File[]) {
  if (!files || files.length === 0 || !files[0]) {
    throw new Error('No file provided')
  }
  try {
    const res = await importUsers(files[0])
    importVisible.value = false
    Notify.create({
      message: t('message.success', { action: t('action.import') }),
      type: 'positive',
    })

    refresh()
    return res.data
  } catch (error) {
    Notify.create({
      message: t('message.error', { action: t('action.import') }),
      type: 'negative',
    })
    throw error
  }
}
</script>
