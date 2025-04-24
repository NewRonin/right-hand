<template>
  <DataTable
    :value="modelValue"
    :filters="filters"
    class="table"
    rowGroupMode="rowspan"
    stripedRows
    :groupRowsBy="['epic', 'feature']"
    filterDisplay="row"
    :globalFilterFields="globalFilterFields"
    @row-contextmenu="onRowClick"
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

      <!-- <template #body="{ data }">
        <div @contextmenu.prevent="onRightClick($event, data)">
          {{ data.name }}
        </div>
      </template> -->

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
  type: 'epic' | 'feature' | 'task' | string
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
const selectedId = ref()
const selectedType = ref()

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
  console.log(row)
  selectedRow.value = row;
  cm.value.show(event);
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

function onRowClick(event: { originalEvent: MouseEvent; data: TableItem; index: number }) {
  const target = event.originalEvent.target as HTMLElement;
  const td = target.closest('td');
  if (!td) return;

  const tdList = Array.from(td.parentElement?.children || []);
  const rawIndex = tdList.indexOf(td);

  const current = props.modelValue[event.index];
  const previous = props.modelValue[event.index - 1];

  // Сколько колонок сгруппировано (rowspan-ом и пропущены в DOM)
  let groupOffset = 0;
  if (previous && current.epicId === previous.epicId) groupOffset++;
  if (previous && current.featureId === previous.featureId) groupOffset++;

  const actualColumnIndex = rawIndex + groupOffset;
  const columnField = props.columns[actualColumnIndex]?.field;

  let entityType: 'epic' | 'feature' | 'task' = 'task';
  let entityId: string | undefined = current.id;

  if (columnField === 'epic' && (!previous || current.epicId !== previous.epicId)) {
    entityType = 'epic';
    entityId = current.epicId;
  } else if (columnField === 'feature' && (!previous || current.featureId !== previous.featureId)) {
    entityType = 'feature';
    entityId = current.featureId;
  }

  console.log(`Clicked ${entityType} with ID: ${entityId}`);
  selectedId.value = entityId
  selectedType.value = entityType

  cm.value.show(event.originalEvent);
}


function addTask() {
  const selectedRow = props.modelValue.find((el) => el.id === selectedId.value)

  if (!selectedRow) return;

  const newTask: TableItem = {
    id: generateId('task'),
    name: 'New Task',
    priority: 'Normal',
    epic: selectedRow.epic,
    epicId: selectedRow.epicId,
    feature: selectedRow.feature,
    featureId: selectedRow.featureId,
  };

  const currentData = [...props.modelValue];
  const index = currentData.findIndex(item => item.id === selectedRow?.id);

  if (index !== -1) {
    currentData.splice(index + 1, 0, newTask);
    emit('update:modelValue', currentData);
  }
}


function addFeature() {
  const selectedRow = props.modelValue.find((el) => el.featureId === selectedId.value)
  if (!selectedRow) return;

  const newFeatureId = generateId('feature');
  const newTask: TableItem = {
    id: generateId('task'),
    name: 'New Feature Task',
    priority: 'Normal',
    epic: selectedRow.epic,
    epicId: selectedRow.epicId,
    feature: newFeatureId,
    featureId: newFeatureId,
  };

  const currentData = [...props.modelValue];
  const currentIndex = currentData.findIndex(item => item.featureId === selectedRow.id);

  const featureGroupIndex = currentData.findIndex((item, i) =>
    i > currentIndex &&
    item.epicId === selectedRow?.epicId &&
    item.featureId !== selectedRow?.featureId
  );

  const insertIndex = featureGroupIndex !== -1 ? featureGroupIndex : currentData.length;

  currentData.splice(insertIndex, 0, newTask);
  emit('update:modelValue', currentData);
}


function addEpic() {
  const selectedRow = props.modelValue.find((el) => el.epicId === selectedId.value)
  if (!selectedRow) return;

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
  if(!selectedType.value && !selectedId.value) return;
  let result = [...props.modelValue]

  switch(selectedType.value){
    case 'task':
      result = result.filter(item => item.id !== selectedId.value);
      break;
    case 'feature':
      result = result.filter(item => item.featureId !== selectedId.value);z``
      break;
    case 'epic':
      result = result.filter(item => item.epicId !== selectedId.value);
      break;
  }

  console.log(result)
  emit('update:modelValue', result);
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
  const type = getItemType(row);
  if (type === 'epic') {
    // Можно добавить специальную логику для Epic
    console.log('Dragging Epic', row.name);
  }
  draggedRow.value = row;
  event.dataTransfer?.setData("text/plain", row.id);
};

const onDrop = (event: DragEvent, targetRow: TableItem) => {
  event.preventDefault();
  if (!draggedRow.value) return;
  
  const draggedType = getItemType(draggedRow.value);
  const targetType = getItemType(targetRow);
  
  // Пример ограничений:
  // - Нельзя переносить Epic внутрь Feature или Task
  // - Feature можно переносить только между Epic
  if (draggedType === 'epic' && targetType !== 'epic') {
    console.warn('Cannot drop Epic into non-Epic');
    return;
  }
  
  if (draggedType === 'feature' && targetType !== 'epic') {
    console.warn('Can only drop Feature into Epic');
    return;
  }
  
  // Остальная логика переноса...
  const updatedData = [...props.modelValue];
  const draggedIndex = updatedData.findIndex(item => item.id === draggedRow.value?.id);
  const targetIndex = updatedData.findIndex(item => item.id === targetRow.id);
  
  if (draggedIndex !== -1 && targetIndex !== -1) {
    const [removed] = updatedData.splice(draggedIndex, 1);
    updatedData.splice(targetIndex, 0, removed);
    emit("update:modelValue", updatedData);
  }
  
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
}
</style>
