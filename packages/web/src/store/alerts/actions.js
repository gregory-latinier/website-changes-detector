export const saveAlert = async function (context, alert) {
  delete alert._id
  return this.$api.service('alerts').create(alert)
}

export const editAlert = async function (context, alert) {
  return this.$api.service('alerts').patch(alert._id, alert)
}

export const findAlerts = async function () {
  return this.$api.service('alerts').find()
}

export const getAlert = async function (context, id) {
  return this.$api.service('alerts').get(id)
}

export const removeAlert = async function (context, id) {
  return this.$api.service('alerts').remove(id)
}

export const triggerAlert = async function (context, id) {
  return this.$api.service('alert-trigger').get(id)
}
