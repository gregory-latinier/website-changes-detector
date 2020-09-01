<script>
import { mapActions } from 'vuex'
import AlertForm from './components/alert-form'
import { Notify } from 'quasar'

export default {
  name: 'page-alerts-list',
  components: { AlertForm },
  data () {
    return {
      initialPagination: {
        sortBy: 'type',
        descending: false,
        rowsPerPage: 20
      },
      columns: [
        { name: 'type', required: true, label: 'Type', align: 'left', field: 'type', sortable: true },
        { name: 'value', required: true, label: 'Value', align: 'left', field: 'value', sortable: true },
        { name: 'active', required: true, label: 'Active', align: 'left', field: 'active' },
        { name: 'action', required: false, label: 'Actions', align: 'right' }
      ],
      typeOptions: [
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'whatsapp', label: 'Whatsapp' }
      ],
      showForm: false,
      editForm: null,
      data: [],
      removeId: null
    }
  },
  methods: {
    ...mapActions('alerts', ['findAlerts', 'removeAlert', 'triggerAlert']),
    async onRemoveAlert (id) {
      this.removeId = id
      const result = await this.removeAlert(id)
      this.data = this.data.filter(r => r._id !== result._id)
      this.removeId = null
      this.$q.notify({ type: 'positive', message: 'Succès' })
    },
    async onFindAlerts () {
      const result = await this.findAlerts()
      if (result) {
        this.data = result.data
      }
    },
    async onRefresh () {
      this.showForm = false
      this.editForm = null
      await this.onFindAlerts()
    },
    onNew () {
      this.editForm = null
      this.showForm = true
    },
    onEdit (data) {
      this.editForm = {
        _id: data._id,
        type: data.type,
        value: data.value,
        active: data.active
      }
      this.showForm = true
    },
    async onTriggerAlert (id) {
      const result = await this.triggerAlert(id)
      if (result.success) {
        Notify.create({ type: 'positive', message: 'Alerte envoyée' })
      } else {
        Notify.create({ type: 'error', message: 'API error' })
      }
    }
  },
  async beforeMount () {
    await this.onFindAlerts()
  }
}
</script>

<template lang="pug">
q-page.q-pa-md
  q-dialog(v-model="showForm")
    alert-form.alert-form.q-pa-md(
      :initForm="editForm"
      @refresh="onRefresh"
      @close="showForm = false"
    )
  q-table(
    title="Alerts"
    :data="data"
    :columns="columns"
    row-key="alert"
    :pagination="initialPagination"
  )
    template(v-slot:body="props")
      q-tr(:props="props")
        q-td(key="alert" :props="props") {{ props.row.alert }}
        q-td(key="type" :props="props") {{ props.row.type }}
        q-td(key="value" :props="props") {{ props.row.value }}
        q-td(key="active" :props="props")
          q-icon(v-if="props.row.active" color="green" name="fas fa-check-circle")
          q-icon(v-if="!props.row.active" color="red" name="fa fa-times")
        q-td(key="action" :props="props")
          q-btn(icon="fa fa-edit" flat size="sm" @click="onEdit(props.row)")
          q-btn(icon="fa fa-trash" color="red" flat size="sm" :loading="removeId === props.row._id")
            q-popup-proxy
              .column
                .bg-accent.text-white.q-pa-sm Confirmer la suppression
                .row.flex.justify-between.q-pa-sm
                  q-btn(label="Non" dense flat v-close-popup)
                  q-btn(color="primary" label="Oui" unelevated dense @click="onRemoveAlert(props.row._id)" v-close-popup)
          q-btn(icon="fas fa-bell" flat size="sm" @click="onTriggerAlert(props.row._id)")
  q-page-sticky(position="bottom-right" :offset="[18, 18]")
    q-btn(
      icon="fa fa-plus"
      round
      color="primary"
      @click="onNew"
    )
</template>

<style lang="sass" scoped>
.alert-form
  width: 450px
</style>
