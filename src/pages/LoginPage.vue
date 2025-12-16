<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElFormItem, ElImage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { SERVER_URL } from 'src/constants'
import ThemeToogle from 'components/ThemeToogle.vue'
import LanguageSelector from 'components/LanguageSelector.vue'
import logo from 'src/assets/logo.svg'
import hello from 'src/assets/hello_ccwj.svg'


const { t } = useI18n()
const router = useRouter()

const loading = ref<boolean>(false)
const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const rules = reactive<FormRules<typeof form>>({
  username: [
    { required: true, message: t('placeholder.inputText', { field: t('username') }), trigger: 'blur' },
    { min: 5, max: 12, message: t('placeholder.lengthRange', { min: 5, max: 12 }), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('placeholder.inputText', { field: t('password') }), trigger: 'blur' },
    { min: 8, max: 32, message: t('placeholder.lengthRange', { min: 8, max: 32 }), trigger: 'blur' }
  ]
})

async function onSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await api.get(SERVER_URL.LOGIN)
        await router.replace('/')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <ElContainer class="h-screen relative overflow-hidden bg---el-color-primary-light-9) dark:bg-(--el-bg-color-page)">
    <figure class="absolute bg-primary-gradient rounded-full"
      style="height: 31em; width: 31em;  top: -14em; right: -12em; ">
    </figure>
    <figure class="absolute bg-success-gradient rounded-full"
      style="height: 19em; width: 19em; bottom: 6em; right: -7em; ">
    </figure>
    <figure class="absolute bg-warning-gradient rounded-full"
      style="height: 40em; width: 40em; bottom: -17em; left: -15em;">
    </figure>
    <figure class="absolute bg-error-gradient rounded-full"
      style="height: 19em;  width: 19em; bottom: -12em; left: 12em; ">
    </figure>

    <ElHeader class="flex flex-nowrap items-center z-10" height="50px">
      <div class="inline-flex flex-1 justify-end items-center space-x-4">
        <!-- language -->
        <LanguageSelector />
        <!-- theme -->
        <ThemeToogle />
      </div>
    </ElHeader>
    <ElMain class="items-center justify-center z-10">
      <Transition appear name="el-zoom-in-center">
        <ElCard class="w-full lg:w-1/2 xl:w-2/3" style="height: 70vh;border-radius: 1.5rem;"
          body-class="flex items-center !p-0 h-full">
          <div class="hidden xl:flex flex-col items-center h-full w-1/2  ">
            <div class="inline-flex grow flex-col items-center justify-center w-full">
              <ElImage :src="hello" alt="hello" class="m-24" />
              <div>
                <p class="font-bold text-xl text-left">
                  {{ $t('tips.welcome') }}
                </p>
                <p class="text-subtitle1">
                  {{ $t('tips.subtitle') }}
                </p>
              </div>
            </div>
          </div>
          <div
            class="flex flex-row items-center w-full xl:w-1/2 h-full bg-(--el-color-primary-light-9) dark:bg-transparent">
            <div class="inline-flex flex-col w-full h-full space-y-2xl justify-center items-center">
              <div class="text-center">
                <ElImage :src="logo" alt="logo" class="w-24 h-24" />
              </div>
              <div class="text-lg font-bold text-center mb-xs">
                {{ $t('signinTo') }}
              </div>
              <ElForm ref="formRef" :model="form" :rules="rules" @submit.prevent="onSubmit"
                class="bg-transparent max-w-lg w-full my-6 space-y-4">
                <ElRow>
                  <ElCol>
                    <ElFormItem prop="username">
                      <ElInput size="large" :disable="loading" v-model="form.username" :placeholder="$t('username')">
                        <template #prefix>
                          <Icon icon="material-symbols:person-outline-rounded" width="18" height="18" />
                        </template>
                      </ElInput>
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElRow>
                  <ElCol>
                    <ElFormItem prop="password">
                      <ElInput size="large" :disable="loading" type="password" v-model="form.password"
                        :placeholder="$t('password')" show-password>
                        <template #prefix>
                          <Icon icon="material-symbols:key-vertical-outline-rounded" width="18" height="18" />
                        </template>
                      </ElInput>
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElRow>
                  <ElCol>
                    <ElFormItem>
                      <ElButton title="signin" size="large" type="primary" :loading="loading" class="w-full"
                        native-type="submit">
                        {{ $t('signin') }}
                      </ElButton>
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </ElForm>
            </div>

          </div>
        </ElCard>
      </Transition>
    </ElMain>
    <ElFooter class="z-10" height="50px">
      <p class="text-sm text-center">
        Copyright &copy; {{ new Date().getFullYear() }} Leafage. All Rights Reserved.
      </p>
    </ElFooter>
  </ElContainer>
</template>

<style lang="scss" scoped>
.el-main {
  display: flex;
}

.el-form-item {
  margin-bottom: 18px;
}
</style>
