<template>
  <Flex column :flex="1">
    <Flex column :bv="1">
      <Flex row justifyContent="space-between" :ph="2" :pv="1">
        <Words>Container Logs</Words>
        <Words>Resize knob</Words>
        <Words>Dismiss Button</Words>
      </Flex>
      <Flex column :bt="1" :ph="2" overflow="hidden">
        <Words color="grey60" marginTop="12px" overflowY="scroll">
          <pre class="omg-right-logs" v-text="logsAllReverse"></pre>
        </Words>
      </Flex>
    </Flex>
    <Flex row :ph="2" :pv="1">
      <Words>History Dismiss Button</Words>
    </Flex>
  </Flex>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'
import Words from '~/components/Words.vue'

export default {
  components: { Flex, Button, Words },
  computed: {
    ...mapGetters(['logsAllReverse']),
  },
  methods: {
    ...mapMutations(['toggleHistory']),
  },
  data: () => ({}),
}
</script>
