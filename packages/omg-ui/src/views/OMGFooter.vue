<template>
  <Flex row :ph="2" :pv="1"></Flex>
</template>

<script>
import { mapMutations } from 'vuex'

import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'

export default {
  components: { Flex, Button },
  computed: {},
  methods: {
    ...mapMutations(['toggleHistory']),
  },
}
</script>
