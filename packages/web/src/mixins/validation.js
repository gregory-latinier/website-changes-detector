import { isURL } from 'validator'
import { scroll } from 'quasar'
const { getScrollTarget, setScrollPosition } = scroll

export const validation = {
  data () {
    return {
      rules: {
        required: val => (val !== null && val !== '') || 'Le champ est requis',
        requiredIf: cond => val => {
          if (!cond || (cond && !!val)) {
            return true
          }
          return 'Le champ est requis'
        },
        positiveAmount: val => parseFloat(val) >= 0 || 'Veuillez saisir un nombre supérieur ou égal à 0',
        lesserThan: value => val => parseFloat(val) < value || `La valeur doit être inférieure à ${value}`,
        lesserThanOrEqual: value => val => parseFloat(val) <= value || `La valeur doit être inférieure ou égale à ${value}`,
        greaterThan: value => val => parseFloat(val) > 0 || `La valeur doit être supérieure à ${value}`,
        greaterThanOrEqual: value => val => parseFloat(val) >= value || `La valeur doit être supérieure ou égale à  ${value}`,
        url: val => !val || isURL(val, { require_protocol: true }) || 'Veuillez saisir une URL valide.'
      }
    }
  },
  methods: {
    async validate (form) {
      if (!form) return true
      let valid = true
      let el
      for await (const key of Object.keys(form)) {
        if (Array.isArray(form[key])) {
          for (let i = 0; i < form[key].length; i += 1) {
            for await (const subKey of Object.keys(form[key][i])) {
              valid = await this.$refs[`${key}${i}_${subKey}`][0].validate() && valid
              if (!valid && !el) {
                el = this.$refs[`${key}${i}_${subKey}`][0]
              }
            }
          }
        } else {
          if (this.$refs[key]) {
            // Form components
            if (this.$refs[key].onValidate) {
              valid = await this.$refs[key].onValidate() && valid
            } else if (this.$refs[key].validate) {
              valid = await this.$refs[key].validate() && valid
            }
            if (!valid && !el) {
              el = this.$refs[key]
            }
          }
        }
      }
      if (!valid) {
        setScrollPosition(getScrollTarget(el.$el), el.offsetTop, 1000)
      }
      return valid
    },
    async resetValidation (form) {
      await this.$nextTick()
      if (!form) return
      for (const key of Object.keys(form)) {
        if (Array.isArray(form[key])) {
          for (let i = 0; i < form[key].length; i += 1) {
            for (const subKey of Object.keys(form[key][i])) {
              if (this.$refs[`${key}${i}_${subKey}`][0] && this.$refs[`${key}${i}_${subKey}`][0].resetValidation) {
                this.$refs[`${key}${i}_${subKey}`][0].resetValidation()
              }
            }
          }
        } else {
          if (this.$refs[key] && this.$refs[key].resetValidation) {
            this.$refs[key].resetValidation()
          }
        }
      }
    }
  }
}
