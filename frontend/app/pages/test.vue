<template>
  <Transition name="fade">
    <div class="page-container">
      <main>
        <section class="post-container">
          <div class="title"> Create Evaluation Model </div>
          <InputMain v-model="body.title" label="Title" required></InputMain>
          <VButton @click="sendForm"> Send data </VButton>
        </section>
      </main>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { useMainStore } from "~/stores/main";

  const store = useMainStore()

  const body = reactive({
    title: ''
  })

  async function sendForm() {
    try{
      const result = await $fetch<any>(
          store.getApi("/api/evaluationModel"),
          {
            method: "POST",
            body: body,
          }
      );
      console.log(result);
      // if (result.success) {
      //   navigateTo('/event')
      // }
    } catch {
      console.log('[Test/Async data]: Failed to send values')
    }
  }

</script>

<style scoped lang="scss">
.page-container {
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100dvh;

  @media (max-width: 833px) {
    padding-top: 0;
    min-height: 100%;
  }

  main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    background: var(--main);
    align-items: center;

    @media (max-width: 833px) {
      height: 100%;
      justify-content: space-between;
      padding-bottom: 2rem;
    }

    .post-container {
      width: 50%;
      height: 50%;
      border-radius: 2rem;
      background-color: var(--light-white);

      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;

      padding: 4rem;
      gap: 2rem;
    }

    .title {
      font-size: 3rem;
    }

  }
}
</style>
