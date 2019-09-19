<template>
  <div :style="{height: '100%'}" ref="editor"></div>
</template>

<script>
</script>

<script lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js'

// @ts-ignore
self.MonacoEnvironment = {
  getWorkerUrl() {
    return '/editor.worker.js'
  },
}

export default {
  props: {
    code: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    onChange: {
      type: Function,
    },
  },
  components: {},
  methods: {},
  mounted() {
    const editor = monaco.editor.create(this.$refs.editor, {
      language: 'json',
      value: this.code,
      readOnly: this.readonly,
      renderLineHighlight: this.readonly ? 'none' : 'all',
      minimap: {
        enabled: false,
      },
      wordWrap: 'on',
      lineNumbers: 'off',
      scrollbar: {
        verticalScrollbarSize: 2,
        horizontal: 'visible',
      },
      scrollBeyondLastLine: false,
    })
    editor.onDidChangeModelContent(() => {
      if (this.onChange) [this.onChange(editor.getValue())]
    })
  },
}
</script>
