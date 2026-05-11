<template>
  <h3 class="text-h5">Last 3 days activities</h3>
  <q-timeline color="secondary">
    <q-timeline-entry v-for="item in activities" :key="item.id" :title="item.name" :subtitle="item.lastModifiedDate"
      :color="actions[item.action]">
      <div>
        {{ item.description }}
      </div>
    </q-timeline-entry>
  </q-timeline>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { actions } from 'src/constants'


const activities = ref([
  { id: 4, name: 'Create a set of data', description: 'User: username is test', action: 'create', lastModifiedDate: '2024-09-12' },
  { id: 3, name: 'Delete the data from user where username is test', description: 'User: username is test', action: 'remove', lastModifiedDate: '2024-08-19' },
  { id: 2, name: 'Update the test user', description: 'User: username is test', action: 'modify', lastModifiedDate: '2024-08-17' },
  { id: 1, name: 'Enabled the test user', description: 'User: username is test', action: 'enable', lastModifiedDate: '2024-08-16' }
  // 更多仓库
])
</script>