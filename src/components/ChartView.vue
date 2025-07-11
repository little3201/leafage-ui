<template>
  <div ref="elRef" :style="styles"></div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, onActivated } from 'vue'
import { useQuasar, debounce, is } from 'quasar'
import ApexCharts from 'apexcharts'


const $q = useQuasar()

const props = withDefaults(defineProps<{
  options: ApexCharts.ApexOptions
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

let chartRef: ApexCharts | null = null

const styles = computed(() => {
  const width = is.number(props.width) ? `${props.width}px` : props.width
  const height = is.number(props.height) ? `${props.height}px` : props.height

  return {
    width,
    height
  }
})

const initChart = () => {
  if (elRef.value && props.options) {
    // 销毁旧图表，防止重复渲染
    if (chartRef) {
      chartRef.destroy()
    }
    chartRef = new ApexCharts(elRef.value, options.value)
    chartRef?.render()
  }
}

watch(
  () => options.value,
  (options) => {
    if (chartRef) {
      // 第二个参数 true 表示对图表强制更新
      chartRef?.updateOptions(options, true, false)
    }
  },
  {
    deep: true
  }
)

const resizeHandler = debounce(() => {
  if (chartRef) {
    chartRef.updateOptions(options.value, true, false)
  }
}, 100)

const contentResizeHandler = (e: TransitionEvent): void => {
  if (e.propertyName === 'width') {
    resizeHandler()
  }
}

onMounted(() => {
  initChart()

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

  if (chartRef) {
    chartRef.destroy()
  }
})

onActivated(() => {
  if (chartRef) {
    resizeHandler()
  }
})
</script>
