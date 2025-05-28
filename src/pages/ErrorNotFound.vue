<script setup lang="ts">
import { useRouter } from 'vue-router'

const { push } = useRouter()
</script>

<template>
  <ElContainer class="h-screen">
    <ElMain class="flex-col tems-center justify-center">
      <ElImage :alt="404" src="/svgs/404.svg" class="w-1/3 mx-auto" />
      <div class="text-center">
        <div class="text-2xl text-[var(--el-color-info)]">Oops. Nothing here...</div>
        <div class="mt-8">
          <ElButton size="large" type="primary" @click="push('/')">{{ $t('goHome') }}</ElButton>
        </div>
      </div>
    </ElMain>
  </ElContainer>
</template>

<style lang="scss" scoped>
.el-main {
  display: flex;
}
</style>
