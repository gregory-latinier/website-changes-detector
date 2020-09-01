<script>
import { mapActions } from 'vuex'

export default {
  name: 'page-urls-list',
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
        { name: 'active', required: true, label: 'Active', align: 'left', field: 'active' },
        { name: 'action', required: false, label: 'Actions', align: 'right' }
      ],
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
    }
  },
  async beforeMount () {
    const result = await this.findUrls()
    if (result) {
      this.data = result.data
    }
  }
}
</script>

<template lang="pug">
q-page.q-pa-md
  q-table(
    title="Urls"
    :data="data"
    :columns="columns"
    row-key="url"
    :pagination="initialPagination"
  )
    template(v-slot:body="props")
      q-tr(:props="props")
        q-td(key="url" :props="props") {{ props.row.url }}
        q-td(key="lastAlert" :props="props") {{ props.row.lastAlert }}
        q-td(key="lastCheck" :props="props") {{ props.row.lastCheck }}
        q-td(key="screenshot" :props="props") {{ props.row._id }}
        q-td(key="active" :props="props") {{ props.row.active }}
        q-td(key="action" :props="props")
          q-btn(icon="fa fa-edit" flat size="sm" :to="`/urls/${props.row._id}`")
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
      to="/ranks/new"
    )
</template>

<style lang="sass" scoped>

</style>
