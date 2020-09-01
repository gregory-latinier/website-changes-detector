export default async ({ router, store }) => {
  try {
    await store.$api.reAuthenticate()
  } catch (e) {
    // No auth
  }
  router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.auth)
    if (requiresAuth && !await store.$api.get('authentication')) {
      next('/')
    } else {
      next()
    }
  })
}
