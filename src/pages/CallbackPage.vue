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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import { Cookies } from 'quasar'
import { signIn, handleCallback } from 'src/api/authentication'


const { replace } = useRouter()
const userStore = useUserStore()

onMounted(() => {
  handleCallback().then(res => {
    if (res) {
      // 回调成功，删除code_verifier
      localStorage.removeItem('code_verifier')
      userStore.$patch({
        accessToken: res.data.access_token,
        idToken: res.data.id_token
      })
      // 路由跳转
      replace(Cookies.get('current_page') || '/')
    }
  }).catch(() => {
    // 回调失败，登录
    signIn()
  })
})
</script>