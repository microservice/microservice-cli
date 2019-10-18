<template>
  <Flex column width="calc(50% - 12px)" background-color="white">
    <Flex :pv="1" :ph="2.5" :bb="1" row align-items="center">
      <Words size="medium" font-weight="500">Request</Words>
      <Flex :flex="1" v-if="copySupported" row justify-content="flex-end">
        <Flex
          :b="1"
          :ph="1"
          :pv="0.5"
          v-on:click="handleCopyPayload"
          row
          box-shadow="0px 1px 5px rgba(24, 59, 140, 0.2)"
          cursor="pointer"
          user-select="none"
        >
          <Words size="small">Copy</Words>
        </Flex>
      </Flex>
    </Flex>
    <Flex :flex="1" column position="relative">
      <Monaco :code="activeActionTab.payload" :onChange="setActionPayload" language="json" />
      <Overlay v-if="!activeActionTab.actionName">
        <Flex column alignItems="center" justifyContent="center">
          <Words color="grey90" size="xLarge">Select an Action to perform</Words>
        </Flex>
      </Overlay>
    </Flex>
  </Flex>
</template>
<script lang="ts">
import { mapGetters, mapMutations } from 'vuex'

import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'
import Monaco from '~/components/Monaco.vue'
import Overlay from '~/components/Overlay.vue'

import { COPY_SUPPORTED } from './common'

export default {
  components: { Flex, Words, Monaco, Overlay },
  computed: {
    ...mapGetters({
      activeActionTab: 'getActiveActionTab',
    }),
    copySupported() {
      return COPY_SUPPORTED && this.activeActionTab.actionName
    },
  },
  methods: {
    ...mapMutations(['setActionPayload']),
    handleCopyPayload() {
      navigator.clipboard.writeText(this.activeActionTab.payload)
      this.$toasted.show('Copied Payload to Clipboard', {
        type: 'success',
        position: 'bottom-center',
        duration: 1500,
      })
    },
  },
}
</script>
