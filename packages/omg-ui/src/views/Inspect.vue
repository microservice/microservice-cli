<template>
  <div class="inspect-container">
    {{ getDockerInspect }}
    <button v-if="!isContainerUp" @click="refresh">Refresh</button>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'

export default {
  name: 'inspect',
  data: () => ({
    socket: null,
    isContainerUp: false
  }),
  computed: { ...mapGetters(['getDockerInspect', 'getSocket']) },
  methods: {
    ...mapMutations(['setDockerInspect']),
    refresh () {
      this.socket.emit('inspect')
    }
  },
  mounted () {
    this.socket = this.getSocket
    this.socket.emit('inspect')
    this.socket.on('inspect', res => {
      this.isContainerUp = res.status
      res.status ? this.setDockerInspect(res.log) : this.setDockerInspect(res.notif)
    })
  },
  beforeDestroy () {
    this.socket.removeListener('inspect')
  }
}
</script>

<style lang="scss" scoped>
.inspect-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
</style>
