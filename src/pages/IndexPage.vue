<template>
  <q-page padding>
    <q-card flat>
      <q-card-section>
        <chart-view :options="lineOptionsData" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import ChartView from 'components/ChartView.vue'
import { lineOptions } from 'src/mocks/charts-data'
import type { ApexOptions } from 'apexcharts'

// 获取指数
const lineOptionsData = reactive<ApexOptions | object>(lineOptions) as ApexOptions
</script>
