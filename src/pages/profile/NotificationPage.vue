<template>
  <h3 class="text-h5">Login Information</h3>
  <q-list separator>
    <q-item v-for="item in loginHistory" :key="item.id">
      <q-item-section avatar class="row items-center">
        <q-icon name="sym_r_desktop_windows" size="md" />
      </q-item-section>
      <q-item-section>
        <span>{{ item.ip }}&emsp;●&emsp;{{ item.location }}</span>
        <span class="text-caption">{{ item.device }}</span>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 登录历史数据模拟
const loginHistory = ref([
  { id: 1, device: 'Chrome on Windows', location: 'New York, USA', ip: '127.0.0.1', status: 'online' },
  { id: 2, device: 'Safari on iPhone', location: 'Los Angeles, USA', ip: '127.0.0.2', status: 'offline' },
  { id: 3, device: 'Edge on Windows', location: 'Chicago, USA', ip: '127.0.0.3', status: 'offline' }
])
</script>