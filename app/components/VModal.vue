<template>
  <Transition name="fade">
    <div v-if="modelValue" class="modal-container">
      <div
        @click="emit('update:modelValue', false)"
        class="close-background"
      >
      </div>
      <div class="container-block" ref="modal">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>
<script setup lang="ts">
    const props = defineProps({
        modelValue: { type: Boolean, default: false },
    });

    const modal = ref();
    const emit = defineEmits(["update:modelValue"]);

    watch(
        () => props.modelValue,
        () => {
            if (props.modelValue) {
            document.documentElement.style.overflow = "hidden";
            } else {
            document.documentElement.style.overflow = "auto";
            }
        }
    );
</script>

<style lang="scss" scoped>
.close-background {
  position: fixed;
  width: 100vw;
  height: 100svh;
}
.modal-container {
  box-sizing: border-box;
  width: 100vw;
  height: 100svh;
  min-height: fit-content;
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  background: RGBA(112, 112, 112, 0.2);
  backdrop-filter: blur(10px);
  overflow: auto;
  .container-block {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 700px;

    @media (max-height: 699px) {
      min-height: 0px;
    }
  }
}
.fade-enter-active {
  opacity: 0;

  .modal-container-block {
    transition: all 0.3s ease;
    transform: translateY(50px);
  }
}

.fade-enter-to {
  transition: all 0.3s ease;
  opacity: 1;

  .modal-container-block {
    transition: all 0.3s ease;
    transform: translateY(0);
  }
}

.fade-leave-active {
  transition: all 0.3s ease;
  opacity: 0;

  .modal-container-block {
    transition: all 0.3s ease;
    transform: translateY(50px);
  }
}

@media screen and (max-width: 1439px) {
  .modal-container {
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;

    .container-block {
      height: 100%;
      width: 100%;
      min-height: fit-content;

      :deep(.modal-window) {
        margin: 267px 97px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

@media screen and (max-width: 833px) {
  .modal-container {
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;

    .container-block {
      height: 100%;
      width: 100%;
      min-height: fit-content;

      :deep(.modal-window) {
        margin: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
