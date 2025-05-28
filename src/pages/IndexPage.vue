<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { ApexOptions } from 'apexcharts'
import ChartView from 'components/ChartView.vue'
import { lineOptions } from 'src/mocks/charts-data'


const value = ref(new Date())
// 获取指数
const lineOptionsData = reactive<ApexOptions | object>(lineOptions) as ApexOptions
</script>

<template>
  <ElSpace direction="vertical" fill size="large">
    <ElCard shadow="never">
      <ChartView :options="lineOptionsData" />
    </ElCard>
    <ElCard shadow="never">
      <ElCalendar v-model="value" />
    </ElCard>
  </ElSpace>
</template>
