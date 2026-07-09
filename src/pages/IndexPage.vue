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
import ChartView from "@/components/ChartView.vue";
import { lineOptions } from "@/mocks/charts-data";
import type { ApexOptions } from "apexcharts";
import { reactive } from "vue";

// 获取指数
const lineOptionsData = reactive<ApexOptions | object>(
  lineOptions
) as ApexOptions;
</script>
