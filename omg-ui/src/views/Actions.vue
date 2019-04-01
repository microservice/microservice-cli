<template>
  <div
    class="actions-container"
    v-if="microservice.actions"
  >
    <div class="action-list">
      <div
        class="action"
        v-for="(action, actionName) of microservice.actions"
        :key="`arg-${actionName}`"
      >
        <action-form
          :actionName="actionName"
          @argsEdited="processArgs"
        >
      </div>
    </div>
    <div class="action-output">
      <div class="button-container">
        <button
          class="run"
          @click="runHandler"
          :disabled="!getDockerRunning"
        >
          RUN
        </button>
        <span v-if="!getDockerRunning">Your need to start your container first.</span>
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
    ouput: ''
  }),
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
      this.setDockerRunStat(`${this.getDockerRunStat}\n${res.notif}`)
    })
  },
  methods: {
    ...mapMutations([
      'setAction',
      'addArg',
      'setDockerRunStat',
      'addHistoryEntry'
    ]),
    runHandler () {
      if (this.args.subscribe) {
        delete this.args.subscribe
        // this.subscribe(this.args);
      } else {
        delete this.args.subscribe
        this.run(this.args)
      }
    },
    processArgs (data) {
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
