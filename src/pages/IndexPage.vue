<script setup lang="ts">
import type { ApexOptions } from "apexcharts";
import { reactive, ref } from "vue";
import ChartView from "@/components/ChartView.vue";
import CalendarEvent from "@/components/CalendarEvent.vue";
import { lineOptions } from "@/mocks/charts-data";

const lineOptionsData = reactive<ApexOptions | object>(lineOptions);
</script>

<template>
  <ElCard>
    <ChartView :options="lineOptionsData" />
  </ElCard>

  <ElCard class="mt-4">
    <CalendarEvent />
  </ElCard>
</template>
