<template>
  <ul
    v-show="contextMenu.visible"
    class="context-menu"
    :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
  >
    <li v-for="option in options" @click="handleOption(option.action)">
      {{ option.label }}
    </li>
  </ul>
</template>

<script setup lang="ts">

const props = defineProps<{
  contextMenu: ContextMenu;
  options: ContextMenuOption[];
}>();

const emit = defineEmits(["contextMenuAction"]);

function handleOption(action: string = "") {
  if (action) {
    emit("contextMenuAction", action);
  }
}
</script>

<style scoped>
.context-menu {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 1px solid #ccc;
  list-style: none;
  padding: 8px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}

.context-menu li {
  padding: 5px 10px;
  cursor: pointer;
}

.context-menu li:hover {
  background: #f4f4f4;
}
</style>
