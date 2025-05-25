<template>
  <Transition name="fade">
    <div class="page-container">
      <main>
        <section class="table-section">
          <div class="header-info">
            <h1 class="project-title">{{projectName || 'Unknown title' }}</h1>
            <div class="model-badge">{{ selectedEvaluationModel || 'Unknown evaluation model' }}</div>
          </div>

          <CTableWBS :columns="columns" v-model="tableData" />

          <div v-if="totalEstimate" class="estimate-info">
            <div class="total-estimate">
              <span class="label">Total estimate:</span>
              <span class="value">{{ totalEstimate }}</span>
            </div>
          </div>

          <div class="buttons-container">
            <VButton class="save-button" @click="updateProject" :disabled="isSaving">
              {{ isSaving ? "Saving..." : "Save Changes" }}
            </VButton>
          </div>
        </section>
      </main>
    </div>
  </Transition>
</template>

<script setup lang="ts">

const route = useRoute()

const columns : Ref<TableColumn[]> = ref([
  { key: "epic", field: "epic", header: "Epic" },
  { key: "feature", field: "feature", header: "Feature" },
  { key: "name", field: "name", header: "Task" },
  { key: "priority", field: "priority", header: "Priority" },
  { key: "total_estimation", field: "total_estimation", header: "Estimate"},
]);

const tableData = ref([]);
const selectedEvaluationModel = ref();
const projectName = ref('')
const isSaving = ref(false);
const store = useMainStore();

const projectId = computed(() => route.params.id);
const projectLoaded = ref(false);

const totalEstimate = computed(() => {
  let result = 0

  for(let i of tableData.value){
    result+=i.total_estimation
  }

  return result
})

onMounted(async () => {
  if (projectId.value) {
    try {
      const response = await $fetch(store.getApi(`/api/project?id=${projectId.value}`));
      if (response.success) {
        const project = response.data;
        projectName.value = project.title;
        selectedEvaluationModel.value = project.evaluationModel.title;
        projectLoaded.value = true;
      }

      const flatItems = await $fetch(store.getApi('/api/tableItems'), {
        query: { projectId : projectId.value }, 
        method: "GET",
      });
      
      if (flatItems.success) {

        tableData.value = flatItems.data || []
      }


    } catch (error) {
      console.error("Failed to load project:", error);
    }
  }
});

const updateProject = async () => {
  try {
    const data = await $fetch(store.getApi('/api/tableItems/'), {
      method: 'PUT',
      params: { projectId: projectId.value }, 
      body: {
        items: tableData.value,
      },
    });

    console.log('Project updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error; 
  }
};

watch (selectedEvaluationModel, () => {
  if (selectedEvaluationModel.value === "PERT") {
    columns.value = [
      { key: "epic", field: "epic", header: "Epic" },
      { key: "feature", field: "feature", header: "Feature" },
      { key: "name", field: "name", header: "Task" },
      { key: "priority", field: "priority", header: "Priority" },
      { key: "optimistic_estimation", field: "optimistic_estimation", header: "Optimistic"},
      { key: "realistic_estimation", field: "realistic_estimation", header: "Realistic"},
      { key: "pessimistic_estimation", field: "pessimistic_estimation", header: "Pessimistic"},
      { key: "total_estimation", field: "total_estimation", header: "Estimate", disabled: true},
    ]
  }
  else if (selectedEvaluationModel.value === "T-Shirt Size") {
    columns.value = [
      { key: "epic", field: "epic", header: "Epic" },
      { key: "feature", field: "feature", header: "Feature" },
      { key: "name", field: "name", header: "Task" },
      { key: "priority", field: "priority", header: "Priority" },
      { key: "t_shirt_size", field: "t_shirt_size", header: "T-Shirt"},
    ]
  }
  else {
    columns.value = [
      { key: "epic", field: "epic", header: "Epic" },
      { key: "feature", field: "feature", header: "Feature" },
      { key: "name", field: "name", header: "Task" },
      { key: "priority", field: "priority", header: "Priority" },
      { key: "total_estimation", field: "total_estimation", header: "Estimate"},
    ]
  }
})
</script>

<style scoped lang="scss">
.page-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f7fa;
  padding: 2rem 1rem;

  main {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-flow: column nowrap;
  }
}

.table-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .header-info {
    margin-bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .project-title {
      font-size: 1.8rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }

    .model-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: var(--main-transperent);
      color: var(--main);
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

.estimate-info {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eaeef2;

  .total-estimate {
    display: flex;
    align-items: center;
    gap: 1rem;

    .label {
      font-size: 1.1rem;
      color: #7f8c8d;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--main);
    }
  }
}

.buttons-container {
  margin-top: 3rem;
  display: flex;
  justify-content: flex-end;

  .save-button {
    padding: 0.8rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    border: none;
    transition: all 0.2s ease;
    min-width: 180px;
  }
}

/* Анимация перехода */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .table-section {
    padding: 1.5rem;

    .header-info {
      .project-title {
        font-size: 1.5rem;
      }
    }
  }

  .estimate-info {
    .total-estimate {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }

  .buttons-container {
    justify-content: center;
  }
}
</style>
