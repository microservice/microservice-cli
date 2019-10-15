<template>
  <div class="inspect-container">
    {{ getDockerInspect }}
    <button v-if="!isContainerUp" @click="refresh">Refresh</button>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
import * as rpc from '@/rpc/cli'

export default {
  name: 'inspect',
  data: () => ({
    isContainerUp: false
  }),
  computed: { ...mapGetters(['getDockerInspect']) },
  methods: {
    ...mapMutations(['setDockerInspect']),
    refresh () {
      this.socket.emit('inspect')
    }
  },
  mounted () {
    this.socket = rpc.getSocket()
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
