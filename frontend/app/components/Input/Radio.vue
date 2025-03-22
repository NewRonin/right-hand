<template>
  <div class="radio-container">
    <div class="radio-group-label">
      <span>
          {{ label }}
          <span v-if="required" class="required">
            *
          </span>
        </span>
    </div>
    <div v-for="option in options" :key="option.value" class="radio-option">
      <input
          type="radio"
          :id="`${option.value}`"
          :value="option.value"
          v-model="selectedValue"
      />
      <label :for="`${option.value}`">{{ option.label }}</label>
    </div>
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
    type: [String, Number, Boolean],
    default: false,
  },
  options: {
    type: Array,
    required: true,
    // Example structure: [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }]
  },
  required: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue']);

const selectedValue = ref(props.modelValue);

const idSuffix = Math.random().toString(36).substr(2, 9);

watch(selectedValue, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped lang="scss">

.radio-container{
  width: 100%;
  font-size: 1.4rem;

  display: flex;
  flex-flow: column nowrap;
  gap: .8rem;
}

.radio-group-label {
  margin-bottom: 0.8rem;
}

.radio-option {
  display: flex;
  align-items: center;

  margin-bottom: 0.5rem;

  * {
    @include hover {
      cursor: pointer;
    }
  }
}

.radio-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-option label {
  position: relative;
  padding-left: 3rem;
  cursor: pointer;
}

.radio-option label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1.8rem; /* Custom size */
  height: 1.8rem; /* Custom size */
  border-radius: 50%;
  border: .1rem solid #D9D9D9; /* Border color */
  background-color: transparent; /* Background color */
  transition: background-color 0.2s, border-color 0.2s;
}

.radio-option input[type="radio"]:checked + label::before {
  background-color: transparent; /* Custom active color */
  border-color: var(--accent); /* Change border color when checked */
}

.radio-option label::after {
  content: "";
  position: absolute;
  left: .5rem;
  top: 50%;
  transform: translateY(-50%);
  width: .8rem; /* Inner circle size */
  height: .8rem;
  background-color: transparent;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
}

.radio-option input[type="radio"]:checked + label::after {
  opacity: 1; /* Show inner circle when selected */
  background-color: var(--accent); /* Inner circle color */
}

.required{
  color: var(--error)
}
</style>