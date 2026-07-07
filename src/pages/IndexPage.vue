<script setup lang="ts">
import type { ApexOptions } from "apexcharts";
import ChartView from "@/components/ChartView.vue";
import { retrieveCalendarEvents } from "@/api/calendar-events";
import { lineOptions } from "@/mocks/charts-data";
import type { Schedule } from "@/types";
import { onMounted, reactive, ref } from "vue";

const today = ref(new Date());
// 获取指数
const lineOptionsData = reactive<ApexOptions | object>(lineOptions);
const datas = ref<Record<string, Schedule[]>>({});

onMounted(async () => {
  await load(today.value.getMonth() + 1);
});

async function load(month: number) {
  try {
    const res = await retrieveCalendarEvents(month);
    datas.value = res.data;
  } catch (error) {
    datas.value = {};

    throw error;
  }
}
</script>

<template>
  <ElCard>
    <ChartView :options="lineOptionsData" />
  </ElCard>

  <ElCard class="mt-4">
    <ElCalendar v-model="today">
      <template #date-cell="{ data }">
        <span>{{ data.date.getDate() }}</span>
        <div
          v-if="datas[data.date.getDate()]"
          class="flex-col overflow-y-auto h-14"
        >
          <ElText
            v-for="(item, index) in datas[data.date.getDate()]"
            :key="index"
            class="block"
            :type="item.type"
          >
            {{ item.title }}
          </ElText>
        </div>
      </template>
    </ElCalendar>
  </ElCard>
</template>
