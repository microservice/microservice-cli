<template>
  <div class="container-error-container">
    <div class="error">{{ getDockerHealthCheck.log }}</div>
    <div class="error">
      You can still get yours logs manually:
      <pre><code>docker logs [container_id]</code></pre>
    </div>
    <div class="btn-container">
      <button
        class="build-btn"
        @click="build"
        :disabled="getDockerState === 'building' || getDockerState === 'starting'"
      >
        <clip-loader
          :color="'white'"
          :size="'20px'"
          class="loader"
          v-if="
              getDockerState === 'building' || getDockerState === 'starting'
            "
        ></clip-loader>
        <span v-else>Rebuild</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ClipLoader } from 'vue-spinner/src/ClipLoader'

export default {
  name: 'container-error',
  components: {
    ClipLoader
  },
  computed: {
    ...mapGetters(['getDockerHealthCheck'])
  },
  methods: {
    build () {
      this.$emit('rebuild')
      this.$router.push({ path: '/validation-error' })
    }
  }
}
</script>

<style lang="scss" scoped>
.container-error-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .btn-container {
    display: flex;
    justify-content: center;
    width: 100%;

    button.build-btn {
      height: 35px;
      width: 434px;
      border-radius: 2px;
      background-color: #17b897;
      display: flex;
      justify-content: center;
      align-items: center;

      span {
        color: #ffffff;
        font-family: Graphik;
        font-size: 16px;
        font-weight: 500;
        line-height: 21px;
        text-align: center;
      }

      .loader {
        height: 22px;
      }
    }
  }
}
</style>
