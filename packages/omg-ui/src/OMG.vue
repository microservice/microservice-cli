<template>
  <div id="omg">
    <div class="omg-container">
      <layout />
      <div class="topbar-margin">
        <router-view />
        <docker-logs />
      </div>
      <output-action class="main-output" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import Layout from '@/views/Layout'
import DockerLogs from '@/components/DockerLogs'
import OutputAction from '@/components/layout/OutputAction'

export default {
  name: 'omg',
  components: {
    Layout,
    DockerLogs,
    OutputAction
  },
  data: () => ({
    logsInterval: null,
    statsInterval: null
  }),
  computed: mapGetters([
    'getSocket', 'getOwner', 'getEnvs'
  ]),
  created () {
    this.initSocket()
    this.getSocket.on('validate', res => {
      this.setValidation(res)
    })
    this.getSocket.on('owner', res => {
      this.setOwner(res.notif)
    })
    this.getSocket.on('microservice.yml', res => {
      this.setMicroserviceRaw(res)
    })
    this.getSocket.on('build', res => {
      this.build(res)
    })
    this.getSocket.on('start', res => {
      if (res.ports) {
        this.setDockerPortBindings(res.ports)
      }
      if (res.forwards) {
        this.setDockerForwardBindings(res.forwards)
      }
      this.start(res)
    })
    this.getSocket.on('stop', res => {
      this.stop(res)
    })
    this.getSocket.emit('build', {})
  },
  beforeDestroy () {
    this.getSocket.removeListener('validate')
    this.getSocket.removeListener('owner')
    this.getSocket.removeListener('microservice.yml')
    this.getSocket.removeListener('build')
    this.getSocket.removeListener('start')
    this.getSocket.removeListener('stop')
  },
  methods: {
    ...mapMutations(['initSocket', 'setValidation', 'setOwner',
      'setMicroserviceRaw', 'appendDockerLogs', 'setDockerState',
      'setDockerPortBindings', 'setDockerForwardBindings']),
    build (data) {
      this.setDockerState('building')
      if (data.notif) {
        this.appendDockerLogs(data.notif.trim())
      }
      if (data.status && data.built) {
        this.setDockerState('starting')
        console.log(this.getEnvs)
        this.getSocket.emit('start', {
          image: `omg/${this.getOwner}`,
          envs: { ...this.getEnvs }
        })
      }
    },
    start (data) {
      this.appendDockerLogs(data.notif.trim())
      if (data.started) {
        this.setDockerState('started')
        this.logsInterval = setInterval(() => this.getSocket.emit('dockerLogs'), 1000)
        this.statsInterval = setInterval(() => {
          this.getSocket.emit('container-stats')
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

  #omg {
    font-family: "Graphik", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;

    .omg-container {
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
