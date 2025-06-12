<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { fetchMe } from 'src/api/users'
import { actions } from 'src/constants'
import type { User } from 'src/types'
import { Icon } from '@iconify/vue'


const { locale } = useI18n()
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
  { id: 1, name: 'notifications', icon: 'notifications-outline', path: '' },
  { id: 2, name: 'appearance', icon: 'draw-outline', path: '' },
  { id: 3, name: 'sessions', icon: 'bigtop-updates', path: '' },
])

const activeTab = ref('overview')

const formRef = ref<FormInstance>()
const initialValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
}
const form = ref({ ...initialValues })

// 表单验证规则
const rules = ref({
  oldPassword: [{ required: true, message: 'Please enter your old password', trigger: 'blur' }],
  newPassword: [{ required: true, message: 'Please enter your new password', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: 'Please confirm your new password', trigger: 'blur' }
  ]
})

function more(id: number) {
  console.log(id)
}

// 提交密码修改
async function onSubmit(formEl: FormInstance | undefined) {
  if (!formEl) return

  formEl.validate((valid) => {
    if (valid) {
      alert('success')
    } else {
      alert('error')
    }
  })
}

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
          <span v-if="locale === 'en-US' || me.middleName" class="text-lg my-1">
            {{ me.firstname }} {{ me.middleName }} {{ me.lastname }}
          </span>
          <span v-else class="text-lg my-1">
            {{ me.lastname }}{{ me.firstname }}
          </span>

          <div class="text-sm text-[var(--el-text-color-secondary)]">
            <span>Project Manager</span>
            &emsp;●&emsp;
            <span>New York, USA</span>
          </div>
        </div>

        <ElButton title="profile">
          <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('modify') }}
        </ElButton>
      </ElCard>
    </ElCol>
  </ElRow>

  <ElRow :gutter="16">
    <ElCol :span="5" class="hidden-sm-and-down">
      <ElCard shadow="never">
        <ElMenu>
          <ElMenuItem v-for="item in items" :key="item.id">
            <Icon :icon="`material-symbols:${item.icon}-rounded`" width="20" height="20" class="mr-2" />
            {{ $t(item.name) }}
          </ElMenuItem>
        </ElMenu>
      </ElCard>
    </ElCol>

    <ElCol :span="19">
      <ElCard shadow="never">
        <ElTabs stretch v-model="activeTab">
          <!-- Overview -->
          <ElTabPane :label="$t('overview')" name="overview">
            <h3>Login Information</h3>
            <ElTable :data="loginHistory" :show-header=false stripe table-layout="auto">
              <ElTableColumn prop="device">
                <template #default="scope">
                  <div class="flex items-center">
                    <ElBadge :type="scope.row.status === 'online' ? 'success' : 'info'" is-dot />
                    <Icon icon="material-symbols:desktop-windows-outline-rounded" width="32" height="32"
                      class="ml-3 mr-2" />
                    <div class="ml-2 inline-flex flex-col">
                      <span class="text-sm">{{ scope.row.location }}&emsp;●&emsp;{{ scope.row.ip }}</span>
                      <span class="text-xs text-[var(--el-text-color-secondary)]">{{ scope.row.device }}</span>
                    </div>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn width="80">
                <template #default="scope">
                  <ElButton title="more" size="small" type="primary" link @click="more(scope.row.id)">
                    {{ $t('more') }}
                  </ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>

          <!-- Activities -->
          <ElTabPane :label="$t('activities')" name="activities">
            <h3>Last 3 days activities</h3>
            <ElTimeline>
              <ElTimelineItem v-for="activity in activities" :key="activity.id" :type="actions[activity.action]"
                :timestamp="activity.lastModifiedDate" placement="top">
                <ElCard shadow="never">
                  <h4 class="my-0">{{ activity.name }}</h4>
                  <p class="mb-0">{{ activity.description }}</p>
                </ElCard>
              </ElTimelineItem>
            </ElTimeline>
          </ElTabPane>

          <!-- Change password -->
          <ElTabPane :label="$t('changePassword')" name="changePassword">
            <h3>Change Password</h3>
            <ElForm ref="formRef" :model="form" :rules="rules" label-width="auto">
              <ElRow class="items-baseline">
                <ElCol :span="14">
                  <ElFormItem label="Old Password" prop="oldPassword">
                    <ElInput v-model="form.oldPassword" type="password" minlength="8" maxlength="32" show-password>
                    </ElInput>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="10">
                  <span class="ml-4 text-xs text-[var(--el-text-color-secondary)]">
                    This is a hint for old password
                  </span>
                </ElCol>
              </ElRow>
              <ElRow class="items-baseline">
                <ElCol :span="14">
                  <ElFormItem label="New Password" prop="newPassword">
                    <ElInput v-model="form.newPassword" type="password" minlength="8" maxlength="32" show-password />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="10">
                  <span class="ml-4 text-xs text-[var(--el-text-color-secondary)]">
                    This is a hint for new password
                  </span>
                </ElCol>
              </ElRow>
              <ElRow class="items-baseline">
                <ElCol :span="14">
                  <ElFormItem label="Confirm Password" prop="confirmPassword">
                    <ElInput v-model="form.confirmPassword" type="password" minlength="8" maxlength="32" show-password>
                    </ElInput>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="10">
                  <span class="ml-4 text-xs text-[var(--el-text-color-secondary)]">
                    This is a hint for confirm password
                  </span>
                </ElCol>
              </ElRow>

              <ElFormItem>
                <ElButton title="submit" type="primary" @click="onSubmit(formRef)">Submit</ElButton>
              </ElFormItem>
            </ElForm>
          </ElTabPane>
        </ElTabs>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<style lang="scss" scoped>
.el-badge {
  display: inline-flex;
  vertical-align: baseline;
}
</style>
