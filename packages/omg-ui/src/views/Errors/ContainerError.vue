<template>
  <div class="container-error-container">
    <div class="error">{{ getDockerHealthCheck.log }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'container-error',
  computed: {
    ...mapGetters(['getDockerHealthCheck'])
  }
}
</script>

<style lang="scss" scoped>
.container-error-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
