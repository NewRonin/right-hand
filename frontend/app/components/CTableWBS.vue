<template>
    <DataTable
      :value="props.modelValue"
      rowGroupMode="rowspan"
      :groupRowsBy="rowsGroup"
      sortMode="single"
      :sortOrder="1"
      tableStyle="min-width: 50rem"
      resizableColumns 
      columnResizeMode="fit" 
      showGridlines
      reorderableRows
      @rowReorder="onRowReorder"
    >
        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"></Column>
        <Column rowReorder headerStyle="width: 3rem" :reorderableColumn="false" />
    </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

interface TableColumn {
    key: string;
    field: string;
    header: string,
}

const props = defineProps<{
    columns: TableColumn[];
    modelValue: TableItem[];
}>();

const emit = defineEmits(["update:modelValue"]);
const rowsGroup = ['epic', 'feature']

const onRowReorder = (event: any) => {
  const reorderedData = event.value;
  emit("update:modelValue", reorderedData);
};


</script>