<template>
  <div ref="editor" :style="{height: '100%'}" />
</template>
<script lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'
import 'monaco-editor/esm/vs/editor/contrib/format/formatActions'

// @ts-ignore
// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  getWorkerUrl(moduleId, label) {
    if (label === 'json') {
      return '/monaco.json.worker.js'
    }

    return '/monaco.editor.worker.js'
  },
}

export default {
  components: {},
  props: {
    code: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      default: null,
    },
    lineNumbers: {
      type: String,
      default: 'off',
    },
    wordWrap: {
      type: String,
      default: 'on',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    minimapEnabled: {
      type: Boolean,
      default: false,
    },
    onChange: {
      type: Function,
    },
  },
  watch: {
    code(newValue) {
      if (this.$editor) {
        if (newValue !== this.$editor.getValue()) {
          this.$editor.setValue(newValue)
          this.$editor.getAction('editor.action.formatDocument').run()
        }
      }
    },
  },
  mounted() {
    this.$lastValue = this.code
    this.$editor = monaco.editor.create(this.$refs.editor, {
      language: this.language,
      value: this.code,
      readOnly: this.readonly,
      renderLineHighlight: this.readonly ? 'none' : 'all',
      minimap: {
        enabled: this.minimapEnabled,
      },
      theme: this.theme,
      wordWrap: this.wordWrap,
      lineNumbers: this.lineNumbers,
      scrollbar: {
        verticalScrollbarSize: 2,
        horizontal: 'visible',
      },
      automaticLayout: true,
      scrollBeyondLastLine: false,
    })
    this.$editor.onDidChangeModelContent(() => {
      if (this.onChange) {
        this.onChange(this.$editor.getValue())
      }
    })
  },
  methods: {},
}
</script>
