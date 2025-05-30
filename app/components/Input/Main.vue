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
    <input
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        class="text-input"
        :class="[errorMessage ? 'has-error' : '']"
        ref="input"
        :data-maska="data_mask"
        @input="errorMessage = false"
        v-maska
    />
  </div>
</template>

<script setup>
import { vMaska } from "maska";
import {ref} from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  data_mask: {
    type: String,
    required: false,
  }
});

const emit = defineEmits(['update:modelValue']);

const inputValue = ref(props.modelValue);
const input = ref()
const errorMessage = ref(false)

function checkValid() {
  errorMessage.value = !(props.required && props.modelValue && props.modelValue.length > 0)
  return errorMessage.value
}

onMounted(() => {
  if (input.value) input.value.onsubmit = checkValid;
});

watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped lang="scss">

.input-container {
  width: 100%;
  font-size: 1.4rem;
}

.text-input-label {
  display: block;
  margin-bottom: 0.8rem;
}

.text-input {
  width: 100%;
  padding: 1.2rem 1.2rem;
  border: 1px solid #D9D9D9;
  border-radius: .6rem;

  background-color: transparent;

  &:focus{
    outline: none;
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--inactive);
  }
}

.text-input.has-error{
  border-color: var(--error);
}

.required{
  color: var(--error)
}

</style>