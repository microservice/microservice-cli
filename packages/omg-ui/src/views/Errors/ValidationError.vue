<template>
  <div class="validation-error-container">
    <div class="error">{{ getMicroserviceNotif }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'validation-error',
  computed: {
    ...mapGetters(['getMicroserviceNotif'])
  }
}
</script>

<style lang="scss" scoped>
.validation-error-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
