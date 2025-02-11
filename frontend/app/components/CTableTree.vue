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
            <template
              v-for="(feature, featureIndex) in epic.children ?? []"
              :key="featureIndex"
            >
              <template v-if="(feature.children ?? []).length > 0">
                <template
                  v-for="(task, taskIndex) in feature.children ?? []"
                  :key="`${epicIndex}-${featureIndex}-${taskIndex}`"
                >
                  <tr>
                    <td
                      v-if="featureIndex === 0 && taskIndex === 0"
                      :rowspan="
                        (epic.children ?? []).reduce(
                          (sum, f) => sum + ((f.children ?? []).length || 1),
                          0
                        )
                      "
                      class="table-cell epic-cell"
                      @contextmenu.prevent="
                        openContextMenu(
                          $event,
                          epicIndex,
                          featureIndex,
                          taskIndex,
                          'epic'
                        )
                      "
                    >
                      {{ epic.name }}
                    </td>

                    <td
                      v-if="taskIndex === 0"
                      :rowspan="(feature.children ?? []).length"
                      class="table-cell feature-cell"
                      @contextmenu.prevent="
                        openContextMenu(
                          $event,
                          epicIndex,
                          featureIndex,
                          taskIndex,
                          'feat'
                        )
                      "
                    >
                      {{ feature.name }}
                    </td>

                    <td
                      class="table-cell task-cell"
                      @contextmenu.prevent="
                        openContextMenu(
                          $event,
                          epicIndex,
                          featureIndex,
                          taskIndex,
                          'task'
                        )
                      "
                    >
                      {{ task.name }}
                    </td>
                  </tr>
                </template>
              </template>

              <template v-else>
                <tr :key="`${epicIndex}-${featureIndex}`">
                  <td
                    v-if="featureIndex === 0"
                    :rowspan="
                      (epic.children ?? []).reduce(
                        (sum, f) => sum + ((f.children ?? []).length || 1),
                        0
                      )
                    "
                    class="table-cell epic-cell"
                    @contextmenu.prevent="
                      openContextMenu($event, epicIndex, featureIndex, -1, 'epic')
                    "
                  >
                    {{ epic.name }}
                  </td>
                  <td
                    class="table-cell feature-cell"
                    @contextmenu.prevent="
                      openContextMenu($event, epicIndex, featureIndex, -1, 'feat')
                    "
                  >
                    {{ feature.name }}
                  </td>
                  <td
                    class="table-cell task-cell"
                    @contextmenu.prevent="
                      openContextMenu($event, epicIndex, featureIndex, -1, 'task')
                    "
                  >
                    —
                  </td>
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

  // Handle Edit Logic
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

  // Handle Deletion Logic
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

  // Handle Add Logic
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

  // Handle Edit Logic
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
</script>

<style scoped lang="scss">
.table-container {
  width: 100%;
  overflow-x: auto;
  margin: 20px 0; 
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Montserrat', sans-serif; 
}

.table-header {
  background-color: var(--base-pink);
  color: var(--base-black); 
  border: 1px solid var(--inactive);
  padding: 12px 10px;
  text-align: left;
  font-family: 'Montserrat', sans-serif; 
  font-weight: 600; 
  text-transform: uppercase; 
}

.table-cell {
  border: 1px solid var(--inactive);
  padding: 10px;
  font-family: 'Montserrat', sans-serif; 
  font-size: 16px; 
  color: var(--base-black); 
}

.epic-cell {
  font-weight: bold;
  background-color: var(--light-white);
  background-color: #eaeaea;
  color: var(--base-black); 
}

.feature-cell {
  font-weight: 500;
  background-color: var(--light-white);
  color: var(--base-black); 
}

.task-cell {
  font-size: 14px;
  background-color: #ffffff; 
  color: var(--base-black); 
}

.custom-table tr:nth-child(even) {
  background-color: var(--light-white); 
}

.custom-table tr:nth-child(odd) {
  background-color: #ffffff; 
}

.custom-table tr:hover {
  background-color: var(--main); 
  color: #fff; 
}

.custom-table th, .custom-table td {
  text-align: center; 
}

.dialog-window {
  position: relative;
  width: 40vw;
  padding: 56px 0;
  height: 40vh;
  border-radius: 16px;
  background-color: var(--light-white);
  display: flex;
  flex-direction: column;
  overflow: auto;

  .close {
    position: absolute;
    top: 24px;
    right: 24px;
  }

  .form-container {
      width: 100%;
      height: 100%;
      border-radius: 2rem;
      background-color: var(--light-white);

      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;

      padding: 4rem;
      gap: 2rem;
    }

    .title {
      font-size: 1.5rem;
    }

    button {
      margin-top: 4rem;
      width: 20rem;
    }
}
</style>
