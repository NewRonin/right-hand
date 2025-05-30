<template>
  <button :disabled="disabled" class="btn" @click="onClick">
    <slot></slot>
  </button>
</template>

<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

const onClick = (event) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<style scoped lang="scss">
.btn {
  width: 100%;
  height: 5rem;
  padding: 1.3rem 4.4rem;
  font-size: 2rem;
  font-weight: 600;
  border: 1px;
  border-radius: 20px;
  background-color: var(--accent);
  color: var(--light-white);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn {
  @include hover {
    background-color: var(--main);
    cursor: pointer;
  }
}

/* Disabled state */
.btn:disabled {
  background-color: var(--inactive);
  cursor: not-allowed;
}
</style>