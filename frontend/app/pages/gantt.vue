<template>
  <div width='100%' class="p-8">
    <h1 class="text-2xl font-bold mb-4">Диаграмма Ганта: PERT</h1>
    <ClientOnly>
      <GanttChart />
    </ClientOnly>
  </div>
</template>

<script setup>
import GanttChart from '~/components/GanttChart.vue'
</script>
