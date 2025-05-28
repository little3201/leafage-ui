<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import ThemeToogle from 'components/ThemeToogle.vue'
import LanguageSelector from 'components/LanguageSelector.vue'
import EssentialList from 'components/EssentialList.vue'
import { signOut } from 'src/api/authentication'
import { Icon } from '@iconify/vue'


const { push, currentRoute } = useRouter()
const userStore = useUserStore()
</script>

<template>
  <ElHeader class="fixed top-0 left-0 right-0 flex flex-nowrap bg-[var(--el-color-primary)] z-10" height="50px">
    <div class="inline-flex flex-grow justify-between">
      <div class="inline-flex items-center">
        <ElImage src="/svgs/logo.svg" alt="avatar" class="w-8 h-8" />
        <span class="ml-3 text-20px font-bold text-white">Project Management</span>
      </div>

      <div class="inline-flex justify-end items-center space-x-2">
        <!-- theme -->
        <ThemeToogle />
        <!-- language -->
        <LanguageSelector />
        <!-- faq -->
        <ElButton title="faq" type="default" link @click="push('/faq')">
          <Icon icon="material-symbols:help-outline-rounded" class="text-white" width="22" height="22" />
        </ElButton>
        <ElDropdown trigger="click" class="cursor-pointer">
          <div class="inline-flex items-center">
            <ElAvatar alt="avatar" :size="28" :src="userStore.avatar" />
            <span class="ml-2 text-white">{{ userStore.username }}</span>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <RouterLink to="/profile" class="no-underline">
                <ElDropdownItem>
                  <Icon icon="material-symbols:manage-accounts-rounded" width="18" height="18" class="mr-2" />
                  {{ $t('profile') }}
                </ElDropdownItem>
              </RouterLink>
              <ElDropdownItem divided @click="signOut(userStore.idToken)">
                <Icon icon="material-symbols:logout-rounded" width="18" height="18" class="mr-2" />
                {{ $t('signout') }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </div>
  </ElHeader>

  <ElAside class="fixed top-[50px] left-0" width="200px">
    <ElScrollbar>
      <ElMenu router unique-opened :default-active="currentRoute.fullPath">
        <ElMenuItem :index="'/'">
          <Icon icon="material-symbols:home-outline-rounded" width="18" height="18" class="mr-2" />{{ $t('home') }}
        </ElMenuItem>
        <template v-for="link in userStore.privileges" :key="link.id">
          <EssentialList v-if="link.children && link.children.length > 0" :essentialLink="link"
            :parent-path="`/${link.meta.path}`" />
          <ElMenuItem v-else :index="`/${link.meta.path}`">
            <Icon :icon="`material-symbols:${link.meta.icon}-rounded`" width="18" height="18" class="mr-2" />
            {{ $t(link.name) }}
          </ElMenuItem>
        </template>
      </ElMenu>
    </ElScrollbar>
  </ElAside>

  <ElMain class="bg-[var(--el-bg-color-page)] min-h-[calc(100vh-100px)] ml-[200px] mt-[50px]">
    <RouterView />
  </ElMain>

  <ElFooter height="50px" class="bg-[var(--el-bg-color-page)] ml-[200px] text-center !pt-4">
    <span class="text-sm">Copyright &copy; {{ new Date().getFullYear() }} All Rights Reserved.</span>
  </ElFooter>
</template>
