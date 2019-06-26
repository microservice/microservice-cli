<template>
  <div class="docker-logs-container" :class="{ close: !open }">
    <div class="topbar">
      <div class="left">
        <img
          src="../assets/ic-closetab.svg"
          alt="toggle button"
          class="toggle"
          @click="openHandler()"
        >
        <div class="clear-logs" @click="clearLogs()">
          <div class="rectangle">
            <div class="cross">
              <svg
                enable-background="new 0 0 32 32"
                height="16px"
                id="Layer_1"
                version="1.1"
                viewBox="0 0 32 32"
                width="16px"
                xml:space="preserve"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
              >
                <g id="trash">
                  <path
                    clip-rule="evenodd"
                    d="M29.98,6.819c-0.096-1.57-1.387-2.816-2.98-2.816h-3v-1V3.001   c0-1.657-1.344-3-3-3H11c-1.657,0-3,1.343-3,3v0.001v1H5c-1.595,0-2.885,1.246-2.981,2.816H2v1.183v1c0,1.104,0.896,2,2,2l0,0v17   c0,2.209,1.791,4,4,4h16c2.209,0,4-1.791,4-4v-17l0,0c1.104,0,2-0.896,2-2v-1V6.819H29.98z M10,3.002c0-0.553,0.447-1,1-1h10   c0.553,0,1,0.447,1,1v1H10V3.002z M26,28.002c0,1.102-0.898,2-2,2H8c-1.103,0-2-0.898-2-2v-17h20V28.002z M28,8.001v1H4v-1V7.002   c0-0.553,0.447-1,1-1h22c0.553,0,1,0.447,1,1V8.001z"
                    fill="#333333"
                    fill-rule="evenodd"
                  ></path>
                  <path
                    clip-rule="evenodd"
                    d="M9,28.006h2c0.553,0,1-0.447,1-1v-13c0-0.553-0.447-1-1-1H9   c-0.553,0-1,0.447-1,1v13C8,27.559,8.447,28.006,9,28.006z M9,14.005h2v13H9V14.005z"
                    fill="#333333"
                    fill-rule="evenodd"
                  ></path>
                  <path
                    clip-rule="evenodd"
                    d="M15,28.006h2c0.553,0,1-0.447,1-1v-13c0-0.553-0.447-1-1-1h-2   c-0.553,0-1,0.447-1,1v13C14,27.559,14.447,28.006,15,28.006z M15,14.005h2v13h-2V14.005z"
                    fill="#333333"
                    fill-rule="evenodd"
                  ></path>
                  <path
                    clip-rule="evenodd"
                    d="M21,28.006h2c0.553,0,1-0.447,1-1v-13c0-0.553-0.447-1-1-1h-2   c-0.553,0-1,0.447-1,1v13C20,27.559,20.447,28.006,21,28.006z M21,14.005h2v13h-2V14.005z"
                    fill="#333333"
                    fill-rule="evenodd"
                  ></path>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div
          class="docker-logs"
          :class="{ off: state !== 'dlog' && state !== 'half' }"
          @click="switchHandler('dlog')"
        >
          <div class="rectangle">
            <div class="bar"></div>
          </div>
        </div>
        <div
          class="container-logs"
          :class="{ off: state !== 'clog' && state !== 'half' }"
          @click="switchHandler('clog')"
        >
          <div class="rectangle">
            <div class="bar"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="logs">
      <div
        class="left"
        :class="{
          half: state === 'half',
          min: state === 'clog',
          max: state === 'dlog'
        }"
      >
        <div class="header">
          <span class="title">Docker Logs</span>
          <rebuild/>
        </div>
        <div class="logs-output" id="dlog">
          <pre><code>{{ getDockerLogs }}</code></pre>
        </div>
      </div>
      <div
        class="right"
        :class="{
          half: state === 'half',
          min: state === 'dlog',
          max: state === 'clog'
        }"
      >
        <span class="title">Container Logs</span>
        <div class="logs-output" id="clog">
          <pre><code>{{ getContainerLogs }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import Rebuild from '@/components/layout/Rebuild'

export default {
  name: 'docker-logs',
  components: {
    Rebuild
  },
  data: () => ({
    open: true,
    state: 'half'
  }),
  computed: mapGetters(['getDockerLogs', 'getContainerLogs', 'getSocket']),
  mounted () {
    this.getSocket.on('dockerLogs', res => {
      if (res.trim().length <= 0) {
        this.setContainerLogs('No logs available')
      } else {
        this.setContainerLogs(res)
      }
    })
  },
  watch: {
    getDockerLogs: function () {
      const el = this.$el.querySelector('#dlog')
      el.scrollTop = el.scrollHeight + 100
    },
    getContainerLogs: function () {
      const el = this.$el.querySelector('#clog')
      el.scrollTop = el.scrollHeight + 100
    }
  },
  methods: {
    ...mapMutations(['setContainerLogs', 'clearDockerLogs']),
    openHandler () {
      this.open = !this.open
      if (this.state === 'close') {
        this.state = 'half'
      }
    },
    clearLogs () {
      this.clearDockerLogs()
      this.getSocket.emit('clear-container-logs', Date.now() / 1000)
    },
    switchHandler (side) {
      switch (this.state) {
        case 'half':
          switch (side) {
            case 'dlog':
              this.state = 'clog'
              break
            case 'clog':
              this.state = 'dlog'
              break
          }
          break
        case 'dlog':
          switch (side) {
            case 'dlog':
              this.open = false
              setTimeout(() => {
                this.state = 'close'
              }, 250)
              break
            case 'clog':
              this.state = 'half'
              break
          }
          break
        case 'clog':
          switch (side) {
            case 'dlog':
              this.state = 'half'
              break
            case 'clog':
              this.open = false
              setTimeout(() => {
                this.state = 'close'
              }, 250)
              break
          }
          break
        case 'close':
          switch (side) {
            case 'dlog':
              this.state = 'dlog'
              break
            case 'clog':
              this.state = 'clog'
              break
          }
          this.open = true
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.docker-logs-container {
  &.close {
    height: 29px;

    .topbar {
      .left {
        .toggle {
          transform: rotate(180deg);
        }
      }
    }
  }
  height: 435px;
  width: 100%;
  -webkit-transition: all 250ms ease-in-out;
  -moz-transition: all 250ms ease-in-out;
  -ms-transition: all 250ms ease-in-out;
  -o-transition: all 250ms ease-in-out;
  transition: all 250ms ease-in-out;

  .topbar {
    width: 100%;
    height: 29px;
    background-color: #e4e7eb;
    display: flex;
    justify-content: space-between;

    .left {
      display: flex;
      align-items: center;
      margin-left: 14px;

      .toggle {
        cursor: pointer;
      }

      .clear-logs {
        width: 33px;
        height: 19px;
        background-color: #f5f7fa;
        margin-left: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        .cross {
          display: flex;
        }
      }
    }

    .right {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 52px;
      margin-right: 19px;

      .docker-logs,
      .container-logs {
        &.off {
          .rectangle {
            background: rgba(123, 135, 148, 0.19);
          }
        }
      }

      .rectangle {
        width: 24px;
        height: 19px;
        border-radius: 2px;
        box-shadow: 0 1px 5px 0 rgba(24, 59, 140, 0.19);
        background-color: #ffffff;
        display: flex;
        align-items: center;
        cursor: pointer;

        .bar {
          width: 6px;
          height: 15px;
          border-radius: 2px;
          box-shadow: 0 1px 5px 0 rgba(24, 59, 140, 0.19);
          background-color: #7b8794;
        }
      }

      .container-logs {
        .rectangle {
          justify-content: flex-end;

          .bar {
            margin-right: 2px;
          }
        }
      }

      .docker-logs {
        .rectangle {
          justify-content: flex-start;

          .bar {
            margin-left: 2px;
          }
        }
      }
    }
  }

  .logs {
    display: flex;
    justify-content: space-between;
    height: 100%;

    .left,
    .right {
      &.half {
        width: 50%;
      }
      &.min {
        width: 0;
        opacity: 0;
      }
      &.max {
        width: 100%;
      }

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      -webkit-transition: all 250ms ease-in-out;
      -moz-transition: all 250ms ease-in-out;
      -ms-transition: all 250ms ease-in-out;
      -o-transition: all 250ms ease-in-out;
      transition: all 250ms ease-in-out;

      .title,
      .logs-output {
        margin-left: 24px;
      }

      .title {
        height: 21px;
        color: #1f2933;
        font-family: Graphik;
        font-size: 16px;
        font-weight: 500;
        line-height: 21px;
        margin-top: 16px;
      }

      .logs-output {
        color: #616e7c;
        font-family: Graphik;
        font-size: 13px;
        line-height: 20px;
        margin-top: 16px;
        padding-right: 24px;
        text-align: left;
        height: calc(100% - 102px);
        overflow: auto;
        padding-bottom: 20px;

        pre {
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }

    .left {
      border-right: 1px solid #d8dcee;

      .header {
        display: flex;
        justify-content: space-between;
        width: 100%;
        align-items: center;
      }
    }
  }
}
</style>
