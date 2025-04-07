<template>
  <header>
    <nav>
<!--      <NuxtImg class="logo" src="/sprites/logo.svg" />-->
      <div class="links">
        <div
          v-for="link in links"
          :class="[link.enabled || link.custom ? 'link' : 'link-disabled']"
          @click="headerClickHandler($event, link)"
        >
          <NuxtLink
            v-if="!link.custom"
            :to="link.link"
          >
            {{ link.name }}
          </NuxtLink>

          <div v-else>
            {{ link.name }}
          </div>
        </div>
      </div>
      <NuxtImg class="menu" src="/sprites/menu.svg" @click="openModal = !openModal" />
    </nav>

    <VModal v-model="openModal">
      <div class="modal-window">
        <div class="img-close">
          <NuxtImg src="/sprites/close.svg" @click="openModal = !openModal" />
        </div>
        <div class="mobile-links">
          <div
            v-for="link in links"
            :class="[link.enabled || link.custom ? 'link' : 'link-disabled']"
            @click="headerClickHandler($event, link, true)"
          >
            <NuxtLink
              v-if="!link.custom"
              :to="link.link"
            >
              {{ link.name }}
            </NuxtLink>

            <div v-else>
              {{ link.name }}
            </div>
          </div>
        </div>
      </div>
    </VModal>
  </header>
</template>

<script setup lang="ts">
import VModal from './VModal.vue';

const links: HeaderLink[] = [
  { name: "Home", link: "/", enabled: true },
  { name: "Projects", link: "/project", enabled: true },
  { name: "Roles", link: "/roles", enabled: true },
  { name: "Employees", link: "/employees", enabled: true },
];

const emit = defineEmits(['toFooter'])
const openModal = ref(false)

function headerClickHandler(event: Event, link: HeaderLink, mobile = false) {
  if (link.custom) {
    switch(link.action) {
      case 'contacts':
        emit('toFooter')
        break;
    }
  }

  if (mobile) {
    openModal.value = false
  }
}
</script>

<style scoped lang="scss">
header {
  width: 100dvw;
  height: 10rem;
  overflow-x: hidden;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  @media (max-width: 1400px) {
    justify-content: flex-start;
  }

  nav {
    z-index: 100;
    position: fixed;
    width: 1380px;
    padding: 2rem 6.4rem;

    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;

    border-radius: 0 0 2rem 2rem;
    background: var(--light-white);
    color: var(--base-black);

    -webkit-box-shadow: 0px 4px 4px 0px #00000040;
    -moz-box-shadow: 0px 4px 4px 0px #00000040;
    box-shadow: 0px 4px 4px 0px #00000040;

    @media (max-width: 1400px) {
      width: 100%;
    }

    @media (max-width: 833px) {
      padding: 2rem;
    }
  }
}

.logo {
  width: auto;
  height: 4rem;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(13%) sepia(1%) saturate(0%)
    hue-rotate(116deg) brightness(97%) contrast(97%);
  user-select: none;

  @media (max-width: 833px) {
    height: 2rem;
  }
}

.menu {
  display: none;

  @media (max-width: 833px) {
    display: block;
    height: 3rem;
    width: auto;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(13%) sepia(1%) saturate(0%)
      hue-rotate(116deg) brightness(97%) contrast(97%);
    user-select: none;
  }
}

.modal-window {
  z-index: 100;
  background-color: var(--light-white);

  width: 100dvw;
  height: calc(100dvh - 32px);
  border-radius: 1.6rem;
  align-items: flex-start !important;
  justify-content: flex-start !important;

  padding: 1.6rem;

  flex-flow: column nowrap;

  .img-close {
    width: 100%;
    height: 2.4rem;

    display: flex;
    justify-content: flex-end;

    img {
      height: 100%;
      width: auto;
    }
  }
}

.links {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: 5.6rem;

  font-size: 1.6rem;
  font-weight: 600;

  @media (max-width: 833px) {
    display: none;
  }
}

.mobile-links {
  display: none;

  @media (max-width: 833px) {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4.8rem;

    font-size: 2rem;
    font-weight: 600;

    padding-top: 2.4rem;
    width: 100%;
  }
}

.link {
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
  @include hover {
    color: var(--main);
    cursor: pointer;
  }

  @media (max-width: 833px) {
    position: relative;
    width: 100%;
    text-align: center;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      display: block;
      bottom: -2.4rem;
      left: 50%;
      transform: translate(-50%, 0);
      width: 90%;
      height: .1rem;
      background-color: var(--base-black);
      opacity: 0.15;
      border-radius: 95px;
    }
  }
}

.link-disabled {
  display: none;
}
</style>
