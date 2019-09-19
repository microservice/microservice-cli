<template>
  <Flex row :ph="2" :pv="1">
    <Button :onPress="toggleHistory" :b="1" :p="0.5">Toggle History</Button>
  </Flex>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'

export default {
  components: { Flex, Button },
  computed: {
    ...mapGetters({
      showHistory: 'getShowHistory',
    }),
  },
  methods: {
    ...mapMutations(['toggleHistory']),
  },
}
</script>
