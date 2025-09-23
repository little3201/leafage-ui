<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { fetchMe } from 'src/api/users'
import type { User } from 'src/types'


const { t } = useI18n()

const initialValues: User = {
  id: undefined,
  username: '',
  fullname: '',
  email: ''
}
const form = ref<User>({ ...initialValues })


onMounted(() => {
  fetchMe().then(res => { form.value = res.data })
})
</script>

<template>
  <h3>{{ t('overview') }}</h3>
  <div class="flex">
    <div class="px-6 relative group">
      <ElAvatar :size="180" :src="form.avatar" />
      <div
        class="absolute inset-0 h-[180px] w-[180px] ml-6 hidden group-hover:flex items-center justify-center rounded-full bg-[var(--el-overlay-color-lighter)] group-hover:opacity-100 transition">
        <ElButton title="upload" type="primary" circle>
          <Icon icon="material-symbols:upload-rounded" width="18" height="18" />
        </ElButton>
        <ElButton title="remove" circle>
          <Icon icon="material-symbols:delete-outline-rounded" width="18" height="18" />
        </ElButton>
      </div>
    </div>

    <div class="inline-fle flex-col ml-8">
      <ElFormItem :label="$t('username')" prop="username">
        <ElInput v-model="form.username" :placeholder="$t('inputText', { field: $t('username') })" :maxLength="50" />
        <p class="mt-0 text-sm text-gray-500">Your name may appear around GitHub where you contribute or are mentioned.
          You can remove it at any time.
        </p>
      </ElFormItem>
      <ElFormItem :label="$t('email')" prop="email">
        <ElInput type="email" v-model="form.email" :placeholder="$t('inputText', { field: $t('email') })"
          :maxLength="50" />
        <p class="mt-0 text-sm text-gray-500">Get important notifications about you or activity
          you've
          missed.
        </p>
      </ElFormItem>
      <ElFormItem :label="$t('fullname')" prop="fullname">
        <ElInput v-model="form.fullname" :placeholder="$t('inputText', { field: $t('fullname') })" :maxLength="50" />
        <p class="mt-0 text-sm text-gray-500">Get important notifications about you or activity
          you've
          missed.
        </p>
      </ElFormItem>
    </div>
  </div>

  <div class="mt-8">
    <h3>Third accouts authorize</h3>
    <div class="mt-4">
      <div class="flex justify-between">
        <div class="text-sm/6">
          <label for="comments" class="font-medium text-gray-900">Account Activity</label>
          <p id="comments-description" class="mt-0 text-gray-500">Get important notifications about you or activity
            you've
            missed.
          </p>
        </div>
        <ElButton link>绑定</ElButton>
      </div>
      <div class="flex justify-between">
        <div class="text-sm/6">
          <label for="candidates" class="font-medium text-gray-900">Mobile push notifications</label>
          <p id="candidates-description" class="mt-0 text-gray-500">Receive push notifications whenever your company
            requires
            your attention.</p>
        </div>
        <ElButton link>绑定</ElButton>
      </div>
      <div class="flex justify-between">
        <div class="text-sm/6">
          <label for="offers" class="font-medium text-gray-900">Email notification</label>
          <p id="offers-description" class="mt-0 text-gray-500">Receive email notifications whenever your company
            requires
            your attention.
          </p>
        </div>
        <ElButton link>绑定</ElButton>
      </div>
      <div class="flex justify-between">
        <div class="text-sm/6">
          <label for="offers" class="font-medium text-gray-900">Meetups near me</label>
          <p id="offers-description" class="mt-0 text-gray-500">Get an email when a Flowbite Meetup is posted close
            to
            my
            location.
          </p>
        </div>
        <ElButton link>绑定</ElButton>
      </div>
    </div>
  </div>
</template>