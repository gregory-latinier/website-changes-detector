import feathers from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'
import { Notify } from 'quasar'

class Service {
  api = null
  serviceName = null

  constructor (api, name) {
    this.api = api
    this.serviceName = name
  }

  async find (params) {
    try {
      const result = await this.api.service(this.serviceName).find(params)
      return result
    } catch (e) {
      console.log(e)
      Notify.create({
        type: 'error',
        message: 'API error'
      })
      return null
    }
  }

  async get (id, params) {
    try {
      const result = await this.api.service(this.serviceName).get(id, params)
      return result
    } catch (e) {
      console.log(e)
      Notify.create({
        type: 'negative',
        message: 'API error'
      })
      return null
    }
  }

  async create (data, params) {
    try {
      const result = await this.api.service(this.serviceName).create(data, params)
      Notify.create({ type: 'positive', message: 'Succès' })
      return result
    } catch (e) {
      console.log(e)
      Notify.create({
        type: 'negative',
        message: 'API error'
      })
      return null
    }
  }

  async update (id, data, params) {
    try {
      const result = await this.api.service(this.serviceName).update(id, data, params)
      Notify.create({ type: 'positive', message: 'Succès' })
      return result
    } catch (e) {
      console.log(e)
      Notify.create({
        type: 'negative',
        message: 'API error'
      })
      return null
    }
  }

  async patch (id, data, params) {
    try {
      const result = await this.api.service(this.serviceName).patch(id, data, params)
      Notify.create({ type: 'positive', message: 'Succès' })
      return result
    } catch (e) {
      console.log(e)
      Notify.create({
        type: 'negative',
        message: 'API error'
      })
      return null
    }
  }

  async remove (id, params) {
    try {
      const result = await this.api.service(this.serviceName).remove(id, params)
      Notify.create({ type: 'positive', message: 'Succès' })
      return result
    } catch (e) {
      console.log(e)
      Notify.create({
        type: 'negative',
        message: 'API error'
      })
      return null
    }
  }
}

// eslint-disable-next-line no-unused-vars
class Wrapper {
  api = null

  constructor (api) {
    this.api = api
  }

  service (name) {
    return new Service(this.api, name)
  }

  async authenticate (payload) {
    return this.api.authenticate(payload)
  }

  async reAuthenticate () {
    return this.api.reAuthenticate()
  }

  async logout () {
    return this.api.logout()
  }

  async get (id) {
    return this.api.get(id)
  }
}

export default async ({ Vue, store }) => {
  const api = feathers()
  const restClient = rest(process.env.API_URL)

  api.configure(restClient.fetch(window.fetch))
    .configure(auth({ storage: window.localStorage }))
  const wrapper = new Wrapper(api)
  Vue.prototype.$api = wrapper
  store.$api = wrapper
}
