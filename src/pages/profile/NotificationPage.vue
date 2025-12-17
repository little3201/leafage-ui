<script setup lang="ts">
</script>

<template>
  <h2 class="text-base/7 font-semibold text-gray-900">{{ $t('label.notifications') }}</h2>
  <p class="mt-1 text-sm/6 text-gray-600">We'll always let you know about important changes, but you pick what else you
    want to hear about.</p>

  <div class="mt-8">
    <div class="text-sm/6 font-semibold text-gray-900">Alerts & Notifications</div>
    <div class="mt-4">
      <div class="flex gap-3">
        <ElSwitch />
        <div class="text-sm/6">
          <label for="account-activity" class="font-medium text-gray-900">Account Activity</label>
          <p id="account-activity" class="mt-0 text-gray-500">Get important notifications about you or activity
            you've
            missed.
          </p>
        </div>
      </div>
      <div class="flex gap-3">
        <ElSwitch />
        <div class="text-sm/6">
          <label for="mobile-push" class="font-medium text-gray-900">Mobile push notifications</label>
          <p id="mobile-push-notifications" class="mt-0 text-gray-500">Receive push notifications whenever your company
            requires
            your attention.</p>
        </div>
      </div>
      <div class="flex gap-3">
        <ElSwitch />
        <div class="text-sm/6">
          <label for="email" class="font-medium text-gray-900">Email notification</label>
          <p id="email" class="mt-0 text-gray-500">Receive email notifications whenever your company
            requires
            your attention.
          </p>
        </div>
      </div>
      <div class="flex gap-3">
        <ElSwitch />
        <div class="text-sm/6">
          <label for="meetups-near-me" class="font-medium text-gray-900">Meetups near me</label>
          <p id="meetups-near-me" class="mt-0 text-gray-500">Get an email when a Flowbite Meetup is posted close to
            my
            location.
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 text-sm/6 font-semibold text-gray-900">Email me when:</div>
    <p class="text-sm/6 text-gray-600">These are delivered via SMS to your mobile phone.</p>
    <div class="inline-flex flex-col">
      <ElCheckbox label="Someone mentions me" />
      <ElCheckbox label="Someone asks me to be a collaborator on one of their projects" />
      <ElCheckbox label="I receive invitations to invite new team members" />
      <ElCheckbox label="Anyone follows me" />
      <ElCheckbox label="Someone accepts my invitation" />
    </div>
  </div>
</template>