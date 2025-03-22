<template>
  <DataTable
    :value="props.modelValue"
    rowGroupMode="rowspan"
    :groupRowsBy="['epic', 'feature']"
    tableStyle="min-width: 100rem"
  >
    <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"></Column>
    <Column headerStyle="width: 6rem">
      <template #body="slotProps">
        <div
          draggable="true"
          @dragstart="onDragStart($event, slotProps.data)"
          @dragover="onDragOver"
          @drop="onDrop($event, slotProps.data)"
          style="cursor: grab"
        >
          ⠿
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

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

const onDragStart = (event: DragEvent, row: TableItem) => {
  draggedRow.value = row;
  event.dataTransfer?.setData("text/plain", row.id);
};

const onDrop = (event: DragEvent, targetRow: TableItem) => {
  event.preventDefault();
  if (!draggedRow.value || draggedRow.value.id === targetRow.id) return;

  const updatedData = [...props.modelValue];
  const draggedIndex = updatedData.findIndex(item => item.id === draggedRow.value?.id);
  const targetIndex = updatedData.findIndex(item => item.id === targetRow.id);

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

</style>
