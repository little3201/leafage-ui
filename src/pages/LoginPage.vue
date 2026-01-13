<template>
  <q-layout :class="['overflow-hidden', $q.dark.isActive ? '' : 'bg-light-blue-1']">
    <q-header :class="['transparent', $q.dark.isActive ? '' : 'text-black']">
      <q-toolbar>
        <q-space />

        <ThemeToogle class="q-mx-sm" />
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

        <q-card bordered class="row justify-center items-center q-col-gutter-x-xl shadow-12 overflow-hidden"
          style="height: 60vh; border-radius: 20px;" :style="{ width: $q.screen.lt.sm ? '100%' : '60vw' }">
          <q-card-section horizontal :class="[$q.screen.lt.md ? 'hidden' : 'col-6']">
            <transition appear enter-active-class="animated slideInLeft" leave-active-class="animated slideOutLeft">
              <div class="column inline justify-center items-center full-width q-px-xl">
                <q-img :src="hello" alt="hello" width="100%" height="auto" />
                <div class="column q-mt-md">
                  <span class="text-weight-bold text-h5">
                    {{ $t('tips.welcome') }}
                  </span>
                  <span class="text-subtitle1">
                    {{ $t('tips.subtitle') }}
                  </span>
                </div>
              </div>
            </transition>
          </q-card-section>

          <q-card-section horizontal class="full-height no-border-radius"
            :class="[$q.screen.lt.md ? 'col-12' : 'col-6', $q.dark.isActive ? '' : 'bg-light-blue-1']">
            <transition appear enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight">
              <div class="column justify-center items-center full-width">
                <div class="text-center">
                  <q-img alt="logo" :src="logo" width="8em" height="8em" />
                </div>
                <div class="text-h6 text-center q-mb-xs">
                  {{ $t('message.signinTo') }}
                </div>
                <q-form @submit="onSubmit" class="q-mt-md q-px-xl" style="width: 600px;">
                  <q-input :disable="loading" dense no-error-icon v-model.trim="form.username"
                    :placeholder="$t('label.username')"
                    :rules="[(val) => (val && val.length >= 5 && val.length <= 12) || $t('label.username')]">
                    <template #prepend>
                      <q-icon name="sym_r_person" />
                    </template>
                  </q-input>
                  <q-input :disable="loading" dense no-error-icon :type="showPwd ? 'password' : 'text'"
                    v-model.trim="form.password" :placeholder="$t('label.password')"
                    :rules="[(val) => (val && val.length >= 8 && val.length <= 32) || $t('label.password')]">
                    <template #prepend>
                      <q-icon name="sym_r_key_vertical" />
                    </template>
                    <template v-slot:append>
                      <q-icon size="xs" :name="showPwd ? 'sym_r_visibility_off' : 'sym_r_visibility'"
                        class="cursor-pointer" @click="showPwd = !showPwd" />
                    </template>
                  </q-input>
                  <q-btn title="signin" no-caps rounded glossy :label="$t('action.signin')" type="submit"
                    color="primary" :loading="loading" class="full-width q-mt-md" />
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
import LanguageSelector from 'components/LanguageSelector.vue'
import ThemeToogle from 'components/ThemeToogle.vue'
import { useQuasar } from 'quasar'
import { signIn } from 'src/api/authentication'
import hello from 'src/assets/hello_ccwj.svg'
import logo from 'src/assets/logo.svg'
import { ref } from 'vue'


const $q = useQuasar()

const showPwd = ref<boolean>(true)
const loading = ref<boolean>(false)

const form = ref({
  username: '',
  password: ''
})

async function onSubmit() {
  loading.value = true
  await signIn()
}
</script>
