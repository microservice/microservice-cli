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
    <div class="validation">{{ getMicroserviceNotif }}</div>
  </div>
</template>

<script>
import Monaco from 'monaco-editor-forvue'
import { mapGetters } from 'vuex'

export default {
  name: 'editor',
  data: () => ({
    code: ' ',
    socket: null,
    options: {
      minimap: {
        enabled: false
      }
    }
  }),
  computed: {...mapGetters(['getMicroserviceRaw', 'getSocket', 'getMicroserviceNotif'])},
  components: {
    Monaco
  },
  mounted() {
    this.code = this.getMicroserviceRaw
    this.socket = this.getSocket
  },
  methods: {
    onMounted(editor) {
      this.editor = editor;
    },
    onCodeChange(editor) {
      this.socket.emit('microservice.yml', this.editor.getValue())
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
