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

export default {
  name: 'editor',
  data: () => ({
    code: ' ',
    socket: null,
    disabled: true,
    options: {
      minimap: {
        enabled: false
      }
    }
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
      this.editor = editor;
    },
    onCodeChange(editor) {
      this.disabled = false
      this.socket.emit('microservice.yml', this.editor.getValue())
    },
    refresh() {
      this.disabled = true
      window.location.reload()
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
