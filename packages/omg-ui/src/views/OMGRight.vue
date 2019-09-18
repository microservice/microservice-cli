<template>
  <Flex column backgroundColor="grey10">
    <Flex column :flex="1" :bl="1">
      <Flex row :pt="1.5" :ph="2" :bv="1">
        Setup
        Edit the YAML
      </Flex>
      <Flex column>Container logs:</Flex>
    </Flex>
  </Flex>
</template>

<script>
import Flex from '~/components/Flex.vue'

export default {
  components: { Flex },
  methods: {},
}
</script>
