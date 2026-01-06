<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, onActivated } from 'vue'
import { useDark, useEventListener } from '@vueuse/core'
import ApexCharts from 'apexcharts'
import { isNumber } from 'src/utils'

const props = withDefaults(defineProps<{
  options: ApexCharts.ApexOptions // 使用 ApexCharts 的配置类型
  width?: number | string
  height?: number | string
}>(), {
  width: '100%',
  height: '400px'
})

const options = computed(() => {
  return Object.assign({}, props.options, {
    theme: {
      mode: useDark().value ? 'dark' : 'light'
    }
  })
})

const elRef = ref<HTMLElement | null>(null)

let chartRef: ApexCharts | null = null

const styles = computed(() => {
  const width = isNumber(props.width) ? `${props.width}px` : props.width
  const height = isNumber(props.height) ? `${props.height}px` : props.height

  return {
    width,
    height
  }
})

const initChart = async () => {
  if (elRef.value && props.options) {
    // 销毁旧图表，防止重复渲染
    if (chartRef) {
      chartRef.destroy()
    } else {
      chartRef = new ApexCharts(elRef.value, options.value)
    }
    await chartRef.render()
  }
}

watch(
  () => options.value,
  async (options) => {
    if (chartRef) {
      // 第二个参数 true 表示对图表强制更新
      await chartRef.updateOptions(options, true, false)
    }
  },
  {
    deep: true
  }
)

const resizeHandler = () => {
  if (chartRef) {
    chartRef.destroy()
    void initChart()
  }
}

useEventListener(document, 'transitionend', (evt) => {
  if (elRef.value && evt.propertyName === 'width') {
    resizeHandler()
  }
})

onMounted(async () => {
  await initChart()
})

onBeforeUnmount(() => {
  if (chartRef) {
    chartRef.destroy()
  }
})

onActivated(() => {
  if (chartRef) {
    void resizeHandler()
  }
})
</script>

<template>
  <div ref="elRef" :style="styles"></div>
</template>
