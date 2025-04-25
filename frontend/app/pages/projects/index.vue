<template>
  <div class="project-page">
    <div v-if="projects.length === 0" class="title">No projects found</div>
    <div v-else class="projects-grid">
      <div v-for="project in projects.data" :key="project.id" class="project-card" @click="openProject(project.id)">
        <div class="icon">🚧</div>
        <div class="project-content">
          <div class="project-title">{{ project.title }}</div>
          <div class="project-model">Model: {{ project.evaluationModel.title }}</div>
        </div>
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
  router.push(`/projects/${id}`);
};

const redirectToNewProject = () => {
  router.push("/projects/new");
};

</script>

<style scoped lang="scss">
.project-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background-color: var(--light-gray);
  min-height: calc(100dvh - 10rem);

  .title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .projects-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 900px;
    margin-bottom: 2rem;
  }

  .project-card {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background: var(--light-white);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    min-height: 120px;
    border-left: 6px solid var(--main);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }

    .icon {
      font-size: 2.8rem;
      margin-right: 1.5rem;
      flex-shrink: 0;
      opacity: 0.8;
    }

    .project-content {
      flex-grow: 1;
      overflow: hidden;
    }

    .project-title {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .project-model {
      font-size: 1rem;
      color: var(--main);
      font-weight: 500;
      margin-bottom: 0.8rem;
      display: inline-block;
      padding: 0.3rem 0.8rem;
      background: var(--main-transperent);
      border-radius: 20px;
    }

    .project-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;

      .stat-item {
        color: #7f8c8d;
        display: flex;
        align-items: center;

        &::before {
          content: "•";
          margin-right: 0.4rem;
          color: #bdc3c7;
        }
      }
    }
  }

  button {
    width: 100%;
    max-width: 900px;
    margin-top: auto;
    padding: 1rem;
  }
}
</style>