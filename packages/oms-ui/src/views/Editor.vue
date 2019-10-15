<template>
  <div class="editor-container">
    <!-- <div class="editor"> -->
    <Monaco
      language="yaml"
      theme="vs"
      :code="getMicroserviceRaw"
      :options="options"
      :changeThrottle="100"
      @mounted="onMounted"
      @codeChange="onCodeChange"
    ></Monaco>
    <!-- </div> -->
    <!-- <div class="validation">
      <div class="refresh-wrapper">
        <button
          class="refresh-btn"
          @click="refresh()"
          :disabled="disabled || !getMicroserviceStatus"
        >
          Refresh App
        </button>
      </div>
      <div class="validation-wrapper">
        {{ getMicroserviceNotif }}
      </div>
    </div>-->
  </div>
</template>

<script>
import Monaco from 'monaco-editor-forvue'
import { mapGetters } from 'vuex'
import * as yaml from 'js-yaml'
import * as rpc from '@/rpc/cli'

export default {
  name: 'editor',
  data: () => ({
    socket: null,
    disabled: true,
    editor: null,
    options: {
      minimap: {
        enabled: false
      },
      automaticLayout: true
    },
    lines: {},
    len: -1
  }),
  computed: { ...mapGetters(['getMicroserviceRaw', 'getMicroserviceNotif', 'getMicroserviceStatus']) },
  components: {
    Monaco
  },
  watch: {
    getMicroserviceNotif: function (data) {
      if (data !== 'No errors') {
        const errors = data.split(',')
        const lines = []
        for (const error in errors) {
          errors[error] = errors[error].trim()
          lines.push(this.searchLine(errors[error].substr(0, errors[error].split(' ')[0].length)))
        }
        for (const index in lines) {
          this.addInsight(lines[index].line, 0, lines[index].line, lines[index].size, errors[index])
        }
      } else {
        if (this.editor) {
          // eslint-disable-next-line
          monaco.editor.setModelMarkers(this.editor.getModel(), 'omg-app', [])
        }
      }
    }
  },
  mounted () {
    this.socket = rpc.getSocket()
  },
  methods: {
    onMounted (editor) {
      this.editor = editor
    },
    onCodeChange (editor) {
      this.disabled = false
      this.socket.emit('microservice.yml', this.editor.getValue())
    },
    searchLine (query) {
      query = query.replace('root.', '')
      let json = yaml.safeLoad(this.getMicroserviceRaw)
      let obj = ''
      for (const path in query.split('.')) {
        json = json[query.split('.')[path]]
        if (typeof json === 'object') {
          obj = `${query.split('.')[path]}:`
        } else {
          obj = `${query.split('.')[path]}: ${json}`
        }
      }
      for (const line in this.getMicroserviceRaw.split('\n')) {
        if (this.getMicroserviceRaw.split('\n')[line].trim() === obj.trim()) {
          return { line: parseInt(line, 10) + 1, size: this.getMicroserviceRaw.split('\n')[line].length }
        }
      }
    },
    addInsight (line, col, endL, endC, msg, state = 'error') {
      // eslint-disable-next-line
      monaco.editor.setModelMarkers(this.editor.getModel(), 'omg-app', [{
        startLineNumber: line,
        startColumn: col,
        endLineNumber: endL,
        endColumn: endC,
        message: msg,
        severity: state
      }])
    }
  }
}
</script>

<style lang="scss" scoped>
.editor-container {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 1px;
  text-align: left;

  // .editor {
  //   width: calc(100vw - 811px);
  //   height: 97%;
  // }

  // .validation {
  //   text-align: center;
  // }
}
</style>
