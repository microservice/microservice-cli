<template>
  <div class="editor-container">
    <div class="editor">
      <Monaco
        language="yaml"
        theme="vs"
        :code="getMicroserviceRaw"
        :options="options"
        :changeThrottle="100"
        @mounted="onMounted"
        @codeChange="onCodeChange"
      >
      </Monaco>
    </div>
    <div class="validation">
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
    </div>
  </div>
</template>

<script>
import Monaco from 'monaco-editor-forvue'
import { mapGetters } from 'vuex'
import * as yaml from 'js-yaml'

export default {
  name: 'editor',
  data: () => ({
    code: ' ',
    socket: null,
    disabled: true,
    editor: null,
    options: {
      minimap: {
        enabled: false
      }
    },
    lines: {},
    len: -1
  }),
  computed: {...mapGetters(['getMicroserviceRaw', 'getSocket', 'getMicroserviceNotif', 'getMicroserviceStatus'])},
  components: {
    Monaco
  },
  mounted() {
    this.code = this.getMicroserviceRaw
    this.socket = this.getSocket
  },
  methods: {
    onMounted(editor) {
      this.editor = editor
      // console.log(yaml.load(this.editor.getValue()))
      // this.lines = this.fetchAllLines(this.editor.getValue())
      // console.log(this.lines)
      // console.log(this.mapMicroserviceToLines())
    },
    onCodeChange(editor) {
      this.disabled = false
      this.lines = this.fetchAllLines(this.editor.getValue())
      this.socket.emit('microservice.yml', this.editor.getValue())
    },
    fetchAllLines(content) {
      const lines = {}
      let file = content
      for (let i = 0; i < (content.match(/\n/g) || []).length; i++) {
        lines[i + 1] = file.substr(0, file.indexOf('\n'))
        file = file.substr(file.indexOf('\n') + 1)
        this.len = i + 1
      }
      return lines
    },
    getLineFromObj(obj, depth) {
      for (let i = 1; i < this.len; i++) {
        if (`${obj.key}: ${obj.value}`.trim() === this.lines[i].trim()) {
          console.log(`${depth * ''}${obj.key}: ${obj.value}`.trim(), this.lines[i].trim(), `${obj.key}: ${obj.value}`.trim() === this.lines[i].trim(), i)
          return i
        }
      }
    },
    mapMicroserviceToLines(map = yaml.load(this.editor.getValue()), parent = '', depth = 0) {
      Object.keys(map).map(key => {
        if (typeof map[key] === 'object') {
          map['line'] = this.getLineFromObj({key: key, value: ''}, depth)
          this.mapMicroserviceToLines(map[key], key, depth++)
        } else {
          map[key] = {
            value: map[key],
            line: this.getLineFromObj({key: key, value: map[key]}, depth)
          }
        }
      })
      return map
    },
    refresh() {
      this.disabled = true
      window.location.reload()
    },
    addInsight(line, col, endL, endC, msg, state = error) {
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

  .editor {
    width: calc(100vw - 811px);
    height: 97%;
    margin-top: 1px;
    text-align: left;
  }

  .validation {
    text-align: center;
  }
}
</style>
