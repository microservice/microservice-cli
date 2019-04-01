<template>
  <div
    class='env-container'
    v-if="microservice.environment"
  >
    <h2>Environment</h2>
    <form @submit.prevent="saveHandler">
      <div class="form-inputs">
        <label
          :key="`env-${name}`"
          v-for="(env, name) of microservice.environment"
        >
          {{ name }} {{env.required ? '*' : ''}}
          <input
            :name="`env-${name}`"
            :required="`${env.required}`"
            :value="`${envs[name] || ''}`"
          >
        </label>
      </div>
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'environment',
  data: () => ({
    microservice: '',
    envs: {}
  }),
  computed: mapGetters(['getMicroservice', 'getEnvs']),
  mounted () {
    this.microservice = this.getMicroservice
    this.envs = this.getEnvs
  },
  methods: {
    ...mapMutations(['addEnv']),
    saveHandler (data) {
      const e = data.srcElement.elements
      for (let i = 0; i < e.length - 1; i++) {
        if (e[i].type !== 'submit') {
          this.addEnv({ key: e[i].name.substr(4), value: e[i].value })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.env-container {
  width: calc(100vw - 812px);

  form {
    min-height: 300px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-evenly;
    align-items: center;
  }
}
</style>
