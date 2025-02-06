<template>
  <Transition name="fade">
  <div class="page-container">
    <main>
      <CTableTree :columns="columns" :data="tableData" />
    </main>
  </div>
  </Transition>
</template>

<script setup lang="ts">

// Define column structure dynamically
const columns = [
  { key: "epic", label: "Epic" },
  { key: "feature", label: "Feature" },
  { key: "task", label: "Task" }
];

// Define nested table data
const tableData = [
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
  }
];
</script>

<style scoped lang="scss">
  .page-container{
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;

    padding-top: 5.6rem;

    @media (max-width: 833px) {
      padding-top: 0;
      min-height: 100%;
    }

    main {
      width: 100%;
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