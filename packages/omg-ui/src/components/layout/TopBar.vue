<template>
  <div class="topbar-container">
    <div class="topbar-left">
      <img
        src="https://avatars2.githubusercontent.com/u/39149433?s=200&v=4"
        alt="OMG app logo"
        class="logo"
        @click="$router.push({ name: 'Home' })"
      />
      <owner class="owner" />
    </div>
    <div class="topbar-right">
      <div
        class="title-container"
        :class="{ lowercase: $route.name === 'actions' }"
      >
        {{ $route.name === "actions" ? $route.params.action : $route.name }}
      </div>
      <div class="toggle-action-raw" v-if="$route.params.action">
        <span>Send raw JSON data</span>
        <toggle-button
          :toggleHandler="toggleActionSendRaw"
          :toggleReceiver="getActionSendRaw"
        ></toggle-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import Owner from '@/components/layout/Owner'
import ToggleButton from '@/components/ToggleButton'

export default {
  name: 'topbar',
  data: () => ({
    cURL: '',
    cURLInput: null
  }),
  components: {
    Owner,
    ToggleButton
  },
  computed: {
    ...mapGetters(['getMicroservice', 'getActionCurlArgs', 'getDockerPort',
      'getDockerState', 'getActionSendRaw'])
  },
  methods: {
    ...mapMutations(['toggleActionSendRaw']),
    copy () {
      this.cURLInput.setAttribute('type', 'text')
      this.cURLInput.select()
      try {
        document.execCommand('copy')
      } catch (e) {
        console.error(e)
      }
      this.cURLInput.setAttribute('type', 'hidden')
      window.getSelection().removeAllRanges()
    },
    cURLHandler () {
      const action = this.$route.params.action
      let param = false
      let body = {}

      this.cURLInput = this.$el.querySelector('#curl')
      this.cURL = `curl --request ${this.getMicroservice.actions[action].http.method.toUpperCase()} `
      this.cURL += `--url http://localhost:${this.getDockerPort}/${action}`
      for (const arg in this.getMicroservice.actions[action].arguments) {
        if (this.getMicroservice.actions[action].arguments[arg].in === 'query') {
          if (!param) {
            this.cURL += '?'
            param = true
            this.cURL += `${arg}=${this.getActionCurlArgs[arg]}`
          } else {
            this.cURL += `&${arg}=${this.getActionCurlArgs[arg]}`
          }
        } else if (this.getMicroservice.actions[action].arguments[arg].in === 'requestBody') {
          body[arg] = ''
        }
        this.cURL += ' '
      }

      if (body && Object.keys(body).length > 0) {
        this.cURL += `--data ${JSON.stringify(body)} `
      }

      this.copy()
    }
  }
}
</script>

<style lang="scss" scoped>
.vert-divider {
  border-left: 1px solid #d8dcee;
  height: 100%;
}

.topbar-container {
  width: 100%;
  display: flex;
  height: 69px;

  .topbar-left {
    width: 300px;
    min-width: 300px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid rgb(244, 245, 250);
    border-right: 1px solid rgb(244, 245, 250);

    img {
      height: 69px;
      width: 75px;
      background-color: #150d44;
      cursor: pointer;
    }

    .owner {
      margin-left: 29px;
    }
  }

  .topbar-right {
    width: auto;
    min-width: calc(100vw - 878px);
    // min-width: 300px;
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 28px 0 57px;

    .title-container {
      margin: 0;
      height: 35px;
      color: #1f2933;
      font-family: Graphik;
      font-size: 20px;
      font-weight: 500;
      line-height: 30px;

      &.lowercase {
        text-transform: lowercase;
      }
    }

    .method-container {
      text-transform: uppercase;
      display: flex;
      align-items: center;
      height: 31px;
      color: #1f2933;
      font-family: Graphik;
      font-size: 16px;
      line-height: 21px;

      span.text {
        padding: 0 32px;
      }
    }

    .http-method-container {
      height: 18px;
      color: #1f2933;
      font-family: Graphik;
      font-size: 18px;
      line-height: 20px;
      text-transform: uppercase;
    }

    .path-container {
      height: 40px;
      width: 434px;
      border: 1px solid #e4e7eb;
      border-radius: 2px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .path {
        height: 26px;
        color: #1f2933;
        font-family: Graphik;
        font-size: 14px;
        font-weight: 500;
        line-height: 21px;
        margin-left: 12px;
        display: flex;
        align-items: center;
      }

      .copy-btn {
        width: 43px;
        color: #616e7c;
        font-family: Graphik;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.5px;
        line-height: 21px;
        text-align: center;
        border-left: 1px solid #e4e7eb;
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 12px;
        cursor: pointer;
      }
    }

    .search-container {
      height: 40px;
      width: 400px;
      border-radius: 5px;
      background-color: #f2f3f9;
      margin: 24px 55px 24px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;

      .search-input {
        background: transparent;
        border: none;
        box-shadow: none;
        height: 26px;
        width: 116px;
        color: #7b7b8f;
        font-family: "Graphik";
        font-size: 12px;
        letter-spacing: 0.38px;
        line-height: 28px;
      }
    }

    .toggle-action-raw {
      display: flex;
      align-items: center;

      span {
        color: #1f2933;
        font-family: Graphik;
        font-size: 18px;
        line-height: 20px;
        margin-right: 8px;
      }
    }
  }
}
</style>
