<template>
  <v-list-group :value="essentialLink.name">
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        color="primary"
        :prepend-icon="pageIcon(essentialLink.name)"
        rounded="pill"
        :title="$t(`page.${essentialLink.name}`)"
      />
    </template>

    <template v-for="(link, index) in essentialLink.children" :key="index">
      <!-- children -->
      <EssentialList
        v-if="link.children && link.children.length > 0"
        :essential-link="link"
        :parent-path="pathResolve(parentPath, link.meta.path)"
      />

      <v-list-item
        v-else
        color="primary"
        :prepend-icon="pageIcon(link.name)"
        rounded="pill"
        :title="$t(`page.${link.name}`)"
        :to="pathResolve(parentPath, link.meta.path)"
      />
    </template>
  </v-list-group>
</template>

<script setup lang="ts">
import type { PrivilegeTreeNode } from '@/types'
import { pageIcon, pathResolve } from '@/utils'

withDefaults(defineProps<{
  essentialLink: PrivilegeTreeNode
  parentPath?: string
}>(), {
  parentPath: '',
})
</script>
