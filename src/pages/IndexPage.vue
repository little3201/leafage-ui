<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { ApexOptions } from 'apexcharts'
import ChartView from 'components/ChartView.vue'
import { retrieveCalendarEvents } from 'src/api/calendar-events'
import type { Schedule } from 'src/types'
import { lineOptions } from 'src/mocks/charts-data'


const today = ref(new Date())
// 获取指数
const lineOptionsData = reactive<ApexOptions | object>(lineOptions) as ApexOptions
const datas = ref<Record<string, Schedule[]>>({})

async function load(month: number) {
  try {
    const res = await retrieveCalendarEvents(month)
    datas.value = res.data
  } catch {
    return Promise.resolve()
  }
}

onMounted(async () => {
  await load(today.value.getMonth() + 1)
})
</script>

<template>
  <ElSpace direction="vertical" fill size="large">
    <ElCard shadow="never">
      <ChartView :options="lineOptionsData" />
    </ElCard>
    <ElCard shadow="never">
      <ElCalendar v-model="today">
        <template #date-cell="{ data }">
          <span>{{ data.date.getDate() }}</span>
          <div v-if="datas[data.date.getDate()]" class="flex-col overflow-y-auto h-14">
            <ElText v-for="(item, index) in datas[data.date.getDate()]" :key="index" class="block" tag="b"
              :type="item.type">
              {{ item.title }}
            </ElText>
          </div>
        </template>
      </ElCalendar>
    </ElCard>
  </ElSpace>
</template>
