<template>
  <div class="history-container">
    <div
      class="entry"
      v-for="(entry, entryName) of getHistory"
      :key="`entry-${entryName}`"
    >
      <h2 class="action">{{ entry.action }}</h2>
      <router-link
        tag="span"
        class="arg"
        :to="{ name: 'actions', query: { ...entry } }"
        >{{ entry.args }}</router-link
      >
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
