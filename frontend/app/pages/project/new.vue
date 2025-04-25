<template>
  <Transition name="fade">
    <div class="page-container">
      <main>
        <section v-if="step === 2" class="selection-section">
          <div class="selection-container">
            <InputRadio
                v-model="selectedEvaluationModel"
                :label="'Evaluation model'"
                :options="evaluationModels?.data?.map(model => ({
                label: model.title,
                value: model.id
              }))"
                required
            />
          </div>
          <div class="buttons-container">
            <VButton class="next-button" @click="goToNextStep" :disabled="!selectedEvaluationModel">Next</VButton>
          </div>
        </section>
        <section v-else-if="step === 1" class="selection-section">
          <div class="selection-container">
            <InputMain
                v-model="projectName"
                :label="`Project title`"
                required
            />
          </div>
          <div class="buttons-container">
            <VButton class="next-button" @click="goToNextStep" :disabled="!projectName">Next</VButton>
          </div>
        </section>
        <section v-else class="table-section">
          <div class="header-info">
            <h2> Project name: {{projectName || 'Unknown title' }}</h2>
            <p> Model: {{ selectedEvaluationModel ? evaluationModels?.data?.find(model => model.id === selectedEvaluationModel)?.title : 'Unknown evaluation model' }}</p>
          </div>

          <CTableWBS :columns="columns" v-model="tableData" />

          <div class="estimate-info">
            <h1>{{ `Total estimate: ${totalEstimate}` }}</h1>
          </div>

          <div class="buttons-container">
            <VButton class="save-button" @click="saveProject" :disabled="isSaving">
              {{ isSaving ? "Saving..." : "Save" }}
            </VButton>
          </div>
        </section>
      </main>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const step = ref(1);  
const route = useRoute()

const columns = [
  { key: "epic", field: "epic", header: "Epic" },
  { key: "feature", field: "feature", header: "Feature" },
  { key: "name", field: "name", header: "Task" },
  { key: "priority", field: "priority", header: "Priority" },
  { key: "total_estimation", field: "total_estimation", header: "Estimate"},
];

const tableData = ref([
    {
      "id": "15",
      "name": "Task 2",
      "featureId": "9",
      "feature": "Feature 1",
      "epicId": "8",
      "epic": "Epic 2",
      "optimistic_estimation": null,
      "realistic_estimation": null,
      "pessimistic_estimation": null,
      "t_shirt_size": null,
      "total_estimation": null,
      "priority": "Normal"
    },
    {
      "id": "16",
      "name": "Task 4",
      "featureId": "9",
      "feature": "Feature 1",
      "epicId": "8",
      "epic": "Epic 2",
      "optimistic_estimation": null,
      "realistic_estimation": null,
      "pessimistic_estimation": null,
      "t_shirt_size": null,
      "total_estimation": null,
      "priority": "Normal"
    }
  ]);

const selectedEvaluationModel = ref();
const projectName = ref('')
const isSaving = ref(false);
const store = useMainStore();
const router = useRouter()

const totalEstimate = computed(() => {
  let result = 0

  for(let i of tableData.value){
    result+=i.total_estimation
  }

  return result
})

const evaluationModels = await $fetch('/api/evaluationModel', {
  method: "GET",
});

const goToNextStep = () => {
  step.value++;
};

const saveProject = async () => {
  if (!projectName.value || !selectedEvaluationModel.value) return;
  
  isSaving.value = true;
  
  try {
    // Сначала создаем проект
    const projectResponse = await $fetch(store.getApi('/api/project'), {
      method: "POST",
      body: {
        title: projectName.value,
        evaluationModelId: selectedEvaluationModel.value,
        description: "New project created",
      },
    });

    if (projectResponse.success) {
      // Затем сохраняем табличные данные
      const tableResponse = await $fetch(store.getApi('/api/tableItems'), {
        method: "POST",
        query: { projectId : projectResponse.data.id }, 
        body: {
          items: tableData.value,
        },
      });

      if (tableResponse.success) {
        router.push(`/project/${projectResponse.data.id}`); 
      } else {
        console.error("Failed to save table items:", tableResponse);
      }
    } else {
      console.error("Failed to save project:", projectResponse);
    }
  } catch (error) {
    console.error("Error saving project:", error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped lang="scss">
.page-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 5.6rem;

  @media (max-width: 833px) {
    padding-top: 0;
    min-height: 100%;
  }

  main {
    width: 80%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;

    @media (max-width: 833px) {
      height: 100%;
      justify-content: space-between;
      padding-bottom: 2rem;
    }
  }
}

.selection-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  margin-bottom: 2rem;
}

.table-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  margin-bottom: 2rem;

  .header-info{
    margin-bottom: 4rem;
  }
}

.selection-container {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.buttons-container {
  width: 100%;
  height: 4rem;
  max-width: 500px;
  display: flex;
  justify-content: center;
  margin-top: 4rem;
}

.next-button {
  width: 100%;
  height: 100%;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  justify-content: center;

  &:hover {
    background-color: var(--accent);
  }

  &:disabled {
    background-color: #dcdcdc;
    cursor: not-allowed;
  }
}
</style>