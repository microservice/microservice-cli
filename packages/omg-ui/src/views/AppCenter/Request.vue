<template>
  <Flex column width="calc(50% - 12px)" backgroundColor="white">
    <Flex row :pv="1" :ph="2.5" :bb="1" alignItems="center">
      <Words size="medium" fontWeight="500">Request</Words>
      <Flex row :flex="1" justifyContent="flex-end" v-if="copySupported">
        <Flex
          row
          :b="1"
          :ph="1"
          :pv="0.5"
          v-on:click="handleCopyPayload"
          boxShadow="0px 1px 5px rgba(24, 59, 140, 0.2)"
          cursor="pointer"
          userSelect="none"
        >
          <Words size="small">Copy</Words>
        </Flex>
      </Flex>
    </Flex>
    <Flex column :flex="1">
      <Monaco language="json" :code="activeActionTab.payload" :onChange="setActionPayload" />
    </Flex>
  </Flex>
</template>
<script lang="ts">
import { mapGetters, mapMutations } from 'vuex'

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
  data: () => ({
    copySupported: COPY_SUPPORTED,
  }),
}
</script>
