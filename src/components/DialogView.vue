<script setup lang="ts">
import { computed, useAttrs, ref, useSlots } from 'vue'
import type { Slot } from 'vue'
import { isNumber } from 'src/utils'
import { ElButton } from 'element-plus'
import { Icon } from '@iconify/vue'

const slots: { [key: string]: Slot | undefined } = useSlots()

interface Props {
  [key: string]: string | number | boolean | undefined
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  maxHeight?: string | number,
  showFullScreen?: boolean
  showClose?: boolean
}>(), {
  modelValue: false,
  showFullScreen: false,
  showClose: false
})

const getBindValue = computed(() => {
  const delArr: string[] = ['title', 'maxHeight']
  const attrs = useAttrs()
  const obj: Props = { ...attrs, ...props }
  for (const key in obj) {
    if (delArr.indexOf(key) !== -1) {
      delete obj[key]
    }
  }
  return obj
})

const fullScreen = ref(false)

const toggleFull = () => {
  fullScreen.value = !fullScreen.value
}

const dialogStyle = computed(() => {
  const innerHeight = slots.footer ? 120 : 72
  const maxHeight = window.innerHeight - innerHeight

  let height = '100%';
  const propMaxHeight = props.maxHeight

  if (propMaxHeight) {
    const parsedMaxHeight = isNumber(propMaxHeight)
      ? propMaxHeight
      : propMaxHeight.includes('px')
        ? Number(propMaxHeight.replace('px', ''))
        : propMaxHeight.includes('%')
          ? Number(propMaxHeight.replace('%', '')) / 100 * maxHeight
          : null

    if (parsedMaxHeight !== null) {
      height = parsedMaxHeight > maxHeight ? `${maxHeight}px` : `${parsedMaxHeight}px`;
    }
  }

  // 当全屏显示时，强制设置为 maxHeight
  if (fullScreen.value) {
    height = `${maxHeight}px`;
  }

  return { height }
})

</script>

<template>
  <ElDialog v-bind="getBindValue" :fullscreen="fullScreen" align-center destroy-on-close lock-scroll draggable
    append-to-body :close-on-click-modal="false" :show-close="showClose">
    <template #header>
      <slot name="title">
        <span>{{ title }}</span>
      </slot>
      <ElButton v-if="showFullScreen" @click="toggleFull"
        :class="['absolute top-1.5 !border-none !border-0 !bg-transparent', showClose ? 'right-8 ' : 'right-1']">
        <Icon :icon="`material-symbols:${fullScreen ? 'fullscreen-exit-rounded' : 'fullscreen-rounded'}`" width="18"
          height="18" class="el-dialog__close" />
      </ElButton>
    </template>

    <ElScrollbar :style="dialogStyle" :noresize="!showFullScreen">
      <slot></slot>
    </ElScrollbar>

    <template v-if="slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </ElDialog>
</template>
