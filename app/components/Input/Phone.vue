<template>
  <InputMain
      v-model="phoneNumber"
      type="tel"
      :data_mask="'+7 (###) ###-##-##'"
      :placeholder="placeholder"
      :label="label"
      :required="required"
  ></InputMain>
</template>
<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
});

const emits = defineEmits<{
  (eventName: "update:modelValue", value: string): void;
}>();

function editValue() {
  emits("update:modelValue", phoneNumber.value.replace(/[\s.,%)(-]/g, ""));
}
const phoneNumber = ref(props.modelValue);

watch(phoneNumber, () => {
  editValue();
});
</script>
