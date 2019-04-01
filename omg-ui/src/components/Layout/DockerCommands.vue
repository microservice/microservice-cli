<template>
  <section class="docker-commands-container">
    <button
      v-if="!getDockerRunning"
      class="docker-button"
      @click="start()"
    >{{ getDockerStarting ? 'STARTING' : 'START' }}</button>
    <button
      v-else
      class="docker-button"
      @click="stop()"
    >STOP</button>
    <button
      class="docker-button"
      @click="build()"
    >{{ getDockerBuilt ? 'REBUILD' : 'BUILD'}}</button>
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'docker-commands',
  data: () => ({
    socket: null
  }),
  computed: mapGetters([
    'getDockerStarting',
    'getDockerRunning',
    'getDockerBuilt',
    'getSocket',
    'getEnvs',
    'getOwner',
    'getDockerLogs'
  ]),
  mounted () {
    this.socket = this.getSocket
    this.socket.on('build', res => {
      this.setDockerLogs(res.log)
      this.setDockerBuilt(res.status)
      this.setDockerBuilding(false)
    })
    this.socket.on('start', res => {
      this.setDockerLogs(`${this.getDockerLogs}\n${res.notif}`)
      if (res.status && res.notif.indexOf('Started Docker') >= 0) {
        this.setDockerRunning(true)
        this.setDockerStarting(false)
      }
    })
    this.socket.on('stop', res => {
      this.setDockerLogs(`${this.getDockerLogs}\n${res.notif}`)
    })
  },
  methods: {
    ...mapMutations([
      'setDockerBuilding',
      'setDockerLogs',
      'setDockerBuilt',
      'setDockerStarting',
      'setDockerRunning'
    ]),
    build () {
      this.setDockerBuilding(true)
      this.socket.emit('build', {})
    },
    start () {
      this.setDockerStarting(true)
      this.socket.emit('start', {
        image: `omg/${this.getOwner}`,
        envs: { ...this.getEnvs }
      })
    },
    stop () {
      this.socket.emit('stop')
      this.setDockerRunning(false)
    }
  }
}
</script>

<style lang="scss" scoped>
.docker-commands-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
  border-bottom: 1px solid lightslategray;
}
</style>
