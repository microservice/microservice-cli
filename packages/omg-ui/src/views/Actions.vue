<template>
  <div class="action-container">
    <div class="left" :class="{ raw: getActionSendRaw }">
      <event-selector
        class="event-selector"
        :actionName="$route.params.action"
        @eventSelected="processEvent"
        v-if="
          getMicroservice &&
            getMicroservice.actions[$route.params.action].events
        "
      ></event-selector>
      <div class="row">
        <div class="desc" v-if="getMicroservice">
          {{ getMicroservice.actions[$route.params.action].help }}
        </div>
        <div class="toggle-action-raw" v-if="$route.params.action">
          <span>Send raw JSON data</span>
          <toggle-button
            :toggleHandler="toggleActionSendRaw"
            :toggleReceiver="getActionSendRaw"
          ></toggle-button>
        </div>
      </div>
      <div class="title">Arguments</div>
      <div class="args" v-if="getMicroservice">
        <action-form
          :actionName="$route.params.action"
          :eventName="event"
          @argsEdited="processArgs"
          v-if="!getActionSendRaw"
        />
        <div v-else class="editor">
          <Monaco
            language="json"
            theme="vs"
            :options="{
              minimap: {
                enabled: false
              },
              automaticLayout: true
            }"
            :changeThrottle="100"
            :code="rawJson"
            @mounted="onEditorMounted"
            @codeChange="onCodeChange"
          ></Monaco>
          <div class="btn-container form-row">
            <button
              class="run-btn"
              @click="runHandler()"
              :disabled="parseError"
            >
              {{ parseError ? "Cannot parse JSON" : "Run Action" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="right"></div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import Monaco from 'monaco-editor-forvue'
import ActionForm from '@/components/ActionForm'
import EventSelector from '@/components/EventSelector'
import ToggleButton from '@/components/ToggleButton'

export default {
  name: 'actions',
  components: {
    ActionForm,
    EventSelector,
    Monaco,
    ToggleButton
  },
  data: () => ({
    microservice: '',
    args: {},
    ouput: '',
    edited: false,
    event: '',
    rawJson: '',
    editor: null,
    parseError: false
  }),
  props: {
    query: {
      type: Object,
      default: () => {},
      required: false
    }
  },
  computed: {
    ...mapGetters([
      'getAction',
      'getArgs',
      'getMicroservice',
      'getMicroserviceStatus',
      'getOwner',
      'getSocket',
      'getDockerRunning',
      'getDockerRunStat',
      'getActionSendRaw'
    ])
  },
  watch: {
    getMicroserviceStatus: function () {
      if (!this.getMicroserviceStatus) {
        this.$router.push({ path: '/validation-error' })
      }
    }
  },
  mounted () {
    this.microservice = this.getMicroservice
    this.args = this.getArgs
    this.getSocket.on('run', res => {
      if (res && res.notif) {
        this.appendDockerLogs(`[OMG]: ${res.notif}`)
      }
      if (res.output) {
        try {
          this.setActionOutput(JSON.parse(res.output))
        } catch (e) {
          this.setActionOutput(res.output.trim())
        }
      }
    })
    this.getSocket.on('subscribe', res => {
      if (res.output) {
        try {
          this.setActionOutput(JSON.parse(res.output))
        } catch (e) {
          this.setActionOutput(res.output.trim())
        }
      }
    })
  },
  beforeDestroy () {
    this.getSocket.removeListener('run')
    this.getSocket.removeListener('subscribe')
  },
  methods: {
    ...mapMutations([
      'setAction',
      'addHistoryEntry',
      'setActionOutput',
      'appendDockerLogs',
      'toggleActionSendRaw'
    ]),
    runHandler () {
      if (this.query && this.query.args && this.edited === false) {
        this.run(this.query)
      } else {
        if (this.args.subscribe) {
          delete this.args.subscribe
          this.subscribe(this.args)
        } else {
          delete this.args.subscribe
          this.run(this.args)
        }
      }
    },
    processArgs (data) {
      this.edited = true
      this.args = data
      if (this.event && this.event.length > 0) {
        this.args['subscribe'] = true
      } else {
        this.args['subscribe'] = false
      }
      if (!this.getActionSendRaw) {
        this.runHandler()
      }
    },
    processEvent (data) {
      this.event = data
    },
    run (e) {
      const run = {
        image: `omg/${this.getOwner}`,
        action: e.action,
        args: { ...e.args }
      }
      this.setActionOutput('')
      this.getSocket.emit('run', run)
      this.addHistoryEntry(run)
    },
    subscribe (e) {
      const run = {
        image: `omg/${this.getOwner}`,
        action: e.action,
        args: { ...e.args },
        event: this.event
      }
      this.setActionOutput('')
      this.getSocket.emit('subscribe', run)
      this.addHistoryEntry(run)
    },
    onEditorMounted (editor) {
      this.editor = editor
    },
    onCodeChange (editor) {
      this.parseError = false
      let json = {}
      try {
        json = JSON.parse(this.editor.getValue())
      } catch (e) {
        this.parseError = true
        return
      }
      this.processArgs({
        action: this.$route.params.action,
        args: json
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.action-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
  overflow: auto;
  padding-bottom: 24px;

  .left {
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    margin: 24px 0 0 24px;
    width: 100%;

    &.raw {
      height: calc(100% - 48px);
    }

    .event-selector {
      margin-bottom: 24px;
    }

    .title {
      // height: 27px;
      height: 57px;
      color: #1f2933;
      font-family: Graphik;
      font-size: 18px;
      font-weight: 500;
      line-height: 27px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      width: 97%;
      align-items: center;

      .desc {
        height: 31px;
        color: #616e7c;
        font-family: Graphik;
        font-size: 14px;
        line-height: 22px;
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
    .args {
      width: 100%;
      height: 100%;
      display: flex;
      text-align: left;

      .editor {
        width: calc(100% - 24px);
        height: calc(100% - 24px);

        .btn-container {
          margin-top: 24px;

          button.run-btn {
            height: 35px;
            width: 435px;
            border-radius: 2px;
            color: #ffffff;
            font-family: Graphik;
            font-size: 16px;
            font-weight: 500;
            line-height: 21px;
            text-align: center;
            background-color: #17b897;
            margin-right: 109px;

            &:hover {
              background-color: #2dcca7;
              cursor: pointer;
            }

            &:focus {
              background-color: #079a82;
            }

            &:disabled {
              background-color: #bcbed6;

              &:hover {
                background-color: #bcbed6;
                cursor: not-allowed;
              }
            }
          }
        }
      }
    }
  }
}
</style>
