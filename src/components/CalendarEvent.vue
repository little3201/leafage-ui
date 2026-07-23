<script setup lang="ts">
import { dayjs } from "element-plus";
import { onMounted, ref, computed } from "vue";
import { retrieveCalendarEvents } from "@/api/calendar-events";
import type { CalendarEvent, EventSegment } from "@/types";

const selectedDay = ref<Date>(new Date());
const events = ref<CalendarEvent[]>([]);
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
  await load(selectedDay.value.getMonth() + 1);
});

async function load(month: number) {
  try {
    const res = await retrieveCalendarEvents(month);
    events.value = res.data;

    segments.value = createSegments(events.value);
  } catch (error) {
    events.value = [];
    segments.value = [];
    throw error;
  }
}

/**
 * 获取 week key
 */
function getWeekKey(date: Date) {
  return dayjs(date).startOf("week").format("YYYY-MM-DD");
}

/**
 * 生成 week segment
 */
function createSegments(events: CalendarEvent[]): EventSegment[] {
  if (!events.length) return [];
  const result: EventSegment[] = [];

  events.forEach(event => {
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
function assignRows(segments: EventSegment[]) {
  const weeks = new Map<string, EventSegment[]>();

  // 按周分组
  segments.forEach(segment => {
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
 * 获取 segment
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
 * 获取 row count
 */
function getRowCount(date: Date) {
  return Object.keys(getRows(date)).length;
}
</script>

<template>
  <ElCalendar v-model="selectedDay">
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
              v-for="segment in getRows(data.date)[row - 1]"
              :key="segment.key"
              class="h-5 truncate px-1 text-xs leading-5 text-white"
              :style="{
                backgroundColor: `var(--el-color-${segment.event.type})`
              }"
            >
              {{ segment.event.title }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </ElCalendar>
</template>
