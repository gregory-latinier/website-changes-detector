<script>
import { mapActions } from 'vuex'
import UrlForm from './components/url-form'

export default {
  name: 'page-urls-list',
  components: { UrlForm },
  data () {
    return {
      initialPagination: {
        sortBy: 'lastAlert',
        descending: false,
        rowsPerPage: 20
      },
      columns: [
        { name: 'url', required: true, label: 'URL', align: 'left', field: 'url', sortable: true },
        { name: 'lastAlert', required: true, label: 'Last Alert', align: 'left', field: 'lastAlert', sortable: true },
        { name: 'lastCheck', required: true, label: 'Last Check', align: 'left', field: 'lastCheck', sortable: true },
        { name: 'screenshot', required: true, label: 'Screenshot', align: 'left', field: 'screenshot' },
        { name: 'frequency', required: true, label: 'Refresh freq.', align: 'left', field: 'frequency' },
        { name: 'active', required: true, label: 'Active', align: 'left', field: 'active' },
        { name: 'action', required: false, label: 'Actions', align: 'right' }
      ],
      frequencyUnitOptions: [
        { value: 1000, label: 'Seconds' },
        { value: 60 * 1000, label: 'Minutes' },
        { value: 60 * 60 * 1000, label: 'Hours' },
        { value: 24 * 60 * 60 * 1000, label: 'Days' }
      ],
      showForm: false,
      editForm: null,
      data: [],
      removeId: null
    }
  },
  methods: {
    ...mapActions('urls', ['findUrls', 'removeUrl']),
    async onRemoveUrl (id) {
      this.removeId = id
      const result = await this.removeUrl(id)
      this.data = this.data.filter(r => r._id !== result._id)
      this.removeId = null
      this.$q.notify({ type: 'positive', message: 'Succès' })
    },
    async onFindUrls () {
      const result = await this.findUrls()
      if (result) {
        this.data = result.data
      }
    },
    async onRefresh () {
      this.showForm = false
      this.editForm = null
      await this.onFindUrls()
    },
    onEdit (data) {
      this.editForm = {
        _id: data._id,
        url: data.url,
        frequency: data.frequency,
        frequencyUnit: data.frequencyUnit,
        active: data.active
      }
      this.showForm = true
    },
    onOpenUrl (url) {
      window.open(url, '_blank')
    }
  },
  async beforeMount () {
    await this.onFindUrls()
  }
}
</script>

<template lang="pug">
q-page.q-pa-md
  q-dialog(v-model="showForm")
    url-form.url-form.q-pa-md(
      :initForm="editForm"
      @refresh="onRefresh"
      @close="showForm = false"
    )
  q-table(
    title="Urls"
    :data="data"
    :columns="columns"
    row-key="url"
    :pagination="initialPagination"
  )
    template(v-slot:body="props")
      q-tr(:props="props")
        q-td(key="url" :props="props")
          | {{ props.row.url }}
          q-btn(
            icon="fa fa-link"
            color="primary"
            flat
            size="xs"
            @click="onOpenUrl(props.row.url)"
          )
        q-td(key="lastAlert" :props="props") {{ props.row.lastAlert }}
        q-td(key="lastCheck" :props="props") {{ props.row.lastCheck }}
        q-td(key="screenshot" :props="props")
          q-img(
            :src="`screenshots/${props.row._id}.png`"
            spinner-color="white"
            style="height: 150px; width: 200px"
          )
            template(v-slot:error)
              .absolute-full.flex.flex-center.bg-negative.text-white N/A
        q-td(key="frequency" :props="props") {{ props.row.frequency }} {{ frequencyUnitOptions.find(f => f.value === props.row.frequencyUnit ).label }}
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
                  q-btn(color="primary" label="Oui" unelevated dense @click="onRemoveUrl(props.row._id)" v-close-popup)
  q-page-sticky(position="bottom-right" :offset="[18, 18]")
    q-btn(
      icon="fa fa-plus"
      round
      color="primary"
      @click="showForm = true"
    )
</template>

<style lang="sass" scoped>
.url-form
  width: 450px
</style>
