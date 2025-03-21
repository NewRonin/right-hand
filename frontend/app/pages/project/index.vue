<template>
  <div class="project-page">
    <div class="title">No projects found</div>
    <VButton @click="redirectToNewProject">Create project</VButton>
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
  justify-content: space-between;
  align-items: center;
  flex-flow: column wrap;
  height: calc(100dvh - 10rem);
  padding: 6rem 1rem;
  background-color: var(--light-gray);

  button {
    width: 80%;
  }

  .title {
    font-size: 2rem;
  }
}
</style>
