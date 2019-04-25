<template>
  <div class="env-container">
    <div class="title" v-if="!getMicroservice.environment">
      Environment Variable
    </div>
    <form @submit.prevent="saveHandler" v-if="getMicroservice.environment">
      <div class="inputs">
        <label
          :key="`env-${name}`"
          v-for="(env, name) of getMicroservice.environment"
          class="form-row"
        >
          {{ name }} {{ env.required ? "*" : "" }}
          <input
            :name="`env-${name}`"
            :required="`${env.required}`"
            :value="`${getEnvs[name] || ''}`"
            :placeholder="env.type"
            :type="env.type === 'number' ? 'number' : 'string'"
          />
        </label>
      </div>
      <div class="btn-container">
        <div class="spacer"></div>
        <button type="submit" class="run-btn">Save</button>
      </div>
    </form>
    <div v-else>
      <div class="desc">
        There are not environment variable to setup on this microservice. You're
        all set up.
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'environment',
  data: () => ({}),
  computed: mapGetters(['getMicroservice', 'getEnvs', 'getOwner', 'getSocket', 'getDockerRebuild']),
  mounted () {},
  methods: {
    ...mapMutations(['addEnv']),
    saveHandler (data) {
      const e = data.srcElement.elements
      for (let i = 0; i < e.length - 1; i++) {
        if (e[i].type !== 'submit') {
          this.addEnv({ key: e[i].name.substr(4), value: e[i].value })
        }
      }
      if (this.getDockerRebuild) {
        this.getSocket.emit('rebuild', {
          build: {}, 
          start: {
            image: `omg/${this.getOwner}`,
            envs: { ...this.getEnvs }
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.env-container {
  width: 90%;
  height: 100%;
  margin: 24px 0 0 24px;
  text-align: left;

  .title {
    height: 27px;
    color: #1f2933;
    font-family: Graphik;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
  }

  .desc {
    margin-top: 8px;
    height: 51px;
    color: #616e7c;
    font-family: Graphik;
    font-size: 14px;
    line-height: 22px;
  }

  form {
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-evenly;
    align-items: flex-end;

    .form-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .inputs {
      display: flex;
      flex-flow: column;

      label {
        color: #616e7c;
        font-family: Graphik;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.5px;
        line-height: 21px;
        text-align: right;
        margin-bottom: 20px;
        text-transform: uppercase;
        align-items: center;
      }

      input {
        height: 40px;
        width: 420px;
        border: 1px solid #dfe0e8;
        border-radius: 2px;
        background-color: #ffffff;
        margin-left: 24px;
        color: #1f2933;
        font-family: Graphik;
        font-size: 14px;
        line-height: 21px;
        padding-left: 12px;

        &::placeholder {
          height: 18px;
          color: #1f2933;
          font-family: Graphik;
          font-size: 14px;
          line-height: 21px;
        }
      }
    }

    .btn-container {
      button.run-btn {
        height: 35px;
        width: 434px;
        border-radius: 2px;
        color: #ffffff;
        font-family: Graphik;
        font-size: 16px;
        font-weight: 500;
        line-height: 21px;
        text-align: center;
        background-color: #17b897;
      }
    }
  }
}
</style>
