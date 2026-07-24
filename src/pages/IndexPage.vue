<template>
  <v-card class="pa-4" flat>
    <v-sheet class="d-flex" tile>
      <v-btn
        class="ma-2"
        icon
        variant="text"
        @click="calendar?.prev()"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <v-select
        v-model="type"
        class="ma-2"
        density="comfortable"
        hide-details
        :items="types"
        label="type"
        variant="outlined"
      />

      <v-select
        v-model="mode"
        class="ma-2"
        density="comfortable"
        hide-details
        :items="modes"
        label="event-overlap-mode"
        variant="outlined"
      />

      <v-spacer />

      <v-btn
        class="ma-2"
        icon
        variant="text"
        @click="calendar?.next()"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-sheet>

    <v-sheet height="600">
      <v-calendar
        ref="calendar"
        v-model="value"
        :event-color="getEventColor"
        :event-overlap-mode="mode"
        :event-overlap-threshold="30"
        :events="events"
        :type="type"
        @change="getEvents"
      />
    </v-sheet>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type CalendarEvent = {
  name?: string
  start: Date | string
  end: Date | string
  color?: string
  timed?: boolean
}

type CalendarType = 'month' | 'week' | 'day' | '4day'
type EventOverlapMode = 'stack' | 'column'

const type = ref<CalendarType>('month')

const types: CalendarType[] = [
  'month',
  'week',
  'day',
  '4day',
]

const mode = ref<EventOverlapMode>('stack')

const modes: EventOverlapMode[] = [
  'stack',
  'column',
]

const value = ref('')

const events = ref<CalendarEvent[]>([])

const colors = [
  'blue',
  'indigo',
  'deep-purple',
  'cyan',
  'green',
  'orange',
  'grey-darken-1',
]

const names = [
  'Meeting',
  'Holiday',
  'PTO',
  'Travel',
  'Event',
  'Birthday',
  'Conference',
  'Party',
]

function rnd (a: number, b: number) {
  return Math.floor(
    (b - a + 1) * Math.random(),
  ) + a
}

interface CalendarChange {
  start: {
    date: string
  }
  end: {
    date: string
  }
}

function getEvents ({
  start,
  end,
}: CalendarChange) {
  const evts: CalendarEvent[] = []

  const min = new Date(
    `${start.date}T00:00:00`,
  )

  const max = new Date(
    `${end.date}T23:59:59`,
  )

  const days
    = (max.getTime() - min.getTime())
      / 86_400_000

  const eventCount = rnd(
    days,
    days + 20,
  )

  for (let i = 0; i < eventCount; i++) {
    const allDay = rnd(0, 3) === 0

    const firstTimestamp = rnd(
      min.getTime(),
      max.getTime(),
    )

    const first = new Date(
      firstTimestamp - (firstTimestamp % 900_000),
    )

    const secondTimestamp
      = rnd(
        2,
        allDay ? 288 : 8,
      ) * 900_000

    const second = new Date(
      first.getTime() + secondTimestamp,
    )

    evts.push({
      name: names[rnd(0, names.length - 1)],
      start: first,
      end: second,
      color: colors[rnd(0, colors.length - 1)],
      timed: !allDay,
    })
  }

  events.value = evts
}

function getEventColor (event: { color?: string }) {
  return event.color
}

/**
 * v-calendar实例
 */
interface CalendarRef {
  prev: () => void
  next: () => void
}

const calendar = ref<CalendarRef | null>(null)

</script>
