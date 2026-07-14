<script setup lang="ts">
import type { ApexOptions } from "apexcharts";
import { dayjs } from "element-plus";
import { onMounted, reactive, ref, computed } from "vue";
import ChartView from "@/components/ChartView.vue";
import { retrieveCalendarEvents } from "@/api/calendar-events";
import { lineOptions } from "@/mocks/charts-data";
import type { CalendarEvent } from "@/types";

interface EventSegment {
  event: CalendarEvent;
  start: Date;
  end: Date;
  row: number;
  key: string | number;
}

const today = ref(new Date());

const lineOptionsData = reactive<ApexOptions | object>(lineOptions);

const events = ref<CalendarEvent[]>([]);

/**
 * 每周的segment布局
 */
const segments = ref<EventSegment[]>([]);

const daySegmentMap = computed(() => {
  const map = new Map<string, EventSegment[]>();

  segments.value.forEach(segment => {
    let current = dayjs(segment.start);

    const end = dayjs(segment.end);

    while (current.isBefore(end, "day") || current.isSame(end, "day")) {
      const key = current.format("YYYY-MM-DD");

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(segment);

      current = current.add(1, "day");
    }
  });

  return map;
});

onMounted(async () => {
  await load(today.value.getMonth() + 1);
});

async function load(month: number) {
  const res = await retrieveCalendarEvents(month);

  events.value = res.data;

  segments.value = createSegments(events.value);
}

/**
 * 获取周key
 */
function getWeekKey(date: Date) {
  return dayjs(date).startOf("week").format("YYYY-MM-DD");
}

/**
 * 生成week segment
 */
function createSegments(list: CalendarEvent[]): EventSegment[] {
  const result: EventSegment[] = [];

  list.forEach(event => {
    const eventKey = event.id ?? `${crypto.randomUUID()}`;

    let cursor = dayjs(event.startDate).startOf("week");

    const last = dayjs(event.endDate).startOf("week");

    while (cursor.isBefore(last, "day") || cursor.isSame(last, "day")) {
      const weekStart = cursor.startOf("week");

      const weekEnd = cursor.endOf("week");

      const start = dayjs(event.startDate).isAfter(weekStart, "day")
        ? dayjs(event.startDate)
        : weekStart;

      const end = dayjs(event.endDate).isBefore(weekEnd, "day")
        ? dayjs(event.endDate)
        : weekEnd;

      result.push({
        event,

        start: start.toDate(),

        end: end.toDate(),

        row: -1,

        key: eventKey
      });

      cursor = cursor.add(1, "week");
    }
  });

  assignRows(result);

  return result;
}

/**
 * 判断两个segment重叠
 */
function overlap(a: EventSegment, b: EventSegment) {
  return !(
    dayjs(a.end).isBefore(b.start, "day") ||
    dayjs(a.start).isAfter(b.end, "day")
  );
}

/**
 * 分配row
 */
function assignRows(list: EventSegment[]) {
  const weeks = new Map<string, EventSegment[]>();

  // 按周分组
  list.forEach(segment => {
    const week = getWeekKey(segment.start);

    if (!weeks.has(week)) {
      weeks.set(week, []);
    }

    weeks.get(week)!.push(segment);
  });

  let previousOrder = new Map<string | number, number>();

  Array.from(weeks.values()).forEach(segments => {
    segments.sort((a, b) => {
      const ai = previousOrder.get(a.key) ?? -1;

      const bi = previousOrder.get(b.key) ?? -1;

      if (ai !== -1 && bi !== -1) {
        return ai - bi;
      }

      if (ai !== -1) {
        return -1;
      }

      if (bi !== -1) {
        return 1;
      }

      // 新事件
      return dayjs(a.start).diff(b.start, "day");
    });

    const rows: EventSegment[][] = [];

    segments.forEach(segment => {
      let row = 0;

      while (rows[row]?.some(item => overlap(item, segment))) {
        row++;
      }

      if (!rows[row]) {
        rows[row] = [];
      }

      rows[row].push(segment);

      segment.row = row;
    });

    previousOrder = new Map(
      rows.flat().map((item, index) => [item.key, index])
    );
  });
}

/**
 * 获取某天segment
 */
function getDaySegments(date: Date) {
  return daySegmentMap.value.get(dayjs(date).format("YYYY-MM-DD")) ?? [];
}

/**
 * 当前日期分组
 */
function getRows(date: Date) {
  const rows: Record<number, EventSegment[]> = {};

  getDaySegments(date).forEach(item => {
    if (!rows[item.row]) {
      rows[item.row] = [];
    }

    rows[item.row].push(item);
  });

  return rows;
}

/**
 * 最大row
 */
function getRowCount(date: Date) {
  return Object.keys(getRows(date)).length;
}
</script>

<template>
  <ElCard>
    <ChartView :options="lineOptionsData" />
  </ElCard>

  <ElCard class="mt-4">
    <ElCalendar v-model="today">
      <template #date-cell="{ data }">
        <div class="relative">
          <span>{{ data.date.getDate() }}</span>
          <div class="absolute -inset-x-2 top-8">
            <div
              v-for="row in getRowCount(data.date)"
              :key="row"
              class="h-5 my-0.5"
            >
              <div
                v-for="(segment, index) in getRows(data.date)[row - 1]"
                :key="index"
                class="h-5 truncate px-1 text-xs leading-5 text-white"
                :class="segment.event.type"
              >
                {{ segment.event.title }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </ElCalendar>
  </ElCard>
</template>

<style lang="css" scoped>
.primary {
  background: var(--el-color-primary);
}

.success {
  background: var(--el-color-success);
}

.warning {
  background: var(--el-color-warning);
}

.danger {
  background: var(--el-color-danger);
}

.info {
  background: var(--el-color-info);
}
</style>
