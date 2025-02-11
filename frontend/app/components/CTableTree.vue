<template>
  <div class="table-container">
    <table class="custom-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" class="table-header">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody v-if="normalizedData" :key="refreshKey">
        <template v-for="(epic, epicIndex) in normalizedData" :key="epicIndex">
          <template v-if="(epic.children ?? []).length > 0">
            <template v-for="(feature, featureIndex) in epic.children ?? []" :key="featureIndex">
              <template v-if="(feature.children ?? []).length > 0">
                <template v-for="(task, taskIndex) in feature.children ?? []" :key="taskIndex">
                  <tr>
                    <td
                      v-if="featureIndex === 0 && taskIndex === 0"
                      :rowspan="(epic.children ?? []).reduce((sum, f) => sum + ((f.children ?? []).length || 1), 0)"
                      class="table-cell epic-cell"
                      @contextmenu.prevent="openContextMenu($event, epicIndex, featureIndex, taskIndex, 'epic')"
                    >
                      {{ epic.name }}
                    </td>

                    <td
                      v-if="taskIndex === 0"
                      :rowspan="(feature.children ?? []).length"
                      class="table-cell feature-cell"
                      @contextmenu.prevent="openContextMenu($event, epicIndex, featureIndex, taskIndex, 'feat')"
                    >
                      {{ feature.name }}
                    </td>

                    <td 
                      class="table-cell task-cell"
                      @contextmenu.prevent="openContextMenu($event, epicIndex, featureIndex, taskIndex, 'task')"
                    >
                      {{ task.name }}
                    </td>
                  </tr>
                </template>
              </template>

              <template v-else>
                <tr>
                  <td v-if="featureIndex === 0"
                      :rowspan="(epic.children ?? []).reduce((sum, f) => sum + ((f.children ?? []).length || 1), 0)"
                      class="table-cell epic-cell"
                      @contextmenu.prevent="openContextMenu($event, epicIndex, featureIndex, -1, 'epic')"
                  >
                    {{ epic.name }}
                  </td>
                  <td class="table-cell feature-cell"
                      @contextmenu.prevent="openContextMenu($event, epicIndex, featureIndex, -1, 'feat')"
                  >
                    {{ feature.name }}
                  </td>
                  <td class="table-cell task-cell">No tasks</td>
                </tr>
              </template>
            </template>
          </template>

          <template v-else>
            <tr>
              <td class="table-cell epic-cell"
                  @contextmenu.prevent="openContextMenu($event, epicIndex, -1, -1, 'epic')"
              >
                {{ epic.name }}
              </td>
              <td class="table-cell feature-cell">No Features</td>
              <td class="table-cell task-cell">No tasks</td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>

    <MenuContext
      v-if="contextMenu.visible"
      :options="contextMenu.options"
      :contextMenu="contextMenu"
      @contextMenuAction="handleContextMenuAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface TableColumn {
  key: string;
  label: string;
}

const props = defineProps<{
  columns: TableColumn[];
  modelValue: TableItem[];
}>();

const emit = defineEmits(["update:modelValue"]);

const refreshKey = ref(0);

const normalizedData = computed(() => {
  return props.modelValue.map(epic => ({
    ...epic,
    children: epic.children ?? [],
  }));
});

const contextMenu : Ref<ContextMenu> = ref({
  visible: false,
  x: 0,
  y: 0,
  options: [] as ContextMenuOption[],
  selectedIndexes: { epicIndex: -1, featureIndex: -1, taskIndex: -1 },
});

const openContextMenu = (event: MouseEvent, epicIndex: number, featureIndex: number, taskIndex: number, cellType: string) => {
  const options = [];

  if (cellType === 'task') {
    options.push({ label: "Add Task", action: "addTask" });
  }
  if (cellType === 'feat') {
    options.push({ label: "Add Feature", action: "addFeature" });
  }
  if (cellType === 'epic') {
    options.push({ label: "Add Epic", action: "addEpic" });
  }

  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    options: options,
    selectedIndexes: { epicIndex, featureIndex, taskIndex },
  };
};

const handleContextMenuAction = (action: string) => {
  const { epicIndex, featureIndex } = contextMenu.value.selectedIndexes;

  const newData = [...props.modelValue];

  if (action === "addEpic") {
    newData.push({ name: `New Epic ${newData.length + 1}`, children: [] });
  } else if (action === "addFeature" && epicIndex !== -1) {
    if (!newData[epicIndex].children) {
      newData[epicIndex].children = [];
    }
    newData[epicIndex].children.push({ name: "New Feature", children: [] });
  } else if (action === "addTask" && epicIndex !== -1 && featureIndex !== -1) {
    if (!newData[epicIndex].children?.[featureIndex]?.children && newData[epicIndex].children) {
      newData[epicIndex].children[featureIndex].children = [];
    }
    newData[epicIndex].children?.[featureIndex].children?.push({ name: "New Task" });
  }

  emit("update:modelValue", newData);
  refreshKey.value++;
  contextMenu.value.visible = false;
};

</script>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background-color: #f4f4f4;
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.table-cell {
  border: 1px solid #ccc;
  padding: 8px;
}

.epic-cell {
  font-weight: bold;
  background-color: #eaeaea;
}

.feature-cell {
  font-weight: 500;
}

.task-cell {
  font-size: 14px;
}
</style>
