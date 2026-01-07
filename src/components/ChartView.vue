<template>
  <div ref="elRef" :style="styles"></div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import ApexCharts from 'apexcharts'
import { debounce, is, useQuasar } from 'quasar'
import { computed, onActivated, onBeforeUnmount, onMounted, ref, watch } from 'vue'


const $q = useQuasar()

const props = withDefaults(defineProps<{
  options: ApexOptions
  width?: number | string
  height?: number | string
}>(), {
  width: '100%',
  height: '400px'
})

const options = computed(() => ({
  ...props.options,
  theme: {
    mode: $q.dark.isActive ? 'dark' : 'light'
  }
}))

const elRef = ref<HTMLElement | null>(null)
let chart: ApexCharts

const styles = computed(() => {
  const width = is.number(props.width) ? `${props.width}px` : props.width
  const height = is.number(props.height) ? `${props.height}px` : props.height

  return {
    width,
    height
  }
})

const initChart = async () => {
  if (elRef.value && props.options) {
    // 销毁旧图表，防止重复渲染
    if (chart) {
      chart.destroy()
    }
    chart = new ApexCharts(elRef.value, options.value)
    await chart?.render()
  }
}

watch(
  () => options.value,
  async (options) => {
    if (chart) {
      // 第二个参数 true 表示对图表强制更新
      await chart?.updateOptions(options, true, false)
    }
  },
  {
    deep: true
  }
)

const resizeHandler = debounce(async () => {
  if (chart) {
    await chart.updateOptions(options.value, true, false)
  }
}, 100)

const contentResizeHandler = (e: TransitionEvent): void => {
  if (e.propertyName === 'width') {
    resizeHandler()
  }
}

onMounted(async () => {
  await initChart()

  window.addEventListener('resize', resizeHandler)
  if (elRef.value) {
    (elRef.value).addEventListener('transitionend', contentResizeHandler as (event: Event) => void)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  if (elRef.value) {
    (elRef.value as Element).removeEventListener('transitionend', contentResizeHandler as (event: Event) => void)
  }

  if (chart) {
    chart.destroy()
  }
})

onActivated(() => {
  if (chart) {
    resizeHandler()
  }
})
</script>
