<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useUserStore } from 'stores/user-store'
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const { currentRoute } = useRouter()
const userStore = useUserStore()

const me = {
  username: userStore.username,
  fullName: userStore.fullName
}

const items = ref([
  { name: 'overview', icon: 'overview-outline', router: '' },
  { name: 'notifications', icon: 'notification-settings-outline', router: '/notifications' },
  { name: 'sessions', icon: 'bigtop-updates', router: '/sessions' },
  { name: 'changePassword', icon: 'key-outline', router: '/change-password' },
  { name: 'activities', icon: 'browse-activity-outline', router: '/activities' },
])
</script>

<template>
  <ElRow class="mb-4">
    <ElCol :span="24">
      <ElCard shadow="never" body-class="flex items-center">
        <ElAvatar :size="80" :src="`https://cdn.leafage.top/${me.username}`" />
        <div class="ml-4 flex-1">
          <span class="text-lg my-1">
            {{ me.fullName }}
          </span>

          <div class="text-sm text-(--el-text-color-secondary)">
            <span>{{ me.username }}</span>
          </div>
        </div>
      </ElCard>
    </ElCol>
  </ElRow>

  <ElRow :gutter="16">
    <ElCol :span="5">
      <ElCard shadow="never">
        <ElMenu router :default-active="currentRoute.fullPath">
          <ElMenuItem v-for="item in items" :key="item.name" :index="`/profile${item.router}`">
            <Icon :icon="`material-symbols:${item.icon}-rounded`" width="20" height="20" class="mr-2" />
            {{ $t(`label.${item.name}`) }}
          </ElMenuItem>
        </ElMenu>
      </ElCard>
    </ElCol>

    <ElCol :span="19">
      <ElCard shadow="never">
        <RouterView />
      </ElCard>
    </ElCol>
  </ElRow>
</template>
