<template>
  <div class="input-container">
    <label
        class="text-input-label">
        <span>
          {{ label }}
          <span v-if="required" class="required">
            *
          </span>
        </span>
    </label>
    <textarea
        v-model="inputValue"
        :placeholder="placeholder"
        class="text-area"
        @input="errorMessage = false"
        :class="[errorMessage ? 'has-error' : '']"
        ref="input"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue']);

const inputValue = ref(props.modelValue);
const input = ref();
const errorMessage = ref(false)

function checkValid() {
  errorMessage.value = !(props.required && props.modelValue && props.modelValue.length > 0)
  return errorMessage.value
}

onMounted(() => {
  if (input.value) input.value.onsubmit = checkValid;
});

// Watch inputValue and emit the update
watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped>

.input-container {
  width: 100%;
  font-size: 1.4rem;
}

.text-input-label {
  display: block;
  margin-bottom: 0.8rem;
}

.text-area {
  width: 100%;
  padding: 1.2rem 1.2rem;
  border: 1px solid #D9D9D9;
  border-radius: .6rem;
  min-height: 10rem;
  resize: none;

  background-color: transparent;

  &:focus{
    outline: none;
    border-color: var(--accent);
  }
}

:deep(textarea::placeholder) {
    color: var(--inactive);
}

.text-area.has-error{
  border-color: var(--error);
}

.required{
  color: var(--error)
}
</style>