<template>
  <h3 class="text-h5">Change Password</h3>
  <q-form class="q-my-md q-gutter-md">
    <div class="row">
      <q-input outlined dense v-model.trim="form.oldPassword" label="Old Password" no-error-icon type="password"
        class="col-6" />
      <span class="q-ml-md text-caption">
        This is a hint for old password
      </span>
    </div>
    <div class="row">
      <q-input outlined dense v-model.trim="form.newPassword" label="New Password" no-error-icon type="password"
        class="col-6" />
      <span class="q-ml-md text-caption">
        This is a hint for new password
      </span>
    </div>
    <div class="row">
      <q-input outlined dense v-model.trim="form.confirmPassword" label="Confirm Password" no-error-icon type="password"
        class="col-6" />
      <span class="q-ml-md text-caption">
        This is a hint for confirm password
      </span>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const initialValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
}
const form = ref({ ...initialValues })
</script>