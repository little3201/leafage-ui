<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { PrivilegeTreeNode } from 'src/types'
import { pageIcon, pathResolve } from 'src/utils'

withDefaults(defineProps<{
  essentialLink: PrivilegeTreeNode
  parentPath?: string
}>(), {
  parentPath: ''
})

</script>

<template>
  <ElSubMenu :index="essentialLink.meta.path">
    <template #title>
      <Icon :icon="pageIcon(essentialLink.name)" width="1.25em" height="1.25em" class="mr-2" />
      {{ $t(`page.${essentialLink.name}`) }}
    </template>
    <template v-for="link in essentialLink.children" :key="link.id">
      <EssentialList v-if="link.children && link.children.length > 0" :essentialLink="link"
        :parent-path="pathResolve(parentPath, link.meta.path)" />
      <ElMenuItem v-else :index="pathResolve(parentPath, link.meta.path)">
        <Icon :icon="pageIcon(link.name)" width="1.25em" height="1.25em" class="mr-2" />
        {{ $t(`page.${link.name}`) }}
      </ElMenuItem>
    </template>
  </ElSubMenu>
</template>
