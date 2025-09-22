<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchMe } from 'src/api/users'
import type { User } from 'src/types'
import { Icon } from '@iconify/vue'


const me = ref<User>({
  id: undefined,
  username: '',
  fullname: '',
  email: ''
})

onMounted(() => {
  fetchMe().then(res => { me.value = res.data })
})
</script>

<template>
  <ElRow class="mb-4">
    <ElCol :span="24">
      <ElCard shadow="never" body-class="flex items-center">
        <ElAvatar :size="80" :src="me.avatar" />
        <div class="ml-4 flex-1">
          <span class="text-lg my-1">
            {{ me.fullname }}
          </span>

          <div class="text-sm text-[var(--el-text-color-secondary)]">
            <span>Project Manager</span>
            &emsp;●&emsp;
            <span>New York, USA</span>
          </div>
        </div>

        <div>
          周三
        </div>
      </ElCard>
    </ElCol>
  </ElRow>

  <ElRow :gutter="16">
    <ElCol :span="5" class="hidden-sm-and-down">
      <ElCard shadow="never">
        <ElMenu router>
          <ElMenuItem index="/profile/notifications">
            <Icon icon="material-symbols:notifications-outline-rounded" width="20" height="20" class="mr-2" />
            {{ $t('notifications') }}
          </ElMenuItem>
          <ElMenuItem index="/profile/sessions">
            <Icon icon="material-symbols:bigtop-updates-rounded" width="20" height="20" class="mr-2" />
            {{ $t('sessions') }}
          </ElMenuItem>
          <ElMenuItem index="/profile/change-password">
            <Icon icon="material-symbols:key-outline-rounded" width="20" height="20" class="mr-2" />
            {{ $t('changePassword') }}
          </ElMenuItem>
          <ElMenuItem index="/profile/activities">
            <Icon icon="material-symbols:key-outline-rounded" width="20" height="20" class="mr-2" />
            {{ $t('activities') }}
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
