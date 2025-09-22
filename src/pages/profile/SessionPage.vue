<script setup lang="ts">
import { ref } from 'vue'

// 登录历史数据模拟
const loginHistory = ref([
  { id: 1, device: 'Chrome on Windows', location: 'New York, USA', ip: '192.168.0.112', status: 'online' },
  { id: 2, device: 'Safari on iPhone', location: 'Los Angeles, USA', ip: '172.168.0.112', status: 'offline' },
  { id: 3, device: 'Edge on Windows', location: 'Chicago, USA', ip: '127.0.0.112', status: 'offline' }
])

function more(id: number) {
  console.log(id)
}
</script>

<template>
  <h3>Login Information</h3>
  <ElTable :data="loginHistory" :show-header=false table-layout="auto">
    <ElTableColumn prop="device">
      <template #default="scope">
        <div class="flex items-center">
          <ElBadge :type="scope.row.status === 'online' ? 'success' : 'info'" is-dot />
          <Icon icon="material-symbols:desktop-windows-outline-rounded" width="32" height="32" class="ml-3 mr-2" />
          <div class="ml-2 inline-flex flex-col">
            <span class="text-sm">{{ scope.row.location }}&emsp;●&emsp;{{ scope.row.ip }}</span>
            <span class="text-xs text-[var(--el-text-color-secondary)]">{{ scope.row.device }}</span>
          </div>
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn width="80">
      <template #default="scope">
        <ElButton title="more" size="small" type="primary" link @click="more(scope.row.id)">
          {{ $t('more') }}
        </ElButton>
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<style lang="scss" scoped>
.el-badge {
  display: inline-flex;
  vertical-align: baseline;
}
</style>