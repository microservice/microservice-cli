<template>
  <Flex column backgroundColor="grey10">
    <Flex row :bv="1">
      <Flex row :flex="1" :pt="1.2" :ph="2">My first action</Flex>
      <Flex row :pt="1.2" :ph="2">
        Setup
        Edit the YAML
      </Flex>
    </Flex>
    <Flex row :ph="2" :pv="1">
      <select>
        <option>Select your action</option>
      </select>
      <button>Send</button>
      <button>Save</button>
    </Flex>
    <Flex row :ph="2" :pv="1">
      <Flex column :flex="1">Hello world</Flex>
      <Flex column :flex="1">Result: Hello world</Flex>
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
