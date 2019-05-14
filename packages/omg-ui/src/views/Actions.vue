<template>
  <div class="action-container">
    <div class="left">
      <event-selector
        class="event-selector"
        :actionName="$route.params.action"
        @eventSelected="processEvent"
        v-if="
          getMicroservice &&
            getMicroservice.actions[$route.params.action].events
        "
      ></event-selector>
      <div class="desc" v-if="getMicroservice">
        {{ getMicroservice.actions[$route.params.action].help }}
      </div>
      <div class="title">Arguments</div>
      <action-form
        :actionName="$route.params.action"
        :eventName="event"
        @argsEdited="processArgs"
        v-if="getMicroservice"
      />
    </div>
    <div class="right"></div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ActionForm from '@/components/ActionForm'
import EventSelector from '@/components/EventSelector'

export default {
  name: 'actions',
  components: {
    ActionForm,
    EventSelector
  },
  data: () => ({
    microservice: '',
    args: {},
    ouput: '',
    edited: false,
    event: ''
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
      'getOwner',
      'getSocket',
      'getDockerRunning',
      'getDockerRunStat'
    ])
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
      'appendDockerLogs'
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
      this.runHandler()
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

    .desc {
      // margin-top: 8px;
      // height: 51px;
      height: 31px;
      color: #616e7c;
      font-family: Graphik;
      font-size: 14px;
      line-height: 22px;
    }
  }
}
</style>
