export default defineNuxtRouteMiddleware(async (to, from) => {
    if (to.name === 'index') {
        return navigateTo(`/project`)
    }
  })