export const saveUrl = async function (context, url) {
  delete url._id
  return this.$api.service('urls').create(url)
}

export const editUrl = async function (context, url) {
  return this.$api.service('urls').patch(url._id, url)
}

export const findUrls = async function () {
  return this.$api.service('urls').find()
}

export const getUrl = async function (context, id) {
  return this.$api.service('urls').get(id)
}

export const removeUrl = async function (context, id) {
  return this.$api.service('urls').remove(id)
}
