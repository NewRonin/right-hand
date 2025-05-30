<template>
  <div>
    <div
      ref="ganttContainer"
      class="overflow-x-auto"
      style="min-width: 1000px"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Gantt from "frappe-gantt";

const ganttContainer = ref(null);
const ganttInstance = ref(null);

const props = defineProps({
  modelValue: { type: Array, required: true },
});

const emit = defineEmits(["update:modelValue"]);

const isInternalChange = ref(false);

function transformTasks(data) {
  return data.map((task) => ({
    id: task.id,
    name: task.name,
    start: stripTime(formatDateLocal(task.start_date)) ?? stripTime(new Date()),
    end: stripTime(formatDateLocal(task.end_date)) ?? stripTime(addOneDay()),
    progress: task.progress ?? 0,
  }));

}

function formatDateLocal(date) {
  const d = new Date(stripTime(date));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addOneDay() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

const stripTime = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

function renderGantt() {
  const tasks = transformTasks(props.modelValue);
  console.log(props.modelValue, tasks)

  if (ganttContainer.value) {
    ganttContainer.value.innerHTML = "";

    ganttInstance.value = new Gantt(ganttContainer.value, tasks, {
      view_mode: "Day",
      custom_popup_html: null,

      on_date_change: (task, start, end) => {
        isInternalChange.value = true;

        const updatedTasks = props.modelValue.map((t) =>
          t.id === task.id
            ? {
                ...t,
                start_date: stripTime(start),
                end_date: stripTime(end),
              }
            : t
        );

        emit("update:modelValue", updatedTasks);
      },

      on_progress_change: (task, progress) => {
        isInternalChange.value = true;
        const updatedTasks = props.modelValue.map((t) =>
          t.id === task.id ? { ...t, progress } : t
        );
        emit("update:modelValue", updatedTasks);
      },
    });
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (isInternalChange.value) {
      isInternalChange.value = false;
      return;
    }

    if (ganttInstance.value) {
      const tasks = transformTasks(newVal);
      ganttInstance.value.refresh(tasks);
    } else {
      renderGantt();
    }
  },
  { deep: true }
);

onMounted(() => {
  renderGantt();
});
</script>
