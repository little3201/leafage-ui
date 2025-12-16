<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import { Icon } from '@iconify/vue'


const { currentRoute } = useRouter()
const userStore = useUserStore()

const cdn_url = import.meta.env.VITE_APP_CDN_URL
const me = {
  username: userStore.username,
  fullName: userStore.fullName
}

onMounted(() => {

})
</script>

<template>
  <ElRow class="mb-4">
    <ElCol :span="24">
      <ElCard shadow="never" body-class="flex items-center">
        <ElAvatar :size="80" :src="`${cdn_url}/${me.username}`" />
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
          <ElMenuItem index="/profile">
            <Icon icon="material-symbols:overview-outline-rounded" width="20" height="20" class="mr-2" />
            {{ $t('label.overview') }}
          </ElMenuItem>
          <ElMenuItem index="/profile/notifications">
            <Icon icon="material-symbols:notification-settings-outline-rounded" width="20" height="20" class="mr-2" />
            {{ $t('label.notifications') }}
          </ElMenuItem>
          <ElMenuItem index="/profile/sessions">
            <Icon icon="material-symbols:bigtop-updates-rounded" width="20" height="20" class="mr-2" />
            {{ $t('label.sessions') }}
          </ElMenuItem>
          <ElMenuItem index="/profile/change-password">
            <Icon icon="material-symbols:key-outline-rounded" width="20" height="20" class="mr-2" />
            {{ $t('label.changePassword') }}
          </ElMenuItem>
          <ElMenuItem index="/profile/activities">
            <Icon icon="material-symbols:browse-activity-outline-rounded" width="20" height="20" class="mr-2" />
            {{ $t('label.activities') }}
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
