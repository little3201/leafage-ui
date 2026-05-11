<template>
  <q-btn flat round dense :icon="$q.dark.isActive ? 'sym_r_dark_mode' : 'sym_r_light_mode'"
    @click="handleChange(!$q.dark.isActive)" />
</template>

<script setup lang="ts">
import { Cookies, useQuasar } from 'quasar'

const $q = useQuasar()
$q.dark.set(Cookies.get('theme') === 'dark')

function handleChange(value: boolean) {
  Cookies.set('theme', value ? 'dark' : 'light', { secure: true, sameSite: 'Lax' })
  $q.dark.set(value)
}
</script>
