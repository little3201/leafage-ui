<template>
  <v-list-group :value="essentialLink.name">
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :prepend-icon="`mdi-${essentialLink.meta.icon}`"
        :title="essentialLink.name"
      />
    </template>

    <template v-for="(link, index) in essentialLink.children" :key="index">
      <!-- children -->
      <EssentialList
        v-if="link.children && link.children.length > 0"
        :essential-link="link"
        :parent-path="pathResolve(parentPath, link.meta.path)"
      />

      <v-list-item v-else :prepend-icon="`mdi-${link.meta.icon}`" :title="link.name" :to="pathResolve(parentPath, link.meta.path)" />
    </template>
  </v-list-group>
</template>

<script setup lang="ts">
import type { PrivilegeTreeNode } from 'src/types'
import { pathResolve } from 'src/utils'

withDefaults(defineProps<{
  essentialLink: PrivilegeTreeNode
  parentPath?: string
}>(), {
  parentPath: '',
})
</script>
