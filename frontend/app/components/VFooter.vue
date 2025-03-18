<template>
  <footer>
    <section class="content">
      <div class="socials">
        <div class="title">
        </div>
        <div class="icons">
        </div>
      </div>
      <div class="copyright">
        © HSE 2025
      </div>
    </section>
  </footer>
</template>

<script setup lang="ts">

  const props = defineProps({
    isScaled : {
      type: Boolean,
      default: false,
    }
  })

</script>

<style scoped lang="scss">
footer {
  width: 100%;
  height: 19rem;

  display: flex;
  justify-content: center;
  align-items: center;

  background: var(--base-black);
  color: var(--light-white);

  @media (max-width: 833px) {
    height: 10rem;
  }

  .content {
    width: 138rem;
    padding: 4.8rem 6.4rem;

    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 1400px) {
      width: 100%;
    }

    @media (max-width: 833px) {
      padding: 2rem;
    }
  }
}

.socials {
  display: flex;
  flex-flow: column nowrap;
  gap: 2.4rem;

  .title{
    font-size: 2rem;

    @media (max-width: 833px) {
      display: none;
    }
  }

  .icons{
    &>a>img{
      width: 4.2rem;
      height: 4.2rem;
      transition: transform 0.3s ease-in-out;

      @media (max-width: 600px) {
        width: 3rem;
        height: 3rem;
      }

      &.scaled-up {
        animation: scaleUp 1s ease infinite;
      }
    }
  }
}

.copyright{
  font-size: 2rem;

  @media (max-width: 500px) {
    font-size: 1.4rem;
  }
}

@keyframes scaleUp {
  0% {
    transform: scale(1); 
  }
  50% {
    transform: scale(1.2); 
  }
  100% {
    transform: scale(1); 
  }
}
</style>