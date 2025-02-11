<template>
  <Transition name="fade">
  <div class="page-container">
    <main>
      <CTableTree :columns="columns" v-model="tableData" />
    </main>
  </div>
  </Transition>
</template>

<script setup lang="ts">

const columns = [
  { key: "epic", label: "Epic" },
  { key: "feature", label: "Feature" },
  { key: "task", label: "Task" }
];

const tableData = ref([
  {
    name: "Epic 1",
    children: [
      {
        name: "Feature 1",
        children: [{ name: "Task 1" }, { name: "Task 2" }]
      },
      {
        name: "Feature 2",
        children: [{ name: "Task 3" }, { name: "Task 4" }]
      },
      {
        name: "Feature 3",
        children: []
      }
    ]
  },
  {
    name: "Epic 2",
    children: [
      {
        name: "Feature 3",
        children: [{ name: "Task 5" }]
      }
    ]
  },
  {
    name: "Epic 3",
    children: []
  }
]);
</script>

<style scoped lang="scss">
  .page-container{
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
</style>