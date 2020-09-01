<script>
import { mapActions } from 'vuex'
import { validation } from '~/mixins/validation'

export default {
  name: 'url-form',
  mixins: [validation],
  props: { initForm: { type: Object } },
  data () {
    return {
      form: {
        _id: null,
        url: null,
        frequency: 1,
        frequencyUnit: 60000,
        active: false
      },
      frequencyUnitOptions: [
        { value: 1000, label: 'Seconds' },
        { value: 60 * 1000, label: 'Minutes' },
        { value: 60 * 60 * 1000, label: 'Hours' },
        { value: 24 * 60 * 60 * 1000, label: 'Days' }
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
            url: null,
            frequency: 1,
            frequencyUnit: 60000,
            active: false
          }
        }
      }
    }
  },
  methods: {
    ...mapActions('urls', ['saveUrl', 'editUrl']),
    async onSubmitUrl () {
      await this.resetValidation(this.form)
      if (!(await this.validate(this.form))) return
      this.submitting = true
      if (!this.form._id) {
        const obj = await this.saveUrl(this.form)
        this.form._id = obj._id
      } else {
        await this.editUrl(this.form)
      }
      this.submitting = false
      this.$emit('refresh')
    }
  }
}
</script>

<template lang="pug">
q-card
  .text-h6 Ajouter une url
  q-card-section
    q-input(
      ref="url"
      v-model="form.url"
      label="URL"
      :rules="[rules.required, rules.url]"
      :lazy-rules="true"
    )
    .row.flex.items-center
      .col-6
        q-input(
          style="margin-top: 20px"
          ref="frequency"
          v-model="form.frequency"
          label="Fréquence"
          type="number"
          :rules="[rules.required, rules.greaterThan(0)]"
          :lazy-rules="true"
        )
      .col-6
        q-select(
          ref="frequencyUnit"
          v-model="form.frequencyUnit"
          :options="frequencyUnitOptions"
          label="Unité"
          emit-value
          map-options
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
      @click="onSubmitUrl"
      :loading="submitting"
    )
</template>

<style lang="sass" scoped>

</style>
