<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { ElSplitter, ElSplitterPanel, TreeInstance } from "element-plus";
import { ref, watch, nextTick } from "vue";
import type { PrivilegeTreeNode, PrivilegeActions } from "@/types";
import { actionIcon, pageIcon } from "@/utils";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const props = defineProps<{
  targetId: number | null;
  selected: PrivilegeActions[];
}>();

const ignoreCheckChange = ref(false);
const treeRef = ref<TreeInstance>();
const selectedNodes = ref<PrivilegeTreeNode[]>([]);
const checkedAuthorities = ref<Array<PrivilegeActions>>([]);

watch(
  () => props.selected,
  newVal => {
    initSelected(newVal ?? []);
  },
  { immediate: true }
);

function setCheckedKeysSafe(keys: number[]) {
  ignoreCheckChange.value = true;
  treeRef.value?.setCheckedKeys(keys);
  // 用 nextTick 确保 Tree 内部事件都发完再解锁
  nextTick(() => {
    ignoreCheckChange.value = false;
  });
}
function initSelected(selected: PrivilegeActions[]) {
  if (!selected.length) {
    selectedNodes.value = [];
    checkedAuthorities.value = [];
    nextTick(() => {
      setCheckedKeysSafe([]);
    });
    return;
  }

  const leafNodes = selected
    .map(item => findNode(userStore.privileges, item.privilegeId))
    .filter(Boolean)
    .flatMap(node => getLeafNodes(node!));

  const uniqueLeaves = Array.from(
    new Map(leafNodes.map(n => [n.id, n])).values()
  );

  selectedNodes.value = [...uniqueLeaves];

  checkedAuthorities.value = uniqueLeaves.map(leaf => {
    const original = selected.find(s => s.privilegeId === leaf.id);
    return {
      id: props.targetId!,
      privilegeId: leaf.id!,
      name: leaf.name,
      actions: original ? [...original.actions] : []
    };
  });

  nextTick(() => {
    setCheckedKeysSafe(uniqueLeaves.map(n => n.id!));
  });
}

function findNode(
  nodes: PrivilegeTreeNode[],
  id: number
): PrivilegeTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.children?.length) {
      const result = findNode(node.children, id);

      if (result) {
        return result;
      }
    }
  }
}

function getLeafNodes(node: PrivilegeTreeNode): PrivilegeTreeNode[] {
  if (!node.children?.length) {
    return [node];
  }

  return node.children.flatMap(child => getLeafNodes(child));
}

function handleCheckChange(data: PrivilegeTreeNode, checked: boolean) {
  if (ignoreCheckChange.value) return;

  const leafNodes = getLeafNodes(data);

  if (checked) {
    // 勾选：直接把所有叶子加进去
    leafNodes.forEach(addSelectedNode);
  } else {
    // 取消勾选：等 Tree 内部状态更新后，只删除真正不再被勾选的叶子
    nextTick(() => {
      const checkedKeys = (treeRef.value?.getCheckedKeys() ?? []) as number[];
      leafNodes.forEach(node => {
        if (!checkedKeys.includes(node.id!)) {
          removeSelectedNode(node.id!);
        }
      });
    });
  }
}

function addSelectedNode(node: PrivilegeTreeNode) {
  if (!props.targetId) return;

  if (selectedNodes.value.some(item => item.id === node.id)) {
    return;
  }

  selectedNodes.value.unshift(node);

  const exists = checkedAuthorities.value.some(
    item => item.privilegeId === node.id
  );

  if (!exists) {
    checkedAuthorities.value.unshift({
      id: props.targetId,
      privilegeId: node.id!,
      name: node.name,
      actions: []
    });
  }
}

function removeSelectedNode(id: number) {
  selectedNodes.value = selectedNodes.value.filter(item => item.id !== id);

  checkedAuthorities.value = checkedAuthorities.value.filter(
    item => item.privilegeId !== id
  );
}

function isAllChecked(node: PrivilegeTreeNode) {
  const actions = getActions(node.id!);
  const metaActions = node.meta.actions ?? [];

  return metaActions.length > 0 && actions.length === metaActions.length;
}

function isIndeterminate(node: PrivilegeTreeNode) {
  const actions = getActions(node.id!);
  const metaActions = node.meta.actions ?? [];

  return actions.length > 0 && actions.length < metaActions.length;
}

function handleCheckAll(node: PrivilegeTreeNode, checked: boolean) {
  updateActions(node.id!, checked ? [...(node.meta.actions ?? [])] : []);
}

function getActions(nodeId: number) {
  return (
    checkedAuthorities.value.find(item => item.privilegeId === nodeId)
      ?.actions ?? []
  );
}

function updateActions(privilegeId: number, actions: string[]) {
  const authority = checkedAuthorities.value.find(
    item => item.privilegeId === privilegeId
  );

  if (authority) {
    authority.actions = [...actions];
  }
}

defineExpose({
  checkedAuthorities() {
    return checkedAuthorities.value;
  }
});
</script>

<template>
  <ElSplitter class="space-x-4">
    <ElSplitterPanel size="30%">
      <ElScrollbar max-height="600px">
        <ElTree
          ref="treeRef"
          :data="userStore.privileges"
          node-key="id"
          show-checkbox
          highlight-current
          @check-change="handleCheckChange"
        >
          <template #default="{ data }">
            <Icon
              :icon="pageIcon(data.name)"
              style="vertical-align: -3.5px"
              width="1.25em"
              height="1.25em"
              class="mr-2"
            />
            <span>{{ $t(`page.${data.name}`) }}</span>
          </template>
        </ElTree>
      </ElScrollbar>
    </ElSplitterPanel>

    <ElSplitterPanel>
      <ElScrollbar max-height="600px">
        <ElAlert
          title="选中菜单即表示拥有查看权限，其他操作权限需要进行配置。"
          type="primary"
          show-icon
          :closable="false"
        />
        <ElEmpty v-if="!selectedNodes.length" />
        <ElCollapse v-else class="px-2">
          <ElCollapseItem
            v-for="item in selectedNodes"
            :key="item.id"
            :name="item.id"
          >
            <template #title>
              <div class="flex items-center space-x-6">
                <div class="inline-flex items-center">
                  <Icon
                    :icon="pageIcon(item.name)"
                    width="1.25em"
                    height="1.25em"
                    class="mr-1"
                  />
                  <ElText>{{ $t(`page.${item.name}`) }}</ElText>
                </div>
                <div class="inline-flex items-center" @click.stop>
                  <ElCheckbox
                    :model-value="isAllChecked(item)"
                    :indeterminate="isIndeterminate(item)"
                    @change="handleCheckAll(item, $event)"
                  >
                    {{ $t("label.all") }}
                  </ElCheckbox>
                </div>
              </div>
            </template>

            <ElCheckboxGroup
              :model-value="getActions(item.id!)"
              @update:model-value="
                (value: string[]) => updateActions(item.id!, value)
              "
            >
              <ElCheckbox
                v-for="(action, index) in item.meta.actions ?? []"
                :key="index"
                :value="action"
              >
                <div class="flex items-center">
                  <Icon
                    :icon="actionIcon(action)"
                    width="1.25em"
                    height="1.25em"
                  />
                  <span>{{ $t(`action.${action}`) }}</span>
                </div>
              </ElCheckbox>
            </ElCheckboxGroup>
          </ElCollapseItem>
        </ElCollapse>
      </ElScrollbar>
    </ElSplitterPanel>
  </ElSplitter>
</template>
