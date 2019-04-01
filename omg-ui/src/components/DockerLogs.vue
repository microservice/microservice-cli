<template>
  <div class="docker-logs-container">
    <pre>{{ getDockerLogs }}</pre>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'docker-logs',
  data: () => ({}),
  computed: mapGetters(['getDockerLogs']),
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.docker-logs-container {
  position: fixed;
  bottom: 0;
  right: 0;
  border-left: 1px solid lightslategray;
  border-top: 1px solid lightslategray;
  width: 500px;
  height: 250px;
  text-align: left;
  padding: 10px 0 0 10px;

  pre {
    height: calc(100% + 2px);
    overflow: auto;
    width: calc(100% + 15px);
    margin: 0;
  }
}
</style>
