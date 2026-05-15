<script setup lang="ts">
import { Icon } from '@iconify/vue'
import EssentialList from 'components/EssentialList.vue'
import LanguageSelector from 'components/LanguageSelector.vue'
import ThemeToogle from 'components/ThemeToogle.vue'
import { signOut } from 'src/api/authentication'
import logo from 'src/assets/logo.svg'
import { useUserStore } from 'stores/user-store'
import { useRouter } from 'vue-router'


const { currentRoute } = useRouter()
const userStore = useUserStore()

const user = {
  username: userStore.username,
  fullName: userStore.fullName,
  privileges: userStore.privileges
}

function logout() {
  userStore.$reset()
  signOut()
}
</script>

<template>
  <ElHeader class="fixed top-0 left-0 right-0 flex flex-nowrap bg-(--el-color-primary) z-10">
    <div class="inline-flex grow justify-between">
      <div class="inline-flex items-center">
        <ElImage :src="logo" alt="avatar" class="w-8 h-8" />
        <h3 class="ml-3 text-white">Project Management</h3>
      </div>

      <div class="inline-flex justify-end items-center space-x-4">
        <ThemeToogle />
        <LanguageSelector />
        <ElDropdown trigger="click" class="cursor-pointer">
          <div class="inline-flex items-center">
            <ElAvatar alt="avatar" :size="32" :src="`https://cdn.leafage.top/${user.username}`" />
            <span class="ml-2 text-white">{{ user.fullName }}</span>
          </div>
          <template #dropdown>
            <div class="flex items-center space-x-2 p-4">
              <ElAvatar alt="avatar" :size="32" :src="`https://cdn.leafage.top/${user.username}`" />
              <div class="inline-flex flex-col">
                <span>{{ user.fullName }}</span>
                <span class="text-xs text-(--el-text-color-secondary)">{{ user.username }}</span>
              </div>
            </div>
            <ElDropdownMenu>
              <RouterLink to="/profile" class="no-underline">
                <ElDropdownItem>
                  <Icon icon="material-symbols:manage-accounts-rounded" width="1.5em" height="1.5em" class="mr-2" />
                  {{ $t('page.profile') }}
                </ElDropdownItem>
              </RouterLink>
              <RouterLink to="/faq" class="no-underline">
                <ElDropdownItem>
                  <Icon icon="material-symbols:help-outline-rounded" width="1.5em" height="1.5em" class="mr-2" />
                  {{ $t('page.faq') }}
                </ElDropdownItem>
              </RouterLink>
              <ElDropdownItem divided @click="logout">
                <Icon icon="material-symbols:logout-rounded" width="1.5em" height="1.5em" class="mr-2" />
                {{ $t('action.signout') }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </div>
  </ElHeader>

  <ElAside class="fixed top-15">
    <ElScrollbar>
      <ElMenu router unique-opened :default-active="currentRoute.fullPath">
        <ElMenuItem :index="'/'">
          <Icon icon="material-symbols:home-outline-rounded" width="1.25em" height="1.25em" class="mr-2" />{{
            $t('page.home') }}
        </ElMenuItem>
        <template v-for="link in user.privileges" :key="link.id">
          <EssentialList v-if="link.children && link.children.length > 0" :essentialLink="link"
            :parent-path="`/${link.meta.path}`" />
          <ElMenuItem v-else :index="`/${link.meta.path}`">
            <Icon :icon="`material-symbols:${link.meta.icon}-rounded`" width="1.25em" height="1.25em" class="mr-2" />
            {{ $t(`page.${link.name}`) }}
          </ElMenuItem>
        </template>
      </ElMenu>
    </ElScrollbar>
  </ElAside>

  <ElMain class="bg-(--el-bg-color-page) min-h-[calc(100vh-120px)] ml-(--el-aside-width) mt-15">
    <RouterView />
  </ElMain>

  <ElFooter class="bg-(--el-bg-color-page) ml-(--el-aside-width) text-center">
    <div class="text-sm mb-2 space-x-4">
      <a href="/privacy" class="text-(--el-text-color-regular) no-underline hover:underline">隐私政策</a>
      <a href="/terms" class="text-(--el-text-color-regular) no-underline hover:underline">使用条款</a>
      <a href="/legal" class="text-(--el-text-color-regular) no-underline hover:underline">法律信息</a>
    </div>
    <span class="text-sm text-(--el-text-color-regular)">Copyright &copy; 2018-{{ new Date().getFullYear() }}
      Leafage. All Rights Reserved.</span>
  </ElFooter>
</template>
