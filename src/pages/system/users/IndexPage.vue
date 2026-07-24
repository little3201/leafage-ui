<template>
  <v-card class="pa-4" flat>

    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :search="filter.username!.value"
      show-select
      @update:options="loadItems"
    >
      <template #top>
        <v-row class="justify-space-between">
          <v-col class="d-inline-flex align-center ga-1 me-auto" cols="2">
            <v-text-field
              v-model="filter.username!.value"
              clearable
              density="compact"
              flat
              hide-details
              label="Search"
              prepend-inner-icon="mdi-magnify"
              rounded="pill"
              single-line
              variant="solo-filled"
            />

            <v-btn
              density="compact"
              flat
              :icon="actionIcon('refresh')"
              @click="refresh()"
            />
          </v-col>

          <v-col class="d-flex align-center justify-end ga-4" cols="2">
            <v-btn
              color="primary"
              flat
              :prepend-icon="actionIcon('create')"
              rounded="lg"
              text="Create"
              @click="saveRow()"
            />

            <v-btn
              color="warning"
              flat
              :prepend-icon="actionIcon('import')"
              rounded="lg"
              text="Import"
              variant="outlined"
              @click="importRows()"
            />

            <v-btn
              color="warning"
              flat
              :prepend-icon="actionIcon('export')"
              rounded="lg"
              text="Export"
              variant="outlined"
              @click="exportRows()"
            />
          </v-col>
        </v-row>
      </template>

      <template #item.status="{ item }">
        <v-chip
          :color="userStatus[item.status!]"
          size="small"
          :text="item.status"
        />
      </template>

      <template #item.enabled="{ item }">
        <v-switch v-model="item.enabled" color="green" hide-details @update:model-value="enableRow(item.id!)" />
      </template>

      <template #item.id="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon color="primary" :icon="actionIcon('modify')" @click="saveRow(item.id!)" />

          <v-icon color="error" :icon="actionIcon('remove')" @click="removeRow(item.id!)" />
        </div>
      </template>
    </v-data-table-server>
  </v-card>

  <v-dialog v-model="visible" max-width="500">
    <v-card :title="`${form.id ? 'Modify' : 'Create'}`">
      <v-card-title>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.fullName" density="compact" label="Full Name" variant="outlined" />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="form.username" density="compact" label="Username" variant="outlined" />
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="form.email" density="compact" label="Email" variant="outlined" />
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

      <v-card-actions>
        <v-btn text="Cancel" variant="plain" @click="visible = false" />
        <v-btn text="Save" @click="onSubmit()" />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="importVisible" max-width="500">
    <v-card flat>
      <v-file-input accept=".csv,.xls,.xlsx" label="File input" variant="outlined" @update:model-value="onImport" />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Filter, Pagination, User } from '@/types'
import type { DataTableHeader, DataTableSortItem } from 'vuetify'
import { computed, reactive, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { createUser, enableUser, fetchUser, importUsers, modifyUser, removeUser, retrieveUsers } from '@/api/system/users'
import { userStatus } from '@/constants'
import { actionIcon } from '@/utils'

const { t } = useI18n()
const loading = ref(true)
const headers = computed<DataTableHeader[]>(() => [
  {
    title: t('label.username'),
    align: 'start',
    sortable: false,
    key: 'username',
  },
  { title: t('label.email'), key: 'email', sortable: false, align: 'center' },
  { title: t('label.status'), key: 'status', align: 'center' },
  { title: t('label.enabled'), key: 'enabled', align: 'start' },
  { title: t('label.actions'), key: 'id', sortable: false, align: 'end' },
])

const items = ref<Array<User>>([])
const itemsPerPage = ref(10)
const totalItems = ref(0)

const filter = reactive<Filter<User>>({
  username: { op: 'like', value: undefined },
})

const visible = shallowRef(false)
const initialValues: User = {
  id: null,
  username: '',
  fullName: '',
  email: '',
  status: '',
}
const form = ref<User>({ ...initialValues })

const importVisible = ref(false)

async function loadItems ({ page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy: DataTableSortItem[] }) {
  loading.value = true

  const pagination: Pagination = { page, size: itemsPerPage }
  if (sortBy.length > 0) {
    pagination.sortBy = sortBy[0].key
    pagination.descending = sortBy[0].order === 'desc'
  }
  const res = await retrieveUsers(pagination, filter)
  items.value = res.data.content
  totalItems.value = res.data.page.totalElements
  loading.value = false
}

function refresh () {
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [] })
}

async function saveRow (id?: number) {
  form.value = { ...initialValues }
  if (id) {
    try {
      const res = await fetchUser(id)
      form.value = res.data
    } catch (error) {
      return error
    }
  }
  visible.value = true
}

async function removeRow (id: number) {
  loading.value = true
  try {
    await removeUser(id)
    refresh()
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

async function onSubmit () {
  try {
    await (form.value.id ? modifyUser(form.value.id, form.value) : createUser(form.value))
    visible.value = false
  } catch (error) {
    return error
  }
}

async function enableRow (id: number) {
  try {
    await enableUser(id)
    refresh()
  } catch (error) {
    return error
  }
}

function importRows () {
  importVisible.value = true
}

async function onImport (file: File | File[]) {
  if (!file || (Array.isArray(file) && file.length === 0) || (!Array.isArray(file) && !file)) {
    throw new Error('No file provided')
  }
  try {
    await importUsers(Array.isArray(file) ? file[0] : file)
    importVisible.value = false
    refresh()
  } catch (error) {
    return error
  }
}

async function exportRows () {
  // Implementation for export rows
}

</script>
