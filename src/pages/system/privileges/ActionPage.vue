<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createPrivilegeAction,
  enablePrivilegeAction,
  fetchPrivilegeAction,
  modifyPrivilegeAction,
  retrievePrivilegeActions
} from 'src/api/privileges'
import { buttonTypes } from 'src/constants'
import type { PrivilegeAction } from 'src/types'
import { hasAction } from 'src/utils'
import { onMounted, reactive, ref, watch } from 'vue'


const props = defineProps<{
  privilegeId: number
}>()
const loading = ref<boolean>(false)
const datas = ref<Array<PrivilegeAction>>([])
const total = ref<number>(0)

const saveLoading = ref<boolean>(false)
const visible = ref<boolean>(false)

const formRef = ref<FormInstance>()
const initialValues: PrivilegeAction = {
  id: null,
  name: '',
  privilegeId: null,
  icon: '',
  type: null,
  enabled: true
}
const form = ref<PrivilegeAction>({ ...initialValues })

const rules = reactive<FormRules<typeof form>>({
  name: [
    { required: true, trigger: 'blur' }
  ],
  icon: [
    { required: true, trigger: 'blur' }
  ],
  type: [
    { required: true, trigger: 'blur' }
  ]
})

onMounted(async () => {
  await load()
})


watch(
  () => props.privilegeId,
  async (newPrivilegeId, oldPrivilegeId) => {
    if (newPrivilegeId !== oldPrivilegeId) {
      await load()
    }
  },
  { immediate: false }
)

async function load() {
  loading.value = true
  try {
    const res = await retrievePrivilegeActions(props.privilegeId)
    datas.value = res.data
    total.value = res.data.page.totalElements
  } catch (error) {
    return error
  } finally {
    loading.value = false
  }
}

/**
 * 弹出框
 * @param id 主键
 */
async function saveRow(id?: number) {
  form.value = { ...initialValues }
  try {
    if (id) {
      await loadOne(id)
    }
  } catch (error) {
    return error
  }
  visible.value = true
}

/**
 * 加载
 * @param id 主键
 */
async function loadOne(id: number) {
  try {
    const res = await fetchPrivilegeAction(props.privilegeId, id)
    form.value = res.data
  } catch (error) {
    return error
  }
}

async function enableChange(id: number) {
  try {
    await enablePrivilegeAction(props.privilegeId, id)
    await load()
  } catch (error) {
    return error
  }
}

/**
 * 表单提交
 */
async function onSubmit(formEl: FormInstance) {
  if (!formEl) return

  const valid = await formEl.validate()
  if (valid) {
    saveLoading.value = true
    try {
      if (form.value.id) {
        await modifyPrivilegeAction(props.privilegeId, form.value)
      } else {
        await createPrivilegeAction(props.privilegeId, form.value)
      }

      visible.value = false
      await load()
    } catch (error) {
      return error
    } finally { saveLoading.value = false }
  }
}
</script>

<template>
  <ElTable v-loading="loading" :data="datas" row-key="id" table-layout="auto">
    <ElTableColumn type="index" :label="$t('label.no')" width="55" />
    <ElTableColumn prop="name" :label="$t('label.name')">
      <template #default="scope">
        <ElButton :title="scope.row.name" :type="scope.row.type" link>
          <Icon :icon="`material-symbols:${scope.row.icon}-rounded`" style="vertical-align: -3.5px" width="1.25em"
            height="1.25em" />
          {{ scope.row.name ? $t(`action.${scope.row.name}`) : '' }}
        </ElButton>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="enabled" :label="$t('label.enabled')" sortable>
      <template #default="scope">
        <ElSwitch size="small" v-model="scope.row.enabled" @change="enableChange(scope.row.id)"
          style="--el-switch-on-color: var(--el-color-success);" :disabled="!hasAction($route.name, 'enable')" />
      </template>
    </ElTableColumn>
    <ElTableColumn :label="$t('label.actions')">
      <template #default="scope">
        <ElButton v-if="hasAction($route.name, 'modify')" title=" modify" type="primary" link
          @click="saveRow(scope.row.id)">
          <Icon icon="material-symbols:edit-outline-rounded" width="16" height="16" />{{ $t('action.modify') }}
        </ElButton>
      </template>
    </ElTableColumn>
  </ElTable>

  <!-- form -->
  <ElDialog v-model="visible" :title="$t('label.actions')" align-center :show-close="false" append-to-body width="480">
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem :label="$t('label.name')" prop="name">
            <ElInput v-model="form.name" :placeholder="$t('placeholder.inputText', { field: $t('label.name') })"
              disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('label.type')" prop="type">
            <!-- <ElInput v-model="form.type" :placeholder="$t('placeholder.inputText', { field: $t('label.type') })" /> -->
            <ElSelect v-model="form.type" class="min-w-48"
              :placeholder="$t('placeholder.selectText', { field: $t('label.actions') })">
              <ElOption v-for="(value, label) in buttonTypes" :key="value" :label="label" :value="value" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol>
          <ElFormItem :label="$t('label.icon')" prop="icon">
            <ElInput v-model="form.icon" :placeholder="$t('placeholder.inputText', { field: $t('icon') })">
              <template #prefix>
                <Icon :icon="`material-symbols:${form.icon}-rounded`" />
              </template>
            </ElInput>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton title="cancel" @click="visible = false">
        <Icon icon="material-symbols:close" width="1.25em" height="1.25em" />{{ $t('action.cancel') }}
      </ElButton>
      <ElButton title="submit" type="primary" :loading="saveLoading" @click="onSubmit(formRef!)">
        <Icon icon="material-symbols:check-circle-outline-rounded" width="1.25em" height="1.25em" /> {{
          $t('action.submit') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
