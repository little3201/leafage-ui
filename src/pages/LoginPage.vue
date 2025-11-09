<template>
  <q-layout :class="['overflow-hidden', $q.dark.isActive ? '' : 'bg-light-blue-1']">
    <q-header :class="['transparent', $q.dark.isActive ? '' : 'text-black']">
      <q-toolbar>
        <q-space />
        <!-- theme -->
        <ThemeToogle class="q-mx-sm" />
        <!-- language -->
        <LanguageSelector />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page padding class="row justify-center items-center">

        <figure class="absolute bg-primary-gradient"
          style="height: 35em; width: 35em;  top: -19em; right: -14em; border-radius: 50%;" />
        <figure class="absolute bg-positive-gradient"
          style="height: 21em; width: 21em; bottom: 4em; right: -7em; border-radius: 50%;" />
        <figure class="absolute bg-warning-gradient"
          style="height: 42em; width: 42em; bottom: -19em; left: -14em; border-radius: 50%;" />
        <figure class="absolute bg-negative-gradient"
          style="height: 21em;  width: 21em; bottom: -16em; left: 14em; border-radius: 50%;" />

        <q-card bordered class="column justify-center items-center shadow-12 overflow-hidden"
          style="height: 70vh; border-radius: 20px;" :style="{ width: $q.screen.lt.sm ? '100%' : '65vw' }">
          <q-card-section horizontal :class="['full-height', $q.screen.lt.md ? 'hidden' : '']" style="width: 50%;">
            <transition appear enter-active-class="animated slideInLeft" leave-active-class="animated slideOutLeft">
              <div class="column inline justify-center items-center" style="margin-top: -60px">
                <canvas ref="lottieRef" style="height: 32em; width: 32em" />
                <div class="column q-gutter-y-xs">
                  <span class="text-weight-bold text-h5" style="margin-top: -20px">
                    {{ $t('welcome') }}
                  </span>
                  <span class="text-subtitle1">
                    {{ $t('subtitle') }}
                  </span>
                </div>
              </div>
            </transition>
          </q-card-section>
          <q-separator vertical />
          <q-card-section horizontal class="full-height no-border-radius"
            :style="{ width: $q.screen.lt.md ? '100%' : '50%' }" :class="$q.dark.isActive ? '' : 'bg-light-blue-1'">
            <transition appear enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight">
              <div class="column justify-center items-center full-width">
                <div class="text-center">
                  <q-img alt="logo" :src="logo" width="8em" height="8em" />
                </div>
                <div class="text-h6 text-center q-mb-xs">
                  {{ $t('signinTo') }}
                </div>
                <q-form @submit="onSubmit" class="q-mt-md full-width q-px-xl">
                  <q-input :disable="loading" dense no-error-icon v-model.trim="form.username"
                    :placeholder="$t('username')"
                    :rules="[(val) => (val && val.length >= 5 && val.length <= 12) || $t('username')]">
                    <template #prepend>
                      <q-icon name="sym_r_person" />
                    </template>
                  </q-input>
                  <q-input :disable="loading" dense no-error-icon :type="showPwd ? 'password' : 'text'"
                    v-model.trim="form.password" :placeholder="$t('password')"
                    :rules="[(val) => (val && val.length >= 8 && val.length <= 32) || $t('password')]">
                    <template #prepend>
                      <q-icon name="sym_r_key_vertical" />
                    </template>
                    <template v-slot:append>
                      <q-icon size="xs" :name="showPwd ? 'sym_r_visibility_off' : 'sym_r_visibility'"
                        class="cursor-pointer" @click="showPwd = !showPwd" />
                    </template>
                  </q-input>
                  <q-checkbox :disable="loading" v-model="rememberMe" :label="$t('rememberMe')" dense
                    @update:model-value="changeRememberMe" class="q-my-md" />
                  <q-btn title="signin" no-caps rounded glossy :label="$t('signin')" type="submit" color="primary"
                    :loading="loading" class="full-width" />
                </q-form>
              </div>
            </transition>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
    <q-footer class="bg-transparent text-center" :class="$q.dark.isActive ? 'text-white' : 'text-black'">
      <p :class="{ 'text-white': $q.dark.isActive }">Copyright &copy; {{ new Date().getFullYear() }}
        All Rights Reserved.</p>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DotLottie } from '@lottiefiles/dotlottie-web'
import { useQuasar } from 'quasar'
import LanguageSelector from 'components/LanguageSelector.vue'
import ThemeToogle from 'components/ThemeToogle.vue'
import { signIn } from 'src/api/authentication'
import logo from 'src/assets/logo.svg'


const $q = useQuasar()

const showPwd = ref<boolean>(true)
const rememberMe = ref<boolean>(false)
const loading = ref<boolean>(false)
const lottieRef = ref<HTMLCanvasElement | null>(null)

const form = ref({
  username: '',
  password: ''
})

onMounted(() => {
  load()
})

function changeRememberMe(value: boolean) {
  return value
}

async function onSubmit() {
  loading.value = true
  signIn()
}

function load() {
  if (lottieRef.value) {
    new DotLottie({
      canvas: lottieRef.value,
      loop: true,
      autoplay: true,
      src: '/1707289607880.lottie',
      renderConfig: {
        autoResize: true
      }
    })
  }
}
</script>
