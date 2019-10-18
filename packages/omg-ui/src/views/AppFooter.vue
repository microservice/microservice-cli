<template>
  <Flex column v-bind:class="{'app-footer': true, 'expanded': showLogs}">
    <Flex column :bv="1">
      <Flex row justifyContent="space-between" :ph="2" :pv="1">
        <Words>Container Logs</Words>
        <Photo :source="iconResizeKnob" :width="1.5" :height="2" />
        <Flex row :mr="1">
          <ToggleVertical :enabled="showLogs" :onToggle="toggleShowLogs" />
        </Flex>
      </Flex>
      <Flex column :bt="1" :pl="2" overflow="hidden" v-if="showLogs">
        <Words color="grey60" overflowY="scroll">
          <pre v-text="logsAllReverse" />
        </Words>
      </Flex>
    </Flex>
    <Flex row :ph="2" :pv="1" userSelect="none">
      <ToggleHorizontal :enabled="showHistory" :onToggle="toggleShowHistory" />
      <Flex :ml="1">
        <Words size="small">Show History</Words>
      </Flex>
    </Flex>
  </Flex>
</template>

<script lang="ts">
import { mapGetters, mapMutations } from 'vuex'

import Flex from '~/components/Flex.vue'
import Photo from '~/components/Photo.vue'
import Words from '~/components/Words.vue'
import ToggleVertical from '~/components/ToggleVertical.vue'
import ToggleHorizontal from '~/components/ToggleHorizontal.vue'

import iconResizeKnob from '~/images/icon-resize-knob.svg'

export default {
  components: { Flex, Words, Photo, ToggleVertical, ToggleHorizontal },
  methods: {
    ...mapMutations(['toggleShowHistory', 'toggleShowLogs']),
  },
  computed: {
    ...mapGetters({
      showLogs: 'getShowLogs',
      showHistory: 'getShowHistory',
      logsAllReverse: 'logsAllReverse',
    }),
  },
  data: () => ({
    iconResizeKnob,
  }),
}
</script>
<style lang="less" scoped>
.app-footer {
  height: 9% !important;
  &.expanded {
    height: 30% !important;
  }
}
</style>
