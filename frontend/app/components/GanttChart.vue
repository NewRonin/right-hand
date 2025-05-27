<template>
  <div>
    <div ref="ganttContainer" class="overflow-x-auto" style="min-width: 1000px;" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Gantt from 'frappe-gantt'

const ganttContainer = ref(null)

const tasks = [
  {
    id: '1.1.1',
    name: 'Форма создания проекта',
    start: '2025-06-01',
    end: '2025-06-01',
    progress: 0,
  },
  {
    id: '1.1.2',
    name: 'Выбор модели оценки',
    start: '2025-06-02',
    end: '2025-06-02',
    progress: 0,
  },
  {
    id: '1.2.1',
    name: 'UI WBS',
    start: '2025-06-03',
    end: '2025-06-05',
    progress: 0,
  },
  {
    id: '1.2.2',
    name: 'Редактирование и удаление',
    start: '2025-06-06',
    end: '2025-06-07',
    progress: 0,
  },
  {
    id: '2.1.1',
    name: 'Интерфейс ввода',
    start: '2025-06-08',
    end: '2025-06-08',
    progress: 0,
  },
  {
    id: '2.1.2',
    name: 'Множественные оценки',
    start: '2025-06-09',
    end: '2025-06-09',
    progress: 0,
  },
  {
    id: '2.2.1',
    name: 'Агрегация оценок',
    start: '2025-06-10',
    end: '2025-06-12',
    progress: 0,
  },
  {
    id: '3.2.2',
    name: 'Расчёт временной шкалы',
    start: '2025-06-13',
    end: '2025-06-15',
    progress: 0,
  },
  {
    id: '4.2.1',
    name: 'Диаграмма Ганта',
    start: '2025-06-16',
    end: '2025-06-18',
    progress: 0,
  },
  {
    id: '5.1.2',
    name: 'Оптимизация UI',
    start: '2025-06-19',
    end: '2025-06-20',
    progress: 0,
  }
]

onMounted(() => {
  if (ganttContainer.value) {
    new Gantt(ganttContainer.value, tasks, {
      view_mode: 'Month',
      custom_popup_html: null,
    })
  }
})
</script>
