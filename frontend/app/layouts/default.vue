<template>
  <div class="layout">
    <VHeader class="header" @toFooter="scrollToFooter" />
    <div class="content">
      <slot />
    </div>
    <VFooter id="footer" :isScaled="scaleContacts" />
  </div>
</template>

<script setup lang="ts">

const scaleContacts = ref(false)

function scrollToFooter() {
  const footer = document.getElementById('footer');

  if (footer) {
    footer.scrollIntoView({ behavior: 'smooth' });
    scaleContacts.value = true

    setTimeout(() => scaleContacts.value = false, 4000)
  }
}
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  width: 100dvw;
  min-height: 100dvh;
  overflow: hidden;
}

.content{
  flex: 1;
}
</style>
