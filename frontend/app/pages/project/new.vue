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
                :options="evaluationModels?.data?.map(model => ({
                label: model.title,
                value: model.id
              }))"
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
        </section>
      </main>
    </div>
  </Transition>
</template>

<script setup lang="ts">

const step = ref(1);  // Текущий шаг, меняем на 2, когда переходим ко второму этапу

const columns = [
  { key: "epic", field: "epic", header: "Epic" },
  { key: "feature", field: "feature", header: "Feature" },
  { key: "name", field: "name", header: "Task" },
  { key: "priority", field: "priority", header: "Priority" },
];

const tableData = ref([
  { "id": "task-1", "name": "Task 1", "priority": "High", "feature": "feature-1", "featureId": "feature-1", "epic": "epic-1", "epicId": "epic-1" },
  { "id": "task-2", "name": "Task 2", "priority": "High", "feature": "feature-1", "featureId": "feature-1", "epic": "epic-1", "epicId": "epic-1" },
  { "id": "task-3", "name": "Task 3", "priority": "High", "feature": "feature-2", "featureId": "feature-2", "epic": "epic-1", "epicId": "epic-1" },
  { "id": "task-4", "name": "Task 4", "priority": "High", "feature": "feature-2", "featureId": "feature-2", "epic": "epic-1", "epicId": "epic-1" },
  { "id": "task-5", "name": "Task 5", "priority": "Normal", "feature": "feature-3", "featureId": "feature-3", "epic": "epic-2", "epicId": "epic-2" },
  { "id": "task-6", "name": "Task 6", "priority": "Normal", "feature": "feature-3", "featureId": "feature-3", "epic": "epic-2", "epicId": "epic-2" },
  { "id": "task-7", "name": "Task 7", "priority": "Normal", "feature": "feature-4", "featureId": "feature-4", "epic": "epic-2", "epicId": "epic-2" },
  { "id": "task-8", "name": "Task 8", "priority": "Normal", "feature": "feature-4", "featureId": "feature-4", "epic": "epic-2", "epicId": "epic-2" }
]);

const selectedEvaluationModel = ref();
const projectName = ref('')

// Получаем данные моделей оценки
const evaluationModels = await $fetch('/api/evaluationModel', {
  method: "GET",
});

// Функция для перехода на следующий этап
const goToNextStep = () => {
  step.value++;
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
  align-items: flex-start;
  padding: 2rem;
  margin-bottom: 2rem;

  .header-info{
    margin-bottom: 2rem;
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
