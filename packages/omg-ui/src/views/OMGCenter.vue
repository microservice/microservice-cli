<template>
  <Flex column backgroundColor="grey10" :flex="1">
    <Flex row :bv="1" :pt="1.5" :ph="2">
      <Button
        :ph="3"
        :pv="1.5"
        :b="1"
        :mr="1"
        borderTop="3px solid #477BF3"
        borderBottom="none"
        backgroundColor="white"
        color="blue"
      >My first action</Button>
      <Button
        :ph="3"
        :pv="1.5"
        :b="1"
        :mr="1"
        borderBottom="none"
        backgroundColor="white"
        color="blue"
      >Custom Name</Button>
      <Button
        :ph="1.5"
        :pv="0.5"
        :b="1"
        :mr="1"
        borderBottom="none"
        bordercolor="blue20"
        backgroundColor="blue10"
      >
        <Photo :source="iconPlusSource" :size="3" />
      </Button>
    </Flex>
    <Flex row :ph="2" :pv="2">
      <Flex row :flex="1">
        <select :style="{width: '100%'}">
          <option>Select your action</option>
        </select>
        <Button :ph="2" :pv="1.5" color="white" backgroundColor="blue40" :ml="1">Send</Button>
        <Button
          :ph="2"
          :pv="1.5"
          :ml="1"
          :b="1"
          color="blue40"
          bordercolor="blue20"
          backgroundColor="blue10"
        >Save</Button>
      </Flex>
      <Flex row :flex="1" :ml="2" />
    </Flex>
    <Flex row :ph="2" :pv="1" :flex="1">
      <Flex column :flex="1" backgroundColor="white">
        <Flex column :flex="1">Hello world</Flex>
      </Flex>
      <Flex column :flex="1" :ml="2" backgroundColor="white">
        <Flex column :flex="1">Result: Hello world</Flex>
      </Flex>
    </Flex>
  </Flex>
</template>

<script>
import Flex from '~/components/Flex.vue'
import Photo from '~/components/Photo.vue'
import Button from '~/components/Button.vue'

export default {
  components: { Flex, Photo, Button },
  data: () => ({
    iconPlusSource: require('~/images/icon-plus.svg'),
  }),
  methods: {},
}
</script>
