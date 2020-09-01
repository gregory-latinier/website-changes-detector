export const login = async function ({ commit }, credentials) {
  try {
    const res = await this.$api.authenticate({
      strategy: 'local',
      ...credentials
    })
    commit('setUser', res.user)
    return true
  } catch (error) {
    return false
  }
}

export const logout = async function ({ commit }) {
  await this.$api.logout()
  commit('setUser', null)
}
