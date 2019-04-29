<template>
  <div class="docker-logs-container" :class="{ close: !open }">
    <div class="topbar">
      <div class="left">
        <img
          src="../assets/ic-closetab.svg"
          alt="toggle button"
          class="toggle"
          @click="openHandler()"
        />
      </div>
      <div class="right">
        <div
          class="docker-logs"
          :class="{ lit: state === 'dlog' || state === 'half' }"
          @click="switchHandler('dlog')"
        >
          <div class="rectangle">
            <div class="bar"></div>
          </div>
        </div>
        <div
          class="container-logs"
          :class="{ lit: state === 'clog' || state === 'half' }"
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
        <span class="title">Docker Logs</span>
        <div class="logs-output">
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
        <div class="logs-output">
          <pre><code>{{ getContainerLogs }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { setInterval } from 'timers';

export default {
  name: 'docker-logs',
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
      const els = this.$el.querySelectorAll("code")
      for (const el of els) {
        el.scrollTop = el.scrollHeight
      }
    }
  },
  methods: {
    ...mapMutations(['setContainerLogs']),
    openHandler() {
      this.open = !this.open
      if (this.state === 'close') {
        this.state = 'half'
      }
    },
    switchHandler(side) {
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
              setTimeout(() => this.state = 'close', 250)
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
              setTimeout(() => this.state = 'close', 250)
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
    }

    .right {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 52px;
      margin-right: 19px;

      .docker-logs,
      .container-logs {
        &.lit {
          .rectangle {
            background: rgba(66, 143, 247, 0.22);
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
        height: calc(100% - 82px);
        overflow: auto;

        pre {
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }

    .left {
      border-right: 1px solid #d8dcee;
    }
  }
}
</style>
