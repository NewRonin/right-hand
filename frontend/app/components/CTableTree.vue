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
        <template v-for="(epic, epicIndex) in data" :key="epicIndex">
          <template v-for="(feature, featureIndex) in epic.children" :key="featureIndex">
            <template v-for="(task, taskIndex) in feature.children" :key="taskIndex">
              <tr>
                <td
                  v-if="featureIndex === 0 && taskIndex === 0"
                  :rowspan="epic.children.reduce((sum, f) => sum + f.children.length, 0)"
                  class="table-cell epic-cell"
                >
                  {{ epic.name }}
                </td>

                <td
                  v-if="taskIndex === 0"
                  :rowspan="feature.children.length"
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
  data: Epic[];
}>();

const emit = defineEmits(["update:data"]);

const tableData = reactive<Epic[]>(props.data);

const addEpic = () => {
  tableData.push({
    name: `New Epic ${tableData.length + 1}`,
    children: []
  });
  emit("update:data", tableData);
};

const addFeature = (epicIndex: number) => {
  tableData[epicIndex].children.push({
    name: `New Feature ${tableData[epicIndex].children.length + 1}`,
    children: []
  });
  emit("update:data", tableData);
};

const addTask = (epicIndex: number, featureIndex: number) => {
  tableData[epicIndex].children[featureIndex].children.push({
    name: `New Task ${tableData[epicIndex].children[featureIndex].children.length + 1}`
  });
  emit("update:data", tableData);
};
</script>


<style scoped>
.table-container {
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