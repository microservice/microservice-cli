<template>
  <div class="modals-wrapper" v-bind:class="{hidden: !activeModal}">
    <YamlEditor v-if="openYamlEditorModal" />
    <Environment v-if="showEnvironmentModal" />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'

import YamlEditor from './YamlEditor.vue'
import Environment from './Environment.vue'

export default {
  components: { YamlEditor, Environment },
  computed: {
    ...mapGetters({
      activeModal: 'getActiveModal',
    }),
    openYamlEditorModal() {
      return this.activeModal === 'YAML_EDITOR'
    },
    showEnvironmentModal() {
      return this.activeModal === 'ENVIRONMENT'
    },
  },
  methods: {},
}
</script>
<style lang="less" scoped>
.modals-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  display: flex;
}
.modals-wrapper.hidden {
  display: none;
}
</style>
