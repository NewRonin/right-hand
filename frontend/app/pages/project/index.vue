<template>
  <div class="project-page">
    <div class="title">Welcome!</div>
    <VButton @click="redirectToNewProject">Go to New Project</VButton>
  </div>
</template>

<script setup>
const router = useRouter();

const redirectToNewProject = () => {
  router.push("/project/new");
};
</script>

<style scoped lang="scss">
.project-page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  gap: 50%;
  height: 100vh;
  background-color: var(--light-gray);

  button {
    width: 80%;
  }

  .title {
    font-size: 6rem;
  }
}
</style>
