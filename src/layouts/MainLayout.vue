<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import ThemeToogle from 'components/ThemeToogle.vue'
import LanguageSelector from 'components/LanguageSelector.vue'
import EssentialList from 'components/EssentialList.vue'
import { signIn, signOut } from 'src/api/authentication'
import { Icon } from '@iconify/vue'
import logo from 'src/assets/logo.svg'


const router = useRouter()
const { currentRoute } = useRouter()
const userStore = useUserStore()

const cdn_url = import.meta.env.VITE_APP_CDN_URL
const user = {
  username: userStore.username,
  fullName: userStore.fullName,
  privileges: userStore.privileges
}

const isCollapse = ref(false)

async function logout() {
  const res = await signOut()
  if (res && res.status === 200) {
    userStore.$reset()
    signIn()
  }
}
</script>

<template>
  <ElHeader class="fixed top-0 left-0 right-0 flex flex-nowrap bg-(--el-color-primary) z-10" height="50px">
    <div class="inline-flex grow justify-between">
      <div class="inline-flex items-center">
        <ElImage :src="logo" alt="avatar" class="w-8 h-8" />
        <span class="ml-3 text-20px font-bold text-white">Project Management</span>
        <ElButton link class="ml-8" @click="isCollapse = !isCollapse">
          <Icon icon="material-symbols:menu" class="text-white" width="1.5em" height="1.5em" />
        </ElButton>
      </div>

      <div class="inline-flex justify-end items-center space-x-4">
        <ThemeToogle />
        <LanguageSelector />
        <ElButton title="faq" type="default" link @click="router.push('/faq')">
          <Icon icon="material-symbols:help-outline-rounded" class="text-white" width="22" height="22" />
        </ElButton>
        <ElDropdown trigger="click" class="cursor-pointer">
          <div class="inline-flex items-center">
            <ElAvatar alt="avatar" :size="32" :src="`${cdn_url}/${user.username}`" />
            <span class="ml-2 text-white">{{ user.username }}</span>
          </div>
          <template #dropdown>
            <div class="flex items-center space-x-2 p-4">
              <ElAvatar alt="avatar" :size="32" :src="`${cdn_url}/${user.username}`" />
              <div class="inline-flex flex-col">
                <span>{{ user.username }}</span>
                <span class="text-xs text-(--el-text-color-secondary)">{{ user.fullName }}</span>
              </div>
            </div>
            <ElDropdownMenu>
              <RouterLink to="/profile" class="no-underline">
                <ElDropdownItem>
                  <Icon icon="material-symbols:manage-accounts-rounded" width="1.25em" height="1.25em" class="mr-2" />
                  {{ $t('page.profile') }}
                </ElDropdownItem>
              </RouterLink>
              <ElDropdownItem divided @click="logout">
                <Icon icon="material-symbols:logout-rounded" width="1.25em" height="1.25em" class="mr-2" />
                {{ $t('action.signout') }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </div>
  </ElHeader>

  <ElAside class="fixed top-12.5 left-0" width="200px">
    <ElScrollbar>
      <ElMenu router unique-opened class="el-menu-collapse" :default-active="currentRoute.fullPath">
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

  <ElMain class="bg-(--el-bg-color-page) min-h-[calc(100vh-100px)] ml-50 mt-12.5">
    <RouterView />
  </ElMain>

  <ElFooter height="50px" class="bg-(--el-bg-color-page) ml-50 text-center pt-4!">
    <span class="text-sm">Copyright &copy; {{ new Date().getFullYear() }} Leafage. All Rights Reserved.</span>
  </ElFooter>
</template>
