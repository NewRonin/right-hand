<template>
  <Transition name="fade">
    <div class="page-container">
      <main>
        <section class="table-section">
          <div class="header-info">
            <h2> Project name: {{projectName || 'Unknown title' }}</h2>
            <p> Model: {{ selectedEvaluationModel || 'Unknown evaluation model' }}</p>
          </div>

          <CTableWBS :columns="columns" v-model="tableData" />

          <div class="estimate-info">
            <h1>{{ `Total estimate: ${totalEstimate}` }}</h1>
          </div>

          <div class="buttons-container">
            <VButton class="save-button" @click="updateProject" :disabled="isSaving">
              {{ isSaving ? "Saving..." : "Save" }}
            </VButton>
          </div>
        </section>
      </main>
    </div>
  </Transition>
</template>

<script setup lang="ts">

const route = useRoute()

const columns = [
  { key: "epic", field: "epic", header: "Epic" },
  { key: "feature", field: "feature", header: "Feature" },
  { key: "name", field: "name", header: "Task" },
  { key: "priority", field: "priority", header: "Priority" },
  { key: "total_estimation", field: "total_estimation", header: "Estimate"},
];

const tableData = ref([]);
const selectedEvaluationModel = ref();
const projectName = ref('')
const isSaving = ref(false);
const store = useMainStore();
const router = useRouter()

const evaluationModels = await $fetch('/api/evaluationModel', {
  method: "GET",
});

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
    const response = await useFetch(store.getApi(`/api/tableItems/`), {
      method: 'PUT',
      query: { projectId : projectId.value }, 
      body: {
        items: tableData.value,
      },
    })

    if (response.error) {
      throw new Error(response.error.message)
    }

    console.log('Project updated successfully:', response.data)
  } catch (error) {
    console.error('Failed to update project:', error)
  }
}
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
