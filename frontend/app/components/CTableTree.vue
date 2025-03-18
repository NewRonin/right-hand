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
      <tbody>
      <template v-for="(epic, epicIndex) in normalizedData" :key="epicIndex">
        <template v-if="(epic.children ?? []).length > 0">
          <template v-for="(feature, featureIndex) in epic.children ?? []" :key="featureIndex">
            <template v-if="(feature.children ?? []).length > 0">
              <template v-for="(task, taskIndex) in feature.children ?? []" :key="`${epicIndex}-${featureIndex}-${taskIndex}`">
                <tr
                    draggable="true"
                    @dragstart="onDragStart($event, epicIndex, featureIndex, taskIndex)"
                    @dragover.prevent="onDragOver"
                    @drop="onDrop($event, epicIndex, featureIndex, taskIndex)"
                >
                  <td v-if="featureIndex === 0 && taskIndex === 0" :rowspan="(epic.children ?? []).reduce((sum, f) => sum + ((f.children ?? []).length || 1), 0)" class="table-cell epic-cell" >
                    {{ epic.name }}
                  </td>
                  <td v-if="taskIndex === 0" :rowspan="(feature.children ?? []).length" class="table-cell feature-cell">
                    {{ feature.name }}
                  </td>
                  <td class="table-cell task-cell">
                    {{ task.name }}
                  </td>
                </tr>
              </template>
            </template>
            <template v-else>
              <tr :key="`${epicIndex}-${featureIndex}`" draggable="true" @dragstart="onDragStart($event, epicIndex, featureIndex, -1)" @dragover.prevent="onDragOver" @drop="onDrop($event, epicIndex, featureIndex, -1)">
                <td v-if="featureIndex === 0" :rowspan="(epic.children ?? []).reduce((sum, f) => sum + ((f.children ?? []).length || 1), 0)" class="table-cell epic-cell">
                  {{ epic.name }}
                </td>
                <td class="table-cell feature-cell">
                  {{ feature.name }}
                </td>
                <td class="table-cell task-cell">—</td>
              </tr>
            </template>
          </template>
        </template>

        <template v-else>
          <tr :key="`${epicIndex}`">
            <td
                class="table-cell epic-cell"
                @contextmenu.prevent="openContextMenu($event, epicIndex, -1, -1, 'epic')"
            >
              {{ epic.name }}
            </td>
            <td
                class="table-cell feature-cell"
                @contextmenu.prevent="openContextMenu($event, epicIndex, -1, -1, 'feat')"
            >
              —
            </td>
            <td class="table-cell task-cell">—</td>
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

    <CDialog v-model="dialog">
      <div class="dialog-window">
        <div class="close" @click="dialog = false">
          <img src="/sprites/close.svg" alt="" />
        </div>
        <div class="form-container">
          <div class="title"> Edit </div>
          <InputMain v-model="dialogData.name" label="Title" required></InputMain>
          <VButton @click="handleEditAdd"> Apply </VButton>
        </div>
      </div>
    </CDialog>
  </div>
</template>

<script setup lang="ts">
interface TableColumn {
  key: string;
  label: string;
}

interface DraggedItem {
  epicIndex: number;
  featureIndex: number;
  taskIndex: number;
}

const props = defineProps<{
  columns: TableColumn[];
  modelValue: TableItem[];
}>();

const emit = defineEmits(["update:modelValue"]);

const normalizedData = computed(() => {
  return props.modelValue.map((epic) => ({
    ...epic,
    children: epic.children ?? [],
  }));
});

const contextMenu: Ref<ContextMenu> = ref({
  visible: false,
  x: 0,
  y: 0,
  options: [] as ContextMenuOption[],
  selectedIndexes: { epicIndex: -1, featureIndex: -1, taskIndex: -1 },
});

const dialog = ref(false);
const dialogData = ref()

const openContextMenu = (
    event: MouseEvent,
    epicIndex: number,
    featureIndex: number,
    taskIndex: number,
    cellType: string
) => {
  const options = [];

  if (cellType === "task") {
    options.push({ label: "Add Task", action: "addTask" });
    options.push({ label: "Edit Task", action: "editTask" });
    options.push({ label: "Delete Task", action: "deleteTask" });
  }
  if (cellType === "feat") {
    options.push({ label: "Add Feature", action: "addFeature" });
    options.push({ label: "Edit Feature", action: "editFeature" });
    options.push({ label: "Delete Feature", action: "deleteFeature" });
  }
  if (cellType === "epic") {
    options.push({ label: "Add Epic", action: "addEpic" });
    options.push({ label: "Edit Epic", action: "editEpic" });
    options.push({ label: "Delete Epic", action: "deleteEpic" });
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
  const { epicIndex, featureIndex, taskIndex } = contextMenu.value.selectedIndexes;

  const newData = [...props.modelValue];

  if (action.includes("add") || action.includes("edit")) {
    dialogData.value = {
      newData: newData,
      action: action,
      name: action.includes("edit")
          ? taskIndex !== -1
              ? newData[epicIndex]?.children?.[featureIndex].children?.[taskIndex].name
              : featureIndex !== -1
                  ? newData[epicIndex].children?.[featureIndex].name
                  : newData[epicIndex].name
          : ''
    }

    dialog.value = true
  }

  else if (action === "deleteEpic" && epicIndex !== -1) {
    newData.splice(epicIndex, 1);
  } else if (action === "deleteFeature" && epicIndex !== -1 && featureIndex !== -1) {
    newData[epicIndex].children?.splice(featureIndex, 1);
  } else if (
      action === "deleteTask" &&
      epicIndex !== -1 &&
      featureIndex !== -1 &&
      taskIndex !== -1
  ) {
    newData[epicIndex].children?.[featureIndex].children?.splice(taskIndex, 1);
  }

  emit("update:modelValue", newData);
  contextMenu.value.visible = false;
};

const handleEditAdd = () => {

  const { epicIndex, featureIndex, taskIndex } = contextMenu.value.selectedIndexes;

  const newData = dialogData.value.newData

  const action = dialogData.value.action

  if (action === "addEpic") {
    newData.push({ name: dialogData.value.name, children: [] });
  } else if (action === "addFeature" && epicIndex !== -1) {
    if (!newData[epicIndex].children) {
      newData[epicIndex].children = [];
    }
    newData[epicIndex].children.push({ name: dialogData.value.name, children: [] });
  } else if (action === "addTask" && epicIndex !== -1 && featureIndex !== -1) {
    if (
        !newData[epicIndex].children?.[featureIndex]?.children &&
        newData[epicIndex].children
    ) {
      newData[epicIndex].children[featureIndex].children = [];
    }
    newData[epicIndex].children?.[featureIndex].children?.push({ name: dialogData.value.name });
  }

  else if (action === "editEpic" && epicIndex !== -1) {
    newData[epicIndex].name = dialogData.value.name;
  } else if (action === "editFeature" && epicIndex !== -1 && featureIndex !== -1) {
    newData[epicIndex].children[featureIndex].name = dialogData.value.name;
  } else if (action === "editTask" && epicIndex !== -1 && featureIndex !== -1 && taskIndex !== -1) {
    newData[epicIndex].children[featureIndex].children[taskIndex].name = dialogData.value.name;
  }

  dialog.value = false
  emit("update:modelValue", newData);
  contextMenu.value.visible = false;

}

const draggedItem = ref<DraggedItem | null>(null);

const onDragStart = (
    event: DragEvent,
    epicIndex: number,
    featureIndex: number,
    taskIndex: number
) => {
  draggedItem.value = { epicIndex, featureIndex, taskIndex };
  if (event.dataTransfer) {
    const transparentImage = new Image();
    event.dataTransfer.setDragImage(transparentImage, 0, 0);
    event.dataTransfer.effectAllowed = "move";
  }
};

const onDrop = (
    event: DragEvent,
    targetEpicIndex: number,
    targetFeatureIndex: number,
    targetTaskIndex: number
) => {
  event.preventDefault();
  if (!draggedItem.value) return;

  const { epicIndex, featureIndex, taskIndex } = draggedItem.value;
  const newData: TableItem[] = reactive(props.modelValue);

  let draggedElement: TableItem | undefined;

  if (taskIndex !== -1) {
    draggedElement = newData[epicIndex]?.children?.[featureIndex]?.children?.splice(taskIndex, 1)[0];
  } else if (featureIndex !== -1) {
    draggedElement = newData[epicIndex]?.children?.splice(featureIndex, 1)[0];
  } else {
    draggedElement = newData.splice(epicIndex, 1)[0];
  }

  if (!draggedElement) return;

  if (!newData[targetEpicIndex]?.children) {
    newData[targetEpicIndex].children = [];
  }

  if (targetTaskIndex !== -1 || (targetFeatureIndex !== -1 && targetTaskIndex === -1)) {
    if (!newData[targetEpicIndex]?.children?.[targetFeatureIndex]?.children) {
      newData[targetEpicIndex].children[targetFeatureIndex].children = [];
    }
    newData[targetEpicIndex].children[targetFeatureIndex].children.splice(targetTaskIndex, 0, draggedElement);
  } else if (targetFeatureIndex !== -1) {
    newData[targetEpicIndex].children.splice(targetFeatureIndex, 0, draggedElement);
  } else {
    newData.splice(targetEpicIndex, 0, draggedElement);
  }

  draggedItem.value = null;
  emit("update:modelValue", newData);
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};

</script>

<style scoped>
.table-container {
  width: 100%;
  max-height: 70vh;
  overflow: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background-color: #f4f4f4;
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

.table-cell {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

.epic-cell {
  background-color: #f9f9f9;
}

.feature-cell {
  background-color: #f1f1f1;
}

.task-cell {
  background-color: #fff;
}

</style>
