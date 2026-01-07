<template>
  <q-expansion-item :icon="`sym_r_${essentialLink.meta.icon}`" :label="$t(`page.${essentialLink.name}`)">
    <q-card>
      <q-card-section>
        <template v-for="link in essentialLink.children" :key="link.id">
          <!-- children -->
          <EssentialList v-if="link.children && link.children.length > 0" :essentialLink="link"
            :parent-path="pathResolve(parentPath, link.meta.path)" />

          <!-- single item -->
          <EssentialLink v-else
            v-bind="{ name: link.name, icon: link.meta.icon, path: link.meta.path, parentPath: parentPath || '' }" />
        </template>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import EssentialLink from 'components/EssentialLink.vue'
import type { PrivilegeTreeNode } from 'src/types'
import { pathResolve } from 'src/utils'

withDefaults(defineProps<{
  essentialLink: PrivilegeTreeNode
  parentPath?: string
}>(), {
  parentPath: ''
})
</script>
