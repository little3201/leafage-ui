<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col">
        <q-card flat>
          <q-card-section class="flex items-center">
            <q-avatar size="80px">
              <img :src="me.avatar as string" alt="avatar" />
            </q-avatar>

            <div class="ml-2">
              <span v-if="locale === 'en-US' || me.middleName" class="text-subtitle2 q-my-1">
                {{ me.firstname }} {{ me.middleName }} {{ me.lastname }}
              </span>
              <span v-else class="text-subtitle2 q-my-1">
                {{ me.lastname }}{{ me.firstname }}
              </span>

              <div class="flex items-center text-caption">
                <span>Project Manager</span>
                &emsp;●&emsp;
                <span>New York, USA</span>
              </div>
            </div>

            <q-space />

            <q-btn title="profile" flat icon="sym_r_edit">
              {{ $t('modify') }}
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div style="width: 256px;">
        <q-card flat>
          <q-card-section>
            <q-list>
              <q-item clickable v-ripple v-for="item in items" :key="item.id">
                <q-item-section avatar>
                  <q-icon :name="`sym_r_${item.icon}`" />
                </q-item-section>
                <q-item-section>{{ $t(item.name) }}</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col">
        <q-card flat>
          <q-card-section>
            <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify">
              <q-tab name="overview" :label="$t('overview')" />
              <q-tab name="activities" :label="$t('activities')" />
              <q-tab name="changePassword" :label="$t('changePassword')" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="overview">
                <div class="text-h6">Login Information</div>
                <q-list separator>
                  <q-item v-for="item in loginHistory" :key="item.id">
                    <q-item-section avatar class="row items-center">
                      <q-icon name="sym_r_desktop_windows" size="md" />
                    </q-item-section>
                    <q-item-section>
                      <span>{{ item.ip }}&emsp;●&emsp;{{ item.location }}</span>
                      <span class="text-caption">{{ item.device }}</span>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-tab-panel>

              <q-tab-panel name="activities">
                <div class="text-h6">Last 3 days activities</div>
                <q-timeline color="secondary">
                  <q-timeline-entry v-for="item in activities" :key="item.id" :title="item.name"
                    :subtitle="item.lastModifiedDate" :color="actions[item.action]">
                    <div>
                      {{ item.description }}
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </q-tab-panel>

              <q-tab-panel name="changePassword">
                <div class="text-h6">Change Password</div>
                <q-form class="q-my-md q-gutter-md">
                  <div class="row">
                    <q-input outlined dense v-model.trim="form.oldPassword" label="Old Password" no-error-icon
                      type="password" class="col-6" />
                    <span class="q-ml-md text-caption">
                      This is a hint for old password
                    </span>
                  </div>
                  <div class="row">
                    <q-input outlined dense v-model.trim="form.newPassword" label="New Password" no-error-icon
                      type="password" class="col-6" />
                    <span class="q-ml-md text-caption">
                      This is a hint for new password
                    </span>
                  </div>
                  <div class="row">
                    <q-input outlined dense v-model.trim="form.confirmPassword" label="Confirm Password" no-error-icon
                      type="password" class="col-6" />
                    <span class="q-ml-md text-caption">
                      This is a hint for confirm password
                    </span>
                  </div>
                </q-form>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchMe } from 'src/api/users'
import { actions } from 'src/constants'
import type { User } from 'src/types'


const { locale } = useI18n()
const tab = ref('overview')

const me = ref<User>({
  id: undefined,
  username: '',
  firstname: '',
  lastname: '',
  email: ''
})

// 登录历史数据模拟
const loginHistory = ref([
  { id: 1, device: 'Chrome on Windows', location: 'New York, USA', ip: '192.168.0.112', status: 'online' },
  { id: 2, device: 'Safari on iPhone', location: 'Los Angeles, USA', ip: '172.168.0.112', status: 'offline' },
  { id: 3, device: 'Edge on Windows', location: 'Chicago, USA', ip: '127.0.0.112', status: 'offline' }
])

// 仓库数据模拟
const activities = ref([
  { id: 4, name: 'Create a set of data', description: 'User: username is test', action: 'create', lastModifiedDate: '2024-09-12' },
  { id: 3, name: 'Delete the data from user where username is test', description: 'User: username is test', action: 'remove', lastModifiedDate: '2024-08-19' },
  { id: 2, name: 'Update the test user', description: 'User: username is test', action: 'modify', lastModifiedDate: '2024-08-17' },
  { id: 1, name: 'Enabled the test user', description: 'User: username is test', action: 'enable', lastModifiedDate: '2024-08-16' }
  // 更多仓库
])

const items = ref([
  { id: 1, name: 'notifications', icon: 'notifications', path: '' },
  { id: 2, name: 'appearance', icon: 'draw', path: '' },
  { id: 3, name: 'sessions', icon: 'bigtop_updates', path: '' },
])

const initialValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
}
const form = ref({ ...initialValues })

onMounted(() => {
  fetchMe().then(res => { me.value = res.data })
})
</script>