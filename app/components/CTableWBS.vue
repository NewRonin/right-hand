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
    editMode="cell"
    @cell-edit-complete="onCellEditComplete"
  >
    <template #header>
      <div class="flex justify-end">
        <IconField>
          <InputText
            v-model="filters['global'].value"
            placeholder="Keyword Search"
          />
        </IconField>
      </div>
    </template>

    <template v-for="col, colIndex in columns" :key="col.field">
      <Column
        :field="col.field"
        :header="col.header"
        filter
        showFilterMenu
        :filterMatchMode="FilterMatchMode.EQUALS"
      >
        <template v-if="col.field === 'priority'" #body="{ data }">
          <Tag :value="data.priority" :severity="getSeverity(data.priority)" />
        </template>

        <template
          v-if="col.field !== 'optimistic_estimation' &&
                  col.field !== 'realistic_estimation' &&
                  col.field !== 'pessimistic_estimation' &&
                  col.field !== 'extra_coefficient' &&
                  col.field !== 'extra_coefficient_description' &&
                  col.field !== 'total_estimate'"
          #filter="{ filterModel, filterCallback }"
        >
          <Select
            v-model="filters[col.field].value"
            @change="filterCallback()"
            :options="filterOptions[col.field]"
            optionLabel="displayText"
            optionValue="value"
            placeholder="Select One"
            style="min-width: 12rem"
            :showClear="true"
          >
            <template #option="slotProps">
              <Tag
                v-if="col.field === 'priority'"
                :value="slotProps.option.displayText"
                :severity="getSeverity(slotProps.option.value)"
              />
              <span
                v-else-if="col.field === 'employee'"
              >{{ getEmployeeName(slotProps.option.value) }}</span>
            </template>
          </Select>
        </template>

        <template #editor="{ data, field, index }">
          <Select
            v-if="field === 'priority'"
            v-model="data[field]"
            :options="options"
            optionLabel="displayText"
            optionValue="value"
            placeholder="Select Priority"
            class="w-full"
            autofocus
            :showClear="false"
          >
            <template #option="slotProps">
              <Tag
                :value="slotProps.option.displayText"
                :severity="getSeverity(slotProps.option.value)"
              />
            </template>
          </Select>
          <InputNumber
            v-else-if="field === 'total_estimation' || field === 'optimistic_estimation' || field === 'realistic_estimation' || field === 'pessimistic_estimation' ||  field === 'extra_coefficient'"
            v-model="data[field]"
            :autofocus="col"
            :disabled="col.disabled"
          />
          <InputText v-else v-model="data[field]" autofocus fluid />
        </template>

        <template v-if="col.field === 'employee'" #body="{ data }">
          {{ getEmployeeName(data.employee) }}
        </template>

        <template v-if="col.field === 'employee'" #editor="{ data, field, index }">
          <Select
            v-model="data[field]"
            :options="props.employees"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Employee"
            class="w-full"
            autofocus
            :showClear="true"
            @change="value => onEmployeeChange(value, data, field, index)"
          />
        </template>
      </Column>

      <Column
        v-if="col.field === 'extra_coefficient_description'"
        field="seniority_coefficient"
        header="Seniority Coefficient"
      >
        <template #body="{ data }">
          {{ getSeniorityCoefficient(data.employee) }}
        </template>
      </Column>
    </template>
  </DataTable>

  <ContextMenu :model="contextMenuItems" ref="cm" />

  <ContextMenu :model="contextMenuItems" ref="cm" />
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Select from 'primevue/select';
import { FilterMatchMode } from "@primevue/core";
import { InputNumber } from "primevue";

interface TableItem {
  id: string;
  name: string;
  priority: string;
  feature: string;
  featureId: string;
  epic: string;
  epicId: string;
  employee?: string; 
  employeeName?: string; 
  seniority_coefficient?: number;
  type: 'epic' | 'feature' | 'task' | string
}

interface Employee {
  id: number;
  name: string;
  seniority_coefficient?: number;
}

const props = defineProps<{
  columns: TableColumn[];
  modelValue: TableItem[];
  employees: Employee[];
}>();

const emit = defineEmits(["update:modelValue"]);
const draggedRow = ref<TableItem | null>(null);
const cm = ref();
const selectedId = ref()
const selectedType = ref()

const globalFilterFields = ref(["epic", "feature", "name", "priority"]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const filterOptions = ref<{ [key: string]: { displayText: string; value: any }[] }>(
  {}
);

const options = ref([
  { displayText: "High", value: "High" },
  { displayText: "Normal", value: "Normal" },
  { displayText: "Low", value: "Low" },
]);

const generateFilterOptions = () => {
  const newFilterOptions: { [key: string]: { displayText: string; value: any }[] } =
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
        displayText: value,
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

function onPriorityChange(value: any, data: TableItem, field: string, index: number) {
  const updatedData = [...props.modelValue];
  updatedData[index][field] = value;
  emit('update:modelValue', updatedData);
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

  selectedId.value = entityId
  selectedType.value = entityType

  cm.value.show(event.originalEvent);
}

function onCellEditComplete(event: {
  originalEvent: Event,
  data: TableItem,
  newValue: any,
  field: string,
  index: number
}) {
  const updatedData = [...props.modelValue];
  const target = updatedData[event.index];

  if (event.field === 'epic' || event.field === 'feature') {
    const idField = `${event.field}Id` as 'epicId' | 'featureId';
    const idValue = target[idField];

    if (idValue) {
      updatedData.forEach(item => {
        if (item[idField] === idValue) {
          item[event.field] = event.newValue;
        }
      });
    }
  }
  else {
    target[event.field] = event.newValue;
  }

  if (['optimistic_estimation', 'realistic_estimation', 'pessimistic_estimation', 'extra_coefficient'].includes(event.field)) {
    target[event.field] = Number(event.newValue);

    const opt = Number(target.optimistic_estimation) || 0;
    const real = Number(target.realistic_estimation) || 0;
    const pess = Number(target.pessimistic_estimation) || 0;

    target.total_estimation = parseFloat(((opt + 4 * real + pess) / 6).toFixed(2));

    if (target.extra_coefficient) {
      target.total_estimation = target.total_estimation * target.extra_coefficient
    }
    
    target.total_estimation *= getSeniorityCoefficient(target.employee)

  }


  else if (event.field === 'total_estimation' && event.value !==  event.newValue) {
    if (target.extra_coefficient) {
      target.total_estimation = target.total_estimation * target.extra_coefficient
    }
    
    target.total_estimation *= getSeniorityCoefficient(target.employee)
  }
  
  emit('update:modelValue', updatedData);
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
  const currentIndex = currentData.findIndex(item => item.featureId === selectedRow.featureId);

  const featureGroupIndex = currentData.findIndex((item, i) =>
    i > currentIndex &&
    item.epicId === selectedRow?.epicId &&
    item.featureId !== selectedRow?.featureId
  );

  const insertIndex = featureGroupIndex !== -1 ? featureGroupIndex : currentIndex;

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
      result = result.filter(item => item.featureId !== selectedId.value);
      break;
    case 'epic':
      result = result.filter(item => item.epicId !== selectedId.value);
      break;
  }

  emit('update:modelValue', result);
}

const employeeMap = computed(() => {
  const map = new Map<number, string>();
  props.employees.forEach(emp => map.set(emp.id, emp.display_name));
  return map;
});

const getEmployeeName = (employeeId: number) => {
  const employee = props.employees.find(e => e.id === employeeId);
  return employee ? employee.name : '—';
};

function onEmployeeChange(event: { value: number }, data: TableItem, field: string, index: number) {
  const selectedEmployeeId = event.value;

  const updatedData = [...props.modelValue];
  const target = updatedData[index];
  target[field] = selectedEmployeeId;

  console.log(selectedEmployeeId)

  const employee = props.employees.find(e => e.id === selectedEmployeeId);
  target.seniority_coefficient = employee?.seniorityLevel.seniority_coefficient ?? 1;

  console.log(updatedData, updatedData[index], employee)

  emit('update:modelValue', updatedData);
}


function getSeniorityCoefficient(employeeId?: number): number {
  const employee = props.employees.find(e => e.id === employeeId);
  return employee?.seniorityLevel.seniority_coefficient ?? 1;
}

watch(() => props.modelValue, (newValue, oldValue) => {
  // Вызываем существующую функцию
  generateFilterOptions();
  
  if (!newValue?.length) {
    initializeDefaultData();
  }
  
}, { immediate: true });

watch(() => props.columns, generateFilterOptions, { immediate: true });



function initializeDefaultData() {
  if (!props.modelValue.length) {
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
}

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


  if (draggedType === 'epic' && targetType !== 'epic') {
    console.warn('Cannot drop Epic into non-Epic');
    return;
  }

  if (draggedType === 'feature' && targetType !== 'epic') {
    console.warn('Can only drop Feature into Epic');
    return;
  }

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

.p-datatable-table-container,
.p-datatable-header {
  width: 100dvw;
  max-width: 100%;
}
</style>
