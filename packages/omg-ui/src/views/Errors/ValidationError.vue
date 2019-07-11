<template>
  <div class="validation-error-container">
    <div class="error">{{ getMicroserviceNotif }}</div>
    <div class="error" v-if="getDockerState === 'building'">
      <span>Building</span>
      <clip-loader :color="'rgb(45, 204, 167)'" :size="'20px'" class="loader"></clip-loader>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ClipLoader from 'vue-spinner/src/ClipLoader'

export default {
  name: 'validation-error',
  components: {
    ClipLoader
  },
  computed: {
    ...mapGetters(['getMicroserviceNotif', 'getDockerState'])
  }
}
</script>

<style lang="scss" scoped>
.validation-error-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
