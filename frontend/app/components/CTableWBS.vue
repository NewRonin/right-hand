<template>
  <DataTable
    :value="props.modelValue"
    :filters="filters"
    class="table"
    rowGroupMode="rowspan"
    stripedRows
    :groupRowsBy="['epic', 'feature']"
    filterDisplay="row"
    :globalFilterFields="globalFilterFields"
    editMode="cell"
  >
    <template #header>
      <div class="flex justify-end">
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText
            v-model="filters['global'].value"
            placeholder="Keyword Search"
          />
        </IconField>
      </div>
    </template>

    <Column
      v-for="col of columns"
      :key="col.field"
      :field="col.field"
      :header="col.header"
      filter
      showFilterMenu
      :filterMatchMode="FilterMatchMode.EQUALS"
    >
      <template v-if="col.field === 'priority'" #body="{ data }">
        <Tag :value="data.priority" :severity="getSeverity(data.priority)" />
      </template>

      <!-- <template #body="{ data }">
        <div @contextmenu.prevent="onRightClick($event, data)">
          {{ data.name }}
        </div>
      </template> -->

      <template #filter="{ filterModel, filterCallback }">
        <Select
          v-model="filters[col.field].value"
          @change="filterCallback()"
          :options="filterOptions[col.field]"
          optionLabel="label"
          optionValue="value"
          placeholder="Select One"
          style="min-width: 12rem"
          :showClear="true"
        >
          <template #option="slotProps">
            <Tag
              :value="slotProps.option.label"
              :severity="getSeverity(slotProps.option.value)"
            />
          </template>
        </Select>
      </template>

      <template #editor="{ data, field }">
        <template v-if="field !== 'priority'">
          <InputText v-model="data[field]" autofocus fluid />
        </template>
        <template v-else>
          <!-- <InputNumber
            v-model="data[field]"
            mode="currency"
            currency="USD"
            locale="en-US"
            autofocus
            fluid
          /> -->
        </template>
      </template>
    </Column>
  </DataTable>

  <ContextMenu :model="contextMenuItems" ref="cm" />
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { FilterMatchMode } from "@primevue/core";

interface TableItem {
  id: string;
  name: string;
  priority: string;
  feature: string;
  featureId: string;
  epic: string;
  epicId: string;
}

interface TableColumn {
  key: string;
  field: string;
  header: string;
}

const props = defineProps<{
  columns: TableColumn[];
  modelValue: TableItem[];
}>();

const emit = defineEmits(["update:modelValue"]);
const draggedRow = ref<TableItem | null>(null);
const cm = ref();
const selectedRow = ref<TableItem | null>(null);

const globalFilterFields = ref(["epic", "feature", "name", "priority"]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const filterOptions = ref<{ [key: string]: { label: string; value: any }[] }>(
  {}
);

const options = ref([
  { label: "High", value: "High" },
  { label: "Normal", value: "Normal" },
  { label: "Low", value: "Low" },
]);

const generateFilterOptions = () => {
  const newFilterOptions: { [key: string]: { label: string; value: any }[] } =
    {};

  props.columns.forEach((col) => {
    if (!filters.value[col.field]) {
      filters.value[col.field] = {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      };
    }

    if (!newFilterOptions[col.field]) {
      const uniqueValues = new Set(
        props.modelValue.map((item) => item[col.field])
      );
      newFilterOptions[col.field] = Array.from(uniqueValues).map((value) => ({
        label: value,
        value,
      }));
    }
  });

  filterOptions.value = newFilterOptions;
};

const contextMenuItems = ref([
  { label: 'Add Task', icon: 'pi pi-plus', command: () => addTask() },
  { label: 'Add Feature', icon: 'pi pi-plus', command: () => addFeature() },
  { label: 'Add Epic', icon: 'pi pi-plus', command: () => addEpic() },
  { separator: true },
  { label: 'Delete', icon: 'pi pi-trash', command: () => deleteRow() }
]);

function onRightClick(event: MouseEvent, row: TableItem) {
  selectedRow.value = row;
  cm.value.show(event);
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

function addTask() {
  if (!selectedRow.value) return;

  const newTask: TableItem = {
    id: generateId('task'),
    name: 'New Task',
    priority: 'Normal',
    epic: selectedRow.value.epic,
    epicId: selectedRow.value.epicId,
    feature: selectedRow.value.feature,
    featureId: selectedRow.value.featureId,
  };

  const currentData = [...props.modelValue];
  const index = currentData.findIndex(item => item.id === selectedRow.value?.id);

  if (index !== -1) {
    currentData.splice(index + 1, 0, newTask);
    emit('update:modelValue', currentData);
  }
}


function addFeature() {
  if (!selectedRow.value) return;

  const newFeatureId = generateId('feature');
  const newTask: TableItem = {
    id: generateId('task'),
    name: 'New Feature Task',
    priority: 'Normal',
    epic: selectedRow.value.epic,
    epicId: selectedRow.value.epicId,
    feature: newFeatureId,
    featureId: newFeatureId,
  };

  const currentData = [...props.modelValue];
  const currentIndex = currentData.findIndex(item => item.id === selectedRow.value?.id);

  const featureGroupIndex = currentData.findIndex((item, i) =>
    i > currentIndex &&
    item.epicId === selectedRow.value?.epicId &&
    item.featureId !== selectedRow.value?.featureId
  );

  const insertIndex = featureGroupIndex !== -1 ? featureGroupIndex : currentData.length;

  currentData.splice(insertIndex, 0, newTask);
  emit('update:modelValue', currentData);
}


function addEpic() {
  const newEpicId = generateId('epic');

  const newTask: TableItem = {
    id: generateId('task'),
    name: 'New Epic Task',
    priority: 'Normal',
    epic: newEpicId,
    epicId: newEpicId,
    feature: generateId('feature'),
    featureId: generateId('feature'),
  };

  emit('update:modelValue', [...props.modelValue, newTask]);
}

function deleteRow() {
  if (!selectedRow.value) return;

  const filtered = props.modelValue.filter(item => item.id !== selectedRow.value?.id);
  emit('update:modelValue', filtered);
}


watch(() => props.modelValue, generateFilterOptions, { immediate: true });

watch(() => props.columns, generateFilterOptions, { immediate: true });

function getSeverity(option: string) {
  let severity = "info";
  switch (option) {
    case "High":
      severity = "error";
      break;
    case "Normal":
      severity = "warn";
      break;
    case "Low":
      severity = "secondary";
      break;
  }
  return severity;
}

const onDragStart = (event: DragEvent, row: TableItem) => {
  draggedRow.value = row;
  event.dataTransfer?.setData("text/plain", row.id);
};

const onDrop = (event: DragEvent, targetRow: TableItem) => {
  event.preventDefault();
  if (!draggedRow.value || draggedRow.value.id === targetRow.id) return;

  const updatedData = [...props.modelValue];
  const draggedIndex = updatedData.findIndex(
    (item) => item.id === draggedRow.value?.id
  );
  const targetIndex = updatedData.findIndex((item) => item.id === targetRow.id);

  if (draggedIndex !== -1 && targetIndex !== -1) {
    // Swap the positions
    const [removed] = updatedData.splice(draggedIndex, 1);
    updatedData.splice(targetIndex, 0, removed);
  }

  emit("update:modelValue", updatedData);
  draggedRow.value = null;
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};
</script>

<style lang="scss">
.p-iconfield {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.table {
  box-shadow: 1px solid var(--base-black);
  padding: 2rem;
  border-radius: 10px;
}

.p-datatable-table-container, .p-datatable-header {
  width: 100dvw;
  padding: 2rem;
}
</style>
