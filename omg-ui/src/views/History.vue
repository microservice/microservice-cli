<template>
  <div class="history-container">
    <div
      class="entry"
      v-for="(entry, entryName) of getHistory"
      :key="`entry-${entryName}`"
    >
      <h2 class="action">{{ entry.action }}</h2>
      <span class="arg"> {{ entry.args }} </span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'history',
  data: () => ({}),
  computed: mapGetters(['getHistory'])
}
</script>

<style lang="scss" scoped>
</style>
