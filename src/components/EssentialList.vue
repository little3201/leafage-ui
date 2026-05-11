<template>
  <q-expansion-item :content-inset-level="0.3">
    <template #header>
      <q-item-section side>
        <q-icon :name="`sym_r_${essentialLink.meta.icon}`" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t(`page.${essentialLink.name}`) }}</q-item-label>
      </q-item-section>
    </template>

    <template v-for="link in essentialLink.children" :key="link.id">
      <!-- children -->
      <EssentialList v-if="link.children && link.children.length > 0" :essentialLink="link"
        :parent-path="pathResolve(parentPath, link.meta.path)" />

      <q-item v-else :to="pathResolve(parentPath, link.meta.path)">
        <q-item-section side>
          <q-icon :name="`sym_r_${link.meta.icon}`" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t(`page.${link.name}`) }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-expansion-item>
</template>

<script setup lang="ts">
import type { PrivilegeTreeNode } from 'src/types'
import { pathResolve } from 'src/utils'

withDefaults(defineProps<{
  essentialLink: PrivilegeTreeNode
  parentPath?: string
}>(), {
  parentPath: ''
})
</script>
