<script setup lang="ts">
import { useRouter } from 'vue-router'
import notFound from 'src/assets/404.svg'

const router = useRouter()
</script>

<template>
  <ElContainer class="h-screen">
    <ElMain class="flex-col tems-center justify-center">
      <ElImage :alt="404" :src="notFound" class="w-1/3 mx-auto" />
      <div class="text-center">
        <div class="text-2xl text-(--el-color-info)">Oops. Nothing here...</div>
        <div class="mt-8">
          <ElButton size="large" type="primary" @click="router.push('/')">{{ $t('action.goHome') }}</ElButton>
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
