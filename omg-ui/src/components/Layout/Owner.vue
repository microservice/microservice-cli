<template>
  <div class="owner-container">
    <img
      src="https://github.com/favicon.ico"
      alt="Github logo"
      class="gh-logo"
    >
    <a
      class="owner-name"
      :href="`https://github.com/${getOwner}`"
    >{{ getOwner }}</a>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'owner',
  data: () => ({
    url: ''
  }),
  computed: mapGetters(['getOwner']),
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.owner-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;

  .gh-logo {
    margin-right: 20px;
  }
}
</style>
