<template>
  <div id="oms">
    <div class="oms-container">
      <layout />
      <div class="topbar-margin">
        <router-view
          @rebuild="socket.emit('rebuild', {
            build: {},
            start: {
              image: `oms/${getOwner}`,
              envs: { ...getEnvs }
            }
          })"
        />
        <docker-logs />
      </div>
      <output-action class="main-output" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import * as rpc from '@/rpc/cli'
import Layout from '@/views/Layout'
import DockerLogs from '@/components/DockerLogs'
import OutputAction from '@/components/layout/OutputAction'
import { setInterval, clearInterval } from 'timers'
import { isEmpty, isEnvRequired, isRequiredEnvFilled } from '@/utils'

export default {
  name: 'oms',
  components: {
    Layout,
    DockerLogs,
    OutputAction
  },
  data: () => ({
    logsInterval: null,
    statsInterval: null,
    wait: true
  }),
  computed: mapGetters([
    'getOwner', 'getEnvs', 'getMicroserviceStatus', 'getMicroservice'
  ]),
  created () {
    this.socket = rpc.connect()
    this.socket.on('validate', res => {
      this.setValidation(res)
      this.wait = false
    })
    this.socket.on('owner', res => {
      if (res.generated) {
        this.setOwner({ owner: res.notif, generated: res.generated })
      } else {
        this.setOwner(res.notif)
      }
    })
    this.socket.on('oms.yml', res => {
      this.setMicroserviceRaw(res)
      if (!this.getMicroserviceStatus) {
        this.$router.push({ path: '/validation-error' })
      }
    })
    this.socket.on('build', res => {
      this.build(res)
    })
    this.socket.on('start', res => {
      if (res.ports) {
        this.setDockerPortBindings(res.ports)
      }
      if (res.forwards) {
        this.setDockerForwardBindings(res.forwards)
      }
      this.start(res)
    })
    this.socket.on('stop', res => {
      this.stop(res)
    })
    this.socket.on('health-check', res => {
      this.setDockerHealthCheck(res)
      if (res.status === -1) {
        this.setDockerState('stopped')
        if (!['/editor', '/environments'].includes(this.$router.currentRoute.path)) {
          this.$router.push({
            path: '/container-error'
          })
        }
      }
    })
    this.socket.on('disconnect', () => {
      this.$router.push({ path: '/socket-disconnected' })
    })
    const interval = setInterval(() => {
      if (this.getMicroserviceStatus) {
        this.socket.emit('build', {})
      }
      if (!this.wait) {
        clearInterval(interval)
      }
    }, 1000)
  },
  beforeDestroy () {
    this.socket.removeListener('validate')
    this.socket.removeListener('owner')
    this.socket.removeListener('oms.yml')
    this.socket.removeListener('build')
    this.socket.removeListener('start')
    this.socket.removeListener('stop')
    this.socket.removeListener('health-check')
  },
  methods: {
    ...mapMutations(['setValidation', 'setOwner',
      'setMicroserviceRaw', 'appendDockerLogs', 'setDockerState',
      'setDockerPortBindings', 'setDockerForwardBindings', 'setDockerHealthCheck']),
    build (data) {
      this.setDockerState('building')
      if (data.notif) {
        this.appendDockerLogs(data.notif.trim())
      }
      this.setDockerState('built')
      if (data.status && data.built) {
        if (!isEnvRequired(this.getMicroservice)) {
          this.setDockerState('starting')
          this.socket.emit('start', {
            image: `oms/${this.getOwner}`,
            envs: { ...this.getEnvs }
          })
        } else {
          if (isEmpty(this.getEnvs)) {
            this.$router.push({ path: '/environments' })
          } else {
            if (isRequiredEnvFilled(this.setMicroserviceRaw, this.getEnvs)) {
              this.setDockerState('starting')
              this.socket.emit('start', {
                image: `oms/${this.getOwner}`,
                envs: { ...this.getEnvs }
              })
            }
          }
        }
      }
    },
    start (data) {
      if (data.notif && data.notif.length > 0) {
        this.appendDockerLogs(data.notif.trim())
      }
      if (data.started) {
        this.setDockerState('started')
        this.logsInterval = setInterval(() => this.socket.emit('dockerLogs'), 1000)
        this.statsInterval = setInterval(() => {
          this.socket.emit('container-stats')
          this.socket.emit('health-check')
        }, 1000)
      }
    },
    stop (data) {
      this.appendDockerLogs(data.notif.trim())
      this.setDockerState('stopped')
      clearInterval(this.logsInterval)
      clearInterval(this.statsInterval)
    }
  }
}
</script>

<style lang="scss">
$fonts: (
  // Thin: 100,
    // Extralight: 200,
    // Light: 300,
    Regular: 400,
  Medium: 500,
  Semibold: 600,
  Bold: 700,
  // Black: 800,
    // Super: 900,
);

@each $style, $weight in $fonts {
  @font-face {
    font-family: "Graphik";
    src: url("assets/fonts/Graphik-#{$style}.eot");
    src: url("assets/fonts/Graphik-#{$style}.eot?#iefix")
        format("embedded-opentype"),
      url("assets/fonts/Graphik-#{$style}.woff2") format("woff2"),
      url("assets/fonts/Graphik-#{$style}.woff") format("woff"),
      url("assets/fonts/Graphik-#{$style}.ttf") format("truetype"),
      url("assets/fonts/Graphik-#{$style}.svg#Graphik-#{$style}") format("svg");
    font-weight: $weight;
    font-style: normal;
  }

  @font-face {
    font-family: "SF Mono";
    src: url("assets/fonts/SF-Pro-Display-Regular.otf");
    font-weight: $weight;
    font-style: normal;
  }
}

.text-danger {
  color: tomato;
}

body {
  margin: 0;
  overflow: hidden;

  #oms {
    font-family: "Graphik", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;

    .oms-container {
      display: flex;

      .topbar-margin {
        margin-top: 69px;
        width: 100%;
        height: calc(100vh - 69px);
        overflow: hidden;
        background-color: #f5f7fa;
        border-left: 1px solid #d8dcee;
        border-top: 1px solid #d8dcee;
        display: flex;
        flex-direction: column;
      }
    }
  }
}
</style>
