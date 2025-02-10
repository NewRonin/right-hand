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
      <tbody v-if="modelValue">
        <template v-for="(epic, epicIndex) in modelValue" :key="epicIndex">
          <template v-for="(feature, featureIndex) in epic.children" :key="featureIndex">
            <template v-for="(task, taskIndex) in feature.children" :key="taskIndex">
              <tr>
                <td
                  v-if="featureIndex === 0 && taskIndex === 0"
                  :rowspan="epic.children?.reduce((sum, f) => { return f.children ? sum + f.children?.length : 0 }, 0)"
                  class="table-cell epic-cell"
                >
                  {{ epic.name }}
                </td>

                <td
                  v-if="taskIndex === 0"
                  :rowspan="feature.children?.length"
                  class="table-cell feature-cell"
                >
                  {{ feature.name }}
                </td>

                <td class="table-cell task-cell">
                  {{ task.name }}
                </td>
              </tr>
            </template>
          </template>
        </template>
      </tbody>
    </table>
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

const addEpic = () => {
  props.modelValue.push({
    name: `New Epic ${props.modelValue.length + 1}`,
    children: []
  });
  emit("update:modelValue", props.modelValue);
};

const addFeature = (epicIndex: number) => {
  props.modelValue[epicIndex].children?.push({
    name: `New Feature `,
    children: []
  });
  emit("update:modelValue", props.modelValue);
};

const addTask = (epicIndex: number, featureIndex: number) => {
  props.modelValue[epicIndex].children?.[featureIndex]?.children?.push({
    name: `New Task`,
    children: []
  });
  emit("update:modelValue", props.modelValue);
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