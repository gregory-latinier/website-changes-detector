<script>
import { mapActions } from 'vuex'
export default {
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false
    }
  },
  methods: {
    ...mapActions('auth', ['logout']),
    async onLogout () {
      await this.logout()
      await this.$router.push({ path: '/' })
    }
  }
}
</script>

<template lang="pug">
q-layout(view="lHh Lpr lFf")
  q-header(elevated)
    q-toolbar
      q-btn(
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="leftDrawerOpen = !leftDrawerOpen"
      )
      q-toolbar-title
        | Website Changes Detector

  q-drawer(
    v-model="leftDrawerOpen"
    show-if-above
    bordered
    content-class="bg-grey-1"
  )
    q-list
      q-item(
        clickable
        to="/urls"
      )
        q-item-section(avatar)
          q-icon(name="fa fa-link")
        q-item-section
          q-item-label Urls
      q-item(
        clickable
        @click="onLogout"
      )
        q-item-section(avatar)
          q-icon(name="fa fa-sign-out-alt")
        q-item-section
          q-item-label Logout
  q-page-container
    router-view

</template>
