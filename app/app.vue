<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useMainStore } from "~/stores/main";

const store = useMainStore();

</script>
