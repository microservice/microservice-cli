<template>
  <div class="modals-wrapper" v-bind:class="{hidden: !getActiveModal}">
    <YamlEditor v-if="openYamlEditorModal" />
    <Environment v-if="showEnvironmentModal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Flex from '~/components/Flex.vue'
import YamlEditor from './YamlEditor.vue'
import Environment from './Environment.vue'

export default {
  components: { Flex, YamlEditor, Environment },
  methods: {},
  computed: {
    ...mapGetters(['getActiveModal']),
    openYamlEditorModal() {
      return this.getActiveModal === 'YAML_EDITOR'
    },
    showEnvironmentModal() {
      return this.getActiveModal === 'ENVIRONMENT'
    },
  },
}
</script>
<style lang="less">
.modals-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow-y: scroll;
  display: flex;
}
.modals-wrapper.hidden {
  display: none;
}
</style>
