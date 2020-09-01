<script>
import { mapActions } from 'vuex'
import { validation } from '~/mixins/validation'

export default {
  name: 'alert-form',
  mixins: [validation],
  props: { initForm: { type: Object } },
  data () {
    return {
      form: {
        _id: null,
        type: 'email',
        value: null,
        active: false
      },
      typeOptions: [
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'whatsapp', label: 'Whatsapp' }
      ],
      submitting: false
    }
  },
  watch: {
    initForm: {
      immediate: true,
      handler (val) {
        if (val) {
          this.form = { ...val }
        } else {
          this.form = {
            _id: null,
            type: 'email',
            value: null,
            active: false
          }
        }
      }
    }
  },
  methods: {
    ...mapActions('alerts', ['saveAlert', 'editAlert']),
    async onSubmitAlert () {
      await this.resetValidation(this.form)
      if (!(await this.validate(this.form))) return
      this.submitting = true
      if (!this.form._id) {
        const obj = await this.saveAlert(this.form)
        this.form._id = obj._id
      } else {
        await this.editAlert(this.form)
      }
      this.submitting = false
      this.$emit('refresh')
    }
  }
}
</script>

<template lang="pug">
q-card
  .text-h6 Ajouter une alert
  q-card-section
    q-select(
      ref="type"
      v-model="form.type"
      :options="typeOptions"
      label="Type"
      emit-value
      map-options
    )
    q-input(
      ref="value"
      v-model="form.value"
      label="Valeur"
      :rules="[rules.required]"
      :lazy-rules="true"
    )
    q-toggle(
      v-model="form.active"
      label="Actif"
    )
  q-card-actions(align="right")
    q-btn(
      label="Annuler"
      flat
      @click="$emit('close')"
    )
    q-btn(
      label="Enregister"
      color="primary"
      unelevated
      @click="onSubmitAlert"
      :loading="submitting"
    )
</template>

<style lang="sass" scoped>

</style>
