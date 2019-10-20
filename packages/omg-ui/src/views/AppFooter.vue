<template>
  <Flex v-bind:class="{'app-footer': true, 'expanded': showLogs}" column>
    <Flex :bv="1" column>
      <Flex :ph="2" :pv="1" row justify-content="space-between">
        <Words>Container Logs</Words>
        <Photo :source="iconResizeKnob" :width="1.5" :height="2" />
        <Flex :mr="1" row>
          <ToggleVertical :enabled="showLogs" :onToggle="toggleShowLogs" />
        </Flex>
      </Flex>
      <Flex :bt="1" :pl="2" v-if="showLogs" column overflow="hidden">
        <Words color="grey60" overflow-y="scroll">
          <!-- <pre v-text="logsAllReverse" /> -->
        </Words>
      </Flex>
    </Flex>
    <Flex :ph="2" :pv="1" row user-select="none">
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
