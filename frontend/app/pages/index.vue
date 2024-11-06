<template>
  <Transition name="fade">
  <div class="page-container">
    <main>
      
    </main>
  </div>
  </Transition>
</template>

<script setup lang="ts">

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