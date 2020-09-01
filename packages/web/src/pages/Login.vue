<script>
import { mapActions } from 'vuex'

export default {
  name: 'page-login',
  data () {
    return {
      email: null,
      password: null,
      submitting: false
    }
  },
  methods: {
    ...mapActions('auth', ['login']),
    async onLogin () {
      this.submitting = true
      const res = await this.login({
        email: this.email,
        password: this.password
      })
      if (res) {
        await this.$router.push({ path: '/urls' })
      }
      this.submitting = false
    }
  }
}
</script>

<template lang="pug">
q-page.flex.flex-center
  q-card.login
    q-card-section.bg-primary.text-white.text-h6.text-center Website Changes Detector
    q-card-section
      q-input(type="email", v-model="email", label="Email")
      q-input(type="password", v-model="password", label="Password")
    q-card-actions
      q-btn.full-width(color="primary", label="login", @click="onLogin", :loading="submitting")
</template>

<style lang="sass" scoped>
.login
  width: 350px
</style>
