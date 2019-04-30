<template>
  <div class="action-container">
    <div class="left">
      <div class="title">Arguments</div>
      <div class="desc" v-if="getMicroservice">
        {{ getMicroservice.actions[$route.params.action].help }}
      </div>
      <action-form
        :actionName="$route.params.action"
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

export default {
  name: 'actions',
  components: {
    ActionForm
  },
  data: () => ({
    microservice: '',
    args: {},
    ouput: '',
    edited: false
  }),
  props: {
    query: {
      type: Object,
      default: () => {},
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
    this.getSocket.on('run', res => {
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
  },
  methods: {
    ...mapMutations([
      'setAction',
      'addArg',
      'addLineDockerRunStat',
      'setDockerRunStat',
      'addHistoryEntry',
      'setActionOutput',
      'appendContainerLogs'
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
      this.runHandler()
    },
    run (e) {
      let run = {
        image: `omg/${this.getOwner}`,
        action: e.action,
        args: { ...e.args }
      }
      this.setActionOutput('')
      this.getSocket.emit('run', run)
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

  .left {
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    margin: 24px 0 0 24px;
    width: 100%;

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
  }
}
</style>
