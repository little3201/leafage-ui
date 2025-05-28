<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Cookies from 'universal-cookie'
import { localeOptions } from 'src/i18n'
import { Icon } from '@iconify/vue'


const { locale } = useI18n({ useScope: 'global' })
const cookies = new Cookies(null, { path: '/' })
locale.value = cookies.get('lang') || 'zh-CN'

function changeLocale(lang: string) {
  locale.value = lang
  // 设置lang
  cookies.set('lang', lang, { secure: true, sameSite: 'lax' })
  // 修改html中lang
  const htmlElement = document.querySelector('html')

  if (htmlElement) {
    htmlElement.setAttribute('lang', lang)
  }
}
</script>

<template>
  <ElDropdown trigger="click" @command="changeLocale">
    <ElButton title="language" type="default" link>
      <Icon icon="material-symbols:translate" class="text-white" width="22" height="22" />
    </ElButton>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem v-for="item in localeOptions" :key="item.value" :command="item.value">
          {{ item.label }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
