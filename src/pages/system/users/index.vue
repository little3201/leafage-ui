<template>
  <v-card flat>
    <template #text>
      <v-text-field
        v-model="filter.username!.value"
        hide-details
        label="Search"
        prepend-inner-icon="mdi-magnify"
        single-line
        variant="outlined"
      />
    </template>

    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :search="filter.username!.value"
      @update:options="loadItems"
    />
  </v-card>
</template>

<script setup lang="ts">
import type { Filter, Pagination, User } from 'src/types'
import type { DataTableHeader } from 'vuetify'
import { retrieveUsers } from 'src/api/system/users'
import { reactive, ref } from 'vue'

const loading = ref(true)
const headers = ref<DataTableHeader[]>([
  {
    title: 'username',
    align: 'start',
    sortable: false,
    key: 'username',
  },
  { title: 'email', key: 'email', align: 'center' },
  { title: 'status', key: 'status', align: 'end' },
  { title: 'enabled', key: 'enabled', align: 'end' },
  { title: 'actions', key: 'id', align: 'end' },
])

const items = ref<Array<User>>([])
const itemsPerPage = ref(5)
const totalItems = ref(0)

const filter = reactive<Filter<User>>({
  username: { op: 'like', value: undefined },
})

function loadItems ({ page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy: string }) {
  loading.value = true

  const pagination: Pagination = { page, size: itemsPerPage }
  if (sortBy) {
    pagination.sortBy = sortBy
  }
  retrieveUsers(pagination, filter).then(({ content, totalElements }) => {
    items.value = content
    totalItems.value = totalElements
    loading.value = false
  })
}
</script>
