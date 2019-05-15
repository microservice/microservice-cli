<template>
  <div class="forward-container">
    <div class="forward-wrapper">
      <div class="off" v-if="!getMicroservice || !getMicroservice.forward">
        <div class="title">
          Forward
        </div>
        <div class="desc">
          There are not forward attributes on this microservice.
        </div>
      </div>
      <div class="on" v-else>
        <div class="title">
          Forward
        </div>
        <div
          class="values"
          v-for="(value, valueName) of getDockerForwardBindings"
          :key="`value-${valueName}`"
        >
          <div class="value-name">{{ valueName }}</div>
          <div class="value-params">
            <div class="param">
              Port bound from {{ value.host[0].HostPort }} (host) to the port
              {{ value.container }} (container).
              <a
                href="http://localhost:{{value.host[0].HostPort}}/"
                target="_blank"
                >Visit</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'forward',
  computed: {
    ...mapGetters(['getDockerForwardBindings', 'getMicroservice', 'getMicroserviceStatus'])
  },
  watch: {
    getMicroserviceStatus: function () {
      if (!this.getMicroserviceStatus) {
        this.$router.push({ path: '/validation-error' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.forward-container {
  height: 100%;
  margin: 24px 0 0 24px;
  text-align: left;

  .title {
    height: 27px;
    color: #1f2933;
    font-family: Graphik;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
  }

  .desc {
    margin-top: 8px;
    height: 51px;
    color: #616e7c;
    font-family: Graphik;
    font-size: 14px;
    line-height: 22px;
  }

  .values {
    margin-top: 24px;
    color: #616e7c;
    font-family: Graphik;
    font-size: 14px;
    line-height: 22px;

    .value-params {
      margin-left: 8px;
      margin-top: 8px;

      .param {
        color: #616e7c;
        font-family: Graphik;
        font-size: 14px;
        line-height: 22px;

        a {
          color: #616e7c;
          font-family: Graphik;
          font-size: 14px;
          line-height: 22px;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>
