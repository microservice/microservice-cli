<template>
  <div id="omg">
    <div class="omg-container" v-if="getMicroserviceStatus">
      <layout />
      <div class="mt88">
        <router-view />
      </div>
      <docker-logs />
    </div>
    <div v-else>
      <h2>We found error in your microservice.yml</h2>
      <span class="text-danger">{{ getMicroserviceNotif }}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import Layout from '@/views/Layout'
import DockerLogs from '@/components/DockerLogs'

export default {
  name: 'omg',
  components: {
    Layout,
    DockerLogs
  },
  data: () => ({
    socket: null
  }),
  computed: mapGetters([
    'getSocket',
    'getMicroserviceStatus',
    'getMicroserviceNotif'
  ]),
  created () {
    this.initSocket()
    this.socket = this.getSocket
    this.socket.on('browserReload', function () {
      window.location.reload()
    })
    this.socket.on('validate', res => {
      this.setValidation(res)
    })
    this.socket.on('owner', res => {
      this.setOwner(res.notif)
    })
  },
  methods: {
    ...mapMutations(['initSocket', 'setValidation', 'setOwner'])
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: "GilroyBold";
  font-style: normal;
  font-weight: normal;
  src: local("GilroyBold"), url("assets/GilroyBold.woff") format("woff");
}

@font-face {
  font-family: "GilroySemiBold";
  font-style: normal;
  font-weight: normal;
  src: local("GilroySemiBold"), url("assets/GilroySemiBold.woff") format("woff");
}

.text-danger {
  color: tomato;
}

body {
  margin: 0;

  #omg {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;

    .omg-container {
      display: flex;

      .mt88 {
        margin-top: 88px;
        width: 100%;
        height: calc(100vh - 88px);
      }
    }
  }
}
</style>
