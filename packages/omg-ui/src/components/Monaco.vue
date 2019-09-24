<template>
  <div :style="{height: '100%'}" ref="editor"></div>
</template>

<script>
</script>

<script lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js'
import 'monaco-editor/esm/vs/editor/contrib/format/formatActions.js'

// @ts-ignore
self.MonacoEnvironment = {
  getWorkerUrl(moduleId, label) {
    if (label === 'json') {
      return '/monaco.json.worker.js'
    }

    return '/monaco.editor.worker.js'
  },
}

export default {
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
  components: {},
  methods: {},
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
      wordWrap: this.wordWrap,
      lineNumbers: this.lineNumbers,
      scrollbar: {
        verticalScrollbarSize: 2,
        horizontal: 'visible',
      },
      scrollBeyondLastLine: false,
      theme: this.theme,
    })
    this.$editor.onDidChangeModelContent(() => {
      if (this.onChange) [this.onChange(this.$editor.getValue())]
    })
  },
}
</script>
