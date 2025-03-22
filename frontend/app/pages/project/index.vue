<template>
  <div class="project-page">
    <div v-if="projects.length === 0" class="title">No projects found</div>
    <div v-else class="projects-grid">
      <div v-for="project in projects.data" :key="project.id" class="project-card" @click="openProject(project.id)">
        <div class="icon">🚧</div>
        <div class="project-title">{{ project.title }}</div>
      </div>
    </div>
    <VButton @click="redirectToNewProject">Create project</VButton>
  </div>
</template>

<script setup>
const router = useRouter();
const store = useMainStore();

const {data: projects} = await useFetch(
  store.getApi("/api/project"), {
    onResponse(response){
      console.log(response)
    }
  }
);

const openProject = (id) => {
  router.push(`/project/${id}`);
};

const redirectToNewProject = () => {
  router.push("/project/new");
};

</script>

<style scoped lang="scss">
.project-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: calc(100dvh - 10rem);
  width: 100%;
  padding: 6rem 1rem;
  background-color: var(--light-gray);

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    width: 100%;
    max-width: 800px;
    margin-bottom: 2rem;
  }

  .project-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    .icon {
      font-size: 3rem;
    }

    .project-title {
      margin-top: 0.5rem;
      font-size: 1.1rem;
      font-weight: bold;
      text-align: center;
      word-break: break-word;
    }
  }

  button {
    width: 80%;
  }

  .title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
}
</style>
