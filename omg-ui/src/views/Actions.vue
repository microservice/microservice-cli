<template>
  <div class="actions-container" v-if="microservice.actions">
    <div class="action-list">
      <div
        class="action"
        v-for="(action, actionName) of microservice.actions"
        :key="`arg-${actionName}`"
      >
        <action-form
          :actionName="actionName"
          @argsEdited="processArgs"
          v-if="!query || !query.action"
        >
        </action-form>
        <action-form
          v-else
          @argsEdited="processArgs"
          :actionName="query.action"
          :query="query"
        >
        </action-form>
      </div>
    </div>
    <div class="action-output">
      <div class="button-container">
        <button class="run" @click="runHandler" :disabled="!getDockerRunning">
          RUN
        </button>
        <span v-if="!getDockerRunning"
          >Your need to start your container first.</span
        >
      </div>
      <pre class="output">
        {{ getDockerRunStat }}
      </pre>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ActionForm from '@/components/ActionForm'

export default {
  name: 'actions',
  components: {
    ActionForm
  },
  data: () => ({
    microservice: '',
    args: {},
    socket: null,
    ouput: '',
    edited: false
  }),
  props: {
    query: {
      type: Object,
      default: {},
      required: false
    }
  },
  computed: mapGetters([
    'getAction',
    'getArgs',
    'getMicroservice',
    'getOwner',
    'getSocket',
    'getDockerRunning',
    'getDockerRunStat'
  ]),
  mounted () {
    this.microservice = this.getMicroservice
    this.args = this.getArgs
    this.socket = this.getSocket

    // this.socket.on('start', res => console.log(res))
    // this.socket.on('healthcheck', res => console.log(res))
    // this.socket.on('stop', res => console.log(res))
    // this.socket.on('subscribe', res => console.log(res))
    this.socket.on('run', res => {
      this.addLineDockerRunStat(res.notif)
    })
  },
  beforeDestroy() {
    this.socket.removeListener('run')
  },
  methods: {
    ...mapMutations([
      'setAction',
      'addArg',
      'addLineDockerRunStat',
      'setDockerRunStat',
      'addHistoryEntry'
    ]),
    runHandler () {
      if (this.query && this.query.args && this.edited === false) {
        this.run(this.query)
      } else {
        if (this.args.subscribe) {
          delete this.args.subscribe
          // this.subscribe(this.args);
        } else {
          delete this.args.subscribe
          this.run(this.args)
        }
      }
    },
    processArgs (data) {
      this.edited = true
      this.args = data
    },
    run (e) {
      let run = {
        image: `omg/${this.getOwner}`,
        action: e.action,
        args: { ...e.args }
      }
      this.setDockerRunStat('')
      this.socket.emit('run', run)
      this.addHistoryEntry(run)
    }
  }
}
</script>
<style lang="scss" scoped>
.clickable {
  cursor: pointer;
}

.actions-container {
  width: 100%;
  display: flex;

  .action-list {
    width: 50%;
  }

  .action-output {
    width: 50%;
    border-left: 1px solid lightslategray;
    height: calc(100vh - 88px);

    .button-container {
      display: flex;
      flex-flow: column;
      justify-content: center;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid lightslategray;
    }
  }
}
</style>
