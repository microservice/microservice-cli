<template>
  <Flex column :flex="1">
    <Flex column :bv="1">
      <Flex row justifyContent="space-between" :ph="2" :pv="1">
        <Words>Container Logs</Words>
        <Photo :source="iconResizeKnobSource" :width="1.5" :height="2" />
        <Words>Dismiss Button</Words>
      </Flex>
      <Flex column :bt="1" :ph="2" overflow="hidden">
        <Words color="grey60" overflowY="scroll">
          <pre class="omg-right-logs" v-text="logsAllReverse" />
        </Words>
      </Flex>
    </Flex>
    <Flex row :ph="2" :pv="1" userSelect="none">
      <Toggle :enabled="showHistory" :onToggle="toggleShowHistory" />
      <Flex :ml="1">
        <Words size="small">Show History</Words>
      </Flex>
    </Flex>
  </Flex>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'
import Photo from '~/components/Photo.vue'
import Words from '~/components/Words.vue'
import Toggle from '~/components/Toggle.vue'

export default {
  components: { Flex, Button, Words, Photo, Toggle },
  methods: {
    ...mapMutations(['toggleShowHistory'])
  },
  computed: {
    ...mapGetters({
      showHistory: 'getShowHistory',
      logsAllReverse: 'logsAllReverse',
    }),
  },
  data: () => ({
    iconResizeKnobSource: require('~/images/icon-resize-knob.svg'),
  }),
}
</script>
