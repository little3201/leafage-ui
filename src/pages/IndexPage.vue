<script setup lang="ts">
import type { ApexOptions } from "apexcharts";
import { reactive } from "vue";
import ChartView from "@/components/ChartView.vue";
import CalendarEvent from "@/components/CalendarEvent.vue";
import { lineOptions } from "@/mocks/charts-data";

const lineOptionsData = reactive<ApexOptions | object>(lineOptions);
</script>

<template>
  <ElCard class="mb-4">
    <p class="text-lg font-bold mt-0">应用中心</p>
    <ElButton type="primary" size="large">新增</ElButton>
    <ElButton type="primary" size="large">编辑</ElButton>
    <ElButton type="primary" size="large">删除</ElButton>
  </ElCard>

  <ElRow :gutter="16">
    <ElCol :span="12">
      <ElCard>
        <ChartView :options="lineOptionsData" />
      </ElCard>
    </ElCol>
    <ElCol :span="12">
      <ElCard>
        <CalendarEvent />
      </ElCard>
    </ElCol>
  </ElRow>
</template>
