<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import Cookies from 'universal-cookie'
import { signIn, handleCallback } from 'src/api/authentication'


const { replace } = useRouter()
const userStore = useUserStore()
const cookies = new Cookies(null, { path: '/' })

const loading = ref(true)

onMounted(() => {
  handleCallback().then(res => {
    if (res) {
      // 回调成功，删除code_verifier
      localStorage.removeItem('code_verifier')
      userStore.$patch({
        accessToken: res.data.access_token,
        idToken: res.data.id_token
      })
      loading.value = false
      // 路由跳转
      replace(cookies.get('current_page') || '/')
    }
  }).catch(() => {
    // 回调失败，登录
    signIn()
  })
})
</script>

<template>
  <ElContainer class="h-screen">
    <ElMain v-loading="loading"></ElMain>
  </ElContainer>
</template>
