<template>
  <Flex column width="calc(50% - 12px)" background-color="white">
    <Flex :pv="1" :ph="2.5" :bb="1" row align-items="center">
      <Words size="medium" font-weight="500">Response</Words>
      <Flex :flex="1" v-if="copySupported" row justify-content="flex-end">
        <Flex
          :b="1"
          :ph="1"
          :pv="0.5"
          v-on:click="handleCopyResult"
          row
          box-shadow="0px 1px 5px rgba(24, 59, 140, 0.2)"
          cursor="pointer"
          user-select="none"
        >
          <Words size="small">Copy</Words>
        </Flex>
      </Flex>
    </Flex>
    <Flex :flex="1" column>
      <Monaco :code="activeActionTab.result" language="json" readonly />
    </Flex>
  </Flex>
</template>
<script lang="ts">
import { mapGetters } from 'vuex'

import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'
import Monaco from '~/components/Monaco.vue'

import { COPY_SUPPORTED } from './common'

export default {
  components: { Flex, Words, Monaco },
  computed: {
    ...mapGetters({
      activeActionTab: 'getActiveActionTab',
    }),
  },
  methods: {
    handleCopyResult() {
      navigator.clipboard.writeText(this.activeActionTab.result)
      this.$toasted.show('Copied Result to Clipboard', {
        type: 'success',
        position: 'bottom-center',
        duration: 1500,
      })
    },
  },
  data: () => ({
    copySupported: COPY_SUPPORTED,
  }),
}
</script>
