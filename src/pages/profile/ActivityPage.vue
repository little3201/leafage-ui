<script setup lang="ts">
import { ref } from 'vue'
import { actions } from 'src/constants'


// 仓库数据模拟
const activities = ref([
  { id: 4, name: 'Create a set of data', description: 'User: username is test', action: 'create', lastModifiedDate: '2024-09-12' },
  { id: 3, name: 'Delete the data from user where username is test', description: 'User: username is test', action: 'remove', lastModifiedDate: '2024-08-19' },
  { id: 2, name: 'Update the test user', description: 'User: username is test', action: 'modify', lastModifiedDate: '2024-08-17' },
  { id: 1, name: 'Enabled the test user', description: 'User: username is test', action: 'enable', lastModifiedDate: '2024-08-16' }
])
</script>


<template>
  <h3>Last 3 days activities</h3>
  <ElTimeline>
    <ElTimelineItem v-for="activity in activities" :key="activity.id" :type="actions[activity.action]"
      :timestamp="activity.lastModifiedDate" placement="top">
      <ElCard shadow="never">
        <h4 class="my-0">{{ activity.name }}</h4>
        <p class="mb-0">{{ activity.description }}</p>
      </ElCard>
    </ElTimelineItem>
  </ElTimeline>
</template>