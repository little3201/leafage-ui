<template>
  <q-btn title="translate" icon="sym_r_translate" round flat dense>
    <q-menu>
      <q-list dense separator>
        <q-item clickable v-close-popup v-for="option in langOptions" :key="option.value"
          :active="locale === option.value" @click="changeLocale(option.value)">
          <q-item-section>{{ option.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, Cookies } from 'quasar'
import languages from 'quasar/lang/index.json'
import type { QuasarLanguage } from 'quasar'

const $q = useQuasar()

const { locale } = useI18n({ useScope: 'global' })
locale.value = Cookies.get('lang') || $q.lang.isoName
const modules = import.meta.glob('../../node_modules/quasar/lang/(en-US|zh-CN|zh-TW).js')


const langOptions = languages.filter(lang => ['en-US', 'zh-CN', 'zh-TW'].includes(lang.isoName))
  .map(lang => ({ label: lang.nativeName, value: lang.isoName }))

watch(locale, async (val) => {
  const loadLangModule = modules[`../../node_modules/quasar/lang/${val}.js`]
  if (loadLangModule) {
    const langModule = await loadLangModule()
    $q.lang.set((langModule as { default: QuasarLanguage }).default)
  }
})

function changeLocale(langIso: string) {
  locale.value = langIso
  Cookies.set('lang', langIso, { secure: true, sameSite: 'Lax' })
  // set html lang
  const htmlElement = document.querySelector('html')
  if (htmlElement) {
    htmlElement.setAttribute('lang', langIso)
  }
}
</script>
