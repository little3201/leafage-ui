<template>
  <q-layout>
    <q-page-container class="h-screen">
      <q-page class="flex flex-center">
        <q-spinner color="primary" size="xl" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { handleCallback, signIn } from 'src/api/authentication'
import { useUserStore } from 'src/stores/user'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  const res = await handleCallback()
  if (res && res.status === 200) {
    userStore.$patch({
      accessToken: res.data.access_token,
      idToken: res.data.id_token
    })
    // 路由跳转
    await router.replace('/')
  } else {
    await signIn()
  }
})
</script>