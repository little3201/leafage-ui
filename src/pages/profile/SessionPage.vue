<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const sessions = ref([
  { id: 1, device: 'Chrome on Windows', location: 'New York', country: 'US', ip: '192.168.0.112', status: 'online' },
  { id: 2, device: 'Safari on iPhone', location: 'Los Angeles', country: 'US', ip: '172.168.0.112', status: 'offline' },
  { id: 3, device: 'Edge on Windows', location: 'Chicago', country: 'US', ip: '127.0.0.112', status: 'offline' }
])

function more(id: number) {
  console.log(id)
}
</script>

<template>
  <h3>Login Information</h3>
  <ElCollapse accordion>
    <ElCollapseItem v-for="item in sessions" :key="item.id" :name="item.id">
      <template #icon="{ isActive }">
        <ElButton link type="primary" class="icon-ele" @click="more(item.id)">
          {{ isActive ? 'Less' : 'More' }}
        </ElButton>
      </template>
      <template #title>
        <div class="inline-flex items-center py-2 text-(--el-text-color-secondary)">
          <ElBadge :type="item.status === 'online' ? 'success' : 'info'" is-dot />
          <Icon icon="material-symbols:desktop-windows-outline-rounded" width="32" height="32" class="mx-3" />
          <div class="inline-flex flex-col">
            <span class="text-sm ">{{ item.location }}&emsp;●&emsp;{{ item.ip
            }}
            </span>
            <span class="text-xs ">Your current session</span>
            <span class="text-xs ">Seen in {{ item.country }}</span>
          </div>
        </div>
      </template>
      <div class="px-4 text-sm text-(--el-text-color-secondary)">
        <p>Device: {{ item.device }}</p>
        <p>Last location: {{ item.country }}</p>
        <p>Signed in: {{ item.country }}</p>
        <ElImage src="https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg" />
      </div>
    </ElCollapseItem>
  </ElCollapse>
</template>

<style lang="scss" scoped>
.el-badge {
  display: inline-flex;
  vertical-align: baseline;
}
</style>